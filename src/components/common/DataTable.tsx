import { Fragment, useEffect, useState, type ReactNode } from "react";
import { PAGE_SIZE } from "../../utils/constants";
import {
  PageButton,
  PageButtons,
  Pagination,
  SortHeader,
  Table,
  TableScroll,
  Td,
  Th,
  Tr,
} from "./common.styles";
import { Icon } from "./Icon";

export interface Column<T> {
  key: string;
  header: string;
  /** Custom header content (e.g. a select-all checkbox); `header` is still used as its label. */
  headerNode?: ReactNode;
  render: (row: T) => ReactNode;
  /** Set to make the header clickable; value is the sort key passed to onSort. */
  sortKey?: string;
  width?: string;
  align?: "left" | "right" | "center";
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  empty?: ReactNode;
  sort?: { key: string; dir: "asc" | "desc" };
  onSort?: (key: string) => void;
  pageSize?: number;
  /** Rows to tint (e.g. overdue). */
  highlightRow?: (row: T) => boolean;
  /** Reset to page 1 whenever this value changes (e.g. search/filter). */
  resetKey?: string;
  caption?: string;
}

/** Generic table with sortable headers and client-side pagination. */
export function DataTable<T>({
  columns,
  rows,
  rowKey,
  empty,
  sort,
  onSort,
  pageSize = PAGE_SIZE,
  highlightRow,
  resetKey,
  caption,
}: DataTableProps<T>) {
  const [page, setPage] = useState(1);
  const pageCount = Math.max(1, Math.ceil(rows.length / pageSize));

  useEffect(() => setPage(1), [resetKey]);
  useEffect(() => {
    if (page > pageCount) setPage(pageCount);
  }, [page, pageCount]);

  if (rows.length === 0 && empty) return <>{empty}</>;

  const start = (page - 1) * pageSize;
  const visible = rows.slice(start, start + pageSize);

  const pages = Array.from({ length: pageCount }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === pageCount || Math.abs(p - page) <= 1,
  );

  return (
    <>
      <TableScroll>
        <Table>
          {caption && <caption className="sr-only">{caption}</caption>}
          <thead>
            <tr>
              {columns.map((c) => (
                <Th key={c.key} $width={c.width} $align={c.align}>
                  {c.sortKey && onSort ? (
                    <SortHeader
                      type="button"
                      $active={sort?.key === c.sortKey}
                      onClick={() => onSort(c.sortKey as string)}
                      aria-label={`Sort by ${c.header}`}
                    >
                      {c.header}
                      <Icon
                        name={sort?.key === c.sortKey ? (sort.dir === "asc" ? "arrowUp" : "arrowDown") : "sort"}
                      />
                    </SortHeader>
                  ) : (
                    c.headerNode ?? c.header
                  )}
                </Th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.map((row) => (
              <Tr key={rowKey(row)} $highlight={highlightRow?.(row)}>
                {columns.map((c) => (
                  <Td key={c.key} $align={c.align}>
                    {c.render(row)}
                  </Td>
                ))}
              </Tr>
            ))}
          </tbody>
        </Table>
      </TableScroll>

      <Pagination>
        <span>
          Showing {rows.length === 0 ? 0 : start + 1}–{Math.min(start + pageSize, rows.length)} of {rows.length}
        </span>
        {pageCount > 1 && (
          <PageButtons>
            <PageButton type="button" aria-label="Previous page" disabled={page === 1} onClick={() => setPage(page - 1)}>
              <Icon name="chevronLeft" />
            </PageButton>
            {pages.map((p, i) => (
              <Fragment key={p}>
                {i > 0 && p - pages[i - 1] > 1 && <PageButton as="span">…</PageButton>}
                <PageButton type="button" $active={p === page} onClick={() => setPage(p)} aria-current={p === page}>
                  {p}
                </PageButton>
              </Fragment>
            ))}
            <PageButton
              type="button"
              aria-label="Next page"
              disabled={page === pageCount}
              onClick={() => setPage(page + 1)}
            >
              <Icon name="chevronRight" />
            </PageButton>
          </PageButtons>
        )}
      </Pagination>
    </>
  );
}
