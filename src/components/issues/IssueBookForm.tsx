import { useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import type { Book } from "../../types/book.types";
import type { BookIssue, IssueFormErrors, IssueFormValues, IssueItem } from "../../types/issue.types";
import { availableCopyIds } from "../../services/book.service";
import { activeLoansFor, emptyIssueForm, validateIssueForm } from "../../services/issue.service";
import {
  Banner,
  Button,
  DetailList,
  Field,
  FieldError,
  FieldHint,
  FormActions,
  FormGrid,
  FormSection,
  IconButton,
  Input,
  Label,
  Mono,
  Required,
  SectionHint,
  Select,
  TextArea,
} from "../../styles/ui";
import { addDays, diffInDays, formatDate } from "../../utils/date";
import { MAX_BOOKS_PER_STUDENT } from "../../utils/constants";
import { BookCover } from "../common/BookCover";
import { LoanStatusBadge } from "../common/badges";
import { Icon } from "../common/Icon";
import {
  BookPicker,
  CartCount,
  CartEmpty,
  CartItem,
  CartList,
  Chip,
  HeldLoans,
  LoanPeriod,
  PickerRow,
  Step,
  Steps,
  Summary,
  SummaryBox,
  SummaryGrid,
} from "./issues.styles";

interface IssueBookFormProps {
  books: Book[];
  issues: BookIssue[];
  today: string;
  initialBookId?: string;
  /** Throws ServiceError on failure. */
  onConfirm: (values: IssueFormValues) => BookIssue[];
  onDone: (issues: BookIssue[]) => void;
}

const LOAN_PRESETS = [7, 14, 21, 30];

type FieldKey = keyof IssueFormValues;

const initialItems = (books: Book[], bookId?: string): IssueItem[] =>
  bookId && books.some((b) => b.id === bookId && b.availableCopies > 0) ? [{ bookId, bookCopyId: "" }] : [];

/**
 * Issue one or more books to a single student in one transaction.
 * Each book becomes its own loan record (same student, dates and notes).
 */
export const IssueBookForm = ({ books, issues, today, initialBookId, onConfirm, onDone }: IssueBookFormProps) => {
  const [values, setValues] = useState<IssueFormValues>(() => ({
    ...emptyIssueForm(),
    items: initialItems(books, initialBookId),
  }));
  const [step, setStep] = useState<"form" | "summary">("form");
  const [touched, setTouched] = useState<Partial<Record<FieldKey, boolean>>>({});
  const [submitted, setSubmitted] = useState(false);
  // A field shows errors once it has been edited and left (or after submit), so an
  // untouched field doesn't jump the layout on blur.
  const [dirty, setDirty] = useState<Partial<Record<FieldKey, boolean>>>({});
  const [serverErrors, setServerErrors] = useState<IssueFormErrors>({});
  const [bookQuery, setBookQuery] = useState("");
  const [error, setError] = useState("");

  const errors = useMemo(() => validateIssueForm(values, books, issues), [values, books, issues]);
  const errorFor = (k: FieldKey) => serverErrors[k] ?? ((touched[k] || submitted) && errors[k] ? errors[k] : undefined);

  // Students seen in earlier transactions — a stand-in for the future student database.
  const knownStudents = useMemo(() => {
    const map = new Map<string, BookIssue>();
    issues.forEach((i) => map.has(i.studentId) || map.set(i.studentId, i));
    return [...map.values()];
  }, [issues]);

  const held = useMemo(() => activeLoansFor(values.studentId, issues), [values.studentId, issues]);
  const slotsLeft = Math.max(0, MAX_BOOKS_PER_STUDENT - held.length - values.items.length);

  const bookOf = (id: string) => books.find((b) => b.id === id);
  const inCart = new Set(values.items.map((i) => i.bookId));
  const heldIds = new Set(held.map((h) => h.bookId));

  const issuable = useMemo(() => {
    const q = bookQuery.trim().toLowerCase();
    return books
      .filter((b) => b.availableCopies > 0 && !inCart.has(b.id) && !heldIds.has(b.id))
      .filter(
        (b) =>
          !q ||
          b.title.toLowerCase().includes(q) ||
          b.author.toLowerCase().includes(q) ||
          b.id.toLowerCase().includes(q) ||
          (b.isbn ?? "").replace(/-/g, "").includes(q.replace(/-/g, "")),
      )
      .sort((a, b) => a.title.localeCompare(b.title));
  }, [books, bookQuery, values.items, held]);

  const loanDays = values.issueDate && values.dueDate ? diffInDays(values.issueDate, values.dueDate) : 0;

  /* ---------- field handlers ---------- */
  const set = (k: Exclude<FieldKey, "items">) => (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const value = e.target.value;
    setDirty((d) => ({ ...d, [k]: true }));
    if (e.target.type === "date") setTouched((t) => ({ ...t, [k]: true }));
    setServerErrors((s) => ({ ...s, [k]: undefined }));
    setValues((v) => {
      const next = { ...v, [k]: value };
      // Keep the same loan length when the issue date moves.
      if (k === "issueDate" && value && v.issueDate && v.dueDate)
        next.dueDate = addDays(value, Math.max(0, diffInDays(v.issueDate, v.dueDate)));
      if (k === "studentId") {
        const match = knownStudents.find((s) => s.studentId.toLowerCase() === value.trim().toLowerCase());
        if (match && !v.studentName) {
          next.studentName = match.studentName;
          next.studentClass = match.studentClass ?? "";
          next.studentPhone = match.studentPhone ?? "";
        }
      }
      return next;
    });
  };
  const blur = (k: FieldKey) => () => dirty[k] && setTouched((t) => ({ ...t, [k]: true }));
  const err = (k: FieldKey) => errorFor(k) && <FieldError role="alert">{errorFor(k)}</FieldError>;

  const updateItems = (fn: (items: IssueItem[]) => IssueItem[]) => {
    setValues((v) => ({ ...v, items: fn(v.items) }));
    setTouched((t) => ({ ...t, items: true }));
    setServerErrors((s) => ({ ...s, items: undefined }));
  };
  const addBook = (bookId: string) => {
    if (!bookId) return;
    updateItems((items) => (items.some((i) => i.bookId === bookId) ? items : [...items, { bookId, bookCopyId: "" }]));
  };
  const removeBook = (bookId: string) => updateItems((items) => items.filter((i) => i.bookId !== bookId));
  const setCopy = (bookId: string, copy: string) =>
    updateItems((items) => items.map((i) => (i.bookId === bookId ? { ...i, bookCopyId: copy } : i)));

  /* ---------- submit ---------- */
  const clearAll = () => {
    setValues(emptyIssueForm());
    setTouched({});
    setDirty({});
    setSubmitted(false);
    setServerErrors({});
    setBookQuery("");
  };

  const review = (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    const keys = Object.keys(errors);
    if (keys.length) {
      document.getElementById(keys[0] === "items" ? "iss-addBook" : `iss-${keys[0]}`)?.focus();
      return;
    }
    setError("");
    setStep("summary");
  };

  const confirm = () => {
    try {
      const created = onConfirm(values);
      onDone(created);
      clearAll();
      setStep("form");
    } catch (e) {
      const fe = (e as { fieldErrors?: IssueFormErrors }).fieldErrors;
      if (fe) setServerErrors(fe);
      setError(e instanceof Error ? e.message : "Could not issue the books.");
      setStep("form");
    }
  };

  const reset = () => {
    clearAll();
    setError("");
  };

  const count = values.items.length;
  const booksLabel = `${count} book${count === 1 ? "" : "s"}`;

  const steps = (
    <Steps aria-label="Progress">
      <Step $state={step === "form" ? "active" : "done"}>
        <span>{step === "form" ? 1 : <Icon name="check" size={13} />}</span>Enter details
      </Step>
      <Step $state={step === "summary" ? "active" : "todo"}>
        <span>2</span>Review &amp; confirm
      </Step>
    </Steps>
  );

  /* ---------- step 2: summary ---------- */
  if (step === "summary") {
    return (
      <Summary>
        {steps}
        <Banner $tone="info">
          <Icon name="info" />
          <div>
            Check the details below. Confirming creates {count === 1 ? "one loan record" : `${count} loan records`} and
            reduces each book's available copies by one.
          </div>
        </Banner>
        <SummaryGrid>
          <SummaryBox>
            <h3>Borrower</h3>
            <DetailList>
              <div>
                <dt>Student</dt>
                <dd>
                  {values.studentName} ({values.studentId.toUpperCase()})
                </dd>
              </div>
              <div>
                <dt>Class / Department</dt>
                <dd>{values.studentClass || "—"}</dd>
              </div>
              <div>
                <dt>Phone</dt>
                <dd>{values.studentPhone || "—"}</dd>
              </div>
              <div>
                <dt>Books held after this issue</dt>
                <dd>
                  {held.length + count} of {MAX_BOOKS_PER_STUDENT}
                </dd>
              </div>
            </DetailList>
          </SummaryBox>
          <SummaryBox>
            <h3>Loan</h3>
            <DetailList>
              <div>
                <dt>Loan period</dt>
                <dd>
                  {formatDate(values.issueDate)} → {formatDate(values.dueDate)} ({loanDays} day{loanDays === 1 ? "" : "s"})
                </dd>
              </div>
              <div>
                <dt>Books</dt>
                <dd>{booksLabel}</dd>
              </div>
              {values.notes && (
                <div>
                  <dt>Notes</dt>
                  <dd>{values.notes}</dd>
                </div>
              )}
            </DetailList>
          </SummaryBox>
        </SummaryGrid>

        <SummaryBox>
          <h3>Books to issue ({count})</h3>
          <CartList>
            {values.items.map((it) => {
              const b = bookOf(it.bookId);
              if (!b) return null;
              const copy = it.bookCopyId || availableCopyIds(b, issues)[0];
              return (
                <CartItem key={it.bookId}>
                  <BookCover book={b} />
                  <div>
                    <strong>{b.title}</strong>
                    <small>
                      {b.author} · copy <Mono>{copy}</Mono>
                      {!it.bookCopyId && " (auto-assigned)"}
                    </small>
                  </div>
                  <small>
                    {b.availableCopies - 1} of {b.totalCopies} left
                  </small>
                </CartItem>
              );
            })}
          </CartList>
        </SummaryBox>

        <FormActions>
          <Button type="button" $variant="secondary" onClick={() => setStep("form")}>
            <Icon name="chevronLeft" />
            Back to edit
          </Button>
          <Button type="button" $variant="success" onClick={confirm}>
            <Icon name="check" />
            Confirm &amp; issue {booksLabel}
          </Button>
        </FormActions>
      </Summary>
    );
  }

  /* ---------- step 1: form ---------- */
  return (
    <form onSubmit={review} noValidate>
      {steps}
      {error && (
        <Banner $tone="danger">
          <Icon name="alert" />
          <div>{error}</div>
        </Banner>
      )}

      <FormSection>
        <legend>Borrower information</legend>
        <SectionHint>Entered manually for now — will be looked up from the student database later.</SectionHint>
        <FormGrid>
          <Field>
            <Label htmlFor="iss-studentId">
              Student ID<Required>*</Required>
            </Label>
            <Input
              id="iss-studentId"
              list="known-students"
              placeholder="e.g. STU-24001"
              value={values.studentId}
              onChange={set("studentId")}
              onBlur={blur("studentId")}
              $invalid={!!errorFor("studentId")}
              autoComplete="off"
            />
            <datalist id="known-students">
              {knownStudents.map((s) => (
                <option key={s.studentId} value={s.studentId}>
                  {s.studentName}
                </option>
              ))}
            </datalist>
            {errorFor("studentId") ? err("studentId") : <FieldHint>Known IDs auto-fill the details below</FieldHint>}
          </Field>
          <Field>
            <Label htmlFor="iss-studentName">
              Student Name<Required>*</Required>
            </Label>
            <Input
              id="iss-studentName"
              placeholder="Full name"
              value={values.studentName}
              onChange={set("studentName")}
              onBlur={blur("studentName")}
              $invalid={!!errorFor("studentName")}
            />
            {err("studentName")}
          </Field>
          <Field>
            <Label htmlFor="iss-studentClass">Class / Department</Label>
            <Input
              id="iss-studentClass"
              placeholder="e.g. B.Sc Computer Science – II"
              value={values.studentClass}
              onChange={set("studentClass")}
            />
          </Field>
          <Field>
            <Label htmlFor="iss-studentPhone">Phone Number</Label>
            <Input
              id="iss-studentPhone"
              type="tel"
              placeholder="e.g. 98400 11201"
              value={values.studentPhone}
              onChange={set("studentPhone")}
              onBlur={blur("studentPhone")}
              $invalid={!!errorFor("studentPhone")}
            />
            {err("studentPhone")}
          </Field>
        </FormGrid>

        {held.length > 0 && (
          <HeldLoans>
            <p>
              <Icon name="info" size={15} />
              Already borrowed by this student ({held.length} of {MAX_BOOKS_PER_STUDENT}):
            </p>
            <ul>
              {held.map((h) => (
                <li key={h.id}>
                  <span>
                    {bookOf(h.bookId)?.title ?? h.bookId} · due {formatDate(h.dueDate)}
                  </span>
                  <LoanStatusBadge issue={h} today={today} />
                </li>
              ))}
            </ul>
          </HeldLoans>
        )}
      </FormSection>

      <FormSection>
        <legend>Books</legend>
        <SectionHint>
          Add every book the student is taking. Up to {MAX_BOOKS_PER_STUDENT} books per student, including ones they
          already hold. Only titles with available copies are listed.
        </SectionHint>

        <BookPicker>
          <PickerRow>
            <Input
              type="search"
              placeholder="Filter by title, author, ISBN or Book ID…"
              value={bookQuery}
              onChange={(e) => setBookQuery(e.target.value)}
              aria-label="Filter books"
            />
            <Select
              id="iss-addBook"
              value=""
              disabled={slotsLeft === 0}
              $invalid={!!errorFor("items")}
              onChange={(e) => addBook(e.target.value)}
              aria-label="Add a book"
            >
              <option value="">
                {slotsLeft === 0
                  ? "Book limit reached"
                  : issuable.length
                    ? `+ Add a book (${issuable.length} available)`
                    : "No matching books with stock"}
              </option>
              {issuable.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.title} — {b.author} ({b.availableCopies} of {b.totalCopies} available)
                </option>
              ))}
            </Select>
          </PickerRow>

          {count === 0 ? (
            <CartEmpty $invalid={!!errorFor("items")}>
              <Icon name="books" size={20} />
              No books added yet — choose from the list above.
            </CartEmpty>
          ) : (
            <>
              <CartCount>
                <strong>{booksLabel}</strong> selected
                {slotsLeft > 0 ? ` · ${slotsLeft} more allowed` : " · limit reached"}
              </CartCount>
              <CartList>
                {values.items.map((it, idx) => {
                  const b = bookOf(it.bookId);
                  if (!b) return null;
                  const copies = availableCopyIds(b, issues);
                  return (
                    <CartItem key={it.bookId}>
                      <BookCover book={b} />
                      <div>
                        <strong>
                          {idx + 1}. {b.title}
                        </strong>
                        <small>
                          {b.author} · {b.id} · Shelf {b.shelfNumber ?? "—"} · {b.availableCopies} available
                        </small>
                      </div>
                      <Select
                        aria-label={`Copy of ${b.title}`}
                        value={it.bookCopyId}
                        onChange={(e) => setCopy(b.id, e.target.value)}
                      >
                        <option value="">Auto-assign copy</option>
                        {copies.map((c) => (
                          <option key={c}>{c}</option>
                        ))}
                      </Select>
                      <IconButton
                        type="button"
                        $tone="danger"
                        title="Remove"
                        aria-label={`Remove ${b.title}`}
                        onClick={() => removeBook(b.id)}
                      >
                        <Icon name="x" />
                      </IconButton>
                    </CartItem>
                  );
                })}
              </CartList>
            </>
          )}
          {err("items")}
        </BookPicker>
      </FormSection>

      <FormSection>
        <legend>Transaction details</legend>
        <SectionHint>The same issue and due dates apply to every book in this transaction.</SectionHint>
        <FormGrid>
          <Field>
            <Label htmlFor="iss-issueDate">
              Issue Date<Required>*</Required>
            </Label>
            <Input
              id="iss-issueDate"
              type="date"
              value={values.issueDate}
              onChange={set("issueDate")}
              onBlur={blur("issueDate")}
              $invalid={!!errorFor("issueDate")}
            />
            {err("issueDate")}
          </Field>
          <Field>
            <Label htmlFor="iss-dueDate">
              Due Date<Required>*</Required>
            </Label>
            <Input
              id="iss-dueDate"
              type="date"
              value={values.dueDate}
              min={values.issueDate}
              onChange={set("dueDate")}
              onBlur={blur("dueDate")}
              $invalid={!!errorFor("dueDate")}
            />
            {err("dueDate")}
            <LoanPeriod>
              {LOAN_PRESETS.map((d) => (
                <Chip
                  key={d}
                  type="button"
                  $active={loanDays === d}
                  onClick={() => values.issueDate && setValues((v) => ({ ...v, dueDate: addDays(v.issueDate, d) }))}
                >
                  {d} days
                </Chip>
              ))}
            </LoanPeriod>
          </Field>
          <Field $span={2}>
            <Label htmlFor="iss-notes">Notes</Label>
            <TextArea
              id="iss-notes"
              rows={2}
              placeholder="Anything to remember about this loan"
              value={values.notes}
              onChange={set("notes")}
            />
          </Field>
        </FormGrid>
      </FormSection>

      <FormActions>
        <Button type="button" $variant="secondary" onClick={reset}>
          Reset Form
        </Button>
        <Button type="submit">
          Review {count > 0 ? booksLabel : "issue"}
          <Icon name="chevronRight" />
        </Button>
      </FormActions>
    </form>
  );
};
