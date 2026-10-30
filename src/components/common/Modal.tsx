import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { IconButton } from "../../styles/ui";
import { Dialog, DialogBody, DialogFooter, DialogHeader, Overlay } from "./common.styles";
import { Icon } from "./Icon";

interface ModalProps {
  open: boolean;
  title: string;
  subtitle?: string;
  onClose: () => void;
  footer?: ReactNode;
  width?: number;
  children: ReactNode;
}

/** Base dialog shell. Closes on Escape or backdrop click. */
export const Modal = ({ open, title, subtitle, onClose, footer, width, children }: ModalProps) => {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <Overlay onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <Dialog $width={width} role="dialog" aria-modal="true" aria-label={title}>
        <DialogHeader>
          <div>
            <h2>{title}</h2>
            {subtitle && <p>{subtitle}</p>}
          </div>
          <IconButton type="button" aria-label="Close" onClick={onClose}>
            <Icon name="x" />
          </IconButton>
        </DialogHeader>
        <DialogBody>{children}</DialogBody>
        {footer && <DialogFooter>{footer}</DialogFooter>}
      </Dialog>
    </Overlay>,
    document.body,
  );
};
