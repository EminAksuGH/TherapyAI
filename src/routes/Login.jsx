import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthRedirect from '../components/AuthRedirect';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import styles from './Auth.module.css';
import { useTranslation } from 'react-i18next';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailVerificationState, setEmailVerificationState] = useState({
    needsVerification: false,
    email: ''
  });
  const { login, verifyEmail, currentUser, logout, reloadUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  useEffect(() => {
    if (typeof document === 'undefined') return;
    
    document.body.classList.add('auth-page');
    
    // Check URL parameters
    const params = new URLSearchParams(location.search);
    const emailVerified = params.get('emailVerified');
    const requireVerification = params.get('requireVerification');
    
    if (emailVerified === 'true') {
      setMessage(t('auth.messages.emailVerifiedSuccess'));
      
      // If the user is already logged in, reload auth state to update emailVerified status
      if (currentUser) {
        const reloadAuthState = async () => {
          try {
            await reloadUser();
          } catch (error) {
            console.error("Error reloading auth state:", error);
          }
        };
        reloadAuthState();
      }
    }
    
    // Handle redirect from protected routes
    if (requireVerification === 'true' && currentUser) {
      setError(t('auth.messages.requireVerification'));
      setEmailVerificationState({
        needsVerification: true,
        email: currentUser.email
      });
      
      // Log user out to prevent redirect loops
      logout();
    }
    
    return () => {
      if (typeof document !== 'undefined') {
        document.body.classList.remove('auth-page');
      }
    };
  }, [location, currentUser, logout]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleResendVerification = async () => {
    try {
      setResendLoading(true);
      await verifyEmail();
      setMessage(t('auth.messages.resendSuccess'));
      setEmailVerificationState({ needsVerification: false, email: '' });
    } catch (err) {
      setError(t('auth.messages.resendError'));
    } finally {
      setResendLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      return setError(t('auth.messages.invalidEmail'));
    }
  
    try {
      setError('');
      setMessage('');
      setLoading(true);
      const userCredential = await login(formData.email, formData.password);
      
      // Check if email is verified
      if (!userCredential.user.emailVerified) {
        setError(t('auth.messages.unverifiedEmail'));
        setEmailVerificationState({
          needsVerification: true,
          email: formData.email
        });
        return;
      }
      
      navigate('/');
    } catch (err) {
   
      if (
        err.code === 'auth/user-not-found' ||
        err.code === 'auth/wrong-password' ||
        err.code === 'auth/invalid-credential'
      ) {
        setError(t('auth.messages.invalidCredentials'));
      } else if (err.code === 'auth/invalid-email') {
        setError(t('auth.messages.invalidEmail'));
      } else if (err.code === 'auth/too-many-requests') {
        setError(t('auth.messages.tooManyRequests'));
      } else {
        setError(t('auth.messages.loginFailed'));
      }
    
    
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <AuthRedirect requireEmailVerification={true}>
      <div className={styles.authContainer}>
        <div className={styles.authForm}>
          <h2>{t('auth.titles.login')}</h2>
          {error && <div className={styles.error}>{error}</div>}
          {message && <div className={styles.success}>{message}</div>}
        
        {emailVerificationState.needsVerification ? (
          <div className={styles.verificationNotice}>
            <p>{t('auth.verification.notVerified', { email: emailVerificationState.email })}</p>
            <p>{t('auth.verification.requiresVerification')}</p>
            <button 
              onClick={handleResendVerification} 
              className={styles.resendButton}
              disabled={resendLoading}
            >
              {resendLoading ? t('auth.actions.resendVerificationLoading') : t('auth.actions.resendVerification')}
            </button>
            <div className={styles.authLinks}>
              <Link to="/login" onClick={() => setEmailVerificationState({ needsVerification: false, email: '' })}>
                {t('auth.links.backToLogin')}
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label htmlFor="email">{t('auth.labels.email')}</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="password">{t('auth.labels.password')}</label>
              <div className={styles.passwordInputContainer}>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  className={styles.passwordToggle}
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? t('auth.showHide.hidePassword') : t('auth.showHide.showPassword')}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              className={styles.authButton}
              disabled={loading}
            >
              {loading ? t('auth.actions.loginLoading') : t('auth.actions.login')}
            </button>
          </form>
        )}
        
        {!emailVerificationState.needsVerification && (
          <>
            <div className={styles.authLinks}>
              <Link to="/forgot-password">{t('auth.links.forgotPassword')}</Link>
            </div>
            
            <div className={styles.authLinks}>
              {t('auth.links.noAccount')} <Link to="/signup">{t('auth.links.signup')}</Link>
            </div>
          </>
        )}
        </div>
      </div>
    </AuthRedirect>
  );
};

export default Login; 