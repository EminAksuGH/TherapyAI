import React, { useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './EmailVerifiedRoute.module.css';

const EmailVerifiedRoute = () => {
  const { currentUser, sendVerificationEmail } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // If user is not authenticated, redirect to login
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // If user's email is verified, render the child routes
  if (currentUser.emailVerified) {
    return <Outlet />;
  }

  // If we're here, the user is logged in but email is not verified
  const handleResendVerification = async () => {
    try {
      setLoading(true);
      setMessage('');
      setError('');
      await sendVerificationEmail();
      setMessage('Doğrulama e-postası gönderildi. Lütfen gelen kutunuzu kontrol edin.');
    } catch (err) {
      setError('Doğrulama e-postası gönderilemedi. Lütfen daha sonra tekrar deneyin.');
      console.error('Error sending verification email:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h2>E-posta Doğrulaması Gerekli</h2>
        <p>
          Bu sayfaya erişmek için e-posta adresinizi doğrulamanız gerekmektedir.
          Lütfen <strong>{currentUser.email}</strong> adresine gönderdiğimiz doğrulama e-postasını kontrol edin
          ve içindeki bağlantıya tıklayın.
        </p>

        {message && <div className={styles.message}>{message}</div>}
        {error && <div className={styles.error}>{error}</div>}

        <button 
          onClick={handleResendVerification} 
          disabled={loading}
          className={styles.button}
        >
          {loading ? 'Gönderiliyor...' : 'Doğrulama e-postasını yeniden gönder'}
        </button>

        <div className={styles.links}>
          <a href="/" className={styles.link}>Ana Sayfa'ya Dön</a>
        </div>
      </div>
    </div>
  );
};

export default EmailVerifiedRoute; 