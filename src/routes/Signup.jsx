import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import AuthRedirect from '../components/AuthRedirect';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import styles from './Auth.module.css';
import { useTranslation } from 'react-i18next';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { signup, verifyEmail } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Add effect to set auth-page class on body
  useEffect(() => {
    if (typeof document === 'undefined') return;
    
    document.body.classList.add('auth-page');
    
    // Cleanup function to remove class when component unmounts
    return () => {
      if (typeof document !== 'undefined') {
        document.body.classList.remove('auth-page');
      }
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      return setError(t('auth.messages.invalidEmail'));
    }
    
    if (formData.password !== formData.confirmPassword) {
      return setError(t('auth.messages.passwordMismatch'));
    }

    if (formData.password.length < 6) {
      return setError(t('auth.messages.passwordMinLength'));
    }

    try {
      setError('');
      setLoading(true);
      
      // Create user with email and password
      const userCredential = await signup(formData.email, formData.password);
      
      // Update user profile with name
      await updateProfile(userCredential.user, {
        displayName: formData.name
      });
      
      // Send email verification
      try {
        await verifyEmail();
      } catch (verifyError) {
        console.error("Email verification error:", verifyError);
        // Continue anyway, just log the error
      }
      
      // Create user document in Firestore
      try {
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          name: formData.name,
          email: formData.email,
          emailVerified: false,
          createdAt: new Date(),
          lastActive: new Date(),
          preferences: {
            memoryEnabled: true
          }
        });
        
      } catch (firestoreErr) {
        console.error("Firestore error:", firestoreErr);
        // If there's a permission error, show a more meaningful message but continue
        if (firestoreErr.code === 'permission-denied') {
          // This is expected until email verification - no need to log
        }
      }
      
      setMessage(t('auth.messages.signupSuccess'));
      
      // Navigate to login after 5 seconds
      setTimeout(() => {
        navigate('/login');
      }, 5000);
    } catch (err) {
      console.error("Authentication error:", err);
      
      // Create more concise error message
      if (err.code === 'auth/email-already-in-use') {
        setError(t('auth.messages.emailInUse'));
      } else if (err.code === 'auth/invalid-email') {
        setError(t('auth.messages.invalidEmail'));
      } else if (err.code === 'auth/weak-password') {
        setError(t('auth.messages.weakPassword'));
      } else if (err.code === 'auth/network-request-failed') {
        setError(t('auth.messages.networkError'));
      } else {
        setError(t('auth.messages.signupFailed', { error: err.code || err.message }));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthRedirect requireEmailVerification={true}>
      <div className={styles.authContainer}>
        <div className={styles.authForm}>
          <h2>{t('auth.titles.signup')}</h2>
          {error && <div className={styles.error}>{error}</div>}
          {message && <div className={styles.success}>{message}</div>}
        
        {!message ? (
          <form onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label htmlFor="name">{t('auth.labels.name')}</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder={t('auth.placeholders.fullName')}
                required
              />
            </div>

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

            <div className={styles.formGroup}>
              <label htmlFor="confirmPassword">{t('auth.labels.confirmPassword')}</label>
              <div className={styles.passwordInputContainer}>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  className={styles.passwordToggle}
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? t('auth.showHide.hidePassword') : t('auth.showHide.showPassword')}
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              className={styles.authButton}
              disabled={loading}
            >
              {loading ? t('auth.actions.signupLoading') : t('auth.actions.signup')}
            </button>
          </form>
        ) : (
          <div className={styles.authLinks}>
            <Link to="/login">{t('auth.links.backToLogin')}</Link>
          </div>
        )}
        
        {!message && (
          <div className={styles.authLinks}>
            {t('auth.links.haveAccount')} <Link to="/login">{t('auth.links.login')}</Link>
          </div>
        )}
        </div>
      </div>
    </AuthRedirect>
  );
};

export default Signup; 