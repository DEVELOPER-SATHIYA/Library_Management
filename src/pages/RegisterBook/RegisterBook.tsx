import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLibrary } from "../../context/LibraryContext";
import { useToast } from "../../context/ToastContext";
import { ServiceError, emptyBookForm, type EditingCopy } from "../../services/book.service";
import { PageHeader } from "../../components/layout/PageHeader";
import { BookForm } from "../../components/books/BookForm";
import { EditCopyModal } from "../../components/books/EditCopyModal";
import { BookCover } from "../../components/common/BookCover";
import { Icon } from "../../components/common/Icon";
import { Button, Card, CardBody, CardHeader } from "../../styles/ui";
import { Layout, RecentList, SidePanel, SuccessActions, SuccessCard, Tips } from "./RegisterBookStyles";

const numericDesc = (a: string, b: string) => b.localeCompare(a, undefined, { numeric: true });

export const RegisterBook = () => {
  const { books, registerCopy } = useLibrary();
  const notify = useToast();
  const navigate = useNavigate();
  const [formKey, setFormKey] = useState(0);
  const [created, setCreated] = useState<(EditingCopy & { newTitle: boolean }) | null>(null);
  const [editing, setEditing] = useState<EditingCopy | null>(null);

  // Read from the store so the success card follows later edits.
  const createdBook = created ? books.find((b) => b.id === created.bookId) : undefined;
  const createdCopy = createdBook?.copies.find((c) => c.accNo === created?.accNo);

  // Copies registered in this session first, then the highest Book IDs.
  const recent = useMemo(
    () =>
      books
        .flatMap((b) => b.copies.map((c) => ({ book: b, copy: c })))
        .sort((x, y) => (y.copy.addedAt ?? "").localeCompare(x.copy.addedAt ?? "") || numericDesc(x.copy.accNo, y.copy.accNo))
        .slice(0, 5),
    [books],
  );

  // Recompute the suggested Book ID whenever the form is reset.
  const initialValues = useMemo(() => emptyBookForm(books), [formKey]);

  return (
    <>
      <PageHeader
        title="Register New Book"
        description="Add a physical book to the catalogue."
        actions={
          <Button type="button" $variant="secondary" onClick={() => navigate("/books")}>
            <Icon name="books" />
            View catalogue
          </Button>
        }
      />

      {created && createdBook && createdCopy && (
        <SuccessCard role="status">
          <BookCover book={createdBook} />
          <div>
            <strong>Book registered — Book ID {createdCopy.accNo}</strong>
            <p>
              {createdBook.title} by {createdBook.author}
              {created.newTitle
                ? " · added as a new title."
                : ` · added as another copy (${createdBook.copies.length} copies of this title now).`}
            </p>
          </div>
          <SuccessActions>
            <Button type="button" $size="sm" $variant="secondary" onClick={() => setEditing(created)}>
              <Icon name="edit" />
              Edit record
            </Button>
            <Button
              type="button"
              $size="sm"
              $variant="secondary"
              onClick={() => navigate(`/books?search=${encodeURIComponent(createdCopy.accNo)}`)}
            >
              <Icon name="eye" />
              View in catalogue
            </Button>
            <Button type="button" $size="sm" onClick={() => navigate(`/issue-return?book=${createdBook.id}`)}>
              <Icon name="swap" />
              Issue this book
            </Button>
          </SuccessActions>
        </SuccessCard>
      )}

      <Layout>
        <Card>
          <CardHeader>
            <div>
              <h2>New Book Registration</h2>
              <p>Changes are kept in this browser tab until the database is connected.</p>
            </div>
          </CardHeader>
          <CardBody>
            <BookForm
              key={formKey}
              initialValues={initialValues}
              books={books}
              submitLabel="Register Book"
              onSubmit={(values) => {
                try {
                  const res = registerCopy(values);
                  notify("success", "Book registered", `${res.book.title} was added as Book ID ${res.copy.accNo}.`);
                  setCreated({ bookId: res.book.id, accNo: res.copy.accNo, newTitle: res.newTitle });
                  setFormKey((k) => k + 1);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                } catch (e) {
                  if (e instanceof ServiceError && e.fieldErrors) return e.fieldErrors;
                  notify("error", "Could not register book", e instanceof Error ? e.message : undefined);
                }
              }}
            />
          </CardBody>
        </Card>

        <SidePanel>
          <Card>
            <CardHeader>
              <h2>Before you save</h2>
            </CardHeader>
            <CardBody>
              <Tips>
                <li>Book ID, title and author are required.</li>
                <li>Book ID is the accession number. The next free number is filled in; change it to match your register.</li>
                <li>Registering a title and author that already exist adds this book as another copy of that title.</li>
                <li>Page is the page of your personal register this book is written on.</li>
                <li>ISBN is optional, but if entered its check digit must be valid.</li>
              </Tips>
            </CardBody>
          </Card>
          <Card>
            <CardHeader>
              <h2>Recently added</h2>
            </CardHeader>
            <CardBody>
              <RecentList>
                {recent.map(({ book, copy }) => (
                  <li key={copy.accNo}>
                    <BookCover book={book} />
                    <div>
                      <strong>{book.title}</strong>
                      <small>
                        Book ID {copy.accNo}
                        {copy.registerPage ? ` · Page ${copy.registerPage}` : ""}
                      </small>
                    </div>
                  </li>
                ))}
              </RecentList>
            </CardBody>
          </Card>
        </SidePanel>
      </Layout>

      <EditCopyModal
        target={editing}
        onClose={() => setEditing(null)}
        onSaved={(c) => setCreated((prev) => (prev ? { ...prev, ...c } : prev))}
      />
    </>
  );
};
