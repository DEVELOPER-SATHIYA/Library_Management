import { Icon } from "../common/Icon";
import { Backdrop, Brand, NavItem, NavSection, SidebarRoot, SoonTag } from "./layout.styles";
import { NAV_ITEMS } from "./navItems";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export const Sidebar = ({ open, onClose }: SidebarProps) => (
  <>
    <Backdrop $open={open} onClick={onClose} />
    <SidebarRoot $open={open} aria-label="Main navigation">
      <Brand>
        <div>
          <Icon name="books" size={20} />
        </div>
        <div>
          <strong>Library Admin</strong>
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

    </SidebarRoot>
  </>
);
