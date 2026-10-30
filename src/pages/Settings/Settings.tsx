import { PageHeader } from "../../components/layout/PageHeader";
import { EmptyState } from "../../components/common/EmptyState";
import { Card } from "../../styles/ui";

export const Settings = () => (
  <>
    <PageHeader title="Settings" description="Admin preferences." />
    <Card>
      <EmptyState
        icon="settings"
        title="Settings are not available yet"
        message="Loan period, fine rules and admin accounts will be configurable here in a later phase."
      />
    </Card>
  </>
);
