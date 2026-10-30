import { IconButton } from "../../styles/ui";
import type { ToastItem } from "../../context/ToastContext";
import { ToastCard, ToastStack } from "./common.styles";
import { Icon, type IconName } from "./Icon";

const icons: Record<ToastItem["tone"], IconName> = {
  success: "check",
  error: "alert",
  warning: "alert",
  info: "info",
};

export const ToastViewport = ({ toasts, onDismiss }: { toasts: ToastItem[]; onDismiss: (id: number) => void }) => (
  <ToastStack aria-live="polite">
    {toasts.map((t) => (
      <ToastCard key={t.id} $tone={t.tone} role="status">
        <Icon name={icons[t.tone]} />
        <div>
          <strong>{t.title}</strong>
          {t.message && <p>{t.message}</p>}
        </div>
        <IconButton type="button" aria-label="Dismiss" onClick={() => onDismiss(t.id)}>
          <Icon name="x" size={14} />
        </IconButton>
      </ToastCard>
    ))}
  </ToastStack>
);
