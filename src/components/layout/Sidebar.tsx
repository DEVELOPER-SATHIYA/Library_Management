import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { AppIcon } from "../common/AppIcon";
import { Icon } from "../common/Icon";
import { Backdrop, Brand, LogoutButton, NavItem, NavSection, SidebarFooter, SidebarRoot, SoonTag } from "./layout.styles";
import { NAV_ITEMS } from "./navItems";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export const Sidebar = ({ open, onClose }: SidebarProps) => {
  // Hooks must be called inside the component, not at the top of the file.
  const { logout } = useAuth();
  const navigate = useNavigate();

  const onLogout = () => {
    onClose();
    navigate("/");
    logout();
  };

  return (
    <>
      <Backdrop $open={open} onClick={onClose} />
      <SidebarRoot $open={open} aria-label="Main navigation">
        <Brand>
          <div>
            <AppIcon size={22} />
          </div>
          <div>
            <strong>படிப்பகம்</strong>
            <span>Library Management System</span>
          </div>
        </Brand>

        <NavSection>
          <p>NAVIGATION MENU</p>
          {NAV_ITEMS.map((item) => (
            <NavItem key={item.path} to={item.path} onClick={onClose}>
              <Icon name={item.icon} />
              <div>
                <strong>{item.label}</strong>
                <small>{item.description}</small>
              </div>
              {item.comingSoon && <SoonTag>SOON</SoonTag>}
            </NavItem>
          ))}
        </NavSection>

        <SidebarFooter>
          <LogoutButton type="button" onClick={onLogout}>
            <Icon name="logout" />
            Log out
          </LogoutButton>
        </SidebarFooter>
      </SidebarRoot>
    </>
  );
};
