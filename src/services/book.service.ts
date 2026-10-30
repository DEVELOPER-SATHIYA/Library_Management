/**
 * Book service — pure functions over in-memory state.
 * When a backend is added, swap these implementations for API calls
 * (e.g. `fetch("/api/books")`) while keeping the same signatures.
 */
import type {
  AvailabilityFilter,
  Book,
  BookFormErrors,
  BookFormValues,
  BookSortKey,
} from "../types/book.types";
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

export const emptyBookForm = (): BookFormValues => ({
  title: "",
  author: "",
  isbn: "",
  category: "",
  publisher: "",
  edition: "",
  publicationYear: "",
  totalCopies: "1",
  shelfNumber: "",
  coverImage: "",
});

export const bookToForm = (b: Book): BookFormValues => ({
  title: b.title,
  author: b.author,
  isbn: b.isbn ?? "",
  category: b.category,
  publisher: b.publisher ?? "",
  edition: b.edition ?? "",
  publicationYear: b.publicationYear ? String(b.publicationYear) : "",
  totalCopies: String(b.totalCopies),
  shelfNumber: b.shelfNumber ?? "",
  coverImage: b.coverImage ?? "",
});

/** Number of copies currently out on loan for a book. */
export const copiesOnLoan = (bookId: string, issues: BookIssue[]): number =>
  issues.filter((i) => i.bookId === bookId && i.status === "issued").length;

/** availableCopies = totalCopies − active loans. */
export const reconcileAvailability = (books: Book[], issues: BookIssue[]): Book[] =>
  books.map((b) => ({
    ...b,
    availableCopies: Math.max(0, b.totalCopies - copiesOnLoan(b.id, issues)),
  }));

export const validateBookForm = (
  v: BookFormValues,
  books: Book[],
  opts: { editingId?: string; minCopies?: number } = {},
): BookFormErrors => {
  const errors: BookFormErrors = {};
  if (!v.title.trim()) errors.title = "Book title is required.";
  if (!v.author.trim()) errors.author = "Author is required.";
  if (!v.category.trim()) errors.category = "Select a category.";

  const copies = Number(v.totalCopies);
  if (!v.totalCopies.trim()) errors.totalCopies = "Total copies is required.";
  else if (!Number.isInteger(copies)) errors.totalCopies = "Enter a whole number.";
  else if (copies <= 0) errors.totalCopies = "Copies must be at least 1.";
  else if (copies > 9999) errors.totalCopies = "That seems too many — max 9999.";
  else if (opts.minCopies && copies < opts.minCopies)
    errors.totalCopies = `${opts.minCopies} cop${opts.minCopies === 1 ? "y is" : "ies are"} on loan — total can't be lower.`;

  if (v.isbn.trim()) {
    if (!isValidIsbn(v.isbn)) {
      errors.isbn = "Enter a valid ISBN-10 or ISBN-13 (check digit must match).";
    } else {
      const n = normalizeIsbn(v.isbn);
      const dup = books.find(
        (b) => b.id !== opts.editingId && b.isbn && normalizeIsbn(b.isbn) === n,
      );
      if (dup) errors.isbn = `ISBN already registered to ${dup.id} (${dup.title}).`;
    }
  }

  if (v.publicationYear.trim()) {
    const y = Number(v.publicationYear);
    const max = new Date().getFullYear() + 1;
    if (!Number.isInteger(y) || y < 1000 || y > max)
      errors.publicationYear = `Enter a year between 1000 and ${max}.`;
  }
  return errors;
};

/** Generates the next temporary Book ID (BK-xxxx). */
export const nextBookId = (books: Book[]): string => {
  const max = books.reduce((m, b) => {
    const n = Number(b.id.replace(/\D/g, ""));
    return Number.isFinite(n) && n > m ? n : m;
  }, 1000);
  return `BK-${max + 1}`;
};

const formToFields = (v: BookFormValues) => ({
  title: v.title.trim(),
  author: v.author.trim(),
  isbn: v.isbn.trim() || undefined,
  category: v.category,
  publisher: v.publisher.trim() || undefined,
  edition: v.edition.trim() || undefined,
  publicationYear: v.publicationYear.trim() ? Number(v.publicationYear) : undefined,
  totalCopies: Number(v.totalCopies),
  shelfNumber: v.shelfNumber.trim() || undefined,
  coverImage: v.coverImage || undefined,
});

export const createBook = (books: Book[], v: BookFormValues): { books: Book[]; book: Book } => {
  const errors = validateBookForm(v, books);
  if (Object.keys(errors).length) throw new ServiceError("Please fix the highlighted fields.", errors);
  const fields = formToFields(v);
  const book: Book = {
    id: nextBookId(books),
    ...fields,
    availableCopies: fields.totalCopies,
    createdAt: todayISO(),
  };
  return { books: [book, ...books], book };
};

export const updateBook = (
  books: Book[],
  issues: BookIssue[],
  id: string,
  v: BookFormValues,
): { books: Book[]; book: Book } => {
  const existing = books.find((b) => b.id === id);
  if (!existing) throw new ServiceError(`Book ${id} was not found.`);
  const onLoan = copiesOnLoan(id, issues);
  const errors = validateBookForm(v, books, { editingId: id, minCopies: onLoan });
  if (Object.keys(errors).length) throw new ServiceError("Please fix the highlighted fields.", errors);
  const fields = formToFields(v);
  const book: Book = { ...existing, ...fields, availableCopies: fields.totalCopies - onLoan };
  return { books: books.map((b) => (b.id === id ? book : b)), book };
};

export const deleteBook = (books: Book[], issues: BookIssue[], id: string): Book[] => {
  const onLoan = copiesOnLoan(id, issues);
  if (onLoan > 0)
    throw new ServiceError(
      `This book has ${onLoan} cop${onLoan === 1 ? "y" : "ies"} on loan. Process the returns before deleting it.`,
    );
  return books.filter((b) => b.id !== id);
};

export type StockStatus = "available" | "low" | "out";

export const stockStatus = (b: Book): StockStatus =>
  b.availableCopies <= 0 ? "out" : b.availableCopies <= LOW_STOCK_THRESHOLD ? "low" : "available";

export const searchBooks = (
  books: Book[],
  q: { keyword: string; category: string; availability: AvailabilityFilter; sort: BookSortKey; dir: "asc" | "desc" },
): Book[] => {
  const kw = q.keyword.trim().toLowerCase();
  const kwIsbn = normalizeIsbn(kw);
  const out = books.filter((b) => {
    if (q.category && b.category !== q.category) return false;
    if (q.availability !== "all" && stockStatus(b) !== q.availability) return false;
    if (!kw) return true;
    return (
      b.title.toLowerCase().includes(kw) ||
      b.author.toLowerCase().includes(kw) ||
      b.id.toLowerCase().includes(kw) ||
      (!!b.isbn && !!kwIsbn && normalizeIsbn(b.isbn).toLowerCase().includes(kwIsbn.toLowerCase()))
    );
  });
  const m = q.dir === "asc" ? 1 : -1;
  return [...out].sort((a, b) => {
    if (q.sort === "stock") return (a.availableCopies - b.availableCopies) * m || a.title.localeCompare(b.title);
    return a[q.sort].localeCompare(b[q.sort]) * m;
  });
};

/** Copy IDs (BK-1001-C01…) not currently on loan. */
export const availableCopyIds = (book: Book, issues: BookIssue[]): string[] => {
  const taken = new Set(
    issues.filter((i) => i.bookId === book.id && i.status === "issued").map((i) => i.bookCopyId),
  );
  return Array.from({ length: book.totalCopies }, (_, i) => `${book.id}-C${String(i + 1).padStart(2, "0")}`).filter(
    (c) => !taken.has(c),
  );
};
