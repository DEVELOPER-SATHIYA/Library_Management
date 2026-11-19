import { useLibrary } from "../../context/LibraryContext";
import { useToast } from "../../context/ToastContext";
import { ServiceError, copyToForm, type EditingCopy } from "../../services/book.service";
import { Modal } from "../common/Modal";
import { BookForm } from "./BookForm";

interface EditCopyModalProps {
  /** The copy to edit, or null when closed. */
  target: EditingCopy | null;
  onClose: () => void;
  /** Called with the saved Book ID (it may have been renamed). */
  onSaved?: (copy: EditingCopy) => void;
}

/** "Edit book" dialog used by All Books and Register Book. */
export const EditCopyModal = ({ target, onClose, onSaved }: EditCopyModalProps) => {
  const { books, updateCopy } = useLibrary();
  const notify = useToast();
  if (!target) return null;

  const book = books.find((b) => b.id === target.bookId);
  const copy = book?.copies.find((c) => c.accNo === target.accNo);
  if (!book || !copy) return null;

  const others = book.copies.length - 1;
  return (
    <Modal
      open
      width={760}
      title="Edit book"
      subtitle={`Book ID ${copy.accNo} · ${book.title}${
        others > 0
          ? ` — title, author, ISBN, publisher, edition and year also change the other ${others} cop${others === 1 ? "y" : "ies"}`
          : ""
      }`}
      onClose={onClose}
    >
      <BookForm
        key={`${book.id}|${copy.accNo}`}
        initialValues={copyToForm(book, copy)}
        books={books}
        editing={target}
        submitLabel="Save changes"
        showReset={false}
        onCancel={onClose}
        onSubmit={(values) => {
          try {
            const res = updateCopy(target, values);
            notify("success", "Book updated", `${res.book.title} (Book ID ${res.copy.accNo}) has been saved.`);
            onSaved?.({ bookId: res.book.id, accNo: res.copy.accNo });
            onClose();
          } catch (e) {
            if (e instanceof ServiceError && e.fieldErrors) return e.fieldErrors;
            notify("error", "Update failed", e instanceof Error ? e.message : undefined);
          }
        }}
      />
    </Modal>
  );
};
