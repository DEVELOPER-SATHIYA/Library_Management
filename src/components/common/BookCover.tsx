import type { Book } from "../../types/book.types";
import { Cover } from "./common.styles";

const hueFor = (s: string) => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) % 360, 7);

const initials = (title: string) =>
  title
    .replace(/[^A-Za-z0-9 ]/g, "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");

/** Cover thumbnail, or a generated placeholder when no image was uploaded. */
export const BookCover = ({ book, size = "sm" }: { book: Pick<Book, "title" | "coverImage">; size?: "sm" | "lg" }) => (
  <Cover $hue={hueFor(book.title || "?")} $size={size} aria-hidden="true">
    {book.coverImage ? <img src={book.coverImage} alt="" /> : initials(book.title || "?")}
  </Cover>
);
