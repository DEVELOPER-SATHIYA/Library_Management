import styled from "styled-components";
import { Link } from "react-router-dom";
import { Card } from "../../styles/ui";

export const LoginShell = styled.div`
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 24px 16px;
`;

export const LoginCard = styled(Card)`
  width: 100%;
  max-width: 400px;
  padding: 32px 28px 28px;

  form {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  form > button { margin-top: 4px; }
`;

export const LoginHead = styled.div`
  text-align: center;
  margin-bottom: 24px;

  > div {
    width: 48px;
    height: 48px;
    margin: 0 auto 14px;
    border-radius: 12px;
    display: grid;
    place-items: center;
    background: ${({ theme }) => theme.colors.sidebar};
    color: #fff;
  }
  h1 { font-size: 20px; font-weight: 700; }
  p { color: ${({ theme }) => theme.colors.textMuted}; margin-top: 4px; font-size: 13px; }
`;

export const PasswordWrap = styled.div`
  position: relative;

  input { padding-right: 42px; }
  /* Hide the browser's own reveal button so there is only one. */
  input::-ms-reveal { display: none; }

  button {
    position: absolute;
    top: 50%;
    right: 6px;
    transform: translateY(-50%);
    width: 30px;
    height: 30px;
    display: grid;
    place-items: center;
    border: none;
    border-radius: ${({ theme }) => theme.radius.sm};
    background: none;
    cursor: pointer;
    color: ${({ theme }) => theme.colors.textMuted};

    &:hover { color: ${({ theme }) => theme.colors.text}; background: ${({ theme }) => theme.colors.neutralSoft}; }
  }
`;

export const BackLink = styled(Link)`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  margin-top: 20px;
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textMuted};

  &:hover { color: ${({ theme }) => theme.colors.primary}; }
`;
