import type { Book } from "../../types/book.types";
import { stockStatus } from "../../services/book.service";
import { IconButton, Mono, Muted } from "../../styles/ui";
import { BookCover } from "../common/BookCover";
import { BookStockBadge } from "../common/badges";
import { DataTable, type Column } from "../common/DataTable";
import { Icon } from "../common/Icon";
import { Actions, StockBar, StockCell, TitleCell } from "./books.styles";
import type { ReactNode } from "react";

interface BookTableProps {
  books: Book[];
  sort: { key: string; dir: "asc" | "desc" };
  onSort: (key: string) => void;
  onView: (b: Book) => void;
  onEdit: (b: Book) => void;
  onDelete: (b: Book) => void;
  empty: ReactNode;
  resetKey: string;
}

export const BookTable = ({ books, sort, onSort, onView, onEdit, onDelete, empty, resetKey }: BookTableProps) => {
  const columns: Column<Book>[] = [
    { key: "id", header: "Book ID", render: (b) => <Mono>{b.id}</Mono> },
    { key: "cover", header: "Cover", render: (b) => <BookCover book={b} /> },
    {
      key: "title",
      header: "Book Title",
      sortKey: "title",
      render: (b) => (
        <TitleCell>
          <div>
            <strong>{b.title}</strong>
            <small>
              {[b.edition && `${b.edition} ed.`, b.shelfNumber && `Shelf ${b.shelfNumber}`].filter(Boolean).join(" · ")}
            </small>
          </div>
        </TitleCell>
      ),
    },
    { key: "author", header: "Author", sortKey: "author", render: (b) => b.author },
    { key: "isbn", header: "ISBN", render: (b) => (b.isbn ? <Mono>{b.isbn}</Mono> : <Muted>—</Muted>) },
    { key: "category", header: "Category", render: (b) => b.category },
    { key: "total", header: "Total Copies", align: "center", render: (b) => b.totalCopies },
    {
      key: "available",
      header: "Available",
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
    {
      key: "actions",
      header: "Actions",
      align: "right",
      render: (b) => (
        <Actions>
          <IconButton type="button" title="View details" aria-label={`View ${b.title}`} onClick={() => onView(b)}>
            <Icon name="eye" />
          </IconButton>
          <IconButton type="button" title="Edit" aria-label={`Edit ${b.title}`} onClick={() => onEdit(b)}>
            <Icon name="edit" />
          </IconButton>
          <IconButton
            type="button"
            $tone="danger"
            title="Delete"
            aria-label={`Delete ${b.title}`}
            onClick={() => onDelete(b)}
          >
            <Icon name="trash" />
          </IconButton>
        </Actions>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      rows={books}
      rowKey={(b) => b.id}
      sort={sort}
      onSort={onSort}
      empty={empty}
      resetKey={resetKey}
      caption="Book catalogue"
    />
  );
};
