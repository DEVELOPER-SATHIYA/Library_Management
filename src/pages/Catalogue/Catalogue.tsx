import { useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useLibrary } from "../../context/LibraryContext";
import { filterCopies, listCopies } from "../../services/catalogue.service";
import type { CatalogueCopy, CatalogueSortKey, CopyStatusFilter } from "../../types/catalogue.types";
import { PageHeader } from "../../components/layout/PageHeader";
import { AppIcon } from "../../components/common/AppIcon";
import { DataTable, type Column } from "../../components/common/DataTable";
import { EmptyState } from "../../components/common/EmptyState";
import { LibraryLoadState } from "../../components/common/LibraryLoadState";
import { Icon } from "../../components/common/Icon";
import { SearchBar } from "../../components/common/SearchBar";
import { CopyStatusBadge, CopyTitle } from "../../components/catalogue/CopyCells";
import { Button, Card, Mono, Muted, Select, Toolbar } from "../../styles/ui";
import { FilterSummary } from "../Books/BooksStyles";
import { AvatarLink, PublicBrand, PublicContent, PublicHeader, PublicShell } from "./CatalogueStyles";

const STATUS_FILTERS: { value: CopyStatusFilter; label: string }[] = [
  { value: "all", label: "All books" },
  { value: "available", label: "Available" },
  { value: "issued", label: "Issued" },
  { value: "unavailable", label: "Not available" },
];

const COLUMNS: Column<CatalogueCopy>[] = [
  { key: "accNo", header: "Book ID", sortKey: "accNo", render: (c) => <Mono>{c.accNo || "—"}</Mono> },
  { key: "title", header: "Book Title", sortKey: "title", render: (c) => <CopyTitle copy={c} /> },
  { key: "author", header: "Author", sortKey: "author", render: (c) => c.author || <Muted>—</Muted> },
  { key: "shelf", header: "Shelf", render: (c) => (c.shelf ? <Mono>{c.shelf}</Mono> : <Muted>—</Muted>) },
  { key: "status", header: "Status", render: (c) => <CopyStatusBadge copy={c} /> },
];

/** Public, read-only catalogue: the first screen students see. */
export const Catalogue = () => {
  const { isAdmin } = useAuth();
  const { books, issues, status: loadStatus } = useLibrary();

  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState<CopyStatusFilter>("all");
  const [sort, setSort] = useState<{ key: CatalogueSortKey; dir: "asc" | "desc" }>({ key: "title", dir: "asc" });

  const copies = useMemo(() => listCopies(books, issues), [books, issues]);
  const rows = useMemo(
    () => filterCopies(copies, { keyword, status, sort: sort.key, dir: sort.dir }),
    [copies, keyword, status, sort],
  );

  const availableNow = rows.filter((c) => c.status === "available").length;
  const filtersActive = !!keyword || status !== "all";

  const clearFilters = () => {
    setKeyword("");
    setStatus("all");
  };

  const onSort = (key: string) =>
    setSort((s) => ({ key: key as CatalogueSortKey, dir: s.key === key && s.dir === "asc" ? "desc" : "asc" }));

  return (
    <PublicShell>
      <PublicHeader>
        <PublicBrand>
          <div>
            <AppIcon size={22} />
          </div>
          <div>
            <strong>படிப்பகம்</strong>
            <span>Library Management System</span>
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
            <SearchBar value={keyword} onChange={setKeyword} placeholder="Search title, author, publisher or Book ID" />
            <Select
              value={status}
              onChange={(e) => setStatus(e.target.value as CopyStatusFilter)}
              aria-label="Filter by availability"
            >
              {STATUS_FILTERS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </Select>
            {filtersActive && (
              <Button type="button" $variant="ghost" $size="sm" onClick={clearFilters}>
                Clear filters
              </Button>
            )}
          </Toolbar>

          <LibraryLoadState />

          {loadStatus === "ready" && (
            <>
              <FilterSummary>
                <span>
                  <strong>{rows.length}</strong> book{rows.length === 1 ? "" : "s"}
                </span>
                <span>
                  <strong>{availableNow}</strong> available to borrow
                </span>
              </FilterSummary>

              <DataTable
                columns={COLUMNS}
                rows={rows}
                rowKey={(c) => c.accNo}
                sort={sort}
                onSort={onSort}
                resetKey={`${keyword}|${status}|${sort.key}|${sort.dir}`}
                caption="Library books and their availability"
                empty={
                  <EmptyState
                    icon="search"
                    title={filtersActive ? "No books match your search" : "No books in the library yet"}
                    message={filtersActive ? "Try a different keyword, or clear the availability filter." : undefined}
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
            </>
          )}
        </Card>
      </PublicContent>
    </PublicShell>
  );
};
