import type { Book } from "../../types/book.types";
import type { BookIssue } from "../../types/issue.types";
import { stockStatus } from "../../services/book.service";
import { daysOverdue, loanState } from "../../services/issue.service";
import { Card, CardHeader } from "../../styles/ui";
import { StatusBadge } from "../common/StatusBadge";
import { Icon } from "../common/Icon";
import { AlertGroupTitle, AlertItem, AlertList, AllClear, ViewAll } from "./dashboard.styles";

interface AlertsPanelProps {
  books: Book[];
  issues: BookIssue[];
  today: string;
  limit?: number;
}

/** Overdue loans and low / out-of-stock titles that need attention. */
export const AlertsPanel = ({ books, issues, today, limit = 5 }: AlertsPanelProps) => {
  const overdue = issues
    .filter((i) => loanState(i, today) === "overdue")
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  const lowStock = books
    .filter((b) => stockStatus(b) !== "available")
    .sort((a, b) => a.availableCopies - b.availableCopies || a.title.localeCompare(b.title));
  const titleOf = (id: string) => books.find((b) => b.id === id)?.title ?? id;

  return (
    <Card>
      <CardHeader>
        <h2>Alerts</h2>
        <StatusBadge tone={overdue.length + lowStock.length ? "danger" : "success"}>
          {overdue.length + lowStock.length} item{overdue.length + lowStock.length === 1 ? "" : "s"}
        </StatusBadge>
      </CardHeader>

      <AlertGroupTitle>
        <Icon name="clock" size={14} /> Overdue ({overdue.length})
      </AlertGroupTitle>
      {overdue.length === 0 ? (
        <AllClear>No overdue books right now.</AllClear>
      ) : (
        <AlertList>
          {overdue.slice(0, limit).map((i) => (
            <AlertItem key={i.id} $tone="danger">
              <div>
                <strong>{titleOf(i.bookId)}</strong>
                <small>
                  {i.studentName} · {i.studentPhone ?? i.studentId}
                </small>
              </div>
              <StatusBadge tone="danger">{daysOverdue(i, today)}d late</StatusBadge>
            </AlertItem>
          ))}
        </AlertList>
      )}
      {overdue.length > limit && (
        <AllClear>
          <ViewAll to="/issued-books?filter=overdue">+{overdue.length - limit} more overdue →</ViewAll>
        </AllClear>
      )}

      <AlertGroupTitle>
        <Icon name="layers" size={14} /> Low stock ({lowStock.length})
      </AlertGroupTitle>
      {lowStock.length === 0 ? (
        <AllClear>All titles have healthy stock.</AllClear>
      ) : (
        <AlertList>
          {lowStock.slice(0, limit).map((b) => (
            <AlertItem key={b.id} $tone={b.availableCopies === 0 ? "danger" : "warning"}>
              <div>
                <strong>{b.title}</strong>
                <small>
                  {b.id} · {b.availableCopies} of {b.totalCopies} available
                </small>
              </div>
              <StatusBadge tone={b.availableCopies === 0 ? "danger" : "warning"}>
                {b.availableCopies === 0 ? "Out" : "Low"}
              </StatusBadge>
            </AlertItem>
          ))}
        </AlertList>
      )}
      {lowStock.length > limit && (
        <AllClear>
          <ViewAll to="/books?availability=low">View all low-stock titles →</ViewAll>
        </AllClear>
      )}
    </Card>
  );
};
