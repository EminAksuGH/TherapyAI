import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './Auth.module.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    document.body.classList.add('auth-page');
    
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
  
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      return setError('Lütfen e-posta adresine bir \'@\' ekleyin');
    }
  
    try {
      setError('');
      setLoading(true);
      await login(formData.email, formData.password);
      navigate('/');
    } catch (err) {
   
      if (
        err.code === 'auth/user-not-found' ||
        err.code === 'auth/wrong-password' ||
        err.code === 'auth/invalid-credential'
      ) {
        setError('Geçersiz e-posta veya parola');
      } else if (err.code === 'auth/invalid-email') {
        setError('Lütfen e-posta adresine bir \'@\' ekleyin');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Çok fazla deneme. Daha sonra tekrar deneyin');
      } else {
        setError('Giriş başarısız');
      }
    
    
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className={styles.authContainer}>
      <div className={styles.authForm}>
        <h2>Giriş Yap</h2>
        {error && <div className={styles.error}>{error}</div>}
        
        <form onSubmit={handleSubmit}>
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

          <button 
            type="submit" 
            className={styles.authButton}
            disabled={loading}
          >
            {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
          </button>
        </form>
        
        <div className={styles.authLinks}>
          <Link to="/forgot-password">Parolamı Unuttum</Link>
        </div>
        
        <div className={styles.authLinks}>
          Hesabınız yok mu? <Link to="/signup">Kayıt Ol</Link>
        </div>
      </div>
    </div>
  );
};

export default Login; 