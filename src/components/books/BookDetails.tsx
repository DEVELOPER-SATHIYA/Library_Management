import type { Book } from "../../types/book.types";
import type { BookIssue } from "../../types/issue.types";
import { Button, DetailList } from "../../styles/ui";
import { formatDate } from "../../utils/date";
import { BookCover } from "../common/BookCover";
import { BookStockBadge, LoanStatusBadge } from "../common/badges";
import { Icon } from "../common/Icon";
import { Modal } from "../common/Modal";
import { DetailsTop, LoanList, StockSummary, SubHeading } from "./books.styles";

interface BookDetailsProps {
  book: Book | null;
  issues: BookIssue[];
  today: string;
  onClose: () => void;
  onEdit: (b: Book) => void;
}

/** Full record view, including copies currently on loan. */
export const BookDetails = ({ book, issues, today, onClose, onEdit }: BookDetailsProps) => {
  if (!book) return null;
  const active = issues.filter((i) => i.bookId === book.id && i.status === "issued");
  const onLoan = book.totalCopies - book.availableCopies;

  return (
    <Modal
      open
      width={640}
      title="Book details"
      subtitle={book.id}
      onClose={onClose}
      footer={
        <>
          <Button type="button" $variant="secondary" onClick={onClose}>
            Close
          </Button>
          <Button type="button" onClick={() => onEdit(book)}>
            <Icon name="edit" />
            Edit book
          </Button>
        </>
      }
    >
      <DetailsTop>
        <BookCover book={book} size="lg" />
        <div>
          <h3>{book.title}</h3>
          <p>by {book.author}</p>
          <BookStockBadge book={book} />
        </div>
      </DetailsTop>

      <StockSummary>
        <div>
          <strong>{book.totalCopies}</strong>
          <span>Total copies</span>
        </div>
        <div>
          <strong>{book.availableCopies}</strong>
          <span>Available</span>
        </div>
        <div>
          <strong>{onLoan}</strong>
          <span>On loan</span>
        </div>
      </StockSummary>

      <DetailList>
        <div>
          <dt>ISBN</dt>
          <dd>{book.isbn ?? "—"}</dd>
        </div>
        <div>
          <dt>Category</dt>
          <dd>{book.category}</dd>
        </div>
        <div>
          <dt>Publisher</dt>
          <dd>{book.publisher ?? "—"}</dd>
        </div>
        <div>
          <dt>Edition</dt>
          <dd>{book.edition ?? "—"}</dd>
        </div>
        <div>
          <dt>Publication year</dt>
          <dd>{book.publicationYear ?? "—"}</dd>
        </div>
        <div>
          <dt>Shelf / Rack</dt>
          <dd>{book.shelfNumber ?? "—"}</dd>
        </div>
        <div>
          <dt>Registered on</dt>
          <dd>{formatDate(book.createdAt)}</dd>
        </div>
      </DetailList>

      <SubHeading>Copies on loan ({active.length})</SubHeading>
      {active.length === 0 ? (
        <p>All copies are on the shelf.</p>
      ) : (
        <LoanList>
          {active.map((i) => (
            <li key={i.id}>
              <div>
                <strong>{i.studentName}</strong>
                <small>
                  {i.studentId} · {i.bookCopyId} · due {formatDate(i.dueDate)}
                </small>
              </div>
              <LoanStatusBadge issue={i} today={today} />
            </li>
          ))}
        </LoanList>
      )}
    </Modal>
  );
};
