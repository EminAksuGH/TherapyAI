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
  deleteUser,
  reauthenticateWithCredential,
  EmailAuthProvider
} from 'firebase/auth';
import { auth, db } from '../firebase/firebase';
import { 
  doc, 
  deleteDoc, 
  collection, 
  query, 
  where, 
  getDocs, 
  writeBatch 
} from 'firebase/firestore';

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
      url: 'https://eminaksu.tr/action-handler',
      handleCodeInApp: true
    };
    return sendPasswordResetEmail(auth, email, actionCodeSettings);
  }

  function updateUserProfile(profileData) {
    return updateProfile(auth.currentUser, profileData);
  }

  function verifyEmail() {
    const actionCodeSettings = {
      url: 'https://eminaksu.tr/action-handler',
      handleCodeInApp: true
    };
    return sendEmailVerification(auth.currentUser, actionCodeSettings);
  }
  
  function reloadUser() {
    if (auth.currentUser) {
      return reload(auth.currentUser);
    }
    return Promise.resolve();
  }

  async function clearUserData(userId) {
    try {
      // Clear user's conversations and memories without deleting the user account
      const conversationsQuery = query(
        collection(db, 'conversations'),
        where('userId', '==', userId)
      );
      const conversationsSnapshot = await getDocs(conversationsQuery);
      
      let pendingDeletes = 0;
      let batch = writeBatch(db);
      const deletedPaths = new Set();

      const commitIfNeeded = async (force = false) => {
        if (force || pendingDeletes >= 400) {
          await batch.commit();
          batch = writeBatch(db);
          pendingDeletes = 0;
        }
      };
      
      // Delete conversations and their messages
      for (const conversationDoc of conversationsSnapshot.docs) {
        const conversationId = conversationDoc.id;
        
        // Delete messages in this conversation
        const messagesQuery = query(
          collection(db, 'conversations', conversationId, 'messages')
        );
        const messagesSnapshot = await getDocs(messagesQuery);
        
        messagesSnapshot.docs.forEach((messageDoc) => {
          const p = messageDoc.ref.path;
          if (!deletedPaths.has(p)) {
            batch.delete(messageDoc.ref);
            deletedPaths.add(p);
            pendingDeletes += 1;
          }
        });
        await commitIfNeeded();
        
        // Delete the conversation document
        const convPath = `conversations/${conversationId}`;
        if (!deletedPaths.has(convPath)) {
          batch.delete(conversationDoc.ref);
          deletedPaths.add(convPath);
          pendingDeletes += 1;
        }
        await commitIfNeeded();
      }
      
      // Delete user's memories (top-level collection)
      const memoriesQuery = query(
        collection(db, 'memories'),
        where('userId', '==', userId)
      );
      const memoriesSnapshot = await getDocs(memoriesQuery);
      
      memoriesSnapshot.docs.forEach((memoryDoc) => {
        const p = memoryDoc.ref.path;
        if (!deletedPaths.has(p)) {
          batch.delete(memoryDoc.ref);
          deletedPaths.add(p);
          pendingDeletes += 1;
        }
      });
      await commitIfNeeded();

      // Delete user's memories (nested under users/{uid}/memories) – if used
      try {
        const userMemoriesQuery = collection(db, 'users', userId, 'memories');
        const userMemoriesSnapshot = await getDocs(userMemoriesQuery);
        userMemoriesSnapshot.docs.forEach((memoryDoc) => {
          const p = memoryDoc.ref.path;
          if (!deletedPaths.has(p)) {
            batch.delete(memoryDoc.ref);
            deletedPaths.add(p);
            pendingDeletes += 1;
          }
        });
        await commitIfNeeded();
      } catch {}

      // Additionally, catch any stray 'memories' docs anywhere that belong to the user (via collection group)
      try {
        const { collectionGroup } = await import('firebase/firestore');
        const cgQuery = query(collectionGroup(db, 'memories'), where('userId', '==', userId));
        const cgSnapshot = await getDocs(cgQuery);
        cgSnapshot.docs.forEach((memoryDoc) => {
          const p = memoryDoc.ref.path;
          if (!deletedPaths.has(p)) {
            batch.delete(memoryDoc.ref);
            deletedPaths.add(p);
            pendingDeletes += 1;
          }
        });
        await commitIfNeeded();
      } catch {}
      
      // Execute any remaining deletions
      await commitIfNeeded(true);
      
    } catch (error) {
      console.error('Error clearing user data:', error);
      
      // Provide more specific error handling
      if (error.code === 'permission-denied') {
        throw new Error('Firestore güvenlik kuralları veri temizleme işlemine izin vermiyor. Lütfen geliştirici ile iletişime geçin.');
      } else if (error.code === 'unauthenticated') {
        throw new Error('Kimlik doğrulama gerekli. Lütfen tekrar giriş yapın.');
      } else {
        throw new Error('Veriler temizlenirken bir hata oluştu: ' + error.message);
      }
    }
  }

  async function deleteUserData(userId) {
    try {
      // Delete user's conversations
      const conversationsQuery = query(
        collection(db, 'conversations'),
        where('userId', '==', userId)
      );
      const conversationsSnapshot = await getDocs(conversationsQuery);
      
      const batch = writeBatch(db);
      
      // Delete conversations and their messages
      for (const conversationDoc of conversationsSnapshot.docs) {
        const conversationId = conversationDoc.id;
        
        // Delete messages in this conversation
        const messagesQuery = query(
          collection(db, 'conversations', conversationId, 'messages')
        );
        const messagesSnapshot = await getDocs(messagesQuery);
        
        messagesSnapshot.docs.forEach((messageDoc) => {
          batch.delete(messageDoc.ref);
        });
        
        // Delete the conversation document
        batch.delete(conversationDoc.ref);
      }
      
      // Delete user's memories
      const memoriesQuery = query(
        collection(db, 'memories'),
        where('userId', '==', userId)
      );
      const memoriesSnapshot = await getDocs(memoriesQuery);
      
      memoriesSnapshot.docs.forEach((memoryDoc) => {
        batch.delete(memoryDoc.ref);
      });
      
      // Delete user document
      batch.delete(doc(db, 'users', userId));
      
      // Execute all deletions
      await batch.commit();
      
    } catch (error) {
      console.error('Error deleting user data:', error);
      
      // Provide more specific error handling
      if (error.code === 'permission-denied') {
        throw new Error('Firestore güvenlik kuralları hesap silme işlemine izin vermiyor. Lütfen geliştirici ile iletişime geçin.');
      } else if (error.code === 'unauthenticated') {
        throw new Error('Kimlik doğrulama gerekli. Lütfen tekrar giriş yapın.');
      } else {
        throw new Error('Hesap verileri silinirken bir hata oluştu: ' + error.message);
      }
    }
  }

  async function forceLogout() {
    try {
      await signOut(auth);
      setCurrentUser(null);
    } catch (error) {
      console.error('Error during forced logout:', error);
      throw error;
    }
  }

  async function deleteAccount(currentPassword) {
    if (!currentUser) {
      throw new Error('No user logged in');
    }
    
    const userId = currentUser.uid;
    
    try {
      // Refresh user token to get latest email verification status
      await reloadUser();
      
      // Force token refresh to get updated email verification claim
      await currentUser.getIdToken(true);
      
      // Wait a bit for the token to be refreshed
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // First delete user data from Firestore
      await deleteUserData(userId);
      
      try {
        // Re-authenticate if password provided
        if (currentPassword) {
          const credential = EmailAuthProvider.credential(
            currentUser.email,
            currentPassword
          );
          await reauthenticateWithCredential(currentUser, credential);
        }
        
        // Try to delete the Firebase Auth user
        await deleteUser(currentUser);
        console.log('✅ Firebase Auth user deleted successfully');
      } catch (authError) {
        // If deletion fails due to re-auth requirement, continue anyway
        if (authError.code === 'auth/requires-recent-login') {
          console.log('⚠️ Auth deletion failed due to recent login requirement, but data was already deleted');
        } else {
          console.error('❌ Auth deletion failed for other reason:', authError);
          // Re-throw if it's not a re-auth issue
          throw authError;
        }
      }
      
      // Force logout to ensure auth state is cleared
      await forceLogout();
      
    } catch (error) {
      console.error('Delete account error:', error);
      throw error;
    }
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
    verifyEmail,
    reloadUser,
    deleteAccount,
    forceLogout,
    clearUserData
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
} 