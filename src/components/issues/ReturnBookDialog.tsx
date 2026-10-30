import { useEffect, useMemo, useState } from "react";
import type { Book } from "../../types/book.types";
import type { BookIssue, ReturnCondition, ReturnFormValues, ReturnItem } from "../../types/issue.types";
import { FINE_PER_DAY, returnItemFor } from "../../services/issue.service";
import { Banner, Button, Field, FieldError, FormGrid, Input, Label, Required, Select, TextArea } from "../../styles/ui";
import { diffInDays, formatDate } from "../../utils/date";
import { BookCover } from "../common/BookCover";
import { StatusBadge } from "../common/StatusBadge";
import { Icon } from "../common/Icon";
import { Modal } from "../common/Modal";
import { ReturnHead, ReturnList, ReturnRow, TotalRow } from "./issues.styles";

interface ReturnBookDialogProps {
  /** Loans being returned together (empty = closed). */
  issues: BookIssue[];
  books: Book[];
  today: string;
  onCancel: () => void;
  /** Should throw (ServiceError) on failure; the message is shown inline. */
  onConfirm: (values: ReturnFormValues) => void;
}

const CONDITIONS: { value: ReturnCondition; label: string }[] = [
  { value: "good", label: "Good" },
  { value: "fair", label: "Fair – minor wear" },
  { value: "damaged", label: "Damaged" },
  { value: "lost", label: "Lost" },
];

/**
 * Return one or many books in one step. The return date and remarks are shared;
 * condition and fine are recorded per book. Late books get a suggested fine.
 */
export const ReturnBookDialog = ({ issues, books, today, onCancel, onConfirm }: ReturnBookDialogProps) => {
  const [returnDate, setReturnDate] = useState(today);
  const [remarks, setRemarks] = useState("");
  const [items, setItems] = useState<ReturnItem[]>([]);
  const [error, setError] = useState("");

  const key = issues.map((i) => i.id).join(",");
  useEffect(() => {
    setReturnDate(today);
    setRemarks("");
    setItems(issues.map((i) => returnItemFor(i, today)));
    setError("");
    // Reset only when a different set of loans is opened.
  }, [key, today]);

  const lateCount = useMemo(
    () => issues.filter((i) => returnDate && diffInDays(i.dueDate, returnDate) > 0).length,
    [issues, returnDate],
  );
  const totalFine = items.reduce((sum, it) => sum + (Number(it.fineAmount) || 0), 0);

  if (issues.length === 0) return null;

  const latestIssue = issues.reduce((m, i) => (i.issueDate > m ? i.issueDate : m), issues[0].issueDate);
  const beforeIssue = !!returnDate && diffInDays(latestIssue, returnDate) < 0;
  const students = [...new Set(issues.map((i) => `${i.studentName} (${i.studentId})`))];
  const count = issues.length;
  const bookOf = (id: string) => books.find((b) => b.id === id);

  const changeDate = (d: string) => {
    setReturnDate(d);
    // Re-suggest fines for the new date (keeps chosen conditions).
    setItems((prev) =>
      issues.map((i) => {
        const p = prev.find((x) => x.issueId === i.id);
        const s = d ? returnItemFor(i, d) : { issueId: i.id, returnCondition: "good" as const, fineAmount: "" };
        return { ...s, returnCondition: p?.returnCondition ?? "good" };
      }),
    );
    setError("");
  };

  const patch = (id: string, change: Partial<ReturnItem>) =>
    setItems((prev) => prev.map((it) => (it.issueId === id ? { ...it, ...change } : it)));

  const submit = () => {
    try {
      onConfirm({ returnDate, returnRemarks: remarks, items });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    }
  };

  return (
    <Modal
      open
      width={count > 1 ? 760 : 620}
      title={count > 1 ? `Return ${count} books` : "Return book"}
      subtitle={students.length === 1 ? `Borrowed by ${students[0]}` : `${students.length} students`}
      onClose={onCancel}
      footer={
        <>
          <Button type="button" $variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="button" $variant="success" onClick={submit} disabled={!returnDate || beforeIssue}>
            <Icon name="return" />
            Confirm return{count > 1 ? ` of ${count} books` : ""}
          </Button>
        </>
      }
    >
      <FormGrid>
        <Field>
          <Label htmlFor="ret-date">
            Return date<Required>*</Required>
          </Label>
          <Input
            id="ret-date"
            type="date"
            value={returnDate}
            min={latestIssue}
            $invalid={beforeIssue}
            onChange={(e) => changeDate(e.target.value)}
          />
          {beforeIssue && <FieldError>Can't be before an issue date ({formatDate(latestIssue)}).</FieldError>}
        </Field>
        <Field>
          <Label htmlFor="ret-remarks">Remarks</Label>
          <TextArea
            id="ret-remarks"
            rows={1}
            value={remarks}
            placeholder="Applies to all books in this return"
            onChange={(e) => setRemarks(e.target.value)}
          />
        </Field>
      </FormGrid>

      {lateCount > 0 ? (
        <Banner $tone="danger">
          <Icon name="alert" />
          <div>
            <strong>
              {count === 1 ? "Returned late" : `${lateCount} of ${count} books returned late`}.
            </strong>{" "}
            A suggested fine of ₹{FINE_PER_DAY}/day has been filled in — adjust or clear it as needed.
          </div>
        </Banner>
      ) : (
        <Banner $tone="success">
          <Icon name="check" />
          <div>{count === 1 ? "Returned on time" : "All books returned on time"} — no fine due.</div>
        </Banner>
      )}

      <ReturnHead>
        <span>Book</span>
        <span>Condition</span>
        <span>Fine (₹)</span>
      </ReturnHead>
      <ReturnList>
        {issues.map((i) => {
          const b = bookOf(i.bookId);
          const item = items.find((it) => it.issueId === i.id);
          const late = returnDate ? Math.max(0, diffInDays(i.dueDate, returnDate)) : 0;
          return (
            <ReturnRow key={i.id} $late={late > 0}>
              {b ? <BookCover book={b} /> : <span />}
              <div>
                <strong>{b?.title ?? i.bookId}</strong>
                <small>
                  {i.bookCopyId ?? i.bookId} · {i.id} · issued {formatDate(i.issueDate)} · due {formatDate(i.dueDate)}
                </small>
                {late > 0 && (
                  <StatusBadge tone="danger">
                    {late} day{late === 1 ? "" : "s"} late
                  </StatusBadge>
                )}
              </div>
              <Select
                aria-label={`Condition of ${b?.title ?? i.bookId}`}
                value={item?.returnCondition ?? "good"}
                onChange={(e) => patch(i.id, { returnCondition: e.target.value as ReturnCondition })}
              >
                {CONDITIONS.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </Select>
              <Input
                aria-label={`Fine for ${b?.title ?? i.bookId}`}
                type="number"
                min={0}
                placeholder="0"
                value={item?.fineAmount ?? ""}
                onChange={(e) => patch(i.id, { fineAmount: e.target.value })}
              />
            </ReturnRow>
          );
        })}
      </ReturnList>

      {count > 1 && (
        <TotalRow>
          <span>
            {count} books · {lateCount} late
          </span>
          <span>
            Total fine <strong>₹{totalFine}</strong>
          </span>
        </TotalRow>
      )}

      {error && (
        <Banner $tone="danger">
          <Icon name="alert" />
          <div>{error}</div>
        </Banner>
      )}
    </Modal>
  );
};
