import { createContext, useContext } from "react";
import type { Book, BookCopy, BookFormValues } from "../types/book.types";
import type { EditingCopy } from "../services/book.service";
import type { BookIssue, IssueFormValues, ReturnFormValues } from "../types/issue.types";

/**
 * Single source of truth for the UI. Loaded once from the data source
 * (sample spreadsheet now, Supabase later); every page reads from here, so
 * an issue or return instantly refreshes the dashboard, catalogue and tables.
 * The provider component lives in LibraryProvider.tsx (kept separate so Vite Fast Refresh works).
 */
export interface LibraryContextValue {
  /** Data stays empty until status is "ready". */
  status: "loading" | "ready" | "error";
  error?: string;
  reload: () => void;

  books: Book[];
  issues: BookIssue[];
  today: string;
  getBook: (id: string) => Book | undefined;
  /** Registers one copy (added to an existing title with the same title + author, or a new title). */
  registerCopy: (v: BookFormValues) => { book: Book; copy: BookCopy; newTitle: boolean };
  /** Saves the edit form for one copy; title details apply to all copies of the title. */
  updateCopy: (editing: EditingCopy, v: BookFormValues) => { book: Book; copy: BookCopy };
  /** Issues every book in the form to one student; returns the new transactions. */
  issueBooks: (v: IssueFormValues) => BookIssue[];
  /** Closes one or more loans in a single step. */
  returnBooks: (r: ReturnFormValues) => { issue: BookIssue; daysLate: number }[];
}

export const LibraryContext = createContext<LibraryContextValue | null>(null);

export const useLibrary = (): LibraryContextValue => {
  const ctx = useContext(LibraryContext);
  if (!ctx) throw new Error("useLibrary must be used inside <LibraryProvider>");
  return ctx;
};
