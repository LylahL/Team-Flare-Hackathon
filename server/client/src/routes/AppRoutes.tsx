import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Page imports
import Dashboard from '../pages/Dashboard';
import Home from '../pages/Home';
import Login from '../pages/Login';
import Register from '../pages/Register';
import CaseDetails from '../pages/CaseDetails';
import Documents from '../pages/Documents';
import Profile from '../pages/Profile';
import NotFound from '../pages/NotFound';
import AdminDashboard from '../pages/AdminDashboard';

type ProtectedRouteProps = {
  children: React.ReactNode;
  requiredRole?: string[];
};

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole = [] 
}) => {
  const { currentUser, isAuthenticated, userRole } = useAuth();
  
  if (!isAuthenticated || !currentUser) {
    // Redirect to login if user is not authenticated
    return <Navigate to="/login" replace />;
  }
  
  if (requiredRole.length > 0 && !requiredRole.includes(userRole)) {
    // Redirect to dashboard if user doesn't have required role
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {/* Protected routes - require authentication */}
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
            <CaseDetails />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/documents" 
        element={
          <ProtectedRoute>
            <Documents />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/profile" 
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } 
      />
      
      {/* Admin routes - require admin role */}
      <Route 
        path="/admin" 
        element={
          <ProtectedRoute requiredRole={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        } 
      />
      
      {/* Catch-all route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;

