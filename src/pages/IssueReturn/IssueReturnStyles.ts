import styled from "styled-components";

export const TabBar = styled.div`
  display: flex;
  gap: 4px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  margin-bottom: 20px;
`;

export const TabButton = styled.button<{ $active: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border: none;
  background: none;
  cursor: pointer;
  font-weight: 600;
  margin-bottom: -1px;
  color: ${({ theme, $active }) => ($active ? theme.colors.primary : theme.colors.textMuted)};
  border-bottom: 2px solid ${({ theme, $active }) => ($active ? theme.colors.primary : "transparent")};

  &:hover { color: ${({ theme }) => theme.colors.text}; }
`;

export const Layout = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) 320px;
  gap: 20px;
  align-items: start;

  @media (max-width: 1100px) {
    grid-template-columns: 1fr;
  }
`;

export const SideList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;

  li {
    display: flex;
    gap: 10px;
    align-items: center;
    justify-content: space-between;
    padding: 10px 20px;
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};
    &:last-child { border-bottom: none; }
  }
  div { min-width: 0; }
  strong { display: block; font-size: 13px; font-weight: 500; }
  small { color: ${({ theme }) => theme.colors.textMuted}; font-size: 12px; }
`;

export const SideEmpty = styled.p`
  padding: 16px 20px;
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textMuted};
`;

export const DoneCard = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
  padding: 14px 18px;
  margin-bottom: 20px;
  border-radius: ${({ theme }) => theme.radius.lg};
  border: 1px solid ${({ theme }) => theme.colors.success};
  background: ${({ theme }) => theme.colors.successSoft};
  color: ${({ theme }) => theme.colors.success};

  > div { flex: 1; min-width: 200px; }
  strong { display: block; font-weight: 600; }
  p { font-size: 13px; color: ${({ theme }) => theme.colors.text}; }
`;

export const SearchRow = styled.div`
  padding: 16px 20px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

export const DoneList = styled.ul`
  margin: 4px 0 0;
  padding: 0 0 0 18px;
  font-size: 13px;
  color: ${({ theme }) => theme.colors.text};
`;

export const StudentMatch = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  padding: 12px 20px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surfaceAlt};

  strong { display: block; font-weight: 600; }
  small { color: ${({ theme }) => theme.colors.textMuted}; font-size: 12px; }
  > div:last-child { display: flex; gap: 8px; flex-wrap: wrap; }
`;
