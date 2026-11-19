import { useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import type { Book, BookFormErrors, BookFormValues } from "../../types/book.types";
import { validateBookForm, type EditingCopy } from "../../services/book.service";
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
} from "../../styles/ui";
import { Icon } from "../common/Icon";

interface BookFormProps {
  initialValues: BookFormValues;
  books: Book[];
  /** The copy being edited (omit when registering a new one). */
  editing?: EditingCopy;
  submitLabel: string;
  /** Return field errors from the service to display them, or nothing on success. */
  onSubmit: (values: BookFormValues) => BookFormErrors | void;
  onCancel?: () => void;
  cancelLabel?: string;
  /** Hide the Reset button (e.g. inside the edit dialog). */
  showReset?: boolean;
}

/** Register / edit form for one physical book, with inline validation. */
export const BookForm = ({
  initialValues,
  books,
  editing,
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

  const liveErrors = useMemo(() => validateBookForm(values, books, editing), [values, books, editing]);

  const errorFor = (k: keyof BookFormValues) =>
    serverErrors[k] ?? ((touched[k] || submitted) && liveErrors[k] ? liveErrors[k] : undefined);

  const set = (k: keyof BookFormValues) => (e: ChangeEvent<HTMLInputElement>) => {
    setValues((v) => ({ ...v, [k]: e.target.value }));
    setDirty((d) => ({ ...d, [k]: true }));
    setServerErrors((s) => ({ ...s, [k]: undefined }));
  };
  const blur = (k: keyof BookFormValues) => () => dirty[k] && setTouched((t) => ({ ...t, [k]: true }));

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
          <Field>
            <Label htmlFor="book-accNo">
              Book ID<Required>*</Required>
            </Label>
            {input("accNo", { placeholder: "e.g. 39001", autoComplete: "off" })}
            {errorFor("accNo") ? (
              err("accNo")
            ) : (
              <FieldHint>{editing ? "Accession number of this copy" : "Next free number suggested — you can change it"}</FieldHint>
            )}
          </Field>
          <Field>
            <Label htmlFor="book-isbn">ISBN</Label>
            {input("isbn", { placeholder: "978-0-262-04630-5", inputMode: "numeric" })}
            {errorFor("isbn") ? err("isbn") : <FieldHint>Optional · ISBN-10 or ISBN-13, hyphens allowed</FieldHint>}
          </Field>
          <Field $span={2}>
            <Label htmlFor="book-title">
              Book Title<Required>*</Required>
            </Label>
            {input("title", { placeholder: "e.g. Introduction to Algorithms" })}
            {err("title")}
          </Field>
          <Field $span={2}>
            <Label htmlFor="book-author">
              Author<Required>*</Required>
            </Label>
            {input("author", { placeholder: "e.g. Thomas H. Cormen" })}
            {err("author")}
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
        <legend>Register &amp; shelf</legend>
        <FormGrid $cols={3}>
          <Field>
            <Label htmlFor="book-shelfNumber">Shelf / Rack Number</Label>
            {input("shelfNumber", { placeholder: "e.g. CWA3-1" })}
          </Field>
          <Field>
            <Label htmlFor="book-registerPage">Page</Label>
            {input("registerPage", { placeholder: "e.g. 12", maxLength: 10 })}
            {errorFor("registerPage") ? err("registerPage") : <FieldHint>Page in the librarian's register</FieldHint>}
          </Field>
          <Field>
            <Label htmlFor="book-price">Price</Label>
            {input("price", { placeholder: "e.g. 250", inputMode: "decimal" })}
            {err("price")}
          </Field>
        </FormGrid>
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
