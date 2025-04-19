import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import styles from './Auth.module.css';

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
  const { signup, sendVerificationEmail } = useAuth();
  const navigate = useNavigate();

  // Add effect to set auth-page class on body
  useEffect(() => {
    document.body.classList.add('auth-page');
    
    // Cleanup function to remove class when component unmounts
    return () => {
      document.body.classList.remove('auth-page');
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
      return setError('Lütfen e-posta adresine bir \'@\' ekleyin');
    }
    
    if (formData.password !== formData.confirmPassword) {
      return setError('Parolalar eşleşmiyor');
    }

    if (formData.password.length < 6) {
      return setError('Parola en az 6 karakter olmalıdır');
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
      
      // Create user document in Firestore
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        name: formData.name,
        email: formData.email,
        emailVerified: false,
        createdAt: new Date()
      });
      
      // Send verification email
      await sendVerificationEmail();
      
      setMessage('Hesabınız oluşturuldu. Lütfen e-posta adresinizi doğrulamak için gönderdiğimiz e-postadaki bağlantıya tıklayın.');
      
      // Navigate to home after 5 seconds
      setTimeout(() => {
        navigate('/');
      }, 5000);
    } catch (err) {
      // Create more concise error message
      if (err.code === 'auth/email-already-in-use') {
        setError('Bu e-posta adresi zaten kullanımda');
      } else if (err.code === 'auth/invalid-email') {
        setError('Lütfen e-posta adresine bir \'@\' ekleyin');
      } else if (err.code === 'auth/weak-password') {
        setError('Parola çok zayıf');
      } else {
        setError('Hesap oluşturma başarısız oldu');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authForm}>
        <h2>Hesap Oluştur</h2>
        {error && <div className={styles.error}>{error}</div>}
        {message && <div className={styles.success}>{message}</div>}
        
        {!message ? (
          <form onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label htmlFor="name">Ad Soyad</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="email">E-posta</label>
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
              <label htmlFor="password">Parola</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="confirmPassword">Parolayı Onaylayın</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>

            <button 
              type="submit" 
              className={styles.authButton}
              disabled={loading}
            >
              {loading ? 'Hesap oluşturuluyor...' : 'Kayıt Ol'}
            </button>
          </form>
        ) : (
          <div className={styles.authLinks}>
            <Link to="/login">Giriş sayfasına dön</Link>
          </div>
        )}
        
        {!message && (
          <div className={styles.authLinks}>
            Zaten bir hesabınız var mı? <Link to="/login">Giriş Yap</Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Signup; 