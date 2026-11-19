import type { CatalogueCopy } from "../types/catalogue.types";
import { formatDate } from "../utils/date";
import { writeXlsx, type CellValue, type XlsxColumn } from "../utils/xlsxWriter";
import { loanState } from "./issue.service";

const COLUMNS: (XlsxColumn & { value: (c: CatalogueCopy) => CellValue })[] = [
  { header: "Book ID", width: 12, value: (c) => c.accNo },
  { header: "Page", width: 8, value: (c) => c.registerPage },
  { header: "Book Title", width: 48, value: (c) => c.title },
  { header: "Author", width: 28, value: (c) => c.author },
  { header: "Publisher", width: 22, value: (c) => c.publisher },
  { header: "Publish Year", width: 12, value: (c) => (c.publishYear ? Number(c.publishYear) : undefined) },
  { header: "Shelf", width: 11, value: (c) => c.shelf },
  { header: "Price", width: 10, value: (c) => (c.price && /^\d+(\.\d+)?$/.test(c.price) ? Number(c.price) : c.price) },
  {
    header: "Status",
    width: 14,
    value: (c) =>
      c.status === "available"
        ? "Available"
        : c.status === "unavailable"
          ? "Not available"
          : c.loan && loanState(c.loan) === "overdue"
            ? "Overdue"
            : "Issued",
  },
  { header: "Issued To", width: 28, value: (c) => c.loan?.studentName },
  { header: "Borrower ID", width: 12, value: (c) => c.loan?.studentId },
  { header: "Issue Date", width: 13, value: (c) => c.loan && formatDate(c.loan.issueDate) },
  { header: "Due Date", width: 13, value: (c) => c.loan && formatDate(c.loan.dueDate) },
  { header: "Purchase Date", width: 14, value: (c) => c.purchaseDate && formatDate(c.purchaseDate) },
  { header: "Not Available Because", width: 24, value: (c) => c.withdrawnReason },
  { header: "Remarks", width: 34, value: (c) => c.remarks },
  { header: "Serial No", width: 10, value: (c) => c.serial },
];

/** Builds the All Books export for exactly the rows given (already filtered and sorted). */
export const exportCopiesXlsx = (copies: CatalogueCopy[]): Promise<Blob> =>
  writeXlsx(
    "All Books",
    COLUMNS,
    copies.map((c) => COLUMNS.map((col) => col.value(c))),
  );
