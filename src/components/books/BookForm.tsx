import { useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import { BOOK_CATEGORIES, type Book, type BookFormErrors, type BookFormValues } from "../../types/book.types";
import { validateBookForm } from "../../services/book.service";
import {
  Button,
  Field,
  FieldError,
  FieldHint,
  FormActions,
  FormGrid,
  FormSection,
  Input,
  Label,
  Required,
  SectionHint,
  Select,
} from "../../styles/ui";
import { Icon } from "../common/Icon";
import { CoverPreview, CoverUpload, FileLabel, IdPreview } from "./books.styles";

const MAX_COVER_BYTES = 2 * 1024 * 1024;

interface BookFormProps {
  initialValues: BookFormValues;
  books: Book[];
  /** Book ID shown read-only (temporary ID for new records, real ID when editing). */
  bookId: string;
  idHint?: string;
  editingId?: string;
  /** Minimum allowed total copies (copies already on loan). */
  minCopies?: number;
  submitLabel: string;
  /** Return field errors from the service to display them, or nothing on success. */
  onSubmit: (values: BookFormValues) => BookFormErrors | void;
  onCancel?: () => void;
  cancelLabel?: string;
  /** Hide the Reset button (e.g. inside the edit dialog). */
  showReset?: boolean;
}

/** Grouped register / edit form with inline validation. */
export const BookForm = ({
  initialValues,
  books,
  bookId,
  idHint,
  editingId,
  minCopies,
  submitLabel,
  onSubmit,
  onCancel,
  cancelLabel = "Cancel",
  showReset = true,
}: BookFormProps) => {
  const [values, setValues] = useState<BookFormValues>(initialValues);
  const [touched, setTouched] = useState<Partial<Record<keyof BookFormValues, boolean>>>({});
  const [submitted, setSubmitted] = useState(false);
  // A field shows errors once it has been edited and left (or after submit), so an
  // untouched field doesn't jump the layout on blur.
  const [dirty, setDirty] = useState<Partial<Record<keyof BookFormValues, boolean>>>({});
  const [serverErrors, setServerErrors] = useState<BookFormErrors>({});
  const [coverError, setCoverError] = useState("");

  const liveErrors = useMemo(
    () => validateBookForm(values, books, { editingId, minCopies }),
    [values, books, editingId, minCopies],
  );

  const errorFor = (k: keyof BookFormValues) =>
    serverErrors[k] ?? ((touched[k] || submitted) && liveErrors[k] ? liveErrors[k] : undefined);

  const set = (k: keyof BookFormValues) => (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setValues((v) => ({ ...v, [k]: e.target.value }));
    setDirty((d) => ({ ...d, [k]: true }));
    setServerErrors((s) => ({ ...s, [k]: undefined }));
  };
  const blur = (k: keyof BookFormValues) => () => dirty[k] && setTouched((t) => ({ ...t, [k]: true }));

  const onCover = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) return setCoverError("Please choose an image file.");
    if (file.size > MAX_COVER_BYTES) return setCoverError("Image must be 2 MB or smaller.");
    setCoverError("");
    const reader = new FileReader();
    reader.onload = () => setValues((v) => ({ ...v, coverImage: String(reader.result) }));
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    if (Object.keys(liveErrors).length) {
      const first = Object.keys(liveErrors)[0];
      document.getElementById(`book-${first}`)?.focus();
      return;
    }
    const errs = onSubmit(values);
    if (errs && Object.keys(errs).length) setServerErrors(errs);
  };

  const reset = () => {
    setValues(initialValues);
    setTouched({});
    setDirty({});
    setSubmitted(false);
    setServerErrors({});
    setCoverError("");
  };

  const input = (k: keyof BookFormValues, props: Record<string, unknown> = {}) => (
    <Input
      id={`book-${k}`}
      value={values[k]}
      onChange={set(k)}
      onBlur={blur(k)}
      $invalid={!!errorFor(k)}
      aria-invalid={!!errorFor(k)}
      {...props}
    />
  );

  const err = (k: keyof BookFormValues) => errorFor(k) && <FieldError role="alert">{errorFor(k)}</FieldError>;

  return (
    <form onSubmit={handleSubmit} noValidate>
      <FormSection>
        <legend>Book information</legend>
        <SectionHint>Fields marked with * are required.</SectionHint>
        <FormGrid>
          <Field $span={2}>
            <Label htmlFor="book-title">
              Book Title<Required>*</Required>
            </Label>
            {input("title", { placeholder: "e.g. Introduction to Algorithms", autoFocus: !editingId })}
            {err("title")}
          </Field>
          <Field>
            <Label htmlFor="book-author">
              Author<Required>*</Required>
            </Label>
            {input("author", { placeholder: "e.g. Thomas H. Cormen" })}
            {err("author")}
          </Field>
          <Field>
            <Label htmlFor="book-category">
              Category<Required>*</Required>
            </Label>
            <Select
              id="book-category"
              value={values.category}
              onChange={set("category")}
              onBlur={blur("category")}
              $invalid={!!errorFor("category")}
            >
              <option value="">Select a category</option>
              {BOOK_CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </Select>
            {err("category")}
          </Field>
        </FormGrid>
      </FormSection>

      <FormSection>
        <legend>Identification</legend>
        <FormGrid>
          <Field>
            <Label htmlFor="book-isbn">ISBN</Label>
            {input("isbn", { placeholder: "978-0-262-04630-5", inputMode: "numeric" })}
            {errorFor("isbn") ? err("isbn") : <FieldHint>Optional · ISBN-10 or ISBN-13, hyphens allowed</FieldHint>}
          </Field>
          <Field>
            <Label as="span">Book ID</Label>
            <IdPreview>{bookId}</IdPreview>
            {idHint && <FieldHint>{idHint}</FieldHint>}
          </Field>
        </FormGrid>
      </FormSection>

      <FormSection>
        <legend>Publication details</legend>
        <FormGrid $cols={3}>
          <Field>
            <Label htmlFor="book-publisher">Publisher</Label>
            {input("publisher", { placeholder: "e.g. MIT Press" })}
          </Field>
          <Field>
            <Label htmlFor="book-edition">Edition</Label>
            {input("edition", { placeholder: "e.g. 4th" })}
          </Field>
          <Field>
            <Label htmlFor="book-publicationYear">Publication Year</Label>
            {input("publicationYear", { placeholder: "e.g. 2022", inputMode: "numeric", maxLength: 4 })}
            {err("publicationYear")}
          </Field>
        </FormGrid>
      </FormSection>

      <FormSection>
        <legend>Inventory</legend>
        <FormGrid>
          <Field>
            <Label htmlFor="book-totalCopies">
              Total Copies<Required>*</Required>
            </Label>
            {input("totalCopies", { type: "number", min: Math.max(1, minCopies ?? 1), step: 1 })}
            {errorFor("totalCopies")
              ? err("totalCopies")
              : minCopies
                ? <FieldHint>{minCopies} currently on loan</FieldHint>
                : null}
          </Field>
          <Field>
            <Label htmlFor="book-shelfNumber">Shelf / Rack Number</Label>
            {input("shelfNumber", { placeholder: "e.g. T-01-A" })}
          </Field>
        </FormGrid>
      </FormSection>

      <FormSection>
        <legend>Cover image</legend>
        <CoverUpload>
          <CoverPreview>
            {values.coverImage ? <img src={values.coverImage} alt="Cover preview" /> : <Icon name="image" size={24} />}
          </CoverPreview>
          <div>
            <FileLabel>
              <Icon name="image" size={16} />
              {values.coverImage ? "Change image" : "Upload image"}
              <input type="file" accept="image/*" onChange={onCover} />
            </FileLabel>
            {values.coverImage && (
              <Button type="button" $variant="ghost" $size="sm" onClick={() => setValues((v) => ({ ...v, coverImage: "" }))}>
                Remove
              </Button>
            )}
            <div>{coverError ? <FieldError>{coverError}</FieldError> : <FieldHint>Optional · JPG or PNG, up to 2 MB</FieldHint>}</div>
          </div>
        </CoverUpload>
      </FormSection>

      <FormActions>
        {onCancel && (
          <Button type="button" $variant="ghost" onClick={onCancel}>
            {cancelLabel}
          </Button>
        )}
        {showReset && (
          <Button type="button" $variant="secondary" onClick={reset}>
            Reset Form
          </Button>
        )}
        <Button type="submit">
          <Icon name="check" />
          {submitLabel}
        </Button>
      </FormActions>
    </form>
  );
};
