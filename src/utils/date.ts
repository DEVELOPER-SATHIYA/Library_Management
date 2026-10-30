/** Date helpers working on local "YYYY-MM-DD" strings (no timezone drift). */

const pad = (n: number) => String(n).padStart(2, "0");

export const toISODate = (d: Date): string =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export const parseISODate = (iso: string): Date => {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
};

export const todayISO = (): string => toISODate(new Date());

export const addDays = (iso: string, days: number): string => {
  const d = parseISODate(iso);
  d.setDate(d.getDate() + days);
  return toISODate(d);
};

export const daysFromToday = (days: number): string => addDays(todayISO(), days);

/** Whole days from `from` to `to` (positive when `to` is later). */
export const diffInDays = (from: string, to: string): number => {
  const ms = parseISODate(to).getTime() - parseISODate(from).getTime();
  return Math.round(ms / 86_400_000);
};

export const formatDate = (iso?: string): string => {
  if (!iso) return "—";
  return parseISODate(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export const isValidISODate = (iso: string): boolean =>
  /^\d{4}-\d{2}-\d{2}$/.test(iso) && !Number.isNaN(parseISODate(iso).getTime());
