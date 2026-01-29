import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { applyActionCode, getAuth, reload } from 'firebase/auth';
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
  const { t } = useTranslation();

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
        }
        
        setVerificationState({
          isVerifying: false,
          isSuccess: true,
          error: null
        });
        
        // Automatically redirect to login page after 5 seconds
        setTimeout(() => {
          navigate('/login?emailVerified=true');
        }, 5000);
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
  }, [location, navigate, auth]);

  return (
    <AuthRedirect requireEmailVerification={true}>
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
          </div>
        )}
        
        {!verificationState.isVerifying && !verificationState.isSuccess && (
          <div className={styles.error}>
            {verificationState.error}
          </div>
        )}
        
        <div className={styles.authLinks}>
          <Link to="/login">{t('auth.links.backToLogin')}</Link>
        </div>
        </div>
      </div>
    </AuthRedirect>
  );
};

export default VerifyEmail; 