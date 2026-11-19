import { loanState } from "../../services/issue.service";
import type { CatalogueCopy } from "../../types/catalogue.types";
import { TitleCell } from "../books/books.styles";
import { StatusBadge } from "../common/StatusBadge";

/** Table cells shared by the public catalogue and the admin All Books page. */

/** `showOverdue` is for the admin side; students just see "Issued". */
export const CopyStatusBadge = ({ copy, showOverdue }: { copy: CatalogueCopy; showOverdue?: boolean }) => {
  if (copy.status === "issued") {
    if (showOverdue && copy.loan && loanState(copy.loan) === "overdue")
      return <StatusBadge tone="danger">Overdue</StatusBadge>;
    return <StatusBadge tone="info">Issued</StatusBadge>;
  }
  if (copy.status === "unavailable")
    return (
      <StatusBadge tone="neutral" title={copy.withdrawnReason}>
        Not available
      </StatusBadge>
    );
  return <StatusBadge tone="success">Available</StatusBadge>;
};

export const CopyTitle = ({ copy }: { copy: CatalogueCopy }) => (
  <TitleCell>
    <div>
      <strong>{copy.title}</strong>
      <small>{[copy.publisher, copy.publishYear].filter(Boolean).join(" · ")}</small>
    </div>
  </TitleCell>
);
