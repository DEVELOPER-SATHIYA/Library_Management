import { createContext, useContext } from "react";

/** The provider component lives in ToastProvider.tsx (kept separate so Vite Fast Refresh works). */
export type ToastTone = "success" | "error" | "warning" | "info";

export interface ToastItem {
  id: number;
  tone: ToastTone;
  title: string;
  message?: string;
}

export type Notify = (tone: ToastTone, title: string, message?: string) => void;

export const ToastContext = createContext<Notify | null>(null);

export const useToast = (): Notify => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
};
