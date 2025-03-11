import styled from 'styled-components';
import { Link } from 'react-router-dom';

export const LayoutContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background-color: #f5f7fa;
`;

export const SidebarContainer = styled.div<{ isOpen: boolean, mobileOpen: boolean }>`
  width: ${({ isOpen }) => (isOpen ? '240px' : '80px')};
  background-color: #1d2942;
  color: #ffffff;
  transition: width 0.3s ease;
  display: flex;
  flex-direction: column;
  position: fixed;
  height: 100vh;
  z-index: 100;
  
  @media (max-width: 768px) {
    width: 240px;
    left: ${({ mobileOpen }) => (mobileOpen ? '0' : '-240px')};
  }
`;

export const SidebarHeader = styled.div`
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

export const Logo = styled.div`
  font-size: 24px;
  font-weight: 700;
  color: #ffffff;
`;

export const SidebarNav = styled.ul`
  list-style: none;
  padding: 20px 0;
  margin: 0;
  flex-grow: 1;
`;

export const SidebarNavItem = styled.li<{ active?: boolean }>`
  margin-bottom: 5px;
  
  a {
    background-color: ${({ active }) => (active ? 'rgba(255, 255, 255, 0.1)' : 'transparent')};
    border-left: ${({ active }) => (active ? '4px solid #4a80f0' : '4px solid transparent')};
  }
  
  &:hover a {
    background-color: rgba(255, 255, 255, 0.05);
  }
`;

export const SidebarNavLink = styled(Link)`
  display: flex;
  align-items: center;
  padding: 12px 20px;
  color: #ffffff;
  text-decoration: none;
  transition: background-color 0.2s, border-left 0.2s;
  
  span {
    margin-left: 15px;
    font-size: 15px;
    white-space: nowrap;
  }
`;

export const SidebarFooter = styled.div`
  padding: 20px 0;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
`;

export const MainContent = styled.div<{ isSidebarOpen: boolean }>`
  flex: 1;
  margin-left: ${({ isSidebarOpen }) => (isSidebarOpen ? '240px' : '80px')};
  transition: margin-left 0.3s ease;
  display: flex;
  flex-direction: column;
  
  @media (max-width: 768px) {
    margin-left: 0;
    width: 100%;
  }
`;

export const HeaderContainer = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 30px;
  background-color: #ffffff;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  position: sticky;
  top: 0;
  z-index: 10;
`;

export const MobileMenuButton = styled.button`
  display: none;
  background: transparent;
  border: none;
  cursor: pointer;
  color: #1d2942;
  
  @media (max-width: 768px) {
    display: block;
  }
`;

export const HeaderRight = styled.div`
  display: flex;
  align-items: center;
`;

export const NotificationBadge = styled.div`
  position: relative;
  margin-right: 25px;
  cursor: pointer;
  
  span {
    position: absolute;
    top: -8px;
    right: -8px;
    background-color: #ff5c5c;
    color: white;
    border-radius: 50%;
    width: 18px;
    height: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
    font-weight: bold;
  }
`;

export const ProfileSection = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;
`;

export const ProfileImage = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
`;

export const ProfileInfo = styled.div`
  margin-left: 12px;
  display: none;
  
  @media (min-width: 576px) {
    display: block;
  }
`;

export const UserName = styled.div`
  font-weight: 600;
  font-size: 14px;
  color: #1d2942;
`;

export const UserRole = styled.div`
  font-size: 12px;
  color: #7c8db5;
`;

