import styled from "styled-components";

export const TitleCell = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 220px;

  strong { display: block; font-weight: 600; }
  small { color: ${({ theme }) => theme.colors.textMuted}; font-size: 12px; }
`;

export const StockCell = styled.div`
  min-width: 90px;
  strong { font-weight: 600; }
`;

export const StockBar = styled.div<{ $pct: number; $tone: "success" | "warning" | "danger" }>`
  height: 4px;
  margin-top: 4px;
  border-radius: 2px;
  background: ${({ theme }) => theme.colors.neutralSoft};
  overflow: hidden;

  &::after {
    content: "";
    display: block;
    height: 100%;
    width: ${({ $pct }) => $pct}%;
    background: ${({ theme, $tone }) => theme.colors[$tone]};
  }
`;

export const Actions = styled.div`
  display: flex;
  gap: 2px;
  justify-content: flex-end;
`;

/* ---------- BookForm ---------- */
export const CoverUpload = styled.div`
  display: flex;
  gap: 16px;
  align-items: center;
  flex-wrap: wrap;
`;

export const CoverPreview = styled.div`
  width: 72px;
  height: 100px;
  border-radius: 6px;
  border: 1px dashed ${({ theme }) => theme.colors.borderStrong};
  background: ${({ theme }) => theme.colors.surfaceAlt};
  display: grid;
  place-items: center;
  overflow: hidden;
  color: ${({ theme }) => theme.colors.textSubtle};

  img { width: 100%; height: 100%; object-fit: cover; }
`;

export const FileLabel = styled.label`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: ${({ theme }) => theme.radius.sm};
  border: 1px solid ${({ theme }) => theme.colors.borderStrong};
  background: ${({ theme }) => theme.colors.surface};
  font-weight: 600;
  cursor: pointer;
  &:hover { background: ${({ theme }) => theme.colors.surfaceAlt}; }
  input { display: none; }
`;

export const IdPreview = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 9px 12px;
  border-radius: ${({ theme }) => theme.radius.sm};
  background: ${({ theme }) => theme.colors.primarySoft};
  color: ${({ theme }) => theme.colors.primary};
  font-weight: 600;
  font-family: ui-monospace, Menlo, Consolas, monospace;
`;

/* ---------- BookDetails ---------- */
export const DetailsTop = styled.div`
  display: flex;
  gap: 20px;
  align-items: flex-start;

  h3 { font-size: 18px; font-weight: 700; line-height: 1.3; }
  p { color: ${({ theme }) => theme.colors.textMuted}; margin: 2px 0 10px; }

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    flex-direction: column;
  }
`;

export const StockSummary = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;

  > div {
    padding: 12px;
    border-radius: ${({ theme }) => theme.radius.md};
    background: ${({ theme }) => theme.colors.surfaceAlt};
    border: 1px solid ${({ theme }) => theme.colors.border};
    text-align: center;
  }
  strong { display: block; font-size: 20px; font-weight: 700; }
  span { font-size: 12px; color: ${({ theme }) => theme.colors.textMuted}; }
`;

export const LoanList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.md};

  li {
    display: flex;
    justify-content: space-between;
    gap: 10px;
    align-items: center;
    padding: 10px 12px;
    font-size: 13px;
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};
    &:last-child { border-bottom: none; }
  }
  small { color: ${({ theme }) => theme.colors.textMuted}; display: block; }
`;

export const SubHeading = styled.h4`
  font-size: 13px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textMuted};
  text-transform: uppercase;
  letter-spacing: 0.04em;
`;
