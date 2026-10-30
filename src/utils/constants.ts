/** Default loan period in days used to pre-fill the due date. */
export const DEFAULT_LOAN_DAYS = 14;

/** A loan is "due soon" when it is due within this many days. */
export const DUE_SOON_DAYS = 3;

/** A title is "low stock" when available copies are at or below this number (but above 0). */
export const LOW_STOCK_THRESHOLD = 1;

export const PAGE_SIZE = 10;

/** Maximum books a student may hold at once (existing loans + new ones). */
export const MAX_BOOKS_PER_STUDENT = 5;
