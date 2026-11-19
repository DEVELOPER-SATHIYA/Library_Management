import { useCallback, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useLibrary } from "../../context/LibraryContext";
import type { EditingCopy } from "../../services/book.service";
import { filterCopies, listCopies } from "../../services/catalogue.service";
import type { CatalogueCopy, CatalogueSortKey, CopyStatusFilter } from "../../types/catalogue.types";
import { PageHeader } from "../../components/layout/PageHeader";
import { EditCopyModal } from "../../components/books/EditCopyModal";
import { CopyStatusBadge, CopyTitle } from "../../components/catalogue/CopyCells";
import { CopyDetails } from "../../components/catalogue/CopyDetails";
import { DataTable, type Column } from "../../components/common/DataTable";
import { EmptyState } from "../../components/common/EmptyState";
import { Icon } from "../../components/common/Icon";
import { SearchBar } from "../../components/common/SearchBar";
import { Actions } from "../../components/books/books.styles";
import { Button, Card, IconButton, Mono, Muted, Select, Toolbar } from "../../styles/ui";
import { formatDate, todayISO } from "../../utils/date";
import { downloadBlob } from "../../utils/xlsxWriter";
import { exportCopiesXlsx } from "../../services/export.service";
import { useToast } from "../../context/ToastContext";
import { FilterSummary } from "./BooksStyles";

const STATUS_FILTERS: { value: CopyStatusFilter; label: string }[] = [
  { value: "all", label: "All statuses" },
  { value: "available", label: "Available" },
  { value: "issued", label: "Issued" },
  { value: "unavailable", label: "Not available" },
];

const isStatusFilter = (v: string | null): v is CopyStatusFilter => STATUS_FILTERS.some((s) => s.value === v);

/** Admin view of every physical copy. Click a row for details; the only row action is Edit. */
export const Books = () => {
  const { books, issues } = useLibrary();
  const notify = useToast();
  const [downloading, setDownloading] = useState(false);
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const [keyword, setKeyword] = useState(params.get("search") ?? "");
  const [status, setStatus] = useState<CopyStatusFilter>(() => {
    const s = params.get("status");
    return isStatusFilter(s) ? s : "all";
  });
  const [sort, setSort] = useState<{ key: CatalogueSortKey; dir: "asc" | "desc" }>({ key: "accNo", dir: "asc" });

  // Track by key so dialogs show live data after edits.
  const [viewingAcc, setViewingAcc] = useState<string | null>(null);
  const [editing, setEditing] = useState<EditingCopy | null>(null);

  const copies = useMemo(() => listCopies(books, issues), [books, issues]);
  const rows = useMemo(
    () => filterCopies(copies, { keyword, status, sort: sort.key, dir: sort.dir, adminSearch: true }),
    [copies, keyword, status, sort],
  );
  const counts = useMemo(() => {
    const c = { available: 0, issued: 0, unavailable: 0 };
    rows.forEach((r) => c[r.status]++);
    return c;
  }, [rows]);

  const viewing = viewingAcc ? copies.find((c) => c.accNo === viewingAcc) ?? null : null;

  const filtersActive = !!keyword || status !== "all";

  /** Exports exactly the rows matching the current search / status filter, in the current sort order. */
  const download = async () => {
    setDownloading(true);
    try {
      const blob = await exportCopiesXlsx(rows);
      const name = `all-books${filtersActive ? "-filtered" : ""}-${todayISO()}.xlsx`;
      downloadBlob(blob, name);
      notify("success", "Download ready", `${rows.length} book${rows.length === 1 ? "" : "s"} saved to ${name}.`);
    } catch (e) {
      notify("error", "Download failed", e instanceof Error ? e.message : undefined);
    } finally {
      setDownloading(false);
    }
  };
  const clearFilters = () => {
    setKeyword("");
    setStatus("all");
  };

  const onSort = (key: string) =>
    setSort((s) => ({ key: key as CatalogueSortKey, dir: s.key === key && s.dir === "asc" ? "desc" : "asc" }));

  const closeDetails = useCallback(() => setViewingAcc(null), []);
  const closeEdit = useCallback(() => setEditing(null), []);

  const columns: Column<CatalogueCopy>[] = [
    { key: "accNo", header: "Book ID", sortKey: "accNo", render: (c) => <Mono>{c.accNo}</Mono> },
    { key: "page", header: "Page", align: "center", render: (c) => c.registerPage ?? <Muted>—</Muted> },
    { key: "title", header: "Book Title", sortKey: "title", render: (c) => <CopyTitle copy={c} /> },
    { key: "author", header: "Author", sortKey: "author", render: (c) => c.author || <Muted>—</Muted> },
    { key: "shelf", header: "Shelf", render: (c) => (c.shelf ? <Mono>{c.shelf}</Mono> : <Muted>—</Muted>) },
    { key: "price", header: "Price", align: "right", render: (c) => c.price ?? <Muted>—</Muted> },
    {
      key: "issuedTo",
      header: "Issued To",
      render: (c) =>
        c.loan ? (
          <div>
            {c.loan.studentName}
            <br />
            <Muted>
              <small>due {formatDate(c.loan.dueDate)}</small>
            </Muted>
          </div>
        ) : (
          <Muted>—</Muted>
        ),
    },
    { key: "status", header: "Status", render: (c) => <CopyStatusBadge copy={c} showOverdue /> },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      render: (c) => (
        <Actions>
          <IconButton type="button" title="Edit book" aria-label={`Edit ${c.title}`} onClick={() => setEditing({ bookId: c.bookId, accNo: c.accNo })}>
            <Icon name="edit" />
          </IconButton>
        </Actions>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="All Books"
        description={`${copies.length} copies · ${books.length} titles in the catalogue`}
        actions={
          <>
            <Button
              type="button"
              $variant="secondary"
              onClick={download}
              disabled={downloading || rows.length === 0}
              title={filtersActive ? "Download only the books matching the current filters" : "Download every book"}
            >
              <Icon name="download" />
              {downloading ? "Preparing…" : filtersActive ? `Download filtered (${rows.length})` : "Download all"}
            </Button>
            <Button type="button" onClick={() => navigate("/register-book")}>
              <Icon name="plus" />
              Register New Book
            </Button>
          </>
        }
      />

      <Card>
        <Toolbar>
          <SearchBar
            value={keyword}
            onChange={setKeyword}
            placeholder="Search title, author, Book ID, shelf, borrower or remarks"
          />
          <Select value={status} onChange={(e) => setStatus(e.target.value as CopyStatusFilter)} aria-label="Filter by status">
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

        <FilterSummary>
          <span>
            <strong>{rows.length}</strong> cop{rows.length === 1 ? "y" : "ies"}
          </span>
          <span>
            <strong>{counts.available}</strong> available
          </span>
          <span>
            <strong>{counts.issued}</strong> issued
          </span>
          <span>
            <strong>{counts.unavailable}</strong> not available
          </span>
        </FilterSummary>

        <DataTable
          columns={columns}
          rows={rows}
          rowKey={(c) => c.accNo}
          sort={sort}
          onSort={onSort}
          resetKey={`${keyword}|${status}|${sort.key}|${sort.dir}`}
          caption="Library copies"
          onRowClick={(c) => setViewingAcc(c.accNo)}
          rowLabel={(c) => `View details of ${c.title}, Book ID ${c.accNo}`}
          empty={
            <EmptyState
              icon="search"
              title={filtersActive ? "No books match your search" : "No books registered yet"}
              message={
                filtersActive
                  ? "Try a different keyword, or clear the status filter."
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

      <CopyDetails
        copy={viewing}
        onClose={closeDetails}
        onEdit={(c) => {
          setViewingAcc(null);
          setEditing({ bookId: c.bookId, accNo: c.accNo });
        }}
      />

      <EditCopyModal target={editing} onClose={closeEdit} />
    </>
  );
};
