import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Import pages
// Import pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import CasesPage from './pages/CasesPage';
import ProfilePage from './pages/ProfilePage';
import NotificationsPage from './pages/NotificationsPage';
import Navbar from './components/Navbar';
import Layout from './components/Layout';
// Create a theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

// Protected Route component to guard routes that require authentication
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('token') !== null;
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirect to login if not authenticated, save the attempted location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Layout>{children}</Layout>;
};

// Public Route component to prevent authenticated users from accessing login/register
const PublicRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('token') !== null;
  const location = useLocation();
  
  // If user is authenticated and tries to access login/register, redirect to dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route 
            path="/login" 
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            } 
          />
          <Route 
            path="/register" 
            element={
              <PublicRoute>
                <RegisterPage />
              </PublicRoute>
            } 
          />
          
          {/* Protected Routes */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/cases/:caseId" 
            element={
              <ProtectedRoute>
                <div>Case Details Page (to be implemented)</div>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/cases" 
            element={
              <ProtectedRoute>
                <CasesPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/cases/new" 
            element={
              <ProtectedRoute>
                <div>New Case Page (to be implemented)</div>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/documents" 
            element={
              <ProtectedRoute>
                <div>Documents Page (to be implemented)</div>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/documents/upload" 
            element={
              <ProtectedRoute>
                <div>Document Upload Page (to be implemented)</div>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/forum" 
            element={
              <ProtectedRoute>
                <div>Forum Page (to be implemented)</div>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/forum/new" 
            element={
              <ProtectedRoute>
                <div>New Forum Post Page (to be implemented)</div>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/notifications" 
            element={
              <ProtectedRoute>
                <NotificationsPage />
              </ProtectedRoute>
            } 
          />
          
          {/* Redirect to login by default */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          
          {/* Catch all route - 404 page */}
          <Route path="*" element={<div>404 Page Not Found</div>} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
