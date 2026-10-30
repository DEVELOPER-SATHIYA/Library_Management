import { useCallback, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useLibrary } from "../../context/LibraryContext";
import { useToast } from "../../context/ToastContext";
import type { BookIssue } from "../../types/issue.types";
import { loanState, searchIssues } from "../../services/issue.service";
import { useReturnBook } from "../../hooks/useReturnBook";
import { PageHeader } from "../../components/layout/PageHeader";
import { IssueBookForm } from "../../components/issues/IssueBookForm";
import { IssuedBooksTable } from "../../components/issues/IssuedBooksTable";
import { IssueDetailsDialog } from "../../components/issues/IssueDetailsDialog";
import { ReturnBookDialog } from "../../components/issues/ReturnBookDialog";
import { SelectionBar } from "../../components/issues/issues.styles";
import { LoanStatusBadge } from "../../components/common/badges";
import { SearchBar } from "../../components/common/SearchBar";
import { EmptyState } from "../../components/common/EmptyState";
import { Icon } from "../../components/common/Icon";
import { Button, Card, CardBody, CardHeader } from "../../styles/ui";
import { formatDate } from "../../utils/date";
import {
  DoneCard,
  DoneList,
  Layout,
  SearchRow,
  SideEmpty,
  SideList,
  StudentMatch,
  TabBar,
  TabButton,
} from "./IssueReturnStyles";

type TabKey = "issue" | "return";

export const IssueReturn = () => {
  const { books, issues, today, issueBooks } = useLibrary();
  const notify = useToast();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const tab: TabKey = params.get("tab") === "return" ? "return" : "issue";
  const initialBookId = params.get("book") ?? undefined;

  const [lastIssued, setLastIssued] = useState<BookIssue[]>([]);
  const [keyword, setKeyword] = useState("");
  const [viewingId, setViewingId] = useState<string | null>(null);
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

  const bookOf = (id: string) => books.find((b) => b.id === id);

  const outstanding = useMemo(
    () => searchIssues(issues, books, { keyword, filter: "all", sort: "dueDate", dir: "asc" }, today),
    [issues, books, keyword, today],
  );

  // When the search narrows to one student, offer "return all their books".
  const matchedStudent = useMemo(() => {
    if (!keyword.trim() || outstanding.length === 0) return null;
    const ids = new Set(outstanding.map((i) => i.studentId));
    if (ids.size !== 1) return null;
    const all = issues.filter((i) => i.status === "issued" && i.studentId === outstanding[0].studentId);
    return { name: all[0].studentName, id: all[0].studentId, cls: all[0].studentClass, loans: all };
  }, [keyword, outstanding, issues]);

  const selectedLoans = issues.filter((i) => selected.has(i.id) && i.status === "issued");
  const todaysIssues = issues.filter((i) => i.issueDate === today && i.status === "issued");
  const todaysReturns = issues.filter((i) => i.returnDate === today);
  const viewing = viewingId ? issues.find((i) => i.id === viewingId) ?? null : null;

  const switchTab = (t: TabKey) => setParams(t === "issue" ? {} : { tab: t }, { replace: true });

  return (
    <>
      <PageHeader
        title="Issue / Return Books"
        description="Issue one or more books to a student, and return several books in one step."
        actions={
          <Button type="button" $variant="secondary" onClick={() => navigate("/issued-books")}>
            <Icon name="issued" />
            View issued books
          </Button>
        }
      />

      <TabBar role="tablist">
        <TabButton type="button" role="tab" aria-selected={tab === "issue"} $active={tab === "issue"} onClick={() => switchTab("issue")}>
          <Icon name="plus" size={16} />
          Issue Books
        </TabButton>
        <TabButton type="button" role="tab" aria-selected={tab === "return"} $active={tab === "return"} onClick={() => switchTab("return")}>
          <Icon name="return" size={16} />
          Return Books
        </TabButton>
      </TabBar>

      {tab === "issue" ? (
        <>
          {lastIssued.length > 0 && (
            <DoneCard role="status">
              <Icon name="check" size={22} />
              <div>
                <strong>
                  Issued {lastIssued.length} book{lastIssued.length === 1 ? "" : "s"} to {lastIssued[0].studentName} · due{" "}
                  {formatDate(lastIssued[0].dueDate)}
                </strong>
                <DoneList>
                  {lastIssued.map((i) => (
                    <li key={i.id}>
                      {i.id} — {bookOf(i.bookId)?.title} ({i.bookCopyId})
                    </li>
                  ))}
                </DoneList>
              </div>
              <Button type="button" $size="sm" $variant="secondary" onClick={() => navigate("/issued-books")}>
                View in Issued Books
              </Button>
            </DoneCard>
          )}
          <Layout>
            <Card>
              <CardHeader>
                <div>
                  <h2>Issue Books to Student</h2>
                  <p>Enter the student, add one or more books, review the summary, then confirm.</p>
                </div>
              </CardHeader>
              <CardBody>
                <IssueBookForm
                  key={initialBookId ?? "new"}
                  books={books}
                  issues={issues}
                  today={today}
                  initialBookId={initialBookId}
                  onConfirm={issueBooks}
                  onDone={(created) => {
                    setLastIssued(created);
                    const what =
                      created.length === 1 ? bookOf(created[0].bookId)?.title ?? created[0].bookId : `${created.length} books`;
                    notify("success", created.length === 1 ? "Book issued" : `${created.length} books issued`, `${what} issued to ${created[0].studentName}.`);
                    if (initialBookId) setParams({}, { replace: true });
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                />
              </CardBody>
            </Card>

            <Card>
              <CardHeader>
                <h2>Today's desk</h2>
              </CardHeader>
              <CardHeader as="div">
                <p>
                  {todaysIssues.length} issued · {todaysReturns.length} returned
                </p>
              </CardHeader>
              {todaysIssues.length + todaysReturns.length === 0 ? (
                <SideEmpty>No transactions recorded today yet.</SideEmpty>
              ) : (
                <SideList>
                  {[...todaysIssues, ...todaysReturns].map((i) => (
                    <li key={i.id}>
                      <div>
                        <strong>{bookOf(i.bookId)?.title ?? i.bookId}</strong>
                        <small>
                          {i.studentName} · {i.id}
                        </small>
                      </div>
                      <LoanStatusBadge issue={i} today={today} />
                    </li>
                  ))}
                </SideList>
              )}
            </Card>
          </Layout>
        </>
      ) : (
        <Card>
          <CardHeader>
            <div>
              <h2>Return books</h2>
              <p>Search for the student, tick every book they're bringing back, then select Return selected.</p>
            </div>
          </CardHeader>
          <SearchRow>
            <SearchBar value={keyword} onChange={setKeyword} placeholder="Search by student name, student ID, book title or issue ID" />
          </SearchRow>

          {matchedStudent && (
            <StudentMatch>
              <div>
                <strong>
                  {matchedStudent.name} ({matchedStudent.id})
                </strong>
                <small>
                  {matchedStudent.cls ? `${matchedStudent.cls} · ` : ""}
                  {matchedStudent.loans.length} book{matchedStudent.loans.length === 1 ? "" : "s"} on loan
                  {(() => {
                    const n = matchedStudent.loans.filter((l) => loanState(l, today) === "overdue").length;
                    return n ? ` · ${n} overdue` : "";
                  })()}
                </small>
              </div>
              <div>
                <Button
                  type="button"
                  $size="sm"
                  $variant="secondary"
                  onClick={() => setSelected(new Set([...selected, ...matchedStudent.loans.map((l) => l.id)]))}
                >
                  Select all {matchedStudent.loans.length}
                </Button>
                <Button type="button" $size="sm" $variant="success" onClick={() => returnFlow.open(matchedStudent.loans)}>
                  <Icon name="return" />
                  Return all {matchedStudent.loans.length}
                </Button>
              </div>
            </StudentMatch>
          )}

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
            issues={outstanding}
            books={books}
            today={today}
            pageSize={8}
            resetKey={keyword}
            selectedIds={selected}
            onSelectionChange={setSelected}
            onView={(i) => setViewingId(i.id)}
            onReturn={returnFlow.open}
            empty={
              <EmptyState
                icon="search"
                title={keyword ? "No outstanding loan found" : "No books are on loan"}
                message={keyword ? "Check the student ID or try the book title." : "Every copy is currently on the shelf."}
              />
            }
          />
        </Card>
      )}

      <IssueDetailsDialog
        issue={viewing}
        book={viewing ? bookOf(viewing.bookId) : undefined}
        today={today}
        onClose={() => setViewingId(null)}
        onReturn={(i) => {
          setViewingId(null);
          returnFlow.open(i);
        }}
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
