/**
 * Issue service — creates and closes borrowing transactions in memory.
 * Replace with API calls when the database is connected.
 */
import type { Book } from "../types/book.types";
import type {
  BookIssue,
  IssueFormErrors,
  IssueFormValues,
  IssueSortKey,
  IssuedFilter,
  LoanState,
  ReturnFormValues,
  ReturnItem,
} from "../types/issue.types";
import { ServiceError, availableCopyIds } from "./book.service";
import { addDays, diffInDays, isValidISODate, todayISO } from "../utils/date";
import { DEFAULT_LOAN_DAYS, DUE_SOON_DAYS, MAX_BOOKS_PER_STUDENT } from "../utils/constants";

export const emptyIssueForm = (): IssueFormValues => {
  const today = todayISO();
  return {
    studentId: "",
    studentName: "",
    studentClass: "",
    studentPhone: "",
    items: [],
    issueDate: today,
    dueDate: addDays(today, DEFAULT_LOAN_DAYS),
    notes: "",
  };
};

/** Overdue / due-soon are derived — never stored. */
export const loanState = (issue: BookIssue, today = todayISO()): LoanState => {
  if (issue.status === "returned") return "returned";
  const daysLeft = diffInDays(today, issue.dueDate);
  if (daysLeft < 0) return "overdue";
  if (daysLeft <= DUE_SOON_DAYS) return "dueSoon";
  return "issued";
};

export const daysOverdue = (issue: BookIssue, asOf = todayISO()): number =>
  Math.max(0, diffInDays(issue.dueDate, issue.returnDate ?? asOf));

export const daysUntilDue = (issue: BookIssue, today = todayISO()): number => diffInDays(today, issue.dueDate);

/** Active loans held by a student (case-insensitive ID match). */
export const activeLoansFor = (studentId: string, issues: BookIssue[]): BookIssue[] => {
  const id = studentId.trim().toLowerCase();
  if (!id) return [];
  return issues.filter((i) => i.status === "issued" && i.studentId.toLowerCase() === id);
};

export const validateIssueForm = (v: IssueFormValues, books: Book[], issues: BookIssue[]): IssueFormErrors => {
  const errors: IssueFormErrors = {};
  if (!v.studentId.trim()) errors.studentId = "Student ID is required.";
  if (!v.studentName.trim()) errors.studentName = "Student name is required.";
  if (v.studentPhone.trim() && !/^[+\d][\d\s-]{6,15}$/.test(v.studentPhone.trim()))
    errors.studentPhone = "Enter a valid phone number.";

  // Books
  if (v.items.length === 0) {
    errors.items = "Add at least one book.";
  } else {
    const ids = v.items.map((it) => it.bookId);
    const missing = v.items.find((it) => !books.some((b) => b.id === it.bookId));
    const noStock = v.items.find((it) => (books.find((b) => b.id === it.bookId)?.availableCopies ?? 0) <= 0);
    const held = activeLoansFor(v.studentId, issues);
    const alreadyHeld = v.items.find((it) => held.some((h) => h.bookId === it.bookId));
    if (missing) errors.items = `Book ${missing.bookId} no longer exists — remove it.`;
    else if (new Set(ids).size !== ids.length) errors.items = "The same title is listed twice.";
    else if (noStock) errors.items = `${books.find((b) => b.id === noStock.bookId)?.title} has no copies available.`;
    else if (alreadyHeld)
      errors.items = `${v.studentName || "This student"} already has ${books.find((b) => b.id === alreadyHeld.bookId)?.title} on loan.`;
    else if (held.length + v.items.length > MAX_BOOKS_PER_STUDENT)
      errors.items = `Limit is ${MAX_BOOKS_PER_STUDENT} books per student — they already hold ${held.length}, so at most ${Math.max(0, MAX_BOOKS_PER_STUDENT - held.length)} more can be issued.`;
  }

  if (!v.issueDate) errors.issueDate = "Issue date is required.";
  else if (!isValidISODate(v.issueDate)) errors.issueDate = "Enter a valid date.";
  if (!v.dueDate) errors.dueDate = "Due date is required.";
  else if (!isValidISODate(v.dueDate)) errors.dueDate = "Enter a valid date.";
  else if (v.issueDate && diffInDays(v.issueDate, v.dueDate) < 0)
    errors.dueDate = "Due date can't be earlier than the issue date.";
  return errors;
};

export const nextIssueId = (issues: BookIssue[]): string => {
  const max = issues.reduce((m, i) => Math.max(m, Number(i.id.replace(/\D/g, "")) || 0), 2000);
  return `ISS-${max + 1}`;
};

/** Creates one transaction per book (same student and dates) and reduces stock for each. */
export const createIssues = (
  books: Book[],
  issues: BookIssue[],
  v: IssueFormValues,
): { books: Book[]; issues: BookIssue[]; created: BookIssue[] } => {
  const errors = validateIssueForm(v, books, issues);
  if (Object.keys(errors).length) throw new ServiceError("Please fix the highlighted fields.", errors);

  let nextBooks = books;
  let nextIssues = issues;
  const created: BookIssue[] = [];

  for (const item of v.items) {
    const book = nextBooks.find((b) => b.id === item.bookId) as Book;
    const freeCopies = availableCopyIds(book, nextIssues);
    if (item.bookCopyId && !freeCopies.includes(item.bookCopyId))
      throw new ServiceError(`Copy ${item.bookCopyId} is already on loan.`, { items: `Copy ${item.bookCopyId} is already on loan.` });
    const issue: BookIssue = {
      id: nextIssueId(nextIssues),
      studentId: v.studentId.trim().toUpperCase(),
      studentName: v.studentName.trim(),
      studentClass: v.studentClass.trim() || undefined,
      studentPhone: v.studentPhone.trim() || undefined,
      bookId: book.id,
      bookCopyId: item.bookCopyId || freeCopies[0],
      issueDate: v.issueDate,
      dueDate: v.dueDate,
      status: "issued",
      notes: v.notes.trim() || undefined,
    };
    created.push(issue);
    nextIssues = [issue, ...nextIssues];
    nextBooks = nextBooks.map((b) => (b.id === book.id ? { ...b, availableCopies: b.availableCopies - 1 } : b));
  }
  return { books: nextBooks, issues: nextIssues, created };
};

export const returnItemFor = (issue: BookIssue, returnDate: string): ReturnItem => {
  const fine = suggestedFine(issue, returnDate);
  return { issueId: issue.id, returnCondition: "good", fineAmount: fine ? String(fine) : "" };
};

/** Closes one or more loans with a shared return date; each copy goes back on the shelf. */
export const returnIssues = (
  books: Book[],
  issues: BookIssue[],
  r: ReturnFormValues,
): { books: Book[]; issues: BookIssue[]; returned: { issue: BookIssue; daysLate: number }[] } => {
  if (r.items.length === 0) throw new ServiceError("Select at least one book to return.");
  if (!isValidISODate(r.returnDate)) throw new ServiceError("Enter a valid return date.");

  let nextBooks = books;
  let nextIssues = issues;
  const returned: { issue: BookIssue; daysLate: number }[] = [];

  for (const item of r.items) {
    const existing = nextIssues.find((i) => i.id === item.issueId);
    if (!existing) throw new ServiceError(`Transaction ${item.issueId} was not found.`);
    if (existing.status === "returned") throw new ServiceError(`${existing.id} has already been returned.`);
    if (diffInDays(existing.issueDate, r.returnDate) < 0)
      throw new ServiceError(`Return date can't be before the issue date of ${existing.id}.`);
    const fine = item.fineAmount.trim() ? Number(item.fineAmount) : undefined;
    if (fine !== undefined && (!Number.isFinite(fine) || fine < 0))
      throw new ServiceError(`Fine for ${existing.id} must be 0 or more.`);

    const issue: BookIssue = {
      ...existing,
      status: "returned",
      returnDate: r.returnDate,
      returnCondition: item.returnCondition,
      returnRemarks: r.returnRemarks.trim() || undefined,
      fineAmount: fine,
    };
    returned.push({ issue, daysLate: Math.max(0, diffInDays(existing.dueDate, r.returnDate)) });
    nextIssues = nextIssues.map((i) => (i.id === issue.id ? issue : i));
    nextBooks = nextBooks.map((b) =>
      b.id === existing.bookId ? { ...b, availableCopies: Math.min(b.totalCopies, b.availableCopies + 1) } : b,
    );
  }
  return { books: nextBooks, issues: nextIssues, returned };
};

export const searchIssues = (
  issues: BookIssue[],
  books: Book[],
  q: { keyword: string; filter: IssuedFilter; sort: IssueSortKey; dir: "asc" | "desc" },
  today = todayISO(),
): BookIssue[] => {
  const kw = q.keyword.trim().toLowerCase();
  const titleOf = (id: string) => books.find((b) => b.id === id)?.title.toLowerCase() ?? "";
  const out = issues.filter((i) => {
    const state = loanState(i, today);
    if (q.filter === "returned" && state !== "returned") return false;
    if (q.filter !== "returned" && state === "returned") return false;
    if (q.filter === "overdue" && state !== "overdue") return false;
    if (q.filter === "dueSoon" && state !== "dueSoon") return false;
    if (q.filter === "issued" && state !== "issued" && state !== "dueSoon") return false;
    if (!kw) return true;
    return (
      i.id.toLowerCase().includes(kw) ||
      i.studentId.toLowerCase().includes(kw) ||
      i.studentName.toLowerCase().includes(kw) ||
      titleOf(i.bookId).includes(kw)
    );
  });
  const m = q.dir === "asc" ? 1 : -1;
  return [...out].sort((a, b) => a[q.sort].localeCompare(b[q.sort]) * m || a.id.localeCompare(b.id) * m);
};

/** Suggested fine (₹ per day late). Fine policy can be refined later. */
export const FINE_PER_DAY = 2;
export const suggestedFine = (issue: BookIssue, returnDate: string): number =>
  Math.max(0, diffInDays(issue.dueDate, returnDate)) * FINE_PER_DAY;
