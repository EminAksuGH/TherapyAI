import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthRedirect from '../components/AuthRedirect';
import styles from './Auth.module.css';
import { useTranslation } from 'react-i18next';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const { resetPassword } = useAuth();
  const { t } = useTranslation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setMessage('');
      setError('');
      setLoading(true);
      await resetPassword(email);
      setMessage(t('auth.messages.resetSent'));
    } catch (err) {
      // Handle network errors specifically, show same message for everything else
      if (err.code === 'auth/network-request-failed') {
        setError(t('auth.messages.resetNetworkError'));
      } else {
        // Always show the same message for all other error types
        setMessage(t('auth.messages.resetSent'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthRedirect>
      <div className={styles.authContainer}>
        <div className={styles.authForm}>
                  <h2>{t('auth.titles.forgotPassword')}</h2>
        {error && <div className={styles.error}>{error}</div>}
        {message && <div className={styles.success}>{message}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="email">{t('auth.labels.email')}</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('auth.placeholders.email')}
              required
            />
          </div>

          <button 
            type="submit" 
            className={styles.authButton}
            disabled={loading}
          >
            {loading ? t('auth.actions.resetPasswordLoading') : t('auth.actions.resetPassword')}
          </button>
        </form>
        
        <div className={styles.authLinks}>
          <Link to="/login">{t('auth.links.backToLogin')}</Link>
        </div>
        
        <div className={styles.authLinks}>
          {t('auth.links.noAccount')} <Link to="/signup">{t('auth.links.signup')}</Link>
        </div>
        </div>
      </div>
    </AuthRedirect>
  );
};

export default ForgotPassword; 