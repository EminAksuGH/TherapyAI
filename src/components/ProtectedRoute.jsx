import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = () => {
  const { currentUser } = useAuth();
  
  // If the user is not authenticated, redirect to login
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  
  // Check if email is verified
  if (!currentUser.emailVerified) {
    // You can redirect to a special page or show a verification required message
    return <Navigate to="/login?requireVerification=true" replace />;
  }
  
  // If the user is authenticated and email is verified, render the child routes
  return <Outlet />;
};

export default ProtectedRoute; 