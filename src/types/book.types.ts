/** A catalogue record. Describes inventory, not individual loans. */
export interface Book {
  id: string;
  title: string;
  author: string;
  isbn?: string;
  category: string;
  publisher?: string;
  edition?: string;
  publicationYear?: number;
  totalCopies: number;
  availableCopies: number;
  shelfNumber?: string;
  coverImage?: string;
  createdAt?: string;
}

/** Values captured by the register / edit form (strings straight from inputs). */
export interface BookFormValues {
  title: string;
  author: string;
  isbn: string;
  category: string;
  publisher: string;
  edition: string;
  publicationYear: string;
  totalCopies: string;
  shelfNumber: string;
  coverImage: string;
}

export type BookFormErrors = Partial<Record<keyof BookFormValues, string>>;

export type AvailabilityFilter = "all" | "available" | "low" | "out";

export type BookSortKey = "title" | "author" | "stock";

export const BOOK_CATEGORIES = [
  "Technology",
  "Science",
  "Mathematics",
  "Fiction",
  "Literature",
  "History",
  "Biography",
  "Business",
  "Reference",
] as const;
