import styled from "styled-components";

export const FilterSummary = styled.div`
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  padding: 10px 20px;
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textMuted};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surfaceAlt};

  strong { color: ${({ theme }) => theme.colors.text}; }
`;

export const SortSelect = styled.div`
  display: flex;
  gap: 6px;
  align-items: center;

  select { width: auto; min-width: 150px; }

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    flex: 1 1 100%;
    select { flex: 1; }
  }
`;
