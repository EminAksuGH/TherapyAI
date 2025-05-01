import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
  sendEmailVerification,
  reload,
  getAuth
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/firebase';

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
      url: 'https://therapyai-production-4230.up.railway.app/change-password',
      handleCodeInApp: true
    };
    return sendPasswordResetEmail(auth, email, actionCodeSettings);
  }

  function updateUserProfile(profileData) {
    return updateProfile(auth.currentUser, profileData);
  }

  function verifyEmail() {
    const actionCodeSettings = {
      url: 'https://therapyai-production-4230.up.railway.app/verify-email',
      handleCodeInApp: true
    };
    return sendEmailVerification(auth.currentUser, actionCodeSettings);
  }
  
  // Enhanced reloadUser function that returns the updated user
  async function reloadUser() {
    if (auth.currentUser) {
      try {
        // Reload the auth state
        await reload(auth.currentUser);
        // Force token refresh to get updated claims
        await auth.currentUser.getIdToken(true);
        
        // Update the currentUser state with the latest user
        setCurrentUser({...auth.currentUser});
        
        // Return the updated user
        return auth.currentUser;
      } catch (error) {
        console.error("Error reloading user:", error);
        throw error;
      }
    }
    return Promise.resolve(null);
  }

  // Function to create or update user document in Firestore
  async function ensureUserDocument(user) {
    if (!user || !user.emailVerified) return;
    
    try {
      // Check if the document already exists
      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        // Create new user document
        await setDoc(userRef, {
          name: user.displayName || '',
          email: user.email,
          emailVerified: true,
          createdAt: new Date(),
          preferences: {
            memoryEnabled: true
          }
        });
        console.log("User document created in Firestore after email verification");
      } else if (!userDoc.data().emailVerified) {
        // Update the emailVerified field if needed
        await setDoc(userRef, {
          emailVerified: true,
        }, { merge: true });
        console.log("User document updated with verified email status");
      }
    } catch (error) {
      console.error("Error creating/updating user document:", error);
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Reload user to get fresh claims
        try {
          await reload(user);
          // Force token refresh
          await user.getIdToken(true);
          
          if (user.emailVerified) {
            // If email is verified, ensure the user document exists
            await ensureUserDocument(user);
          }
        } catch (error) {
          console.error("Error reloading user:", error);
        }
      }
      
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
    verifyEmail,
    reloadUser,
    ensureUserDocument
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
} 