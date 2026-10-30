import { PageHeader } from "../../components/layout/PageHeader";
import { EmptyState } from "../../components/common/EmptyState";
import { Card } from "../../styles/ui";

export const Students = () => (
  <>
    <PageHeader title="Students" description="Reserved for future integration with the student database." />
    <Card>
      <EmptyState
        icon="students"
        title="Student directory coming soon"
        message="Once the student database is connected, borrower details will be looked up here and auto-filled when issuing books."
      />
    </Card>
  </>
);
