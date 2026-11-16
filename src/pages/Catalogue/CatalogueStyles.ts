import styled from "styled-components";
import { Link } from "react-router-dom";

export const PublicShell = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`;

export const PublicHeader = styled.header`
  position: sticky;
  top: 0;
  z-index: 30;
  height: ${({ theme }) => theme.headerHeight};
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 0 28px;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    padding: 0 16px;
  }
`;

export const PublicBrand = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;

  > div:first-child {
    width: 38px;
    height: 38px;
    flex-shrink: 0;
    border-radius: 10px;
    display: grid;
    place-items: center;
    background: ${({ theme }) => theme.colors.sidebar};
    color: #fff;
  }
  strong { display: block; font-size: 15px; line-height: 1.3; }
  span { font-size: 12px; color: ${({ theme }) => theme.colors.textMuted}; }
`;

export const AvatarLink = styled(Link)`
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: ${({ theme }) => theme.colors.primarySoft};
  color: ${({ theme }) => theme.colors.primary};
  border: 1px solid transparent;
  transition: background 0.15s, color 0.15s, border-color 0.15s;

  &:hover {
    background: ${({ theme }) => theme.colors.primary};
    color: #fff;
  }
`;

export const PublicContent = styled.main`
  flex: 1;
  width: 100%;
  max-width: 1280px;
  margin: 0 auto;
  padding: 24px 28px 40px;

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    padding: 16px;
  }
`;
