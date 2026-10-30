import type { IconName } from "../common/Icon";

export interface NavItemConfig {
  path: string;
  label: string;
  description: string;
  icon: IconName;
  comingSoon?: boolean;
}

export const NAV_ITEMS: NavItemConfig[] = [
  { path: "/dashboard", label: "Dashboard", description: "Library overview", icon: "dashboard" },
  { path: "/books", label: "All Books", description: "Browse and maintain inventory", icon: "books" },
  { path: "/issued-books", label: "Issued Books", description: "Track borrowed copies", icon: "issued" },
  { path: "/register-book", label: "Register New Book", description: "Add books to the catalogue", icon: "register" },
  { path: "/issue-return", label: "Issue / Return Books", description: "Manage borrowing transactions", icon: "swap" },
  { path: "/students", label: "Students", description: "Reserved for future integration", icon: "students", comingSoon: true },
  { path: "/settings", label: "Settings", description: "Admin preferences", icon: "settings", comingSoon: true },
];

/** Header titles per route. */
export const titleFor = (pathname: string): { title: string; subtitle: string } => {
  const item = NAV_ITEMS.find((n) => pathname.startsWith(n.path));
  return item ? { title: item.label, subtitle: item.description } : { title: "Library Admin", subtitle: "" };
};
