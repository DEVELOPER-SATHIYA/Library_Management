import styled, { keyframes } from "styled-components";

/* ---------- SearchBar ---------- */
export const SearchWrap = styled.div`
  position: relative;
  flex: 1 1 260px;
  min-width: 200px;

  > svg {
    position: absolute;
    left: 11px;
    top: 50%;
    transform: translateY(-50%);
    color: ${({ theme }) => theme.colors.textSubtle};
    pointer-events: none;
  }
  input { padding-left: 36px; padding-right: 34px; }
`;

export const ClearButton = styled.button`
  position: absolute;
  right: 6px;
  top: 50%;
  transform: translateY(-50%);
  display: grid;
  place-items: center;
  width: 24px;
  height: 24px;
  border: none;
  border-radius: 50%;
  background: transparent;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.textMuted};
  &:hover { background: ${({ theme }) => theme.colors.neutralSoft}; }
`;

/* ---------- DataTable ---------- */
export const TableScroll = styled.div`
  overflow-x: auto;
`;

export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 13.5px;

  th, td {
    padding: 11px 14px;
    text-align: left;
    vertical-align: middle;
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  }
  th {
    position: sticky;
    top: 0;
    background: ${({ theme }) => theme.colors.surfaceAlt};
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.03em;
    color: ${({ theme }) => theme.colors.textMuted};
    white-space: nowrap;
  }
  tbody tr:hover td { background: ${({ theme }) => theme.colors.surfaceAlt}; }
  tbody tr:last-child td { border-bottom: none; }
`;

export const Th = styled.th<{ $width?: string; $align?: "left" | "right" | "center" }>`
  ${({ $width }) => ($width ? `width: ${$width};` : "")}
  && { text-align: ${({ $align }) => $align ?? "left"}; }
`;

export const Td = styled.td<{ $align?: "left" | "right" | "center" }>`
  && { text-align: ${({ $align }) => $align ?? "left"}; }
`;

export const Tr = styled.tr<{ $highlight?: boolean }>`
  td { background: ${({ theme, $highlight }) => ($highlight ? theme.colors.dangerSoft + "66" : "transparent")}; }
`;

export const SortHeader = styled.button<{ $active: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  border: none;
  background: none;
  padding: 0;
  cursor: pointer;
  font: inherit;
  text-transform: inherit;
  letter-spacing: inherit;
  color: ${({ theme, $active }) => ($active ? theme.colors.primary : "inherit")};
  svg { width: 13px; height: 13px; }
`;

export const Pagination = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  padding: 12px 20px;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 13px;
`;

export const PageButtons = styled.div`
  display: flex;
  gap: 4px;
`;

export const PageButton = styled.button<{ $active?: boolean }>`
  min-width: 32px;
  height: 32px;
  padding: 0 8px;
  display: inline-grid;
  place-items: center;
  border-radius: ${({ theme }) => theme.radius.sm};
  border: 1px solid ${({ theme, $active }) => ($active ? theme.colors.primary : theme.colors.border)};
  background: ${({ theme, $active }) => ($active ? theme.colors.primary : theme.colors.surface)};
  color: ${({ theme, $active }) => ($active ? "#fff" : theme.colors.text)};
  cursor: pointer;
  font-weight: 500;
  svg { width: 15px; height: 15px; }
  &:disabled { opacity: 0.4; cursor: not-allowed; }
`;

/* ---------- StatusBadge ---------- */
export type BadgeTone = "success" | "warning" | "danger" | "info" | "neutral";

export const Badge = styled.span<{ $tone: BadgeTone }>`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 10px;
  border-radius: ${({ theme }) => theme.radius.pill};
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
  background: ${({ theme, $tone }) => ($tone === "neutral" ? theme.colors.neutralSoft : theme.colors[`${$tone}Soft` as const])};
  color: ${({ theme, $tone }) => ($tone === "neutral" ? theme.colors.textMuted : theme.colors[$tone])};

  &::before {
    content: "";
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: currentColor;
  }
`;

/* ---------- Modal / ConfirmDialog ---------- */
const fadeIn = keyframes`from { opacity: 0 } to { opacity: 1 }`;
const pop = keyframes`from { opacity: 0; transform: translateY(8px) scale(.98) } to { opacity: 1; transform: none }`;

export const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 100;
  display: grid;
  place-items: center;
  padding: 16px;
  background: rgba(15, 23, 42, 0.5);
  animation: ${fadeIn} 0.15s ease-out;
`;

export const Dialog = styled.div<{ $width?: number }>`
  width: 100%;
  max-width: ${({ $width }) => $width ?? 480}px;
  max-height: calc(100vh - 32px);
  display: flex;
  flex-direction: column;
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.radius.lg};
  box-shadow: ${({ theme }) => theme.shadow.lg};
  animation: ${pop} 0.18s ease-out;
`;

export const DialogHeader = styled.header`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 18px 20px 14px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};

  h2 { font-size: 16px; font-weight: 600; }
  p { font-size: 13px; color: ${({ theme }) => theme.colors.textMuted}; margin-top: 2px; }
`;

export const DialogBody = styled.div`
  padding: 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

export const DialogFooter = styled.footer`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 14px 20px;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surfaceAlt};
  border-radius: 0 0 ${({ theme }) => theme.radius.lg} ${({ theme }) => theme.radius.lg};
`;

export const ConfirmIcon = styled.div<{ $tone: "danger" | "primary" | "warning" }>`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  flex-shrink: 0;
  background: ${({ theme, $tone }) => ($tone === "primary" ? theme.colors.primarySoft : theme.colors[`${$tone}Soft` as const])};
  color: ${({ theme, $tone }) => ($tone === "primary" ? theme.colors.primary : theme.colors[$tone])};
`;

export const ConfirmRow = styled.div`
  display: flex;
  gap: 14px;
  align-items: flex-start;
  p { color: ${({ theme }) => theme.colors.textMuted}; }
  h3 { font-size: 16px; font-weight: 600; margin-bottom: 4px; }
`;

/* ---------- EmptyState ---------- */
export const Empty = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 8px;
  padding: 48px 20px;
  color: ${({ theme }) => theme.colors.textMuted};

  > div:first-child {
    width: 52px;
    height: 52px;
    border-radius: 50%;
    display: grid;
    place-items: center;
    background: ${({ theme }) => theme.colors.neutralSoft};
    color: ${({ theme }) => theme.colors.textSubtle};
    margin-bottom: 4px;
  }
  h3 { font-size: 15px; font-weight: 600; color: ${({ theme }) => theme.colors.text}; }
  p { max-width: 380px; }
  button { margin-top: 8px; }
`;

/* ---------- Toast ---------- */
const slideIn = keyframes`from { opacity: 0; transform: translateX(16px) } to { opacity: 1; transform: none }`;

export const ToastStack = styled.div`
  position: fixed;
  right: 20px;
  bottom: 20px;
  z-index: 200;
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: min(380px, calc(100vw - 40px));
`;

export const ToastCard = styled.div<{ $tone: "success" | "error" | "warning" | "info" }>`
  display: flex;
  gap: 10px;
  align-items: flex-start;
  padding: 12px 14px;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-left: 4px solid
    ${({ theme, $tone }) => ($tone === "error" ? theme.colors.danger : theme.colors[$tone])};
  border-radius: ${({ theme }) => theme.radius.md};
  box-shadow: ${({ theme }) => theme.shadow.md};
  animation: ${slideIn} 0.2s ease-out;

  > svg { color: ${({ theme, $tone }) => ($tone === "error" ? theme.colors.danger : theme.colors[$tone])}; flex-shrink: 0; margin-top: 2px; }
  > div { flex: 1; min-width: 0; }
  strong { display: block; font-weight: 600; }
  p { font-size: 13px; color: ${({ theme }) => theme.colors.textMuted}; }
`;

/* ---------- Cover thumbnail ---------- */
export const Cover = styled.div<{ $hue: number; $size?: "sm" | "lg" }>`
  width: ${({ $size }) => ($size === "lg" ? "96px" : "34px")};
  height: ${({ $size }) => ($size === "lg" ? "136px" : "46px")};
  border-radius: 4px;
  flex-shrink: 0;
  overflow: hidden;
  display: grid;
  place-items: center;
  font-weight: 700;
  font-size: ${({ $size }) => ($size === "lg" ? "26px" : "12px")};
  color: #fff;
  background: linear-gradient(150deg, hsl(${({ $hue }) => $hue} 55% 52%), hsl(${({ $hue }) => $hue + 30} 50% 35%));
  box-shadow: inset 3px 0 0 rgba(0, 0, 0, 0.18);

  img { width: 100%; height: 100%; object-fit: cover; }
`;
