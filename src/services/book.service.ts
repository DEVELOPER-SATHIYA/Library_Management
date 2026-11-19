/**
 * Book service — pure functions over in-memory state.
 * When Supabase is connected, swap these implementations for queries
 * while keeping the same signatures.
 */
import type { Book, BookCopy, BookFormErrors, BookFormValues } from "../types/book.types";
import type { BookIssue } from "../types/issue.types";
import { isValidIsbn, normalizeIsbn } from "../utils/isbn";
import { LOW_STOCK_THRESHOLD } from "../utils/constants";
import { todayISO } from "../utils/date";

export class ServiceError extends Error {
  constructor(message: string, public fieldErrors?: Record<string, string>) {
    super(message);
    this.name = "ServiceError";
  }
}

/** Normalised text used to decide whether two records are the same title / borrower. */
export const groupKey = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

const titleKey = (title: string, author: string) => `${groupKey(title)}|${groupKey(author)}`;

/** Blank register form, with the Book ID pre-filled with the next free accession number. */
export const emptyBookForm = (books: Book[]): BookFormValues => ({
  accNo: String(nextAccNo(books)),
  title: "",
  author: "",
  isbn: "",
  publisher: "",
  edition: "",
  publicationYear: "",
  shelfNumber: "",
  registerPage: "",
  price: "",
});

export const copyToForm = (b: Book, c: BookCopy): BookFormValues => ({
  accNo: c.accNo,
  title: b.title,
  author: b.author,
  isbn: b.isbn ?? "",
  publisher: b.publisher ?? "",
  edition: b.edition ?? "",
  publicationYear: b.publicationYear ? String(b.publicationYear) : "",
  shelfNumber: c.shelf ?? b.shelfNumber ?? "",
  registerPage: c.registerPage ?? "",
  price: c.price ?? "",
});

const isLendable = (c: BookCopy) => !c.withdrawnReason;

/** Accession numbers currently out on loan. */
const loanedCopyIds = (bookId: string, issues: BookIssue[]) =>
  new Set(issues.filter((i) => i.bookId === bookId && i.status === "issued").map((i) => i.bookCopyId));

/** Number of copies currently out on loan for a book. */
export const copiesOnLoan = (bookId: string, issues: BookIssue[]): number =>
  issues.filter((i) => i.bookId === bookId && i.status === "issued").length;

/** Recomputes totalCopies / availableCopies from the copy list and active loans. */
const withCounts = (b: Book, issues: BookIssue[]): Book => {
  const total = b.copies.filter(isLendable).length;
  return { ...b, totalCopies: total, availableCopies: Math.max(0, total - copiesOnLoan(b.id, issues)) };
};

export const reconcileAvailability = (books: Book[], issues: BookIssue[]): Book[] =>
  books.map((b) => withCounts(b, issues));

/** Accession numbers of lendable copies not currently on loan. */
export const availableCopyIds = (book: Book, issues: BookIssue[]): string[] => {
  const taken = loanedCopyIds(book.id, issues);
  return book.copies.filter((c) => isLendable(c) && !taken.has(c.accNo)).map((c) => c.accNo);
};

/** Identifies the copy being edited, so its own Book ID / ISBN don't count as duplicates. */
export interface EditingCopy {
  bookId: string;
  accNo: string;
}

const ACC_NO = /^[A-Za-z0-9][A-Za-z0-9/-]*$/;
const PRICE = /^[₹$€£]?\s?\d+(\.\d{1,2})?$/;

export const validateBookForm = (v: BookFormValues, books: Book[], editing?: EditingCopy): BookFormErrors => {
  const errors: BookFormErrors = {};

  const acc = v.accNo.trim();
  if (!acc) errors.accNo = "Book ID is required.";
  else if (acc.length > 20 || !ACC_NO.test(acc)) errors.accNo = "Use letters, numbers, - or / only (max 20).";
  else {
    const owner = books.find((b) =>
      b.copies.some((c) => c.accNo.toLowerCase() === acc.toLowerCase() && !(b.id === editing?.bookId && c.accNo === editing.accNo)),
    );
    if (owner) errors.accNo = `Book ID ${acc} is already used by ${owner.title}.`;
  }

  if (!v.title.trim()) errors.title = "Book title is required.";
  if (!v.author.trim()) errors.author = "Author is required.";

  if (v.isbn.trim()) {
    if (!isValidIsbn(v.isbn)) {
      errors.isbn = "Enter a valid ISBN-10 or ISBN-13 (check digit must match).";
    } else {
      const n = normalizeIsbn(v.isbn);
      const sameTitle = (b: Book) =>
        b.id === editing?.bookId || (!editing && titleKey(b.title, b.author) === titleKey(v.title, v.author));
      const dup = books.find((b) => !sameTitle(b) && b.isbn && normalizeIsbn(b.isbn) === n);
      if (dup) errors.isbn = `ISBN already registered to ${dup.title}.`;
    }
  }

  if (v.publicationYear.trim()) {
    const y = Number(v.publicationYear);
    const max = new Date().getFullYear() + 1;
    if (!Number.isInteger(y) || y < 1000 || y > max) errors.publicationYear = `Enter a year between 1000 and ${max}.`;
  }

  if (v.registerPage.trim().length > 10) errors.registerPage = "Keep the page reference to 10 characters.";
  if (v.price.trim() && !PRICE.test(v.price.trim())) errors.price = "Enter an amount, e.g. 250 or 199.50.";
  return errors;
};

/** Generates the next internal title ID (BK-xxxx). */
export const nextBookId = (books: Book[]): string => {
  const max = books.reduce((m, b) => {
    const n = Number(b.id.replace(/\D/g, ""));
    return Number.isFinite(n) && n > m ? n : m;
  }, 1000);
  return `BK-${max + 1}`;
};

/** Next accession number: one above the highest numeric one in the catalogue. */
export const nextAccNo = (books: Book[]): number =>
  books.reduce(
    (m, b) => b.copies.reduce((mm, c) => (/^\d+$/.test(c.accNo) ? Math.max(mm, Number(c.accNo)) : mm), m),
    1000,
  ) + 1;

const titleFields = (v: BookFormValues) => ({
  title: v.title.trim(),
  author: v.author.trim(),
  isbn: v.isbn.trim() || undefined,
  publisher: v.publisher.trim() || undefined,
  edition: v.edition.trim() || undefined,
  publicationYear: v.publicationYear.trim() ? Number(v.publicationYear) : undefined,
});

const copyFields = (v: BookFormValues) => ({
  accNo: v.accNo.trim(),
  shelf: v.shelfNumber.trim().toUpperCase() || undefined,
  registerPage: v.registerPage.trim() || undefined,
  price: v.price.trim() || undefined,
});

const fail = (errors: BookFormErrors) => {
  if (Object.keys(errors).length) throw new ServiceError("Please fix the highlighted fields.", errors);
};

/**
 * Registers one physical copy. If a title with the same name and author exists,
 * the copy is added to it (its blank details are filled in); otherwise a new title is created.
 */
export const registerCopy = (
  books: Book[],
  issues: BookIssue[],
  v: BookFormValues,
): { books: Book[]; book: Book; copy: BookCopy; newTitle: boolean } => {
  fail(validateBookForm(v, books));
  const fields = titleFields(v);
  const copy: BookCopy = { ...copyFields(v), purchaseDate: todayISO(), addedAt: new Date().toISOString() };
  const key = titleKey(fields.title, fields.author);
  const existing = books.find((b) => titleKey(b.title, b.author) === key);

  if (existing) {
    const book = withCounts(
      {
        ...existing,
        isbn: existing.isbn ?? fields.isbn,
        publisher: existing.publisher ?? fields.publisher,
        edition: existing.edition ?? fields.edition,
        publicationYear: existing.publicationYear ?? fields.publicationYear,
        shelfNumber: existing.shelfNumber ?? copy.shelf,
        copies: [...existing.copies, copy],
      },
      issues,
    );
    return { books: books.map((b) => (b.id === book.id ? book : b)), book, copy, newTitle: false };
  }

  const book: Book = {
    id: nextBookId(books),
    ...fields,
    copies: [copy],
    totalCopies: 1,
    availableCopies: 1,
    shelfNumber: copy.shelf,
    createdAt: todayISO(),
  };
  return { books: [book, ...books], book, copy, newTitle: true };
};

/**
 * Updates one copy. Title details (title, author, ISBN, publisher, edition, year) apply to
 * every copy of the title; Book ID, shelf, page and price apply to this copy only.
 * Renaming the Book ID also updates loans that point at it.
 */
export const updateCopy = (
  books: Book[],
  issues: BookIssue[],
  editing: EditingCopy,
  v: BookFormValues,
): { books: Book[]; issues: BookIssue[]; book: Book; copy: BookCopy } => {
  const existing = books.find((b) => b.id === editing.bookId);
  const old = existing?.copies.find((c) => c.accNo === editing.accNo);
  if (!existing || !old) throw new ServiceError(`Book ID ${editing.accNo} was not found.`);
  fail(validateBookForm(v, books, editing));

  const copy: BookCopy = { ...old, ...copyFields(v) };
  const nextIssues =
    copy.accNo === old.accNo
      ? issues
      : issues.map((i) => (i.bookId === existing.id && i.bookCopyId === old.accNo ? { ...i, bookCopyId: copy.accNo } : i));
  const book = withCounts(
    { ...existing, ...titleFields(v), copies: existing.copies.map((c) => (c.accNo === old.accNo ? copy : c)) },
    nextIssues,
  );
  return { books: books.map((b) => (b.id === book.id ? book : b)), issues: nextIssues, book, copy };
};

export type StockStatus = "available" | "low" | "out";

/** Single-copy titles that are on the shelf count as available, not "low". */
export const stockStatus = (b: Book): StockStatus =>
  b.availableCopies <= 0
    ? "out"
    : b.availableCopies <= LOW_STOCK_THRESHOLD && b.totalCopies > LOW_STOCK_THRESHOLD
      ? "low"
      : "available";
