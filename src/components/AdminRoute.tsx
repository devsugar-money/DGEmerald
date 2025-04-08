import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

interface AdminRouteProps {
  children: React.ReactNode;
}

/**
 * A route component that only allows access to admin users
 * Redirects non-admin users to the dashboard page
 */
const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { isAdmin, loading, checkSession } = useAuthStore();
  
  useEffect(() => {
    // Ensure we have the latest session and user role data
    if (loading) {
      checkSession();
    }
  }, [loading, checkSession]);
  
  if (loading) {
    // Show loading state while checking permissions
    return <div className="loading-spinner">Loading...</div>;
  }
  
  // If not an admin, redirect to dashboard
  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }
  
  // If admin, render the protected content
  return <>{children}</>;
};

export default AdminRoute;
