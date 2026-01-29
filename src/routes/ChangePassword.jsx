import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { confirmPasswordReset } from 'firebase/auth';
import { auth } from '../firebase/firebase';
import AuthRedirect from '../components/AuthRedirect';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import styles from './Auth.module.css';
import { useTranslation } from 'react-i18next';

const ChangePassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  // URL parametrelerinden oobCode (eylem kodu) al
  const queryParams = new URLSearchParams(location.search);
  const oobCode = queryParams.get('oobCode');

  useEffect(() => {
    // Eğer oobCode yoksa, bu sayfaya yanlış erişilmiş
    if (!oobCode) {
      setError(t('auth.messages.invalidResetLink'));
      // Kullanıcıya hatayı görmesi için kısa bir süre ver, sonra yönlendir
      setTimeout(() => {
        setShouldRedirect(true);
      }, 2000);
    }
  }, [oobCode]);

  const validatePassword = (password) => {
    // Şifre en az 6 karakter olmalı
    return password.length >= 6;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Şifreleri doğrula
    if (!validatePassword(password)) {
      return setError(t('auth.messages.passwordMinLength'));
    }

    if (password !== confirmPassword) {
      return setError(t('auth.messages.passwordMismatch'));
    }

    try {
      setError('');
      setLoading(true);
      
      // Firebase ile şifre sıfırlamayı onayla
      await confirmPasswordReset(auth, oobCode, password);
      
      setMessage(t('auth.messages.resetSuccess'));
      
      // 3 saniye sonra giriş sayfasına yönlendir
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      console.error('Error updating password:', err);
      if (err.code === 'auth/invalid-action-code' || err.code === 'auth/expired-action-code') {
        setError(t('auth.messages.expiredResetLink'));
        // Kullanıcıya hatayı görmesi için kısa bir süre ver, sonra yönlendir
        setTimeout(() => {
          setShouldRedirect(true);
        }, 3000);
      } else if (err.code === 'auth/weak-password') {
        setError(t('auth.messages.passwordMinLength'));
      } else {
        setError(t('auth.messages.resetFailed'));
      }
    } finally {
      setLoading(false);
    }
  };

  // Geçerli sıfırlama kodu yoksa şifre sıfırlama sayfasına yönlendir
  if (shouldRedirect) {
    return <Navigate to="/forgot-password" replace />;
  }

  return (
    <AuthRedirect allowOobCode>
      <div className={styles.authContainer}>
        <div className={styles.authForm}>
                  <h2>{t('auth.titles.changePassword')}</h2>
        {error && <div className={styles.error}>{error}</div>}
        {message && <div className={styles.success}>{message}</div>}
        
        {!error || error === t('auth.messages.passwordMinLength') || error === t('auth.messages.passwordMismatch') ? (
          <form onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label htmlFor="password">{t('auth.labels.newPassword')}</label>
              <div className={styles.passwordInputContainer}>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading || message}
                  placeholder={t('auth.placeholders.passwordMin6')}
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  className={styles.passwordToggle}
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading || message}
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
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading || message}
                  placeholder={t('auth.placeholders.confirmNewPassword')}
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  className={styles.passwordToggle}
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={loading || message}
                  aria-label={showConfirmPassword ? t('auth.showHide.hidePassword') : t('auth.showHide.showPassword')}
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              className={styles.authButton}
              disabled={loading || message || !oobCode}
            >
              {loading ? t('auth.actions.updatePasswordLoading') : t('auth.actions.updatePassword')}
            </button>
          </form>
        ) : (
          <div className={styles.authLinks}>
            <a href="/forgot-password">{t('auth.links.requestResetLink')}</a>
          </div>
        )}
        </div>
      </div>
    </AuthRedirect>
  );
};

export default ChangePassword; 