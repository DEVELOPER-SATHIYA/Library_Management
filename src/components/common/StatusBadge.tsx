import type { ReactNode } from "react";
import { Badge, type BadgeTone } from "./common.styles";

interface StatusBadgeProps {
  tone: BadgeTone;
  children: ReactNode;
  title?: string;
}

/** Coloured pill used for stock and loan states across all tables. */
export const StatusBadge = ({ tone, children, title }: StatusBadgeProps) => (
  <Badge $tone={tone} title={title}>
    {children}
  </Badge>
);
