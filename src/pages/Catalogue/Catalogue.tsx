import { useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useLibrary } from "../../context/LibraryContext";
import { BOOK_CATEGORIES, type AvailabilityFilter, type Book, type BookSortKey } from "../../types/book.types";
import { searchBooks, stockStatus } from "../../services/book.service";
import { PageHeader } from "../../components/layout/PageHeader";
import { AppIcon } from "../../components/common/AppIcon";
import { BookCover } from "../../components/common/BookCover";
import { BookStockBadge } from "../../components/common/badges";
import { DataTable, type Column } from "../../components/common/DataTable";
import { EmptyState } from "../../components/common/EmptyState";
import { Icon } from "../../components/common/Icon";
import { SearchBar } from "../../components/common/SearchBar";
import { StockBar, StockCell, TitleCell } from "../../components/books/books.styles";
import { Button, Card, Muted, Select, Toolbar } from "../../styles/ui";
import { FilterSummary } from "../Books/BooksStyles";
import { AvatarLink, PublicBrand, PublicContent, PublicHeader, PublicShell } from "./CatalogueStyles";

const AVAILABILITY: { value: AvailabilityFilter; label: string }[] = [
  { value: "all", label: "All availability" },
  { value: "available", label: "Available" },
  { value: "low", label: "Low stock" },
  { value: "out", label: "Out of stock" },
];

const COLUMNS: Column<Book>[] = [
  { key: "cover", header: "Cover", render: (b) => <BookCover book={b} /> },
  {
    key: "title",
    header: "Book Title",
    sortKey: "title",
    render: (b) => (
      <TitleCell>
        <div>
          <strong>{b.title}</strong>
          <small>{[b.edition && `${b.edition} ed.`, b.publisher].filter(Boolean).join(" · ")}</small>
        </div>
      </TitleCell>
    ),
  },
  { key: "author", header: "Author", sortKey: "author", render: (b) => b.author },
  { key: "category", header: "Category", render: (b) => b.category },
  { key: "shelf", header: "Shelf", render: (b) => b.shelfNumber || <Muted>—</Muted> },
  {
    key: "available",
    header: "Copies Available",
    sortKey: "stock",
    render: (b) => {
      const s = stockStatus(b);
      return (
        <StockCell>
          <strong>{b.availableCopies}</strong> <Muted>/ {b.totalCopies}</Muted>
          <StockBar
            $pct={(b.availableCopies / b.totalCopies) * 100}
            $tone={s === "out" ? "danger" : s === "low" ? "warning" : "success"}
          />
        </StockCell>
      );
    },
  },
  { key: "status", header: "Status", render: (b) => <BookStockBadge book={b} /> },
];

/** Public, read-only catalogue: the first screen students see. */
export const Catalogue = () => {
  const { books } = useLibrary();
  const { isAdmin } = useAuth();

  const [keyword, setKeyword] = useState("");
  const [category, setCategory] = useState("");
  const [availability, setAvailability] = useState<AvailabilityFilter>("all");
  const [sort, setSort] = useState<{ key: BookSortKey; dir: "asc" | "desc" }>({ key: "title", dir: "asc" });

  const rows = useMemo(
    () => searchBooks(books, { keyword, category, availability, sort: sort.key, dir: sort.dir }),
    [books, keyword, category, availability, sort],
  );

  const availableNow = rows.filter((b) => b.availableCopies > 0).length;
  const filtersActive = !!keyword || !!category || availability !== "all";

  const clearFilters = () => {
    setKeyword("");
    setCategory("");
    setAvailability("all");
  };

  const onSort = (key: string) =>
    setSort((s) => ({ key: key as BookSortKey, dir: s.key === key && s.dir === "asc" ? "desc" : "asc" }));

  return (
    <PublicShell>
      <PublicHeader>
        <PublicBrand>
          <div>
            <AppIcon size={22} />
          </div>
          <div>
            <strong>படிப்பகம்</strong>
            <span>Library</span>
          </div>
        </PublicBrand>
        <AvatarLink
          to={isAdmin ? "/dashboard" : "/login"}
          aria-label={isAdmin ? "Open admin dashboard" : "Admin login"}
          title={isAdmin ? "Open admin dashboard" : "Admin login"}
        >
          <Icon name="user" size={20} />
        </AvatarLink>
      </PublicHeader>

      <PublicContent>
        <PageHeader title="All Books" description="Search the library and check which books are available to borrow." />

        <Card>
          <Toolbar>
            <SearchBar value={keyword} onChange={setKeyword} placeholder="Search title, author or ISBN" />
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
              <strong>{availableNow}</strong> available to borrow
            </span>
          </FilterSummary>

          <DataTable
            columns={COLUMNS}
            rows={rows}
            rowKey={(b) => b.id}
            sort={sort}
            onSort={onSort}
            resetKey={`${keyword}|${category}|${availability}|${sort.key}|${sort.dir}`}
            caption="Library books and their availability"
            empty={
              <EmptyState
                icon="search"
                title={filtersActive ? "No books match your search" : "No books in the library yet"}
                message={
                  filtersActive ? "Try a different keyword, or clear the category and availability filters." : undefined
                }
                action={
                  filtersActive ? (
                    <Button type="button" $variant="secondary" onClick={clearFilters}>
                      Clear filters
                    </Button>
                  ) : undefined
                }
              />
            }
          />
        </Card>
      </PublicContent>
    </PublicShell>
  );
};
