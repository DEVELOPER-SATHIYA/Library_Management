import { useState } from "react";
import type { Book } from "../../types/book.types";
import type { BookIssue } from "../../types/issue.types";
import { Card, CardHeader } from "../../styles/ui";
import { formatDate } from "../../utils/date";
import { BookCover } from "../common/BookCover";
import { LoanStatusBadge } from "../common/badges";
import { EmptyState } from "../common/EmptyState";
import { ActivityItem, ActivityList, Tab, Tabs, ViewAll } from "./dashboard.styles";

interface RecentTransactionsProps {
  issues: BookIssue[];
  books: Book[];
  today: string;
  limit?: number;
}

/** Tabbed list of the latest issues and returns. */
export const RecentTransactions = ({ issues, books, today, limit = 6 }: RecentTransactionsProps) => {
  const [tab, setTab] = useState<"issues" | "returns">("issues");
  const bookOf = (id: string) => books.find((b) => b.id === id);

  const recentIssues = [...issues]
    .sort((a, b) => b.issueDate.localeCompare(a.issueDate) || b.id.localeCompare(a.id))
    .slice(0, limit);
  const recentReturns = issues
    .filter((i) => i.status === "returned")
    .sort((a, b) => (b.returnDate ?? "").localeCompare(a.returnDate ?? "") || b.id.localeCompare(a.id))
    .slice(0, limit);
  const list = tab === "issues" ? recentIssues : recentReturns;

  return (
    <Card>
      <CardHeader>
        <h2>Recent Activity</h2>
        <Tabs role="tablist">
          <Tab type="button" role="tab" aria-selected={tab === "issues"} $active={tab === "issues"} onClick={() => setTab("issues")}>
            Recent issues
          </Tab>
          <Tab type="button" role="tab" aria-selected={tab === "returns"} $active={tab === "returns"} onClick={() => setTab("returns")}>
            Recent returns
          </Tab>
        </Tabs>
      </CardHeader>
      {list.length === 0 ? (
        <EmptyState title={tab === "issues" ? "No issues yet" : "No returns yet"} />
      ) : (
        <ActivityList>
          {list.map((i) => {
            const b = bookOf(i.bookId);
            return (
              <ActivityItem key={i.id}>
                {b && <BookCover book={b} />}
                <div>
                  <strong>{b?.title ?? i.bookId}</strong>
                  <small>
                    {i.studentName} · {i.studentId} ·{" "}
                    {tab === "issues" ? `issued ${formatDate(i.issueDate)}` : `returned ${formatDate(i.returnDate)}`}
                  </small>
                </div>
                <LoanStatusBadge issue={i} today={today} />
              </ActivityItem>
            );
          })}
        </ActivityList>
      )}
      <CardHeader as="footer">
        <span />
        <ViewAll to={tab === "issues" ? "/issued-books" : "/issued-books?filter=returned"}>View all →</ViewAll>
      </CardHeader>
    </Card>
  );
};
