import { useCallback, useState } from "react";
import { useLibrary } from "../context/LibraryContext";
import { useToast } from "../context/ToastContext";
import type { BookIssue, ReturnFormValues } from "../types/issue.types";

/**
 * Shared return flow used by the Issued Books table and the Issue / Return page.
 * Works for a single loan or several loans returned together.
 */
export const useReturnBook = (onReturned?: (ids: string[]) => void) => {
  const { returnBooks, getBook } = useLibrary();
  const notify = useToast();
  const [targets, setTargets] = useState<BookIssue[]>([]);

  const open = useCallback((issues: BookIssue | BookIssue[]) => {
    setTargets(Array.isArray(issues) ? issues.filter((i) => i.status === "issued") : [issues]);
  }, []);
  const close = useCallback(() => setTargets([]), []);

  /** Throws on validation failure so the dialog can show the message inline. */
  const confirm = useCallback(
    (values: ReturnFormValues) => {
      const results = returnBooks(values);
      const late = results.filter((r) => r.daysLate > 0);
      const fine = results.reduce((s, r) => s + (r.issue.fineAmount ?? 0), 0);
      const students = [...new Set(results.map((r) => r.issue.studentName))].join(", ");
      const what =
        results.length === 1
          ? getBook(results[0].issue.bookId)?.title ?? results[0].issue.bookId
          : `${results.length} books`;
      const fineText = fine ? ` · fine ₹${fine}` : "";

      if (late.length > 0) {
        const lateText =
          results.length === 1
            ? `Returned ${late[0].daysLate} day${late[0].daysLate === 1 ? "" : "s"} late`
            : `${late.length} of ${results.length} books returned late`;
        notify("warning", lateText, `${what} from ${students} back on the shelf${fineText}.`);
      } else {
        notify("success", results.length === 1 ? "Book returned" : `${results.length} books returned`, `${what} from ${students} back on the shelf${fineText}.`);
      }
      onReturned?.(results.map((r) => r.issue.id));
      setTargets([]);
    },
    [returnBooks, getBook, notify, onReturned],
  );

  return { targets, open, close, confirm };
};
