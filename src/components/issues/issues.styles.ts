import styled from "styled-components";

export const StudentCell = styled.div`
  min-width: 140px;
  strong { display: block; font-weight: 600; }
  small { color: ${({ theme }) => theme.colors.textMuted}; font-size: 12px; }
`;

export const BookCell = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 180px;
  strong { display: block; font-weight: 500; }
  small { color: ${({ theme }) => theme.colors.textMuted}; font-size: 12px; }
`;

export const DateCell = styled.div<{ $tone?: "danger" | "warning" }>`
  white-space: nowrap;
  color: ${({ theme, $tone }) => ($tone ? theme.colors[$tone] : "inherit")};
  font-weight: ${({ $tone }) => ($tone ? 600 : 400)};
`;

export const RowActions = styled.div`
  display: flex;
  gap: 6px;
  justify-content: flex-end;
  align-items: center;
`;

/* ---------- Issue form ---------- */
export const BookPicker = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const SelectedBook = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 10px 12px;
  border-radius: ${({ theme }) => theme.radius.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surfaceAlt};

  strong { display: block; }
  small { color: ${({ theme }) => theme.colors.textMuted}; }
`;

export const Summary = styled.div`
  display: flex;
  flex-direction: column;
  gap: 18px;
`;

export const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    grid-template-columns: 1fr;
  }
`;

export const SummaryBox = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.md};
  padding: 16px;

  h3 {
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: ${({ theme }) => theme.colors.textMuted};
    margin-bottom: 12px;
  }
  dl { grid-template-columns: 1fr; gap: 10px; }
`;

export const Steps = styled.ol`
  display: flex;
  gap: 8px;
  list-style: none;
  padding: 0;
  margin: 0 0 20px;
  flex-wrap: wrap;
`;

export const Step = styled.li<{ $state: "done" | "active" | "todo" }>`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 500;
  color: ${({ theme, $state }) => ($state === "todo" ? theme.colors.textSubtle : theme.colors.text)};

  span {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    display: grid;
    place-items: center;
    font-size: 12px;
    font-weight: 700;
    background: ${({ theme, $state }) =>
      $state === "active" ? theme.colors.primary : $state === "done" ? theme.colors.success : theme.colors.neutralSoft};
    color: ${({ $state }) => ($state === "todo" ? "inherit" : "#fff")};
  }

  & + &::before {
    content: "";
    width: 28px;
    height: 1px;
    background: ${({ theme }) => theme.colors.borderStrong};
    margin-right: 0;
  }
`;

export const LoanPeriod = styled.div`
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
`;

export const Chip = styled.button<{ $active?: boolean }>`
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  border: 1px solid ${({ theme, $active }) => ($active ? theme.colors.primary : theme.colors.border)};
  background: ${({ theme, $active }) => ($active ? theme.colors.primarySoft : theme.colors.surface)};
  color: ${({ theme, $active }) => ($active ? theme.colors.primary : theme.colors.textMuted)};
`;

/* ---------- Return dialog ---------- */
export const ReturnFacts = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;

  > div {
    padding: 10px 12px;
    border-radius: ${({ theme }) => theme.radius.md};
    background: ${({ theme }) => theme.colors.surfaceAlt};
    border: 1px solid ${({ theme }) => theme.colors.border};
  }
  span { display: block; font-size: 11.5px; color: ${({ theme }) => theme.colors.textMuted}; }
  strong { font-weight: 600; }

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    grid-template-columns: 1fr;
  }
`;

/* ---------- Multi-book issue (cart) ---------- */
export const PickerRow = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.4fr);
  gap: 10px;

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    grid-template-columns: 1fr;
  }
`;

export const CartCount = styled.p`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textMuted};
  strong { color: ${({ theme }) => theme.colors.text}; }
`;

export const CartList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.md};
  overflow: hidden;
`;

export const CartItem = styled.li`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  &:last-child { border-bottom: none; }

  > div:nth-child(2) { flex: 1; min-width: 0; }
  strong { display: block; font-weight: 600; }
  small { color: ${({ theme }) => theme.colors.textMuted}; font-size: 12px; }
  > select { width: 180px; flex-shrink: 0; }

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    flex-wrap: wrap;
    > select { width: 100%; order: 3; }
  }
`;

export const CartEmpty = styled.div<{ $invalid?: boolean }>`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px;
  border-radius: ${({ theme }) => theme.radius.md};
  border: 1px dashed ${({ theme, $invalid }) => ($invalid ? theme.colors.danger : theme.colors.borderStrong)};
  color: ${({ theme }) => theme.colors.textMuted};
  background: ${({ theme }) => theme.colors.surfaceAlt};
`;

export const HeldLoans = styled.div`
  margin-top: 16px;
  padding: 12px 14px;
  border-radius: ${({ theme }) => theme.radius.md};
  background: ${({ theme }) => theme.colors.infoSoft};
  font-size: 13px;

  > p {
    display: flex;
    align-items: center;
    gap: 6px;
    font-weight: 600;
    color: ${({ theme }) => theme.colors.info};
    margin-bottom: 6px;
  }
  ul { list-style: none; margin: 0; padding: 0; }
  li {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 10px;
    padding: 4px 0;
  }
`;

/* ---------- Multi-book return ---------- */
export const ReturnList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.md};
`;

export const ReturnRow = styled.li<{ $late: boolean }>`
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) 150px 100px;
  gap: 12px;
  align-items: center;
  padding: 12px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  border-left: 3px solid ${({ theme, $late }) => ($late ? theme.colors.danger : "transparent")};
  &:last-child { border-bottom: none; }

  strong { display: block; font-weight: 600; }
  small { display: block; color: ${({ theme }) => theme.colors.textMuted}; font-size: 12px; }

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    grid-template-columns: auto minmax(0, 1fr);
    > select, > input { grid-column: span 2; }
  }
`;

export const ReturnHead = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) 150px 100px;
  gap: 12px;
  padding: 0 12px 0 58px; /* align with rows: 12px pad + 34px cover + 12px gap */
  font-size: 11.5px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: ${({ theme }) => theme.colors.textMuted};

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    display: none;
  }
`;

export const TotalRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  border-radius: ${({ theme }) => theme.radius.md};
  background: ${({ theme }) => theme.colors.surfaceAlt};
  font-size: 13px;
  strong { font-size: 15px; }
`;

/* ---------- Row selection for bulk return ---------- */
export const Checkbox = styled.input.attrs({ type: "checkbox" })`
  width: 16px;
  height: 16px;
  cursor: pointer;
  accent-color: ${({ theme }) => theme.colors.primary};
`;

export const SelectionBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  padding: 10px 20px;
  background: ${({ theme }) => theme.colors.primarySoft};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  font-size: 13px;
  color: ${({ theme }) => theme.colors.primary};

  > div { display: flex; gap: 8px; flex-wrap: wrap; }
  strong { font-weight: 600; }
`;
