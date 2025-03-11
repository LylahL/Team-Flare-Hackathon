import { createGlobalStyle } from 'styled-components';
import theme from './theme';

const GlobalStyles = createGlobalStyle`
  /* Import Google Font - Inter */
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
  
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  html {
    font-size: 16px;
    scroll-behavior: smooth;
  }

  body {
    font-family: ${theme.typography.fontFamily};
    font-size: ${theme.typography.fontSizes.md};
    line-height: ${theme.typography.lineHeights.normal};
    color: ${theme.colors.text.primary};
    background-color: ${theme.colors.background.primary};
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  h1, h2, h3, h4, h5, h6 {
    margin-bottom: ${theme.spacing.md};
    font-weight: ${theme.typography.fontWeights.bold};
    line-height: ${theme.typography.lineHeights.tight};
  }

  h1 {
    font-size: ${theme.typography.fontSizes.xxxl};
  }

  h2 {
    font-size: ${theme.typography.fontSizes.xxl};
  }

  h3 {
    font-size: ${theme.typography.fontSizes.xl};
  }

  h4 {
    font-size: ${theme.typography.fontSizes.lg};
  }

  h5 {
    font-size: ${theme.typography.fontSizes.md};
  }

  h6 {
    font-size: ${theme.typography.fontSizes.sm};
  }

  p {
    margin-bottom: ${theme.spacing.md};
  }

  a {
    color: ${theme.colors.primary};
    text-decoration: none;
    transition: color ${theme.transition.fast};
    
    &:hover {
      color: ${theme.colors.secondary};
    }
  }

  ul, ol {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  button {
    cursor: pointer;
    border: none;
    background: none;
    font-family: inherit;
  }

  input, button, textarea, select {
    font: inherit;
  }

  img, svg {
    max-width: 100%;
    height: auto;
  }

  /* Container for consistent max-width */
  .container {
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 ${theme.spacing.md};
  }

  /* Utility classes */
  .text-center {
    text-align: center;
  }

  .text-left {
    text-align: left;
  }

  .text-right {
    text-align: right;
  }

  .mt-1 { margin-top: ${theme.spacing.xs}; }
  .mt-2 { margin-top: ${theme.spacing.sm}; }
  .mt-3 { margin-top: ${theme.spacing.md}; }
  .mt-4 { margin-top: ${theme.spacing.lg}; }
  .mt-5 { margin-top: ${theme.spacing.xl}; }

  .mb-1 { margin-bottom: ${theme.spacing.xs}; }
  .mb-2 { margin-bottom: ${theme.spacing.sm}; }
  .mb-3 { margin-bottom: ${theme.spacing.md}; }
  .mb-4 { margin-bottom: ${theme.spacing.lg}; }
  .mb-5 { margin-bottom: ${theme.spacing.xl}; }

  .p-1 { padding: ${theme.spacing.xs}; }
  .p-2 { padding: ${theme.spacing.sm}; }
  .p-3 { padding: ${theme.spacing.md}; }
  .p-4 { padding: ${theme.spacing.lg}; }
  .p-5 { padding: ${theme.spacing.xl}; }
`;

export default GlobalStyles;

