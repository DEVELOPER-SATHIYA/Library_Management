# Library Management System — Admin Panel (Phase 1)

Admin-only frontend built with **React 18 + TypeScript + Vite**, routing with **react-router-dom** and styling with **styled-components**.
There is **no database yet** — all data comes from sample records in `src/data/` and lives in React state for the session (a page refresh resets it).

## Run it

```bash
npm install
npm run dev        # opens http://localhost:5173
npm run build      # type-check + production build into dist/
```

Requires Node.js 18 or newer.

## What works

| Screen | Features |
| --- | --- |
| **Dashboard** | Distinct titles vs. physical copies, available / issued / overdue counts, recent issues & returns, overdue + low-stock alerts, quick actions |
| **All Books** | Search (title, author, ISBN, Book ID), category & availability filters, sort by title / author / stock, pagination, view details, edit, delete with confirmation, empty state |
| **Register New Book** | Grouped form, required-field markers, live validation (copies ≥ 1, ISBN-10/13 check digit, duplicate ISBN, year), temporary Book ID, optional cover image, success card with edit / issue shortcuts |
| **Issued Books** | Outstanding loans with search (student, ID, title, issue ID), filters (issued, due soon, overdue, returned history), sort by issue / due date, days-late badge, details and Return dialog |
| **Issue / Return** | Issue: borrower details (known IDs auto-fill), stocked-books-only picker, copy ID, dates with presets, validation, review summary → confirm. Return: find loan → review dates, condition, remarks, fine → confirm |
| Students, Settings | Placeholders for later phases |

Inventory rules: `availableCopies = totalCopies − active loans`. Issuing decrements it, returning increments it, and the total can't be edited below the number of copies on loan. A book with copies on loan can't be deleted.
"Overdue" is **never stored** — it is derived from the due date and today's date while a loan is still `issued`.

## Folder structure

```
src/
├── components/
│   ├── layout/      AdminLayout, Sidebar, Header, PageHeader (+ layout.styles.ts, navItems.ts)
│   ├── common/      SearchBar, DataTable, StatusBadge, ConfirmDialog, EmptyState, Modal, Toast, Icon, BookCover, badges
│   ├── dashboard/   StatCard, QuickActions, RecentTransactions, AlertsPanel
│   ├── books/       BookForm, BookTable, BookDetails
│   └── issues/      IssueBookForm, IssuedBooksTable, ReturnBookDialog, IssueDetailsDialog
├── pages/           Dashboard, Books, RegisterBook, IssuedBooks, IssueReturn, Students, Settings (each with *Styles.ts)
├── services/        book.service.ts, issue.service.ts   ← swap for API calls later
├── context/         LibraryContext (books + issues state), ToastContext
├── hooks/           useReturnBook
├── types/           book.types.ts, issue.types.ts
├── data/            mockBooks.ts, mockIssues.ts
├── styles/          theme, GlobalStyles, shared UI primitives
├── utils/           dates, ISBN validation, constants (loan days, low-stock threshold)
├── routes/          AdminRoutes.tsx
└── App.tsx
```

## Connecting a database later

1. Build API endpoints for books and issues.
2. Make the functions in `src/services/*.service.ts` call those endpoints (make them `async`).
3. In `src/context/LibraryContext.tsx`, load the initial data from the API instead of `src/data/` and `await` the service calls.

Pages and components only talk to the context, so they shouldn't need changes.
