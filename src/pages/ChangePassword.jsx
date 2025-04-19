import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { confirmPasswordReset, verifyPasswordResetCode } from 'firebase/auth';
import { auth } from '../firebase/firebase';
import styles from './Auth.module.css';

const ChangePassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [email, setEmail] = useState('');
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Get the oobCode (action code) from the URL query parameters
  const queryParams = new URLSearchParams(location.search);
  const oobCode = queryParams.get('oobCode');
  const mode = queryParams.get('mode');

  useEffect(() => {
    // If no oobCode is provided, this page was accessed incorrectly
    if (!oobCode) {
      setError('Invalid password reset link. Please request a new password reset link.');
      setVerifying(false);
      // Set a short timeout before redirecting to give user time to see the error
      setTimeout(() => {
        setShouldRedirect(true);
      }, 2000);
      return;
    }

    // Verify the action code is valid
    const verifyCode = async () => {
      try {
        // Verify the password reset code is valid
        const email = await verifyPasswordResetCode(auth, oobCode);
        setEmail(email);
        setVerifying(false);
      } catch (err) {
        console.error('Error verifying reset code:', err);
        setError('This password reset link has expired or is invalid. Please request a new link.');
        setVerifying(false);
        // Set a short timeout before redirecting to give user time to see the error
        setTimeout(() => {
          setShouldRedirect(true);
        }, 3000);
      }
    };

    if (oobCode && mode === 'resetPassword') {
      verifyCode();
    } else if (oobCode) {
      // If there's an oobCode but mode is not resetPassword
      verifyCode();
    } else {
      setVerifying(false);
      // Redirect immediately if no oobCode
      setShouldRedirect(true);
    }
  }, [oobCode, mode]);

  const validatePassword = (password) => {
    // Password should be at least 6 characters
    return password.length >= 6;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate passwords
    if (!validatePassword(password)) {
      return setError('Password should be at least 6 characters long');
    }

    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }

    try {
      setError('');
      setLoading(true);
      
      // Confirm the password reset with Firebase
      await confirmPasswordReset(auth, oobCode, password);
      
      setMessage('Your password has been successfully updated. Redirecting to login...');
      
      // Redirect to login page after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      console.error('Error updating password:', err);
      if (err.code === 'auth/invalid-action-code' || err.code === 'auth/expired-action-code') {
        setError('This password reset link has expired or is invalid. Please request a new link.');
        // Set a short timeout before redirecting to give user time to see the error
        setTimeout(() => {
          setShouldRedirect(true);
        }, 3000);
      } else if (err.code === 'auth/weak-password') {
        setError('Password should be at least 6 characters long');
      } else {
        setError('Failed to reset password. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Redirect to forgot password page if there's no valid reset code
  if (shouldRedirect) {
    return <Navigate to="/forgot-password" replace />;
  }

  if (verifying) {
    return (
      <div className={styles.authContainer}>
        <div className={styles.authForm}>
          <h2>Verifying your link...</h2>
          <div className={styles.loading}>Please wait while we verify your reset link.</div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.authContainer}>
      <div className={styles.authForm}>
        <h2>Set New Password</h2>
        {error && <div className={styles.error}>{error}</div>}
        {message && <div className={styles.success}>{message}</div>}
        
        {email && !message ? (
          <p className={styles.notice}>Set a new password for {email}</p>
        ) : null}
        
        {(!error || error.includes('Password should be') || error.includes('Passwords do not match')) && email ? (
          <form onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label htmlFor="password">New Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading || message}
                required
                minLength={6}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading || message}
                required
                minLength={6}
              />
            </div>

            <button 
              type="submit" 
              className={styles.authButton}
              disabled={loading || message}
            >
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        ) : (
          <div className={styles.authLinks}>
            <a href="/forgot-password">Request a new reset link</a>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChangePassword; 