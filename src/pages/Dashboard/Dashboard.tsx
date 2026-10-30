import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useLibrary } from "../../context/LibraryContext";
import { loanState } from "../../services/issue.service";
import { PageHeader } from "../../components/layout/PageHeader";
import { StatCard } from "../../components/dashboard/StatCard";
import { QuickActions } from "../../components/dashboard/QuickActions";
import { RecentTransactions } from "../../components/dashboard/RecentTransactions";
import { AlertsPanel } from "../../components/dashboard/AlertsPanel";
import { Icon } from "../../components/common/Icon";
import { Button } from "../../styles/ui";
import { formatDate } from "../../utils/date";
import { Column, DashboardGrid, Notice, StatsGrid } from "./DashboardStyles";

export const Dashboard = () => {
  const { books, issues, today } = useLibrary();
  const navigate = useNavigate();

  const stats = useMemo(() => {
    const totalCopies = books.reduce((s, b) => s + b.totalCopies, 0);
    const available = books.reduce((s, b) => s + b.availableCopies, 0);
    const active = issues.filter((i) => i.status === "issued");
    const overdue = active.filter((i) => loanState(i, today) === "overdue").length;
    return { titles: books.length, totalCopies, available, issued: active.length, overdue };
  }, [books, issues, today]);

  return (
    <>
      <PageHeader
        title="Library overview"
        description={`Status as of ${formatDate(today)}`}
        actions={
          <>
            <Button type="button" $variant="secondary" onClick={() => navigate("/register-book")}>
              <Icon name="plus" />
              Register Book
            </Button>
            <Button type="button" onClick={() => navigate("/issue-return")}>
              <Icon name="swap" />
              Issue Book
            </Button>
          </>
        }
      />

      <StatsGrid>
        <StatCard label="Book Titles" value={stats.titles} hint="Distinct titles in catalogue" icon="books" tone="primary" />
        <StatCard label="Total Book Copies" value={stats.totalCopies} hint="All registered copies" icon="layers" tone="info" />
        <StatCard label="Available Copies" value={stats.available} hint="Ready for issue" icon="check" tone="success" />
        <StatCard label="Currently Issued" value={stats.issued} hint="Awaiting return" icon="issued" tone="warning" />
        <StatCard label="Overdue Books" value={stats.overdue} hint="Past the due date" icon="clock" tone="danger" />
      </StatsGrid>

      <DashboardGrid>
        <Column>
          <QuickActions />
          <RecentTransactions issues={issues} books={books} today={today} />
        </Column>
        <Column>
          <AlertsPanel books={books} issues={issues} today={today} />
        </Column>
      </DashboardGrid>

      <Notice>Figures are generated from sample data for the UI preview — not actual library information.</Notice>
    </>
  );
};
