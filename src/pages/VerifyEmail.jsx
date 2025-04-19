import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import styles from './Auth.module.css';

const VerifyEmail = () => {
  const [verifying, setVerifying] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const { verifyEmail, checkVerificationCode, currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Get the oobCode (action code) from the URL query parameters
  const queryParams = new URLSearchParams(location.search);
  const oobCode = queryParams.get('oobCode');
  const mode = queryParams.get('mode');

  useEffect(() => {
    // Check if we have an oobCode and if the mode is verifyEmail
    if (!oobCode || mode !== 'verifyEmail') {
      setError('Geçersiz e-posta doğrulama bağlantısı. Lütfen doğru bağlantıyı kullandığınızdan emin olun.');
      setVerifying(false);
      return;
    }

    const verifyUserEmail = async () => {
      try {
        // First check if the action code is valid
        await checkVerificationCode(oobCode);
        
        // Apply the verification code to confirm email
        await verifyEmail(oobCode);
        
        // If we have a currentUser, update their Firestore record
        if (currentUser && currentUser.uid) {
          try {
            // Update emailVerified field in Firestore
            const userRef = doc(db, 'users', currentUser.uid);
            await updateDoc(userRef, {
              emailVerified: true
            });
          } catch (err) {
            console.error('Error updating Firestore:', err);
            // Continue even if Firestore update fails
          }
        }
        
        setMessage('E-posta adresiniz başarıyla doğrulandı! Artık uygulamanın tüm özelliklerini kullanabilirsiniz.');
        
        // Redirect to home after 3 seconds
        setTimeout(() => {
          navigate('/');
        }, 3000);
      } catch (err) {
        console.error('Error verifying email:', err);
        if (err.code === 'auth/invalid-action-code' || err.code === 'auth/expired-action-code') {
          setError('Bu e-posta doğrulama bağlantısı geçersiz veya süresi dolmuş. Lütfen yeni bir doğrulama e-postası isteyin.');
        } else {
          setError('E-posta doğrulaması başarısız oldu. Lütfen daha sonra tekrar deneyin.');
        }
      } finally {
        setVerifying(false);
      }
    };

    verifyUserEmail();
  }, [oobCode, mode, verifyEmail, checkVerificationCode, currentUser, navigate]);

  if (verifying) {
    return (
      <div className={styles.authContainer}>
        <div className={styles.authForm}>
          <h2>E-posta Doğrulanıyor</h2>
          <div className={styles.loading}>Lütfen e-postanızı doğrularken bekleyin.</div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.authContainer}>
      <div className={styles.authForm}>
        <h2>E-posta Doğrulama</h2>
        {error && <div className={styles.error}>{error}</div>}
        {message && <div className={styles.success}>{message}</div>}
        
        {error && (
          <div className={styles.authLinks}>
            <Link to="/">Ana Sayfa'ya dön</Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail; 