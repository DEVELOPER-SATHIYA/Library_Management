import { useCallback, useState, type ReactNode } from "react";
import { ToastViewport } from "../components/common/Toast";
import { ToastContext, type Notify, type ToastItem } from "./ToastContext";

let counter = 0;

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: number) => setToasts((t) => t.filter((x) => x.id !== id)), []);

  const notify = useCallback<Notify>(
    (tone, title, message) => {
      counter += 1;
      const id = counter;
      setToasts((t) => [...t, { id, tone, title, message }]);
      window.setTimeout(() => dismiss(id), 5000);
    },
    [dismiss],
  );

  return (
    <ToastContext.Provider value={notify}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
};
