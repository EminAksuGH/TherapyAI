import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { applyActionCode, getAuth, reload } from 'firebase/auth';
import { useAuth } from '../context/AuthContext';
import styles from './Auth.module.css';

const VerifyEmail = () => {
  const [verificationState, setVerificationState] = useState({
    isVerifying: true,
    isSuccess: false,
    error: null
  });
  const navigate = useNavigate();
  const location = useLocation();
  const auth = getAuth();
  const { currentUser, reloadUser, ensureUserDocument } = useAuth();

  useEffect(() => {
    document.body.classList.add('auth-page');
    
    // Parse the URL for the action code (oobCode)
    const queryParams = new URLSearchParams(location.search);
    const actionCode = queryParams.get('oobCode');
    
    // If no action code is available, redirect to the login page
    if (!actionCode) {
      setVerificationState({
        isVerifying: false,
        isSuccess: false,
        error: 'Geçersiz veya süresi dolmuş doğrulama bağlantısı.'
      });
      return;
    }
    
    // Verify the email
    const verifyEmail = async () => {
      try {
        await applyActionCode(auth, actionCode);
        
        // Reload the auth state to update emailVerified status
        if (auth.currentUser) {
          await reload(auth.currentUser);
          
          // Force token refresh
          await auth.currentUser.getIdToken(true);
          
          // Update user document in Firestore
          if (auth.currentUser.emailVerified) {
            await ensureUserDocument(auth.currentUser);
          }
          
          // Use our custom reloadUser to update context
          await reloadUser();
        }
        
        setVerificationState({
          isVerifying: false,
          isSuccess: true,
          error: null
        });
        
        // Check if user is already logged in
        if (currentUser) {
          // If logged in and verified, redirect to home/protected area
          setTimeout(() => {
            navigate('/profile'); // or any other protected route
          }, 3000);
        } else {
          // If not logged in, redirect to login page
          setTimeout(() => {
            navigate('/login?emailVerified=true');
          }, 3000);
        }
      } catch (error) {
        console.error("Email verification error:", error);
        setVerificationState({
          isVerifying: false,
          isSuccess: false,
          error: 'E-posta doğrulama işlemi başarısız oldu. Bağlantı geçersiz veya süresi dolmuş olabilir.'
        });
      }
    };
    
    verifyEmail();
    
    return () => {
      document.body.classList.remove('auth-page');
    };
  }, [location, navigate, auth, reloadUser, ensureUserDocument, currentUser]);

  return (
    <div className={styles.authContainer}>
      <div className={styles.authForm}>
        <h2>E-posta Doğrulama</h2>
        
        {verificationState.isVerifying && (
          <div className={styles.loadingContainer}>
            <div className={styles.loadingSpinner}></div>
            <p>E-posta adresiniz doğrulanıyor...</p>
          </div>
        )}
        
        {!verificationState.isVerifying && verificationState.isSuccess && (
          <div className={styles.success}>
            <p>E-posta adresiniz başarıyla doğrulandı!</p>
            {currentUser ? (
              <p>Profilinize yönlendiriliyorsunuz...</p>
            ) : (
              <p>Giriş sayfasına yönlendiriliyorsunuz...</p>
            )}
          </div>
        )}
        
        {!verificationState.isVerifying && !verificationState.isSuccess && (
          <div className={styles.error}>
            {verificationState.error}
          </div>
        )}
        
        <div className={styles.authLinks}>
          {currentUser ? (
            <Link to="/profile">Profilime git</Link>
          ) : (
            <Link to="/login">Giriş sayfasına dön</Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail; 