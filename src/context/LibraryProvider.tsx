import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import type { BookFormValues } from "../types/book.types";
import type { IssueFormValues, ReturnFormValues } from "../types/issue.types";
import { registerCopy as registerCopyIn, updateCopy as updateCopyIn, type EditingCopy } from "../services/book.service";
import { createIssues, returnIssues } from "../services/issue.service";
import { loadLibraryData, type LibraryData } from "../services/libraryData.service";
import { todayISO } from "../utils/date";
import { LibraryContext } from "./LibraryContext";

type LoadState = { status: "loading" } | { status: "ready" } | { status: "error"; error: string };

export const LibraryProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<LibraryData>({ books: [], issues: [] });
  const [load, setLoad] = useState<LoadState>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);
  const today = todayISO();

  useEffect(() => {
    let active = true;
    setLoad({ status: "loading" });
    loadLibraryData().then(
      (data) => {
        if (!active) return;
        setState(data);
        setLoad({ status: "ready" });
      },
      (e) => active && setLoad({ status: "error", error: e instanceof Error ? e.message : String(e) }),
    );
    return () => {
      active = false;
    };
  }, [attempt]);

  const reload = useCallback(() => setAttempt((a) => a + 1), []);

  // Each action computes the next state synchronously (so errors surface to the caller), then commits it.
  const getBook = useCallback((id: string) => state.books.find((b) => b.id === id), [state.books]);

  const registerCopy = useCallback(
    (v: BookFormValues) => {
      const res = registerCopyIn(state.books, state.issues, v);
      setState((s) => ({ ...s, books: res.books }));
      return { book: res.book, copy: res.copy, newTitle: res.newTitle };
    },
    [state.books, state.issues],
  );

  const updateCopy = useCallback(
    (editing: EditingCopy, v: BookFormValues) => {
      const res = updateCopyIn(state.books, state.issues, editing, v);
      setState({ books: res.books, issues: res.issues });
      return { book: res.book, copy: res.copy };
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
    () => ({
      ...state,
      status: load.status,
      error: load.status === "error" ? load.error : undefined,
      reload,
      today,
      getBook,
      registerCopy,
      updateCopy,
      issueBooks,
      returnBooks,
    }),
    [state, load, reload, today, getBook, registerCopy, updateCopy, issueBooks, returnBooks],
  );

  return <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>;
};
