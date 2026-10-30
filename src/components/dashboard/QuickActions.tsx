import { Card, CardHeader } from "../../styles/ui";
import { Icon, type IconName } from "../common/Icon";
import { ActionGrid, ActionTile, type StatTone } from "./dashboard.styles";

const ACTIONS: { to: string; title: string; text: string; icon: IconName; tone: StatTone }[] = [
  { to: "/register-book", title: "Register Book", text: "Create a book record", icon: "register", tone: "primary" },
  { to: "/issue-return", title: "Issue Book", text: "Record a student borrowing a book", icon: "swap", tone: "success" },
  { to: "/issue-return?tab=return", title: "Return Book", text: "Close an outstanding loan", icon: "return", tone: "info" },
  { to: "/issued-books?filter=overdue", title: "View Overdue", text: "Follow up on late returns", icon: "clock", tone: "danger" },
];

export const QuickActions = () => (
  <Card>
    <CardHeader>
      <h2>Quick Actions</h2>
    </CardHeader>
    <ActionGrid>
      {ACTIONS.map((a) => (
        <ActionTile key={a.title} to={a.to} $tone={a.tone}>
          <div>
            <Icon name={a.icon} />
          </div>
          <div>
            <strong>{a.title}</strong>
            <small>{a.text}</small>
          </div>
        </ActionTile>
      ))}
    </ActionGrid>
  </Card>
);
