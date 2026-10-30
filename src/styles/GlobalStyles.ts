import { createGlobalStyle } from "styled-components";

export const GlobalStyles = createGlobalStyle`
  *, *::before, *::after { box-sizing: border-box; }
  html, body, #root { height: 100%; }
  body {
    margin: 0;
    font-family: ${({ theme }) => theme.font};
    font-size: 14px;
    line-height: 1.5;
    color: ${({ theme }) => theme.colors.text};
    background: ${({ theme }) => theme.colors.bg};
    -webkit-font-smoothing: antialiased;
  }
  h1, h2, h3, h4, p { margin: 0; }
  a { color: inherit; text-decoration: none; }
  button, input, select, textarea { font: inherit; color: inherit; }
  :focus-visible { outline: 2px solid ${({ theme }) => theme.colors.primary}; outline-offset: 2px; }
  .sr-only {
    position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
    overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; border: 0;
  }
  ::selection { background: ${({ theme }) => theme.colors.primarySoft}; }
`;
