import styled, { css } from 'styled-components';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'text' | 'danger';
export type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  disabled?: boolean;
}

// Size styles
const getButtonSize = (size: ButtonSize) => {
  switch (size) {
    case 'small':
      return css`
        padding: 0.5rem 1rem;
        font-size: ${({ theme }) => theme.typography.fontSizes.xs};
      `;
    case 'large':
      return css`
        padding: 0.75rem 1.5rem;
        font-size: ${({ theme }) => theme.typography.fontSizes.lg};
      `;
    case 'medium':
    default:
      return css`
        padding: 0.625rem 1.25rem;
        font-size: ${({ theme }) => theme.typography.fontSizes.md};
      `;
  }
};

// Variant styles
const getButtonVariant = (variant: ButtonVariant) => {
  switch (variant) {
    case 'secondary':
      return css`
        background-color: ${({ theme }) => theme.colors.secondary};
        color: ${({ theme }) => theme.colors.text.light};
        
        &:hover:not(:disabled) {
          background-color: ${({ theme }) => theme.colors.secondary};
          filter: brightness(0.9);
        }
      `;
    case 'outline':
      return css`
        background-color: transparent;
        color: ${({ theme }) => theme.colors.primary};
        border: 1px solid ${({ theme }) => theme.colors.primary};
        
        &:hover:not(:disabled) {
          background-color: ${({ theme }) => theme.colors.primary};
          color: ${({ theme }) => theme.colors.text.light};
        }
      `;
    case 'text':
      return css`
        background-color: transparent;
        color: ${({ theme }) => theme.colors.primary};
        padding-left: 0.5rem;
        padding-right: 0.5rem;
        
        &:hover:not(:disabled) {
          background-color: rgba(0, 102, 255, 0.05);
        }
      `;
    case 'danger':
      return css`
        background-color: ${({ theme }) => theme.colors.danger};
        color: ${({ theme }) => theme.colors.text.light};
        
        &:hover:not(:disabled) {
          background-color: ${({ theme }) => theme.colors.danger};
          filter: brightness(0.9);
        }
      `;
    case 'primary':
    default:
      return css`
        background-color: ${({ theme }) => theme.colors.primary};
        color: ${({ theme }) => theme.colors.text.light};
        
        &:hover:not(:disabled) {
          background-color: ${({ theme }) => theme.colors.primary};
          filter: brightness(0.9);
        }
      `;
  }
};

export const StyledButton = styled.button<ButtonProps>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-weight: ${({ theme }) => theme.typography.fontWeights.medium};
  transition: all ${({ theme }) => theme.transition.fast};
  cursor: pointer;
  border: none;
  outline: none;
  position: relative;
  overflow: hidden;
  
  ${({ size = 'medium' }) => getButtonSize(size)}
  ${({ variant = 'primary' }) => getButtonVariant(variant)}
  
  ${({ fullWidth }) =>
    fullWidth &&
    css`
      width: 100%;
    `}
  
  ${({ disabled }) =>
    disabled &&
    css`
      opacity: 0.6;
      cursor: not-allowed;
    `}
  
  /* Icon spacing */
  svg {
    margin-right: ${({ theme }) => theme.spacing.xs};
  }

  /* Empty icon (for right-aligned icons) */
  &.icon-right {
    svg {
      margin-right: 0;
      margin-left: ${({ theme }) => theme.spacing.xs};
    }
  }
`;

