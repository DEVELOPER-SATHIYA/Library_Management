import type { ReactNode } from "react";
import { PageHeaderActions, PageHeaderRoot } from "./layout.styles";

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
}

export const PageHeader = ({ title, description, actions }: PageHeaderProps) => (
  <PageHeaderRoot>
    <div>
      <h2>{title}</h2>
      {description && <p>{description}</p>}
    </div>
    {actions && <PageHeaderActions>{actions}</PageHeaderActions>}
  </PageHeaderRoot>
);
