import styled from "styled-components";

export const Layout = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) 300px;
  gap: 20px;
  align-items: start;

  @media (max-width: 1100px) {
    grid-template-columns: 1fr;
  }
`;

export const SidePanel = styled.aside`
  display: flex;
  flex-direction: column;
  gap: 16px;
  position: sticky;
  top: 84px;

  @media (max-width: 1100px) {
    position: static;
  }
`;

export const Tips = styled.ul`
  margin: 0;
  padding: 0 0 0 18px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 13px;
`;

export const SuccessCard = styled.div`
  display: flex;
  gap: 14px;
  align-items: center;
  flex-wrap: wrap;
  padding: 16px 20px;
  margin-bottom: 20px;
  border-radius: ${({ theme }) => theme.radius.lg};
  border: 1px solid ${({ theme }) => theme.colors.success};
  background: ${({ theme }) => theme.colors.successSoft};

  > div:nth-child(2) { flex: 1; min-width: 200px; }
  strong { display: block; font-weight: 600; color: ${({ theme }) => theme.colors.success}; }
  p { font-size: 13px; color: ${({ theme }) => theme.colors.text}; }
`;

export const SuccessActions = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

export const RecentList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;

  li {
    display: flex;
    gap: 10px;
    align-items: center;
    padding: 10px 0;
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};
    &:last-child { border-bottom: none; }
  }
  strong { display: block; font-size: 13px; font-weight: 500; }
  small { color: ${({ theme }) => theme.colors.textMuted}; font-size: 12px; }
`;
