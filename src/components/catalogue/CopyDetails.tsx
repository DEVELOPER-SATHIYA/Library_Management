import type { ReactNode } from "react";
import type { CatalogueCopy } from "../../types/catalogue.types";
import { Button, DetailList, Mono, Muted } from "../../styles/ui";
import { formatDate } from "../../utils/date";
import { Icon } from "../common/Icon";
import { Modal } from "../common/Modal";
import { CopyStatusBadge } from "./CopyCells";

const Row = ({ label, children }: { label: string; children: ReactNode }) => (
  <div>
    <dt>{label}</dt>
    <dd>{children || <Muted>—</Muted>}</dd>
  </div>
);

interface CopyDetailsProps {
  copy: CatalogueCopy | null;
  onClose: () => void;
  onEdit: (c: CatalogueCopy) => void;
}

/** Admin popup with every detail for one copy. */
export const CopyDetails = ({ copy, onClose, onEdit }: CopyDetailsProps) => {
  if (!copy) return null;
  const loan = copy.loan;
  return (
    <Modal
      open
      width={640}
      title={copy.title}
      subtitle={`Book ID ${copy.accNo}`}
      onClose={onClose}
      footer={
        <Button type="button" $variant="secondary" onClick={() => onEdit(copy)}>
          <Icon name="edit" />
          Edit book
        </Button>
      }
    >
      <DetailList>
        <Row label="Status">
          <CopyStatusBadge copy={copy} showOverdue />
        </Row>
        <Row label="Page">{copy.registerPage}</Row>
        <Row label="Shelf">{copy.shelf && <Mono>{copy.shelf}</Mono>}</Row>
        <Row label="Author">{copy.author}</Row>
        <Row label="Publisher">{copy.publisher}</Row>
        <Row label="Publish year">{copy.publishYear}</Row>
        <Row label="Price">{copy.price}</Row>
        {loan && (
          <>
            <Row label="Issued to">
              {loan.studentName} <Muted>({loan.studentId})</Muted>
            </Row>
            <Row label="Transaction">
              <Mono>{loan.id}</Mono>
            </Row>
            <Row label="Issue date">{formatDate(loan.issueDate)}</Row>
            <Row label="Due date">{formatDate(loan.dueDate)}</Row>
          </>
        )}
        <Row label="Purchase date">{copy.purchaseDate && formatDate(copy.purchaseDate)}</Row>
        <Row label="Serial no.">{copy.serial}</Row>
        <Row label="Not available because">{copy.withdrawnReason}</Row>
        <Row label="Remarks">{copy.remarks}</Row>
        {loan?.notes && <Row label="Loan notes">{loan.notes}</Row>}
      </DetailList>
    </Modal>
  );
};
