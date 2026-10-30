import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Button } from "../../styles/ui";
import { ConfirmIcon, ConfirmRow, Dialog, DialogBody, DialogFooter, Overlay } from "./common.styles";
import { Icon } from "./Icon";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "danger" | "primary" | "warning";
  onConfirm: () => void;
  onCancel: () => void;
}

/** Reusable yes/no confirmation (delete book, etc.). */
export const ConfirmDialog = ({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  tone = "danger",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) => {
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    setBusy(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onCancel();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onCancel]);

  if (!open) return null;

  return createPortal(
    <Overlay onMouseDown={(e) => e.target === e.currentTarget && onCancel()}>
      <Dialog $width={440} role="alertdialog" aria-modal="true" aria-label={title}>
        <DialogBody>
          <ConfirmRow>
            <ConfirmIcon $tone={tone}>
              <Icon name={tone === "danger" ? "trash" : "alert"} />
            </ConfirmIcon>
            <div>
              <h3>{title}</h3>
              <div>{message}</div>
            </div>
          </ConfirmRow>
        </DialogBody>
        <DialogFooter>
          <Button type="button" $variant="secondary" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button
            type="button"
            autoFocus
            $variant={tone === "danger" ? "danger" : "primary"}
            disabled={busy}
            onClick={() => {
              setBusy(true);
              onConfirm();
            }}
          >
            {confirmLabel}
          </Button>
        </DialogFooter>
      </Dialog>
    </Overlay>,
    document.body,
  );
};
