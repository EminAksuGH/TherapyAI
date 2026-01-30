import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { applyActionCode, getAuth, reload } from 'firebase/auth';
import { useAuth } from '../context/AuthContext';
import AuthRedirect from '../components/AuthRedirect';
import styles from './Auth.module.css';
import { useTranslation } from 'react-i18next';

const VerifyEmail = () => {
  const [verificationState, setVerificationState] = useState({
    isVerifying: true,
    isSuccess: false,
    error: null
  });
  const navigate = useNavigate();
  const location = useLocation();
  const auth = getAuth();
  const { currentUser } = useAuth();
  const { t } = useTranslation();

  // Handle redirect after email verification
  useEffect(() => {
    // Only redirect if verification was successful and we have a verified user
    if (verificationState.isSuccess && currentUser && currentUser.emailVerified) {
      // User is logged in and verified, redirect to home/chat
      const timer = setTimeout(() => {
        navigate('/', { replace: true });
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [verificationState.isSuccess, currentUser, navigate]);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    
    document.body.classList.add('auth-page');
    
    // Parse the URL for the action code (oobCode)
    const queryParams = new URLSearchParams(location.search);
    const actionCode = queryParams.get('oobCode');
    
    // If no action code is available, redirect to the login page
    if (!actionCode) {
      setVerificationState({
        isVerifying: false,
        isSuccess: false,
        error: t('auth.messages.invalidVerificationLink')
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
          
          // Force refresh the ID token to update email_verified claim in Firestore security rules
          // This is critical - without this, Firestore will still see email_verified as false
          await auth.currentUser.getIdToken(true);
          
          // Wait a moment for the token and auth state to propagate
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        setVerificationState({
          isVerifying: false,
          isSuccess: true,
          error: null
        });
        
        // If user is not logged in, redirect to login page after showing success message
        if (!auth.currentUser) {
          setTimeout(() => {
            navigate('/login?emailVerified=true');
          }, 3000);
        }
        // If user is logged in, the redirect will be handled by the useEffect above
      } catch (error) {
        setVerificationState({
          isVerifying: false,
          isSuccess: false,
          error: t('auth.messages.verifyFailed')
        });
      }
    };
    
    verifyEmail();
    
    return () => {
      if (typeof document !== 'undefined') {
        document.body.classList.remove('auth-page');
      }
    };
  }, [location, navigate, auth, t]);

  return (
    <AuthRedirect requireEmailVerification={true} allowOobCode={true}>
      <div className={styles.authContainer}>
        <div className={styles.authForm}>
          <h2>{t('auth.titles.verifyEmail')}</h2>
        
        {verificationState.isVerifying && (
          <div className={styles.loadingContainer}>
            <div className={styles.loadingSpinner}></div>
            <p>{t('auth.messages.verifyInProgress')}</p>
          </div>
        )}
        
        {!verificationState.isVerifying && verificationState.isSuccess && (
          <div className={styles.success}>
            {t('auth.messages.verifySuccess')}
            {currentUser && (
              <p style={{ marginTop: '10px', fontSize: '0.9em' }}>
                {t('auth.messages.redirectingToApp') || 'Redirecting to app...'}
              </p>
            )}
          </div>
        )}
        
        {!verificationState.isVerifying && !verificationState.isSuccess && (
          <div className={styles.error}>
            {verificationState.error}
          </div>
        )}
        
        {!verificationState.isVerifying && !currentUser && (
          <div className={styles.authLinks}>
            <Link to="/login">{t('auth.links.backToLogin')}</Link>
          </div>
        )}
        </div>
      </div>
    </AuthRedirect>
  );
};

export default VerifyEmail; 