import styled from "styled-components";
import { NavLink } from "react-router-dom";

export const Shell = styled.div`
  display: flex;
  min-height: 100vh;
`;

export const Main = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  margin-left: ${({ theme }) => theme.sidebarWidth};

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    margin-left: 0;
  }
`;

export const Content = styled.main`
  flex: 1;
  padding: 24px 28px 40px;
  max-width: 1440px;
  width: 100%;
  margin: 0 auto;

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    padding: 16px;
  }
`;

/* ---------- Sidebar ---------- */
export const SidebarRoot = styled.aside<{ $open: boolean }>`
  position: fixed;
  inset: 0 auto 0 0;
  z-index: 50;
  width: ${({ theme }) => theme.sidebarWidth};
  display: flex;
  flex-direction: column;
  background: ${({ theme }) => theme.colors.sidebar};
  color: ${({ theme }) => theme.colors.sidebarText};
  transition: transform 0.2s ease;

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    transform: translateX(${({ $open }) => ($open ? "0" : "-100%")});
    box-shadow: ${({ $open, theme }) => ($open ? theme.shadow.lg : "none")};
  }
`;

export const Backdrop = styled.div<{ $open: boolean }>`
  display: none;
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    display: ${({ $open }) => ($open ? "block" : "none")};
    position: fixed;
    inset: 0;
    z-index: 40;
    background: rgba(15, 23, 42, 0.45);
  }
`;

export const Brand = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px 20px 18px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);

  > div:first-child {
    width: 38px;
    height: 38px;
    border-radius: 10px;
    display: grid;
    place-items: center;
    background: ${({ theme }) => theme.colors.primary};
    color: #fff;
  }
  strong { display: block; color: #fff; font-size: 15px; }
  span { font-size: 12px; color: ${({ theme }) => theme.colors.sidebarMuted}; }
`;

export const NavSection = styled.nav`
  flex: 1;
  overflow-y: auto;
  padding: 16px 12px;
  /* Still scrolls on short screens, but without a visible scrollbar. */
  scrollbar-width: none;
  -ms-overflow-style: none;
  &::-webkit-scrollbar { display: none; }

  > p {
    padding: 0 10px 8px;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.08em;
    color: ${({ theme }) => theme.colors.sidebarMuted};
  }
`;

export const NavItem = styled(NavLink)`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 9px 10px;
  margin-bottom: 2px;
  border-radius: ${({ theme }) => theme.radius.md};
  color: ${({ theme }) => theme.colors.sidebarText};
  transition: background 0.15s;

  > svg { flex-shrink: 0; opacity: 0.85; }
  strong { display: block; font-weight: 500; font-size: 14px; }
  small { display: block; font-size: 11.5px; color: ${({ theme }) => theme.colors.sidebarMuted}; }

  &:hover { background: ${({ theme }) => theme.colors.sidebarHover}; }

  &.active {
    background: ${({ theme }) => theme.colors.primary};
    color: #fff;
    small { color: rgba(255, 255, 255, 0.72); }
    > svg { opacity: 1; }
  }
`;

export const SoonTag = styled.em`
  margin-left: auto;
  font-style: normal;
  font-size: 10px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.08);
  color: ${({ theme }) => theme.colors.sidebarMuted};
`;

/* ---------- Header ---------- */
export const HeaderRoot = styled.header`
  position: sticky;
  top: 0;
  z-index: 30;
  height: ${({ theme }) => theme.headerHeight};
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 28px;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    padding: 0 16px;
  }
`;

export const MenuButton = styled.button`
  display: none;
  border: none;
  background: none;
  padding: 6px;
  cursor: pointer;
  border-radius: 6px;
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    display: grid;
  }
`;

export const HeaderTitle = styled.div`
  flex: 1;
  min-width: 0;
  h1 { font-size: 17px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  p { font-size: 12px; color: ${({ theme }) => theme.colors.textMuted}; }

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    p { display: none; }
  }
`;

export const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const BellLink = styled(NavLink)`
  position: relative;
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  color: ${({ theme }) => theme.colors.textMuted};
  &:hover { background: ${({ theme }) => theme.colors.neutralSoft}; color: ${({ theme }) => theme.colors.text}; }

  span {
    position: absolute;
    top: 3px;
    right: 2px;
    min-width: 18px;
    height: 18px;
    padding: 0 5px;
    border-radius: 9px;
    background: ${({ theme }) => theme.colors.danger};
    color: #fff;
    font-size: 10.5px;
    font-weight: 700;
    display: grid;
    place-items: center;
    border: 2px solid #fff;
  }
`;

export const AdminChip = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 4px 12px 4px 4px;
  border-radius: 999px;
  border: 1px solid ${({ theme }) => theme.colors.border};

  > div {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: grid;
    place-items: center;
    background: ${({ theme }) => theme.colors.primarySoft};
    color: ${({ theme }) => theme.colors.primary};
    font-weight: 700;
    font-size: 13px;
  }
  strong { font-size: 13px; font-weight: 600; display: block; line-height: 1.2; }
  small { font-size: 11px; color: ${({ theme }) => theme.colors.textMuted}; }

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    padding: 2px;
    border: none;
    > span { display: none; }
  }
`;

/* ---------- PageHeader ---------- */
export const PageHeaderRoot = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 20px;

  h2 { font-size: 22px; font-weight: 700; letter-spacing: -0.01em; }
  p { color: ${({ theme }) => theme.colors.textMuted}; margin-top: 2px; }
`;

export const PageHeaderActions = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
`;
