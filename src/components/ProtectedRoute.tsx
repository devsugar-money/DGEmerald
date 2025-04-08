import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * A route component that only allows access to authenticated users
 * Redirects unauthenticated users to the login page
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading, checkSession } = useAuthStore();
  
  useEffect(() => {
    // Ensure we have the latest session data
    if (loading) {
      checkSession();
    }
  }, [loading, checkSession]);
  
  if (loading) {
    // Show loading state while checking authentication
    return <div className="loading-spinner">Loading...</div>;
  }
  
  // If not authenticated, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // If authenticated, render the protected content
  return <>{children}</>;
};

export default ProtectedRoute;
