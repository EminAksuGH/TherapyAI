import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import MemoryManager from '../components/MemoryManager';
import styles from './Profile.module.css';

const Profile = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (currentUser) {
          const userDocRef = doc(db, 'users', currentUser.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            setUserData(userDoc.data());
          } else {
            setUserData({
              name: currentUser.displayName || 'User',
              email: currentUser.email,
            });
          }
        }
      } catch (err) {
        setError('Failed to load user data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [currentUser]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      setError('Failed to log out');
    }
  };

  if (loading) return <div className={styles.loading}>Loading profile...</div>;

  return (
    <div className={styles.profileContainer}>
      <div className={styles.profileCard}>
        <h2>User Profile</h2>
        
        {error && <div className={styles.error}>{error}</div>}
        
        <div className={styles.profileInfo}>
          <div className={styles.avatar}>
            {userData?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          
          <div className={styles.details}>
            <h3>{userData?.name}</h3>
            <p>{userData?.email}</p>
            <p>Member since: {userData?.createdAt ? new Date(userData.createdAt.toDate()).toLocaleDateString() : 'N/A'}</p>
          </div>
        </div>
        
        <div className={styles.actions}>
          <button 
            className={styles.editButton}
            onClick={() => navigate('/edit-profile')}
          >
            Edit Profile
          </button>
          
          <button 
            className={styles.logoutButton}
            onClick={handleLogout}
          >
            Log Out
          </button>
        </div>
      </div>
      
      <div className={styles.memorySection}>
        <MemoryManager />
      </div>
    </div>
  );
};

export default Profile; 