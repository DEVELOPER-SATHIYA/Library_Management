import styled from "styled-components";

export const TitleCell = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 220px;

  strong { display: block; font-weight: 600; }
  small { color: ${({ theme }) => theme.colors.textMuted}; font-size: 12px; }
`;

export const Actions = styled.div`
  display: flex;
  gap: 2px;
  justify-content: flex-end;
`;
