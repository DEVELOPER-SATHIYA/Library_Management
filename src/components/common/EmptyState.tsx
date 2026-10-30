import type { ReactNode } from "react";
import { Empty } from "./common.styles";
import { Icon, type IconName } from "./Icon";

interface EmptyStateProps {
  icon?: IconName;
  title: string;
  message?: string;
  action?: ReactNode;
}

export const EmptyState = ({ icon = "inbox", title, message, action }: EmptyStateProps) => (
  <Empty role="status">
    <div>
      <Icon name={icon} size={24} />
    </div>
    <h3>{title}</h3>
    {message && <p>{message}</p>}
    {action}
  </Empty>
);
