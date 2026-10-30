/** ISBN helpers. Accepts ISBN-10 or ISBN-13, with or without hyphens/spaces. */

export const normalizeIsbn = (isbn: string): string => isbn.replace(/[\s-]/g, "").toUpperCase();

const isValidIsbn10 = (s: string): boolean => {
  if (!/^\d{9}[\dX]$/.test(s)) return false;
  const sum = s
    .split("")
    .reduce((acc, ch, i) => acc + (ch === "X" ? 10 : Number(ch)) * (10 - i), 0);
  return sum % 11 === 0;
};

const isbn13CheckDigit = (first12: string): number => {
  const sum = first12
    .split("")
    .reduce((acc, ch, i) => acc + Number(ch) * (i % 2 === 0 ? 1 : 3), 0);
  return (10 - (sum % 10)) % 10;
};

const isValidIsbn13 = (s: string): boolean =>
  /^97[89]\d{10}$/.test(s) && isbn13CheckDigit(s.slice(0, 12)) === Number(s[12]);

export const isValidIsbn = (isbn: string): boolean => {
  const s = normalizeIsbn(isbn);
  return s.length === 10 ? isValidIsbn10(s) : s.length === 13 ? isValidIsbn13(s) : false;
};

/** Builds a valid hyphenated ISBN-13 from a 12-digit prefix (used for mock data). */
export const makeIsbn13 = (first12: string): string => {
  const full = first12 + isbn13CheckDigit(first12);
  return `${full.slice(0, 3)}-${full.slice(3, 5)}-${full.slice(5, 9)}-${full.slice(9, 12)}-${full[12]}`;
};
