import { Icon, type IconName } from "../common/Icon";
import { StatIcon, StatRoot, type StatTone } from "./dashboard.styles";

interface StatCardProps {
  label: string;
  value: number;
  hint: string;
  icon: IconName;
  tone: StatTone;
}

export const StatCard = ({ label, value, hint, icon, tone }: StatCardProps) => (
  <StatRoot $tone={tone}>
    <header>
      <h3>{label}</h3>
      <StatIcon $tone={tone}>
        <Icon name={icon} />
      </StatIcon>
    </header>
    <strong>{value.toLocaleString("en-IN")}</strong>
    <p>{hint}</p>
  </StatRoot>
);
