import type { Book } from "../../types/book.types";
import type { BookIssue } from "../../types/issue.types";
import { Button, DetailList } from "../../styles/ui";
import { formatDate } from "../../utils/date";
import { BookCover } from "../common/BookCover";
import { LoanStatusBadge } from "../common/badges";
import { Icon } from "../common/Icon";
import { Modal } from "../common/Modal";
import { SelectedBook } from "./issues.styles";

interface IssueDetailsDialogProps {
  issue: BookIssue | null;
  book?: Book;
  today: string;
  onClose: () => void;
  onReturn: (i: BookIssue) => void;
}

const conditionLabel: Record<string, string> = {
  good: "Good",
  fair: "Fair",
  damaged: "Damaged",
  lost: "Lost",
};

export const IssueDetailsDialog = ({ issue, book, today, onClose, onReturn }: IssueDetailsDialogProps) => {
  if (!issue) return null;
  return (
    <Modal
      open
      width={600}
      title="Transaction details"
      subtitle={issue.id}
      onClose={onClose}
      footer={
        <>
          <Button type="button" $variant="secondary" onClick={onClose}>
            Close
          </Button>
          {issue.status === "issued" && (
            <Button type="button" $variant="success" onClick={() => onReturn(issue)}>
              <Icon name="return" />
              Return book
            </Button>
          )}
        </>
      }
    >
      <SelectedBook>
        {book && <BookCover book={book} />}
        <div>
          <strong>{book?.title ?? issue.bookId}</strong>
          <small>
            {book?.author} · {issue.bookCopyId ?? issue.bookId}
          </small>
        </div>
      </SelectedBook>

      <DetailList>
        <div>
          <dt>Status</dt>
          <dd>
            <LoanStatusBadge issue={issue} today={today} />
          </dd>
        </div>
        <div>
          <dt>Student</dt>
          <dd>
            {issue.studentName} ({issue.studentId})
          </dd>
        </div>
        <div>
          <dt>Class / Department</dt>
          <dd>{issue.studentClass ?? "—"}</dd>
        </div>
        <div>
          <dt>Phone</dt>
          <dd>{issue.studentPhone ?? "—"}</dd>
        </div>
        <div>
          <dt>Issue date</dt>
          <dd>{formatDate(issue.issueDate)}</dd>
        </div>
        <div>
          <dt>Due date</dt>
          <dd>{formatDate(issue.dueDate)}</dd>
        </div>
        {issue.status === "returned" && (
          <>
            <div>
              <dt>Returned on</dt>
              <dd>{formatDate(issue.returnDate)}</dd>
            </div>
            <div>
              <dt>Condition</dt>
              <dd>{issue.returnCondition ? conditionLabel[issue.returnCondition] : "—"}</dd>
            </div>
            <div>
              <dt>Fine</dt>
              <dd>{issue.fineAmount ? `₹${issue.fineAmount}` : "—"}</dd>
            </div>
            <div>
              <dt>Return remarks</dt>
              <dd>{issue.returnRemarks ?? "—"}</dd>
            </div>
          </>
        )}
        <div>
          <dt>Notes</dt>
          <dd>{issue.notes ?? "—"}</dd>
        </div>
      </DetailList>
    </Modal>
  );
};
