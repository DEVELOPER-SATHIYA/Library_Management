import type { Book } from "../types/book.types";
import type { BookIssue } from "../types/issue.types";
import type { CatalogueCopy, CatalogueSortKey, CopyStatusFilter } from "../types/catalogue.types";

/** Flattens titles into one row per physical copy, with each copy's current loan. */
export const listCopies = (books: Book[], issues: BookIssue[]): CatalogueCopy[] => {
  const loans = new Map<string, BookIssue>();
  issues.forEach((i) => i.status === "issued" && i.bookCopyId && loans.set(i.bookCopyId, i));

  return books.flatMap((b) =>
    b.copies.map((c): CatalogueCopy => {
      const loan = c.withdrawnReason ? undefined : loans.get(c.accNo);
      return {
        ...c,
        shelf: c.shelf ?? b.shelfNumber,
        bookId: b.id,
        title: b.title,
        author: b.author,
        publisher: b.publisher,
        publishYear: b.publicationYear ? String(b.publicationYear) : undefined,
        status: c.withdrawnReason ? "unavailable" : loan ? "issued" : "available",
        loan,
      };
    }),
  );
};

const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: "base" });

export const filterCopies = (
  copies: CatalogueCopy[],
  opts: {
    keyword: string;
    status: CopyStatusFilter;
    sort: CatalogueSortKey;
    dir: "asc" | "desc";
    /** Also match Book ID, shelf, borrower and remarks. Admin only: borrowers must not be searchable publicly. */
    adminSearch?: boolean;
  },
): CatalogueCopy[] => {
  const q = opts.keyword.trim().toLowerCase();
  const matches = (c: CatalogueCopy) => {
    const fields = [c.title, c.author, c.accNo, c.publisher];
    if (opts.adminSearch)
      fields.push(c.bookId, c.shelf, c.loan?.studentName, c.loan?.studentId, c.remarks, c.withdrawnReason);
    return fields.some((f) => f?.toLowerCase().includes(q));
  };
  const out = copies.filter((c) => (opts.status === "all" || c.status === opts.status) && (!q || matches(c)));
  const sign = opts.dir === "asc" ? 1 : -1;
  return out.sort((a, b) => sign * collator.compare(a[opts.sort], b[opts.sort]));
};
