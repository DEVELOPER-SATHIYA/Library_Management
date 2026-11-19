import type { BookCopy } from "./book.types";
import type { BookIssue } from "./issue.types";

/** A row in the copy-level tables: one physical copy plus its title and current loan. */
export interface CatalogueCopy extends BookCopy {
  bookId: string;
  title: string;
  author: string;
  publisher?: string;
  publishYear?: string;
  status: CopyStatus;
  /** Active loan for this copy, if any. */
  loan?: BookIssue;
}

/** available = on the shelf, issued = borrowed, unavailable = written off / lost / transferred. */
export type CopyStatus = "available" | "issued" | "unavailable";

export type CopyStatusFilter = "all" | CopyStatus;

export type CatalogueSortKey = "accNo" | "title" | "author";
