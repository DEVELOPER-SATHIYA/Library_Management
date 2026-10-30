import { useCallback, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useLibrary } from "../../context/LibraryContext";
import type { BookIssue, IssueSortKey, IssuedFilter } from "../../types/issue.types";
import { loanState, searchIssues } from "../../services/issue.service";
import { useReturnBook } from "../../hooks/useReturnBook";
import { PageHeader } from "../../components/layout/PageHeader";
import { IssuedBooksTable } from "../../components/issues/IssuedBooksTable";
import { IssueDetailsDialog } from "../../components/issues/IssueDetailsDialog";
import { ReturnBookDialog } from "../../components/issues/ReturnBookDialog";
import { SearchBar } from "../../components/common/SearchBar";
import { EmptyState } from "../../components/common/EmptyState";
import { Icon } from "../../components/common/Icon";
import { Button, Card, Select } from "../../styles/ui";
import { SelectionBar } from "../../components/issues/issues.styles";
import { FilterChip, FilterChips, ToolbarRow } from "./IssuedBooksStyles";

const FILTERS: { value: IssuedFilter; label: string; tone: "neutral" | "info" | "warning" | "danger" }[] = [
  { value: "all", label: "All outstanding", tone: "neutral" },
  { value: "issued", label: "Issued (not overdue)", tone: "info" },
  { value: "dueSoon", label: "Due soon", tone: "warning" },
  { value: "overdue", label: "Overdue", tone: "danger" },
  { value: "returned", label: "Returned history", tone: "neutral" },
];

const SORTS: { value: string; label: string }[] = [
  { value: "dueDate:asc", label: "Due date — earliest first" },
  { value: "dueDate:desc", label: "Due date — latest first" },
  { value: "issueDate:desc", label: "Issue date — newest first" },
  { value: "issueDate:asc", label: "Issue date — oldest first" },
];

export const IssuedBooks = () => {
  const { books, issues, today } = useLibrary();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const dropSelected = useCallback(
    (ids: string[]) =>
      setSelected((prev) => {
        const next = new Set(prev);
        ids.forEach((id) => next.delete(id));
        return next;
      }),
    [],
  );
  const returnFlow = useReturnBook(dropSelected);

  const filter = (params.get("filter") as IssuedFilter) || "all";
  const setFilter = (f: IssuedFilter) => setParams(f === "all" ? {} : { filter: f }, { replace: true });

  const [keyword, setKeyword] = useState("");
  const [sort, setSort] = useState<{ key: IssueSortKey; dir: "asc" | "desc" }>({ key: "dueDate", dir: "asc" });
  const [viewingId, setViewingId] = useState<string | null>(null);

  const counts = useMemo(() => {
    const c: Record<IssuedFilter, number> = { all: 0, issued: 0, dueSoon: 0, overdue: 0, returned: 0 };
    issues.forEach((i) => {
      const s = loanState(i, today);
      if (s === "returned") return void c.returned++;
      c.all++;
      if (s === "overdue") c.overdue++;
      else {
        c.issued++;
        if (s === "dueSoon") c.dueSoon++;
      }
    });
    return c;
  }, [issues, today]);

  const rows = useMemo(
    () => searchIssues(issues, books, { keyword, filter, sort: sort.key, dir: sort.dir }, today),
    [issues, books, keyword, filter, sort, today],
  );

  const selectedLoans = issues.filter((i) => selected.has(i.id) && i.status === "issued");

  const viewing = viewingId ? issues.find((i) => i.id === viewingId) ?? null : null;
  const openReturn = (i: BookIssue) => {
    setViewingId(null);
    returnFlow.open(i);
  };

  return (
    <>
      <PageHeader
        title="Issued Books"
        description={`${counts.all} copies currently on loan · ${counts.overdue} overdue`}
        actions={
          <Button type="button" onClick={() => navigate("/issue-return")}>
            <Icon name="plus" />
            Issue Book
          </Button>
        }
      />

      <Card>
        <FilterChips role="tablist" aria-label="Loan status">
          {FILTERS.map((f) => (
            <FilterChip
              key={f.value}
              type="button"
              role="tab"
              aria-selected={filter === f.value}
              $active={filter === f.value}
              $tone={f.tone}
              onClick={() => setFilter(f.value)}
            >
              {f.label}
              <span>{counts[f.value]}</span>
            </FilterChip>
          ))}
        </FilterChips>

        <ToolbarRow>
          <SearchBar value={keyword} onChange={setKeyword} placeholder="Search student name, student ID, book title or issue ID" />
          <Select
            aria-label="Sort"
            value={`${sort.key}:${sort.dir}`}
            onChange={(e) => {
              const [key, dir] = e.target.value.split(":") as [IssueSortKey, "asc" | "desc"];
              setSort({ key, dir });
            }}
          >
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </Select>
        </ToolbarRow>

        {selectedLoans.length > 0 && (
          <SelectionBar role="status">
            <span>
              <strong>{selectedLoans.length}</strong> book{selectedLoans.length === 1 ? "" : "s"} selected
              {(() => {
                const n = new Set(selectedLoans.map((i) => i.studentId)).size;
                return n > 1 ? ` · ${n} students` : ` · ${selectedLoans[0].studentName}`;
              })()}
            </span>
            <div>
              <Button type="button" $size="sm" $variant="ghost" onClick={() => setSelected(new Set())}>
                Clear selection
              </Button>
              <Button type="button" $size="sm" $variant="success" onClick={() => returnFlow.open(selectedLoans)}>
                <Icon name="return" />
                Return selected ({selectedLoans.length})
              </Button>
            </div>
          </SelectionBar>
        )}

        <IssuedBooksTable
          issues={rows}
          selectedIds={selected}
          onSelectionChange={setSelected}
          books={books}
          today={today}
          sort={sort}
          onSort={(key) =>
            setSort((s) => ({ key: key as IssueSortKey, dir: s.key === key && s.dir === "asc" ? "desc" : "asc" }))
          }
          onView={(i) => setViewingId(i.id)}
          onReturn={openReturn}
          resetKey={`${keyword}|${filter}|${sort.key}|${sort.dir}`}
          empty={
            <EmptyState
              icon={keyword ? "search" : "issued"}
              title={keyword ? "No transactions match your search" : filter === "overdue" ? "No overdue books" : "Nothing here"}
              message={
                keyword
                  ? "Check the spelling, or search by student ID or issue ID instead."
                  : filter === "overdue"
                    ? "Every outstanding loan is within its due date."
                    : "No transactions fall under this filter."
              }
              action={
                keyword ? (
                  <Button type="button" $variant="secondary" onClick={() => setKeyword("")}>
                    Clear search
                  </Button>
                ) : undefined
              }
            />
          }
        />
      </Card>

      <IssueDetailsDialog
        issue={viewing}
        book={viewing ? books.find((b) => b.id === viewing.bookId) : undefined}
        today={today}
        onClose={() => setViewingId(null)}
        onReturn={openReturn}
      />
      <ReturnBookDialog
        issues={returnFlow.targets}
        books={books}
        today={today}
        onCancel={returnFlow.close}
        onConfirm={returnFlow.confirm}
      />
    </>
  );
};
