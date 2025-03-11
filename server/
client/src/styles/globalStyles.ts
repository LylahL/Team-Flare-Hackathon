import { createGlobalStyle } from 'styled-components';
import theme from './theme';

const GlobalStyles = createGlobalStyle`
  /* Reset CSS */
  *, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  html {
    font-size: 16px;
    height: 100%;
    scroll-behavior: smooth;
  }

  body {
    font-family: ${theme.typography.fontFamily.primary};
    font-size: ${theme.typography.fontSize.md};
    line-height: ${theme.typography.lineHeight.normal};
    color: ${theme.colors.neutral.gray700};
    background-color: ${theme.colors.neutral.background};
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    min-height: 100vh;
    overflow-x: hidden;
  }

  h1, h2, h3, h4, h5, h6 {
    color: ${theme.colors.neutral.gray800};
    font-weight: ${theme.typography.fontWeight.semiBold};
    line-height: ${theme.typography.lineHeight.tight};
    margin-bottom: ${theme.spacing[4]};
  }

  h1 {
    font-size: ${theme.typography.fontSize['4xl']};
  }

  h2 {
    font-size: ${theme.typography.fontSize['3xl']};
  }

  h3 {
    font-size: ${theme.typography.fontSize['2xl']};
  }

  h4 {
    font-size: ${theme.typography.fontSize.xl};
  }

  h5 {
    font-size: ${theme.typography.fontSize.lg};
  }

  h6 {
    font-size: ${theme.typography.fontSize.md};
  }

  p {
    margin-bottom: ${theme.spacing[4]};
  }

  a {
    color: ${theme.colors.primary.main};
    text-decoration: none;
    transition: color ${theme.transitions.duration.shortest} ${theme.transitions.easing.easeInOut};

    &:hover {
      color: ${theme.colors.primary.dark};
      text-decoration: underline;
    }
  }

  button {
    cursor: pointer;
    font-family: ${theme.typography.fontFamily.primary};
  }

  img {
    max-width: 100%;
    height: auto;
  }

  ul, ol {
    margin-bottom: ${theme.spacing[4]};
    padding-left: ${theme.spacing[6]};
  }

  /* Form elements */
  input, textarea, select {
    font-family: ${theme.typography.fontFamily.primary};
    font-size: ${theme.typography.fontSize.md};
    padding: ${theme.spacing[2]} ${theme.spacing[3]};
    border: 1px solid ${theme.colors.neutral.gray300};
    border-radius: ${theme.borderRadius.md};
    outline: none;
    transition: border-color ${theme.transitions.duration.shortest} ${theme.transitions.easing.easeInOut};

    &:focus {
      border-color: ${theme.colors.primary.main};
      box-shadow: 0 0 0 3px rgba(43, 108, 176, 0.1);
    }
  }

  /* Custom scrollbar */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    background: ${theme.colors.neutral.gray100};
  }

  ::-webkit-scrollbar-thumb {
    background: ${theme.colors.neutral.gray400};
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: ${theme.colors.neutral.gray500};
  }

  /* Accessibility */
  .visually-hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border-width: 0;
  }

  /* Container utility class */
  .container {
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 ${theme.spacing[4]};

    @media (min-width: ${theme.breakpoints.sm}) {
      padding: 0 ${theme.spacing[6]};
    }
  }

  /* Layout utilities */
  .flex {
    display: flex;
  }

  .flex-col {
    flex-direction: column;
  }

  .items-center {
    align-items: center;
  }

  .justify-center {
    justify-content: center;
  }

  .justify-between {
    justify-content: space-between;
  }

  .gap-2 {
    gap: ${theme.spacing[2]};
  }

  .gap-4 {
    gap: ${theme.spacing[4]};
  }

  .my-4 {
    margin-top: ${theme.spacing[4]};
    margin-bottom: ${theme.spacing[4]};
  }

  .text-center {
    text-align: center;
  }
`;

export default GlobalStyles;

