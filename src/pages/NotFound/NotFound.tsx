import { useNavigate } from "react-router-dom";
import { EmptyState } from "../../components/common/EmptyState";
import { Button, Card } from "../../styles/ui";

export const NotFound = () => {
  const navigate = useNavigate();
  return (
    <Card>
      <EmptyState
        icon="search"
        title="Page not found"
        message="The page you're looking for doesn't exist."
        action={<Button onClick={() => navigate("/dashboard")}>Go to Dashboard</Button>}
      />
    </Card>
  );
};
