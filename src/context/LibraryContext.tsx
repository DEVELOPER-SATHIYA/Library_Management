import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import type { Book, BookFormValues } from "../types/book.types";
import type { BookIssue, IssueFormValues, ReturnFormValues } from "../types/issue.types";
import { mockBooks } from "../data/mockBooks";
import { mockIssues } from "../data/mockIssues";
import { createBook, deleteBook, reconcileAvailability, updateBook } from "../services/book.service";
import { createIssues, returnIssues } from "../services/issue.service";
import { todayISO } from "../utils/date";

/**
 * Single source of truth for the UI-only phase.
 * Books and issues live in React state; every page reads from here, so a
 * new issue or return instantly refreshes the dashboard, catalogue and tables.
 */
interface LibraryContextValue {
  books: Book[];
  issues: BookIssue[];
  today: string;
  getBook: (id: string) => Book | undefined;
  addBook: (v: BookFormValues) => Book;
  editBook: (id: string, v: BookFormValues) => Book;
  removeBook: (id: string) => void;
  /** Issues every book in the form to one student; returns the new transactions. */
  issueBooks: (v: IssueFormValues) => BookIssue[];
  /** Closes one or more loans in a single step. */
  returnBooks: (r: ReturnFormValues) => { issue: BookIssue; daysLate: number }[];
}

const LibraryContext = createContext<LibraryContextValue | null>(null);

interface State {
  books: Book[];
  issues: BookIssue[];
}

export const LibraryProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<State>(() => ({
    books: reconcileAvailability(mockBooks, mockIssues),
    issues: mockIssues,
  }));
  const today = todayISO();

  // Each action computes the next state synchronously (so errors surface to the caller), then commits it.
  const getBook = useCallback((id: string) => state.books.find((b) => b.id === id), [state.books]);

  const addBook = useCallback(
    (v: BookFormValues) => {
      const res = createBook(state.books, v);
      setState((s) => ({ ...s, books: res.books }));
      return res.book;
    },
    [state.books],
  );

  const editBook = useCallback(
    (id: string, v: BookFormValues) => {
      const res = updateBook(state.books, state.issues, id, v);
      setState((s) => ({ ...s, books: res.books }));
      return res.book;
    },
    [state.books, state.issues],
  );

  const removeBook = useCallback(
    (id: string) => {
      const books = deleteBook(state.books, state.issues, id);
      setState((s) => ({ ...s, books }));
    },
    [state.books, state.issues],
  );

  const issueBooks = useCallback(
    (v: IssueFormValues) => {
      const res = createIssues(state.books, state.issues, v);
      setState({ books: res.books, issues: res.issues });
      return res.created;
    },
    [state.books, state.issues],
  );

  const returnBooks = useCallback(
    (r: ReturnFormValues) => {
      const res = returnIssues(state.books, state.issues, r);
      setState({ books: res.books, issues: res.issues });
      return res.returned;
    },
    [state.books, state.issues],
  );

  const value = useMemo(
    () => ({ ...state, today, getBook, addBook, editBook, removeBook, issueBooks, returnBooks }),
    [state, today, getBook, addBook, editBook, removeBook, issueBooks, returnBooks],
  );

  return <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>;
};

export const useLibrary = (): LibraryContextValue => {
  const ctx = useContext(LibraryContext);
  if (!ctx) throw new Error("useLibrary must be used inside <LibraryProvider>");
  return ctx;
};
