/** Shared primitives (buttons, cards, form controls) reused across pages. */
import styled, { css } from "styled-components";

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost" | "success";

export const Button = styled.button<{ $variant?: ButtonVariant; $size?: "sm" | "md" }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  border-radius: ${({ theme }) => theme.radius.sm};
  border: 1px solid transparent;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.15s, border-color 0.15s, color 0.15s;
  padding: ${({ $size }) => ($size === "sm" ? "5px 10px" : "9px 16px")};
  font-size: ${({ $size }) => ($size === "sm" ? "13px" : "14px")};

  svg { width: 16px; height: 16px; flex-shrink: 0; }

  &:disabled { opacity: 0.5; cursor: not-allowed; }

  ${({ $variant = "primary", theme }) => {
    const c = theme.colors;
    switch ($variant) {
      case "secondary":
        return css`
          background: ${c.surface};
          border-color: ${c.borderStrong};
          color: ${c.text};
          &:hover:not(:disabled) { background: ${c.surfaceAlt}; }
        `;
      case "danger":
        return css`
          background: ${c.danger};
          color: #fff;
          &:hover:not(:disabled) { background: #991b1b; }
        `;
      case "success":
        return css`
          background: ${c.success};
          color: #fff;
          &:hover:not(:disabled) { background: #166534; }
        `;
      case "ghost":
        return css`
          background: transparent;
          color: ${c.textMuted};
          &:hover:not(:disabled) { background: ${c.neutralSoft}; color: ${c.text}; }
        `;
      default:
        return css`
          background: ${c.primary};
          color: #fff;
          &:hover:not(:disabled) { background: ${c.primaryHover}; }
        `;
    }
  }}
`;

export const IconButton = styled.button<{ $tone?: "default" | "danger" }>`
  display: inline-grid;
  place-items: center;
  width: 32px;
  height: 32px;
  border-radius: ${({ theme }) => theme.radius.sm};
  border: 1px solid transparent;
  background: transparent;
  cursor: pointer;
  color: ${({ theme, $tone }) => ($tone === "danger" ? theme.colors.danger : theme.colors.textMuted)};
  svg { width: 17px; height: 17px; }
  &:hover {
    background: ${({ theme, $tone }) => ($tone === "danger" ? theme.colors.dangerSoft : theme.colors.neutralSoft)};
    color: ${({ theme, $tone }) => ($tone === "danger" ? theme.colors.danger : theme.colors.text)};
  }
`;

export const Card = styled.section`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.lg};
  box-shadow: ${({ theme }) => theme.shadow.sm};
`;

export const CardHeader = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 16px 20px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};

  h2 { font-size: 15px; font-weight: 600; }
  p { color: ${({ theme }) => theme.colors.textMuted}; font-size: 13px; }
`;

export const CardBody = styled.div`
  padding: 20px;
`;

/* ---------- Form controls ---------- */

const control = css<{ $invalid?: boolean }>`
  width: 100%;
  padding: 9px 12px;
  border-radius: ${({ theme }) => theme.radius.sm};
  border: 1px solid ${({ theme, $invalid }) => ($invalid ? theme.colors.danger : theme.colors.borderStrong)};
  background: ${({ theme }) => theme.colors.surface};
  transition: border-color 0.15s, box-shadow 0.15s;

  &:focus {
    outline: none;
    border-color: ${({ theme, $invalid }) => ($invalid ? theme.colors.danger : theme.colors.primary)};
    box-shadow: 0 0 0 3px ${({ theme, $invalid }) => ($invalid ? theme.colors.dangerSoft : theme.colors.primarySoft)};
  }
  &:disabled { background: ${({ theme }) => theme.colors.neutralSoft}; color: ${({ theme }) => theme.colors.textMuted}; }
  &::placeholder { color: ${({ theme }) => theme.colors.textSubtle}; }
`;

export const Input = styled.input<{ $invalid?: boolean }>`
  ${control}
`;

export const Select = styled.select<{ $invalid?: boolean }>`
  ${control}
  appearance: none;
  padding-right: 32px;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2.5'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 10px center;
`;

export const TextArea = styled.textarea<{ $invalid?: boolean }>`
  ${control}
  resize: vertical;
  min-height: 80px;
`;

export const Field = styled.div<{ $span?: number }>`
  display: flex;
  flex-direction: column;
  gap: 6px;
  grid-column: span ${({ $span }) => $span ?? 1};

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    grid-column: span 1;
  }
`;

export const Label = styled.label`
  font-size: 13px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text};
`;

export const Required = styled.span`
  color: ${({ theme }) => theme.colors.danger};
  margin-left: 2px;
`;

export const FieldError = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.danger};
`;

export const FieldHint = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textMuted};
`;

export const FormGrid = styled.div<{ $cols?: number }>`
  display: grid;
  grid-template-columns: repeat(${({ $cols }) => $cols ?? 2}, minmax(0, 1fr));
  gap: 16px 20px;

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    grid-template-columns: 1fr;
  }
`;

export const FormSection = styled.fieldset`
  border: none;
  margin: 0;
  padding: 20px 0;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  &:first-of-type { border-top: none; padding-top: 0; }

  legend {
    padding: 0;
    margin-bottom: 4px;
    font-size: 14px;
    font-weight: 600;
  }
`;

export const SectionHint = styled.p`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 13px;
  margin-bottom: 16px;
`;

export const FormActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  flex-wrap: wrap;
  padding-top: 20px;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`;

export const Toolbar = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};

  > select { width: auto; min-width: 150px; }

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    > * { flex: 1 1 100%; }
    > select { width: 100%; }
  }
`;

export const Muted = styled.span`
  color: ${({ theme }) => theme.colors.textMuted};
`;

export const Mono = styled.span`
  font-family: ui-monospace, "SFMono-Regular", Menlo, Consolas, monospace;
  font-size: 12.5px;
  white-space: nowrap;
`;

export const Banner = styled.div<{ $tone: "success" | "warning" | "danger" | "info" }>`
  display: flex;
  gap: 10px;
  align-items: flex-start;
  padding: 12px 14px;
  border-radius: ${({ theme }) => theme.radius.md};
  font-size: 13px;
  background: ${({ theme, $tone }) => theme.colors[`${$tone}Soft` as const]};
  color: ${({ theme, $tone }) => theme.colors[$tone]};
  svg { width: 18px; height: 18px; flex-shrink: 0; margin-top: 1px; }
  strong { font-weight: 600; }
`;

export const DetailList = styled.dl`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px 20px;
  margin: 0;

  div { min-width: 0; }
  dt { font-size: 12px; color: ${({ theme }) => theme.colors.textMuted}; margin-bottom: 2px; }
  dd { margin: 0; font-weight: 500; overflow-wrap: anywhere; }

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    grid-template-columns: 1fr;
  }
`;
