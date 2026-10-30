import type { Book } from "../../types/book.types";
import type { BookIssue } from "../../types/issue.types";
import { stockStatus } from "../../services/book.service";
import { daysOverdue, daysUntilDue, loanState } from "../../services/issue.service";
import { StatusBadge } from "./StatusBadge";

export const BookStockBadge = ({ book }: { book: Book }) => {
  const s = stockStatus(book);
  if (s === "out") return <StatusBadge tone="danger">Out of Stock</StatusBadge>;
  if (s === "low") return <StatusBadge tone="warning">Low Stock</StatusBadge>;
  return <StatusBadge tone="success">Available</StatusBadge>;
};

const plural = (n: number, w: string) => `${n} ${w}${n === 1 ? "" : "s"}`;

export const LoanStatusBadge = ({ issue, today }: { issue: BookIssue; today: string }) => {
  const state = loanState(issue, today);
  switch (state) {
    case "returned": {
      const late = daysOverdue(issue);
      return (
        <StatusBadge tone="neutral" title={late ? `Returned ${plural(late, "day")} late` : "Returned on time"}>
          Returned{late ? ` · ${late}d late` : ""}
        </StatusBadge>
      );
    }
    case "overdue":
      return <StatusBadge tone="danger">Overdue · {plural(daysOverdue(issue, today), "day")}</StatusBadge>;
    case "dueSoon": {
      const d = daysUntilDue(issue, today);
      return <StatusBadge tone="warning">{d === 0 ? "Due today" : `Due in ${plural(d, "day")}`}</StatusBadge>;
    }
    default:
      return <StatusBadge tone="info">Issued</StatusBadge>;
  }
};
