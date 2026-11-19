/** One physical copy of a title, identified by its accession number. */
export interface BookCopy {
  accNo: string;
  /** Shelf code, e.g. "CWA3-1". Falls back to the title's shelfNumber when missing. */
  shelf?: string;
  price?: string;
  /** Set when the copy can't be lent (written off, lost, transferred) — holds the reason. */
  withdrawnReason?: string;
  purchaseDate?: string; // YYYY-MM-DD
  remarks?: string;
  /** Page of the accession register the copy is recorded on. */
  registerPage?: string;
  /** Serial number from the source register. */
  serial?: string;
  /** ISO timestamp, set when registered in the app (used for "Recently added"). */
  addedAt?: string;
}

/** A catalogue title. Loans are tracked per copy in BookIssue.bookCopyId. */
export interface Book {
  id: string;
  title: string;
  author: string;
  isbn?: string;
  publisher?: string;
  edition?: string;
  publicationYear?: number;
  copies: BookCopy[];
  /** Lendable copies (excludes withdrawn ones). Kept in sync by book.service. */
  totalCopies: number;
  /** totalCopies − copies on loan. Kept in sync by book.service. */
  availableCopies: number;
  shelfNumber?: string;
  createdAt?: string;
}

/**
 * Values captured by the register / edit form (strings straight from inputs).
 * One form = one physical copy: accNo, shelf, registerPage and price belong to the copy;
 * the rest describe the title and apply to all of its copies.
 */
export interface BookFormValues {
  /** Shown as "Book ID" in the form. */
  accNo: string;
  title: string;
  author: string;
  isbn: string;
  publisher: string;
  edition: string;
  publicationYear: string;
  shelfNumber: string;
  registerPage: string;
  price: string;
}

export type BookFormErrors = Partial<Record<keyof BookFormValues, string>>;
