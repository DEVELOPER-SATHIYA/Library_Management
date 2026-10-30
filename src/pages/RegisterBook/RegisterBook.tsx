import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLibrary } from "../../context/LibraryContext";
import { useToast } from "../../context/ToastContext";
import type { Book } from "../../types/book.types";
import { ServiceError, bookToForm, copiesOnLoan, emptyBookForm, nextBookId } from "../../services/book.service";
import { PageHeader } from "../../components/layout/PageHeader";
import { BookForm } from "../../components/books/BookForm";
import { BookCover } from "../../components/common/BookCover";
import { Modal } from "../../components/common/Modal";
import { Icon } from "../../components/common/Icon";
import { Button, Card, CardBody, CardHeader } from "../../styles/ui";
import { Layout, RecentList, SidePanel, SuccessActions, SuccessCard, Tips } from "./RegisterBookStyles";

export const RegisterBook = () => {
  const { books, issues, addBook, editBook } = useLibrary();
  const notify = useToast();
  const navigate = useNavigate();
  const [formKey, setFormKey] = useState(0);
  const [created, setCreated] = useState<Book | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Keep the success card in sync if the record is edited afterwards.
  const createdNow = created ? books.find((b) => b.id === created.id) ?? null : null;
  const editing = editingId ? books.find((b) => b.id === editingId) ?? null : null;
  const recent = [...books].sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? "") || b.id.localeCompare(a.id)).slice(0, 5);

  return (
    <>
      <PageHeader
        title="Register New Book"
        description="Add a title and its physical copies to the catalogue."
        actions={
          <Button type="button" $variant="secondary" onClick={() => navigate("/books")}>
            <Icon name="books" />
            View catalogue
          </Button>
        }
      />

      {createdNow && (
        <SuccessCard role="status">
          <BookCover book={createdNow} />
          <div>
            <strong>Book registered — {createdNow.id}</strong>
            <p>
              {createdNow.title} by {createdNow.author} · {createdNow.totalCopies} cop
              {createdNow.totalCopies === 1 ? "y" : "ies"} added to the catalogue.
            </p>
          </div>
          <SuccessActions>
            <Button type="button" $size="sm" $variant="secondary" onClick={() => setEditingId(createdNow.id)}>
              <Icon name="edit" />
              Edit record
            </Button>
            <Button type="button" $size="sm" $variant="secondary" onClick={() => navigate(`/books?search=${createdNow.id}`)}>
              <Icon name="eye" />
              View in catalogue
            </Button>
            <Button type="button" $size="sm" onClick={() => navigate(`/issue-return?book=${createdNow.id}`)}>
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
              <p>Records are kept in the browser session until the database is connected.</p>
            </div>
          </CardHeader>
          <CardBody>
            <BookForm
              key={formKey}
              initialValues={emptyBookForm()}
              books={books}
              bookId={nextBookId(books)}
              idHint="Temporary ID — assigned automatically on save"
              submitLabel="Register Book"
              onSubmit={(values) => {
                try {
                  const book = addBook(values);
                  notify("success", "Book registered", `${book.title} was added as ${book.id}.`);
                  setCreated(book);
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
                <li>Title, author, category and total copies are required.</li>
                <li>Total copies is the number of physical books owned — all start as available.</li>
                <li>ISBN is optional, but if entered its check digit must be valid and unique.</li>
                <li>Use the shelf / rack number so copies can be found quickly.</li>
              </Tips>
            </CardBody>
          </Card>
          <Card>
            <CardHeader>
              <h2>Recently added</h2>
            </CardHeader>
            <CardBody>
              <RecentList>
                {recent.map((b) => (
                  <li key={b.id}>
                    <BookCover book={b} />
                    <div>
                      <strong>{b.title}</strong>
                      <small>
                        {b.id} · {b.totalCopies} copies
                      </small>
                    </div>
                  </li>
                ))}
              </RecentList>
            </CardBody>
          </Card>
        </SidePanel>
      </Layout>

      {editing && (
        <Modal open width={760} title="Edit book" subtitle={`${editing.id} · ${editing.title}`} onClose={() => setEditingId(null)}>
          <BookForm
            initialValues={bookToForm(editing)}
            books={books}
            bookId={editing.id}
            editingId={editing.id}
            minCopies={copiesOnLoan(editing.id, issues)}
            submitLabel="Save changes"
            showReset={false}
            onCancel={() => setEditingId(null)}
            onSubmit={(values) => {
              try {
                const updated = editBook(editing.id, values);
                notify("success", "Book updated", `${updated.title} has been saved.`);
                setEditingId(null);
              } catch (e) {
                if (e instanceof ServiceError && e.fieldErrors) return e.fieldErrors;
                notify("error", "Update failed", e instanceof Error ? e.message : undefined);
              }
            }}
          />
        </Modal>
      )}
    </>
  );
};
