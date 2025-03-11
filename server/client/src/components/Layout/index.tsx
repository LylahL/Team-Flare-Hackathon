import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { 
  LayoutContainer, 
  MainContent, 
  SidebarContainer, 
  HeaderContainer,
  Logo,
  HeaderRight,
  ProfileSection,
  ProfileImage,
  ProfileInfo,
  NotificationBadge,
  MobileMenuButton,
  SidebarNavLink,
  SidebarNavItem,
  SidebarNav,
  SidebarFooter,
  SidebarHeader,
  UserName,
  UserRole
} from './styles';
import { FiHome, FiFolder, FiCalendar, FiMessageSquare, FiUsers, FiSettings, FiMenu, FiBell, FiLogOut } from 'react-icons/fi';

interface LayoutProps {
  children?: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const navItems = [
    { icon: <FiHome size={20} />, label: 'Dashboard', path: '/dashboard' },
    { icon: <FiFolder size={20} />, label: 'Cases', path: '/cases' },
    { icon: <FiCalendar size={20} />, label: 'Schedule', path: '/schedule' },
    { icon: <FiMessageSquare size={20} />, label: 'Messages', path: '/messages' },
    { icon: <FiUsers size={20} />, label: 'Clients', path: '/clients' },
    { icon: <FiSettings size={20} />, label: 'Settings', path: '/settings' },
  ];

  return (
    <LayoutContainer>
      <SidebarContainer isOpen={sidebarOpen} mobileOpen={mobileMenuOpen}>
        <SidebarHeader>
          <Logo>Lawfully</Logo>
        </SidebarHeader>
        
        <SidebarNav>
          {navItems.map((item, index) => (
            <SidebarNavItem key={index} active={index === 0}>
              <SidebarNavLink to={item.path}>
                {item.icon}
                <span>{item.label}</span>
              </SidebarNavLink>
            </SidebarNavItem>
          ))}
        </SidebarNav>
        
        <SidebarFooter>
          <SidebarNavItem>
            <SidebarNavLink to="/logout">
              <FiLogOut size={20} />
              <span>Logout</span>
            </SidebarNavLink>
          </SidebarNavItem>
        </SidebarFooter>
      </SidebarContainer>
      
      <MainContent isSidebarOpen={sidebarOpen}>
        <HeaderContainer>
          <MobileMenuButton onClick={toggleMobileMenu}>
            <FiMenu size={24} />
          </MobileMenuButton>
          
          <HeaderRight>
            <NotificationBadge>
              <FiBell size={20} />
              <span>3</span>
            </NotificationBadge>
            
            <ProfileSection>
              <ProfileImage src="https://randomuser.me/api/portraits/women/44.jpg" alt="Profile" />
              <ProfileInfo>
                <UserName>Jessica Chen</UserName>
                <UserRole>Immigration Attorney</UserRole>
              </ProfileInfo>
            </ProfileSection>
          </HeaderRight>
        </HeaderContainer>
        
        {children || <Outlet />}
      </MainContent>
    </LayoutContainer>
  );
};

export default Layout;

