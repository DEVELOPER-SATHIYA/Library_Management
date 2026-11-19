/**
 * Loads the initial library state.
 * Today it reads the sample spreadsheet public/LibraryData.xlsx; when Supabase is
 * connected, replace `loadLibraryData` with queries that return the same shape.
 */
import type { Book, BookCopy } from "../types/book.types";
import type { BookIssue } from "../types/issue.types";
import { DEFAULT_LOAN_DAYS } from "../utils/constants";
import { addDays, isValidISODate, todayISO } from "../utils/date";
import { readXlsxRows } from "../utils/xlsx";
import { groupKey, reconcileAvailability } from "./book.service";

export interface LibraryData {
  books: Book[];
  issues: BookIssue[];
}

const DATA_URL = `${import.meta.env.BASE_URL}LibraryData.xlsx`;

/** Shelf codes look like "CWA3-1", "GA26-4", "A16-2", "NONA-5". Anything else in that column is a status note. */
const SHELF_CODE = /^[A-Z]+\d*-\d+$/i;

const pad = (n: number) => String(n).padStart(2, "0");

/** "34149.0" -> "34149" */
const cleanNumber = (v: string) => v.replace(/\.0+$/, "");

/** "120.0" -> "120", "$4.50" stays as is. */
const toPrice = (v: string) => {
  if (!v) return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? String(Math.round(n * 100) / 100) : v;
};

/** Excel date serials ("43778") and typed dates ("18-6-2019") -> YYYY-MM-DD. */
const toISO = (v: string): string | undefined => {
  if (!v) return undefined;
  if (/^\d{4,5}(\.\d+)?$/.test(v)) {
    const d = new Date(Date.UTC(1899, 11, 30) + Math.floor(Number(v)) * 86_400_000);
    return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
  }
  const m = v.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{2}|\d{4})$/);
  if (!m) return undefined;
  const year = m[3].length === 2 ? 2000 + Number(m[3]) : Number(m[3]);
  const iso = `${year}-${pad(Number(m[2]))}-${pad(Number(m[1]))}`;
  return isValidISODate(iso) ? iso : undefined;
};

const mostCommon = (values: (string | undefined)[]) => {
  const counts = new Map<string, number>();
  values.forEach((v) => v && counts.set(v, (counts.get(v) ?? 0) + 1));
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
};

/**
 * One spreadsheet row = one copy. Rows with the same title and author become one Book;
 * rows with an "issuename" become active loans.
 */
export const parseLibrarySheet = (rows: string[][], today = todayISO()): LibraryData => {
  const [header = [], ...body] = rows;
  const col: Record<string, number> = {};
  header.forEach((h, i) => {
    const key = h.trim().toLowerCase();
    if (key && col[key] === undefined) col[key] = i;
  });
  if (col.title === undefined) throw new Error('The spreadsheet has no "title" column');

  const books = new Map<string, Book>();
  const borrowerIds = new Map<string, string>();
  const issues: BookIssue[] = [];

  for (const row of body) {
    const get = (name: string) => (col[name] === undefined ? "" : (row[col[name]] ?? "").trim());
    const title = get("title");
    if (!title) continue;
    const author = get("author") || "Unknown";

    const key = `${groupKey(title)}|${groupKey(author)}`;
    let book = books.get(key);
    if (!book) {
      book = { id: `BK-${1001 + books.size}`, title, author, copies: [], totalCopies: 0, availableCopies: 0 };
      books.set(key, book);
    }
    book.publisher ??= get("publisher") || undefined;
    const year = Number(cleanNumber(get("publish_year")));
    if (!book.publicationYear && Number.isInteger(year) && year > 999) book.publicationYear = year;

    const location = get("availability");
    const isShelf = SHELF_CODE.test(location);
    const copy: BookCopy = {
      accNo: cleanNumber(get("accno")) || `${book.id}-${book.copies.length + 1}`,
      shelf: isShelf ? location.toUpperCase() : undefined,
      price: toPrice(get("price") || get("currency")),
      withdrawnReason: location && !isShelf ? location : undefined,
      purchaseDate: toISO(get("purchase_date")),
      remarks: get("remarks") || undefined,
      registerPage: cleanNumber(get("page")) || undefined,
      serial: cleanNumber(get("sl")) || undefined,
    };
    book.copies.push(copy);

    const borrower = get("issuename");
    if (borrower && !copy.withdrawnReason) {
      const bKey = groupKey(borrower);
      if (!borrowerIds.has(bKey)) borrowerIds.set(bKey, `BR-${String(borrowerIds.size + 1).padStart(3, "0")}`);
      const issued = toISO(get("issuedate"));
      issues.push({
        id: `ISS-${2001 + issues.length}`,
        studentId: borrowerIds.get(bKey) as string,
        studentName: borrower,
        bookId: book.id,
        bookCopyId: copy.accNo,
        issueDate: issued ?? today,
        dueDate: addDays(issued ?? today, DEFAULT_LOAN_DAYS),
        status: "issued",
        notes: issued ? undefined : "Issue date not recorded in the spreadsheet — set to the day it was loaded.",
      });
    }
  }

  const list = [...books.values()].map((b) => ({ ...b, shelfNumber: mostCommon(b.copies.map((c) => c.shelf)) }));
  return { books: reconcileAvailability(list, issues), issues };
};

let cache: Promise<LibraryData> | null = null;

/** Downloads and parses the sample spreadsheet once per page load. */
export const loadLibraryData = (): Promise<LibraryData> => {
  cache ??= fetch(DATA_URL)
    .then((res) => {
      if (!res.ok) throw new Error(`Couldn't download the book list (HTTP ${res.status}).`);
      return res.arrayBuffer();
    })
    .then(readXlsxRows)
    .then((rows) => parseLibrarySheet(rows))
    .catch((e) => {
      cache = null; // allow a retry
      throw e;
    });
  return cache;
};
