import styled from "styled-components";

export const FilterChips = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  padding: 14px 20px 0;
`;

export const FilterChip = styled.button<{ $active: boolean; $tone: "neutral" | "info" | "warning" | "danger" }>`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  border: 1px solid ${({ theme, $active }) => ($active ? theme.colors.primary : theme.colors.border)};
  background: ${({ theme, $active }) => ($active ? theme.colors.primarySoft : theme.colors.surface)};
  color: ${({ theme, $active }) => ($active ? theme.colors.primary : theme.colors.text)};

  span {
    min-width: 22px;
    padding: 0 6px;
    border-radius: 999px;
    font-size: 11.5px;
    font-weight: 700;
    text-align: center;
    background: ${({ theme, $tone }) => ($tone === "neutral" ? theme.colors.neutralSoft : theme.colors[`${$tone}Soft` as const])};
    color: ${({ theme, $tone }) => ($tone === "neutral" ? theme.colors.textMuted : theme.colors[$tone])};
  }
`;

export const ToolbarRow = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  align-items: center;
  padding: 14px 20px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};

  select { width: auto; min-width: 190px; }

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    select { width: 100%; }
  }
`;
