import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthRedirect from '../components/AuthRedirect';
import styles from './Auth.module.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const { resetPassword } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setMessage('');
      setError('');
      setLoading(true);
      await resetPassword(email);
      setMessage('E-posta adresiniz sistemde kayıtlı ise şifre sıfırlama bağlantısı gönderilecektir. Lütfen gelen kutunuzu kontrol edin.');
    } catch (err) {
      // Handle network errors specifically, show same message for everything else
      if (err.code === 'auth/network-request-failed') {
        setError('Ağ bağlantısı hatası. Lütfen internet bağlantınızı kontrol edin.');
      } else {
        // Always show the same message for all other error types
        setMessage('E-posta adresiniz sistemde kayıtlı ise şifre sıfırlama bağlantısı gönderilecektir. Lütfen gelen kutunuzu kontrol edin.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthRedirect>
      <div className={styles.authContainer}>
        <div className={styles.authForm}>
                  <h2>Şifre Sıfırlama</h2>
        {error && <div className={styles.error}>{error}</div>}
        {message && <div className={styles.success}>{message}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="email">E-posta</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="E-posta adresiniz"
              required
            />
          </div>

          <button 
            type="submit" 
            className={styles.authButton}
            disabled={loading}
          >
            {loading ? 'Gönderiliyor...' : 'Şifre Sıfırla'}
          </button>
        </form>
        
        <div className={styles.authLinks}>
          <Link to="/login">Giriş sayfasına dön</Link>
        </div>
        
        <div className={styles.authLinks}>
          Hesabınız yok mu? <Link to="/signup">Kayıt Ol</Link>
        </div>
        </div>
      </div>
    </AuthRedirect>
  );
};

export default ForgotPassword; 