import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { confirmPasswordReset } from 'firebase/auth';
import { auth } from '../firebase/firebase';
import AuthRedirect from '../components/AuthRedirect';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import styles from './Auth.module.css';

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

  // URL parametrelerinden oobCode (eylem kodu) al
  const queryParams = new URLSearchParams(location.search);
  const oobCode = queryParams.get('oobCode');

  useEffect(() => {
    // Eğer oobCode yoksa, bu sayfaya yanlış erişilmiş
    if (!oobCode) {
      setError('Geçersiz şifre sıfırlama bağlantısı. Lütfen yeni bir şifre sıfırlama bağlantısı isteyin.');
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
      return setError('Şifre en az 6 karakter olmalıdır');
    }

    if (password !== confirmPassword) {
      return setError('Şifreler eşleşmiyor');
    }

    try {
      setError('');
      setLoading(true);
      
      // Firebase ile şifre sıfırlamayı onayla
      await confirmPasswordReset(auth, oobCode, password);
      
      setMessage('Şifreniz başarıyla güncellendi. Giriş sayfasına yönlendiriliyorsunuz...');
      
      // 3 saniye sonra giriş sayfasına yönlendir
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      console.error('Error updating password:', err);
      if (err.code === 'auth/invalid-action-code' || err.code === 'auth/expired-action-code') {
        setError('Bu şifre sıfırlama bağlantısının süresi dolmuş veya geçersiz. Lütfen yeni bir bağlantı isteyin.');
        // Kullanıcıya hatayı görmesi için kısa bir süre ver, sonra yönlendir
        setTimeout(() => {
          setShouldRedirect(true);
        }, 3000);
      } else if (err.code === 'auth/weak-password') {
        setError('Şifre en az 6 karakter olmalıdır');
      } else {
        setError('Şifre sıfırlama başarısız oldu. Lütfen tekrar deneyin.');
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
                  <h2>Yeni Şifre Belirle</h2>
        {error && <div className={styles.error}>{error}</div>}
        {message && <div className={styles.success}>{message}</div>}
        
        {!error || error.includes('Şifre en az') || error.includes('Şifreler eşleşmiyor') ? (
          <form onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label htmlFor="password">Yeni Şifre</label>
              <div className={styles.passwordInputContainer}>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading || message}
                  placeholder="En az 6 karakter"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  className={styles.passwordToggle}
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading || message}
                  aria-label={showPassword ? "Şifreyi gizle" : "Şifreyi göster"}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="confirmPassword">Şifreyi Onayla</label>
              <div className={styles.passwordInputContainer}>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading || message}
                  placeholder="Yeni şifrenizi tekrar girin"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  className={styles.passwordToggle}
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={loading || message}
                  aria-label={showConfirmPassword ? "Şifreyi gizle" : "Şifreyi göster"}
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
              {loading ? 'Güncelleniyor...' : 'Şifreyi Güncelle'}
            </button>
          </form>
        ) : (
          <div className={styles.authLinks}>
            <a href="/forgot-password">Yeni sıfırlama bağlantısı iste</a>
          </div>
        )}
        </div>
      </div>
    </AuthRedirect>
  );
};

export default ChangePassword; 