import type { ReactNode } from "react";
import type { Book } from "../../types/book.types";
import type { BookIssue } from "../../types/issue.types";
import { loanState } from "../../services/issue.service";
import { Button, IconButton, Mono, Muted } from "../../styles/ui";
import { formatDate } from "../../utils/date";
import { LoanStatusBadge } from "../common/badges";
import { DataTable, type Column } from "../common/DataTable";
import { Icon } from "../common/Icon";
import { BookCell, Checkbox, DateCell, RowActions, StudentCell } from "./issues.styles";

interface IssuedBooksTableProps {
  issues: BookIssue[];
  books: Book[];
  today: string;
  sort?: { key: string; dir: "asc" | "desc" };
  onSort?: (key: string) => void;
  onView: (i: BookIssue) => void;
  onReturn: (i: BookIssue) => void;
  empty: ReactNode;
  resetKey?: string;
  pageSize?: number;
  /** Enables checkboxes for returning several books at once. */
  selectedIds?: Set<string>;
  onSelectionChange?: (ids: Set<string>) => void;
}

export const IssuedBooksTable = ({
  issues,
  books,
  today,
  sort,
  onSort,
  onView,
  onReturn,
  empty,
  resetKey,
  pageSize,
  selectedIds,
  onSelectionChange,
}: IssuedBooksTableProps) => {
  const bookOf = (id: string) => books.find((b) => b.id === id);

  const selectable = !!selectedIds && !!onSelectionChange;
  const outstanding = issues.filter((i) => i.status === "issued");
  const allSelected = outstanding.length > 0 && outstanding.every((i) => selectedIds?.has(i.id));

  const toggle = (id: string) => {
    if (!selectedIds || !onSelectionChange) return;
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onSelectionChange(next);
  };
  const toggleAll = () => {
    if (!selectedIds || !onSelectionChange) return;
    const next = new Set(selectedIds);
    outstanding.forEach((i) => (allSelected ? next.delete(i.id) : next.add(i.id)));
    onSelectionChange(next);
  };

  const selectColumn: Column<BookIssue> = {
    key: "select",
    header: "Select",
    width: "40px",
    headerNode: (
      <Checkbox
        checked={allSelected}
        disabled={outstanding.length === 0}
        onChange={toggleAll}
        aria-label={`Select all ${outstanding.length} outstanding loans`}
        title="Select all outstanding loans in this list"
      />
    ),
    render: (i) =>
      i.status === "issued" ? (
        <Checkbox
          checked={!!selectedIds?.has(i.id)}
          onChange={() => toggle(i.id)}
          aria-label={`Select ${i.id}`}
        />
      ) : null,
  };

  const columns: Column<BookIssue>[] = [
    ...(selectable ? [selectColumn] : []),
    { key: "id", header: "Issue ID", render: (i) => <Mono>{i.id}</Mono> },
    { key: "studentId", header: "Student ID", render: (i) => <Mono>{i.studentId}</Mono> },
    {
      key: "student",
      header: "Student Name",
      render: (i) => (
        <StudentCell>
          <strong>{i.studentName}</strong>
          {i.studentClass && <small>{i.studentClass}</small>}
        </StudentCell>
      ),
    },
    {
      key: "book",
      header: "Book Title",
      render: (i) => {
        const b = bookOf(i.bookId);
        return (
          <BookCell>
            <div>
              <strong>{b?.title ?? <Muted>Deleted book</Muted>}</strong>
              <small>{b?.author}</small>
            </div>
          </BookCell>
        );
      },
    },
    {
      key: "copy",
      header: "Book Copy ID",
      render: (i) => (i.bookCopyId ? <Mono>{i.bookCopyId}</Mono> : <Muted>—</Muted>),
    },
    {
      key: "issueDate",
      header: "Issue Date",
      sortKey: "issueDate",
      render: (i) => <DateCell>{formatDate(i.issueDate)}</DateCell>,
    },
    {
      key: "dueDate",
      header: "Due Date",
      sortKey: "dueDate",
      render: (i) => {
        const s = loanState(i, today);
        return (
          <DateCell $tone={s === "overdue" ? "danger" : s === "dueSoon" ? "warning" : undefined}>
            {formatDate(i.dueDate)}
            {i.returnDate && (
              <div>
                <Muted>Returned {formatDate(i.returnDate)}</Muted>
              </div>
            )}
          </DateCell>
        );
      },
    },
    { key: "status", header: "Status", render: (i) => <LoanStatusBadge issue={i} today={today} /> },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      render: (i) => (
        <RowActions>
          <IconButton type="button" title="View details" aria-label={`View ${i.id}`} onClick={() => onView(i)}>
            <Icon name="eye" />
          </IconButton>
          {i.status === "issued" && (
            <Button type="button" $size="sm" $variant="secondary" onClick={() => onReturn(i)}>
              <Icon name="return" />
              Return
            </Button>
          )}
        </RowActions>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      rows={issues}
      rowKey={(i) => i.id}
      sort={sort}
      onSort={onSort}
      empty={empty}
      resetKey={resetKey}
      pageSize={pageSize}
      highlightRow={(i) => loanState(i, today) === "overdue"}
      caption="Issued books"
    />
  );
};
