import React, { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Simple loading spinner component
const LoadingSpinner = () => {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      flexDirection: 'column'
    }}>
      <div style={{
        border: '4px solid #f3f3f3',
        borderTop: '4px solid #7c3aed',
        borderRadius: '50%',
        width: '50px',
        height: '50px',
        animation: 'spin 1s linear infinite'
      }}></div>
      <p style={{ marginTop: '20px' }}>Yükleniyor...</p>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

const ProtectedRoute = () => {
  const { currentUser, reloadUser } = useAuth();
  const [isChecking, setIsChecking] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const location = useLocation();
  
  // Reload current user to make sure we have the latest emailVerified status
  useEffect(() => {
    const refreshUserStatus = async () => {
      setIsChecking(true);
      
      if (!currentUser) {
        setIsChecking(false);
        return;
      }
      
      try {
        // First force token refresh
        await currentUser.getIdToken(true);
        
        // Then reload user
        const updatedUser = await reloadUser();
        
        // Check verification status after reload
        if (updatedUser && updatedUser.emailVerified) {
          setIsVerified(true);
        } else {
          setIsVerified(false);
        }
        
        console.log("ProtectedRoute: Email verified status after refresh:", 
          updatedUser ? updatedUser.emailVerified : "No user");
      } catch (error) {
        console.error("Error refreshing auth state in ProtectedRoute:", error);
        // If there's an error, assume not verified
        setIsVerified(false);
      } finally {
        setIsChecking(false);
      }
    };
    
    refreshUserStatus();
  }, [currentUser, reloadUser]);
  
  // Show loading spinner while checking authentication status
  if (isChecking) {
    return <LoadingSpinner />;
  }
  
  // If the user is not authenticated, redirect to login
  if (!currentUser) {
    return <Navigate to={`/login?from=${encodeURIComponent(location.pathname)}`} replace />;
  }
  
  // Check if email is verified - use the refreshed state
  if (!isVerified) {
    console.log("ProtectedRoute: Redirecting - Email not verified");
    // Include the current path in the redirect so we can return after verification
    return <Navigate to={`/login?requireVerification=true&from=${encodeURIComponent(location.pathname)}`} replace />;
  }
  
  // If the user is authenticated and email is verified, render the child routes
  console.log("ProtectedRoute: Rendering protected content");
  return <Outlet />;
};

export default ProtectedRoute; 