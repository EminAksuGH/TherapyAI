import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import styles from './EmailVerificationBanner.module.css';

const EmailVerificationBanner = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const { currentUser, sendVerificationEmail } = useAuth();
  
  // Don't show the banner if user is not logged in or email is already verified
  if (!currentUser || currentUser.emailVerified) {
    return null;
  }
  
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
    <div className={styles.banner}>
      <div className={styles.content}>
        <p className={styles.warning}>
          <strong>E-posta adresiniz henüz doğrulanmamış.</strong> Tüm özelliklere erişmek için lütfen e-posta adresinizi doğrulayın.
        </p>
        {message && <p className={styles.success}>{message}</p>}
        {error && <p className={styles.error}>{error}</p>}
        <button 
          onClick={handleResendVerification} 
          disabled={loading} 
          className={styles.button}
        >
          {loading ? 'Gönderiliyor...' : 'Doğrulama e-postasını yeniden gönder'}
        </button>
      </div>
    </div>
  );
};

export default EmailVerificationBanner; 