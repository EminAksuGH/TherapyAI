import React, { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = () => {
  const { currentUser, reloadUser } = useAuth();
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);
  
  // Reload current user to make sure we have the latest emailVerified status
  useEffect(() => {
    const refreshUserStatus = async () => {
      setIsChecking(true);
      if (currentUser) {
        try {
          await reloadUser();
        } catch (error) {
          console.error("Error refreshing auth state:", error);
          // If there's an error reloading, the user might have been deleted
          // Let the auth state update handle the redirect
        }
      }
      setIsChecking(false);
    };
    
    refreshUserStatus();
  }, [currentUser, reloadUser]);

  // Show loading while checking auth state
  if (isChecking) {
    return <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '200px' 
    }}>
      Yükleniyor...
    </div>;
  }
  
  // If the user is not authenticated, redirect to login with replace to prevent back navigation
  if (!currentUser) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  
  // Check if email is verified
  if (!currentUser.emailVerified) {
    // Redirect to login with verification requirement, prevent back navigation
    return <Navigate to="/login?requireVerification=true" replace state={{ from: location }} />;
  }
  
  // If the user is authenticated and email is verified, render the child routes
  return <Outlet />;
};

export default ProtectedRoute; 