import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
  sendEmailVerification,
  applyActionCode,
  checkActionCode
} from 'firebase/auth';
import { auth } from '../firebase/firebase';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  function signup(email, password) {
    return createUserWithEmailAndPassword(auth, email, password);
  }

  function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  function logout() {
    return signOut(auth);
  }

  function resetPassword(email) {
    const actionCodeSettings = {
      url: 'https://therapyai-3b847.firebaseapp.com/change-password',
      handleCodeInApp: true
    };
    return sendPasswordResetEmail(auth, email, actionCodeSettings);
  }

  function updateUserProfile(profileData) {
    return updateProfile(auth.currentUser, profileData);
  }

  function sendVerificationEmail() {
    const actionCodeSettings = {
      url: 'https://therapyai-3b847.firebaseapp.com/verify-email',
      handleCodeInApp: true
    };
    return sendEmailVerification(auth.currentUser, actionCodeSettings);
  }

  function verifyEmail(actionCode) {
    return applyActionCode(auth, actionCode);
  }

  function checkVerificationCode(actionCode) {
    return checkActionCode(auth, actionCode);
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    signup,
    login,
    logout,
    resetPassword,
    updateUserProfile,
    sendVerificationEmail,
    verifyEmail,
    checkVerificationCode
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
} 