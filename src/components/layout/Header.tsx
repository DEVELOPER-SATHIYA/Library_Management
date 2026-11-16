import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useLibrary } from "../../context/LibraryContext";
import { loanState } from "../../services/issue.service";
import { Icon } from "../common/Icon";
import { IconButton } from "../../styles/ui";
import { AdminChip, BellLink, HeaderActions, HeaderRoot, HeaderTitle, MenuButton } from "./layout.styles";
import { titleFor } from "./navItems";

export const Header = ({ onMenu }: { onMenu: () => void }) => {
  const { pathname } = useLocation();
  const { issues, today } = useLibrary();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const overdue = issues.filter((i) => loanState(i, today) === "overdue").length;
  const { title, subtitle } = titleFor(pathname);

  return (
    <HeaderRoot>
      <MenuButton type="button" aria-label="Open menu" onClick={onMenu}>
        <Icon name="menu" size={22} />
      </MenuButton>
      <HeaderTitle>
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </HeaderTitle>
      <HeaderActions>
        <BellLink
          to="/issued-books?filter=overdue"
          aria-label={`${overdue} overdue books`}
          title={`${overdue} overdue book${overdue === 1 ? "" : "s"}`}
        >
          <Icon name="bell" size={19} />
          {overdue > 0 && <span>{overdue}</span>}
        </BellLink>
        <AdminChip>
          <div>A</div>
          <span>
            <strong>Admin</strong>
            <small>Librarian</small>
          </span>
        </AdminChip>
        <IconButton
          type="button"
          title="Log out"
          aria-label="Log out"
          onClick={() => {
            navigate("/");
            logout();
          }}
        >
          <Icon name="logout" />
        </IconButton>
      </HeaderActions>
    </HeaderRoot>
  );
};
