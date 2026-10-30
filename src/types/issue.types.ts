/**
 * Only "issued" and "returned" are stored. "Overdue" is derived from the
 * due date and today's date while the loan is still issued.
 */
export type IssueStatus = "issued" | "returned";

export type ReturnCondition = "good" | "fair" | "damaged" | "lost";

/** A single borrowing event. */
export interface BookIssue {
  id: string;
  studentId: string;
  studentName: string;
  studentClass?: string;
  studentPhone?: string;
  bookId: string;
  bookCopyId?: string;
  issueDate: string; // YYYY-MM-DD
  dueDate: string; // YYYY-MM-DD
  returnDate?: string; // YYYY-MM-DD
  status: IssueStatus;
  notes?: string;
  returnCondition?: ReturnCondition;
  returnRemarks?: string;
  fineAmount?: number;
}

/** Display-only state computed at runtime. */
export type LoanState = "issued" | "dueSoon" | "overdue" | "returned";

export type IssuedFilter = "all" | "issued" | "dueSoon" | "overdue" | "returned";

export type IssueSortKey = "issueDate" | "dueDate";

/** One book in a multi-book issue. */
export interface IssueItem {
  bookId: string;
  /** Empty = auto-assign the next free copy. */
  bookCopyId: string;
}

/** A single issue session: one student, one or more books, shared dates. */
export interface IssueFormValues {
  studentId: string;
  studentName: string;
  studentClass: string;
  studentPhone: string;
  items: IssueItem[];
  issueDate: string;
  dueDate: string;
  notes: string;
}

export type IssueFormErrors = Partial<Record<keyof IssueFormValues, string>>;

/** Per-book details captured when returning. */
export interface ReturnItem {
  issueId: string;
  returnCondition: ReturnCondition;
  fineAmount: string;
}

/** A single return session: one or more loans, shared return date and remarks. */
export interface ReturnFormValues {
  returnDate: string;
  returnRemarks: string;
  items: ReturnItem[];
}
