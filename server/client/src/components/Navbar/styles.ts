import styled from 'styled-components';
import { Link as RouterLink } from 'react-router-dom';

export const NavbarContainer = styled.nav`
  background: ${({ theme }) => theme.colors.background.dark};
  height: 80px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: ${({ theme }) => theme.typography.fontSizes.md};
  position: sticky;
  top: 0;
  z-index: 999;
  box-shadow: ${({ theme }) => theme.shadows.md};
`;

export const NavbarContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  height

