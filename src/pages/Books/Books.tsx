import { useCallback, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useLibrary } from "../../context/LibraryContext";
import { useToast } from "../../context/ToastContext";
import { BOOK_CATEGORIES, type AvailabilityFilter, type Book, type BookSortKey } from "../../types/book.types";
import { ServiceError, bookToForm, copiesOnLoan, searchBooks } from "../../services/book.service";
import { PageHeader } from "../../components/layout/PageHeader";
import { BookTable } from "../../components/books/BookTable";
import { BookDetails } from "../../components/books/BookDetails";
import { BookForm } from "../../components/books/BookForm";
import { SearchBar } from "../../components/common/SearchBar";
import { EmptyState } from "../../components/common/EmptyState";
import { ConfirmDialog } from "../../components/common/ConfirmDialog";
import { Modal } from "../../components/common/Modal";
import { Icon } from "../../components/common/Icon";
import { Button, Card, IconButton, Select, Toolbar } from "../../styles/ui";
import { FilterSummary, SortSelect } from "./BooksStyles";

const AVAILABILITY: { value: AvailabilityFilter; label: string }[] = [
  { value: "all", label: "All availability" },
  { value: "available", label: "Available" },
  { value: "low", label: "Low stock" },
  { value: "out", label: "Out of stock" },
];

export const Books = () => {
  const { books, issues, today, editBook, removeBook } = useLibrary();
  const notify = useToast();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const [keyword, setKeyword] = useState(params.get("search") ?? "");
  const [category, setCategory] = useState(params.get("category") ?? "");
  const [availability, setAvailability] = useState<AvailabilityFilter>(
    (params.get("availability") as AvailabilityFilter) || "all",
  );
  const [sort, setSort] = useState<{ key: BookSortKey; dir: "asc" | "desc" }>({ key: "title", dir: "asc" });

  const [viewingId, setViewingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<Book | null>(null);

  const rows = useMemo(
    () => searchBooks(books, { keyword, category, availability, sort: sort.key, dir: sort.dir }),
    [books, keyword, category, availability, sort],
  );

  const totals = useMemo(
    () => ({
      copies: rows.reduce((s, b) => s + b.totalCopies, 0),
      available: rows.reduce((s, b) => s + b.availableCopies, 0),
    }),
    [rows],
  );

  const viewing = viewingId ? books.find((b) => b.id === viewingId) ?? null : null;
  const editing = editingId ? books.find((b) => b.id === editingId) ?? null : null;
  const filtersActive = !!keyword || !!category || availability !== "all";

  const clearFilters = () => {
    setKeyword("");
    setCategory("");
    setAvailability("all");
  };

  const onSort = (key: string) =>
    setSort((s) => ({ key: key as BookSortKey, dir: s.key === key && s.dir === "asc" ? "desc" : "asc" }));

  const closeDelete = useCallback(() => setDeleting(null), []);
  const confirmDelete = () => {
    if (!deleting) return;
    try {
      removeBook(deleting.id);
      notify("success", "Book deleted", `${deleting.title} (${deleting.id}) was removed from the catalogue.`);
    } catch (e) {
      notify("error", "Can't delete this book", e instanceof Error ? e.message : undefined);
    }
    setDeleting(null);
  };

  const deletingOnLoan = deleting ? copiesOnLoan(deleting.id, issues) : 0;

  return (
    <>
      <PageHeader
        title="All Books"
        description={`${books.length} titles · ${books.reduce((s, b) => s + b.totalCopies, 0)} copies in the catalogue`}
        actions={
          <Button type="button" onClick={() => navigate("/register-book")}>
            <Icon name="plus" />
            Register New Book
          </Button>
        }
      />

      <Card>
        <Toolbar>
          <SearchBar value={keyword} onChange={setKeyword} placeholder="Search title, author, ISBN or Book ID" />
          <Select value={category} onChange={(e) => setCategory(e.target.value)} aria-label="Filter by category">
            <option value="">All categories</option>
            {BOOK_CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </Select>
          <Select
            value={availability}
            onChange={(e) => setAvailability(e.target.value as AvailabilityFilter)}
            aria-label="Filter by availability"
          >
            {AVAILABILITY.map((a) => (
              <option key={a.value} value={a.value}>
                {a.label}
              </option>
            ))}
          </Select>
          <SortSelect>
            <Select
              value={sort.key}
              onChange={(e) => setSort((s) => ({ ...s, key: e.target.value as BookSortKey }))}
              aria-label="Sort by"
            >
              <option value="title">Sort: Title</option>
              <option value="author">Sort: Author</option>
              <option value="stock">Sort: Available stock</option>
            </Select>
            <IconButton
              type="button"
              title={sort.dir === "asc" ? "Ascending" : "Descending"}
              aria-label="Toggle sort direction"
              onClick={() => setSort((s) => ({ ...s, dir: s.dir === "asc" ? "desc" : "asc" }))}
            >
              <Icon name={sort.dir === "asc" ? "arrowUp" : "arrowDown"} />
            </IconButton>
          </SortSelect>
          {filtersActive && (
            <Button type="button" $variant="ghost" $size="sm" onClick={clearFilters}>
              Clear filters
            </Button>
          )}
        </Toolbar>

        <FilterSummary>
          <span>
            <strong>{rows.length}</strong> title{rows.length === 1 ? "" : "s"}
          </span>
          <span>
            <strong>{totals.copies}</strong> total copies
          </span>
          <span>
            <strong>{totals.available}</strong> available
          </span>
        </FilterSummary>

        <BookTable
          books={rows}
          sort={sort}
          onSort={onSort}
          onView={(b) => setViewingId(b.id)}
          onEdit={(b) => setEditingId(b.id)}
          onDelete={setDeleting}
          resetKey={`${keyword}|${category}|${availability}|${sort.key}|${sort.dir}`}
          empty={
            <EmptyState
              icon="search"
              title={filtersActive ? "No books match your search" : "No books registered yet"}
              message={
                filtersActive
                  ? "Try a different keyword, or clear the category and availability filters."
                  : "Register your first book to start building the catalogue."
              }
              action={
                filtersActive ? (
                  <Button type="button" $variant="secondary" onClick={clearFilters}>
                    Clear filters
                  </Button>
                ) : (
                  <Button type="button" onClick={() => navigate("/register-book")}>
                    <Icon name="plus" />
                    Register New Book
                  </Button>
                )
              }
            />
          }
        />
      </Card>

      <BookDetails
        book={viewing}
        issues={issues}
        today={today}
        onClose={() => setViewingId(null)}
        onEdit={(b) => {
          setViewingId(null);
          setEditingId(b.id);
        }}
      />

      {editing && (
        <Modal open width={760} title="Edit book" subtitle={`${editing.id} · ${editing.title}`} onClose={() => setEditingId(null)}>
          <BookForm
            key={editing.id}
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

      <ConfirmDialog
        open={!!deleting}
        title={deletingOnLoan ? "Book is on loan" : "Delete this book?"}
        tone={deletingOnLoan ? "warning" : "danger"}
        confirmLabel={deletingOnLoan ? "OK" : "Delete book"}
        message={
          deletingOnLoan ? (
            <p>
              <strong>{deleting?.title}</strong> has {deletingOnLoan} cop{deletingOnLoan === 1 ? "y" : "ies"} on loan.
              Process the returns before deleting this record.
            </p>
          ) : (
            <p>
              <strong>{deleting?.title}</strong> ({deleting?.id}) and all {deleting?.totalCopies} copies will be
              removed from the catalogue. This can't be undone.
            </p>
          )
        }
        onCancel={closeDelete}
        onConfirm={deletingOnLoan ? closeDelete : confirmDelete}
      />
    </>
  );
};
