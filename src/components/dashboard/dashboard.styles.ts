import styled from "styled-components";
import { Link } from "react-router-dom";

export type StatTone = "primary" | "success" | "info" | "warning" | "danger";

export const StatRoot = styled.div<{ $tone: StatTone }>`
  position: relative;
  padding: 18px 20px;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.lg};
  box-shadow: ${({ theme }) => theme.shadow.sm};
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    inset: 0 auto 0 0;
    width: 4px;
    background: ${({ theme, $tone }) => theme.colors[$tone]};
  }

  header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 8px;
  }
  h3 { font-size: 13px; font-weight: 500; color: ${({ theme }) => theme.colors.textMuted}; }
  strong { display: block; font-size: 30px; font-weight: 700; letter-spacing: -0.02em; margin: 6px 0 2px; }
  p { font-size: 12.5px; color: ${({ theme }) => theme.colors.textMuted}; }
`;

export const StatIcon = styled.div<{ $tone: StatTone }>`
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: grid;
  place-items: center;
  background: ${({ theme, $tone }) => ($tone === "primary" ? theme.colors.primarySoft : theme.colors[`${$tone}Soft` as const])};
  color: ${({ theme, $tone }) => theme.colors[$tone]};
`;

export const ActionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  padding: 16px 20px 20px;

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    grid-template-columns: 1fr;
  }
`;

export const ActionTile = styled(Link)<{ $tone: StatTone }>`
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 14px;
  border-radius: ${({ theme }) => theme.radius.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
  transition: border-color 0.15s, background 0.15s, transform 0.15s;

  > div:first-child {
    width: 38px;
    height: 38px;
    border-radius: 10px;
    flex-shrink: 0;
    display: grid;
    place-items: center;
    background: ${({ theme, $tone }) => ($tone === "primary" ? theme.colors.primarySoft : theme.colors[`${$tone}Soft` as const])};
    color: ${({ theme, $tone }) => theme.colors[$tone]};
  }
  strong { display: block; font-weight: 600; }
  small { color: ${({ theme }) => theme.colors.textMuted}; font-size: 12px; }

  &:hover {
    border-color: ${({ theme, $tone }) => theme.colors[$tone]};
    background: ${({ theme }) => theme.colors.surfaceAlt};
    transform: translateY(-1px);
  }
`;

export const Tabs = styled.div`
  display: inline-flex;
  padding: 3px;
  border-radius: ${({ theme }) => theme.radius.sm};
  background: ${({ theme }) => theme.colors.neutralSoft};
`;

export const Tab = styled.button<{ $active: boolean }>`
  border: none;
  padding: 5px 12px;
  border-radius: 5px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  background: ${({ theme, $active }) => ($active ? theme.colors.surface : "transparent")};
  color: ${({ theme, $active }) => ($active ? theme.colors.text : theme.colors.textMuted)};
  box-shadow: ${({ theme, $active }) => ($active ? theme.shadow.sm : "none")};
`;

export const ActivityList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
`;

export const ActivityItem = styled.li`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  &:last-child { border-bottom: none; }

  > div:nth-child(2) { flex: 1; min-width: 0; }
  strong { display: block; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  small { color: ${({ theme }) => theme.colors.textMuted}; font-size: 12px; }
`;

export const AlertList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
`;

export const AlertItem = styled.li<{ $tone: "danger" | "warning" }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  padding: 10px 20px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  border-left: 3px solid ${({ theme, $tone }) => theme.colors[$tone]};
  &:last-child { border-bottom: none; }

  > div { min-width: 0; }
  strong { display: block; font-weight: 500; font-size: 13.5px; }
  small { color: ${({ theme }) => theme.colors.textMuted}; font-size: 12px; }
`;

export const AlertGroupTitle = styled.p`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 12px 20px 6px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: ${({ theme }) => theme.colors.textMuted};
`;

export const ViewAll = styled(Link)`
  font-size: 13px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.primary};
  &:hover { text-decoration: underline; }
`;

export const AllClear = styled.p`
  padding: 16px 20px;
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 13px;
`;
