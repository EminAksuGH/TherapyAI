import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { updateProfile, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { db } from '../firebase/firebase';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import styles from './EditProfile.module.css';

const EditProfile = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deleteAccountVisible, setDeleteAccountVisible] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showDeletePassword, setShowDeletePassword] = useState(false);
  const { currentUser, deleteAccount } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (currentUser) {
          const userDocRef = doc(db, 'users', currentUser.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setFormData(prev => ({
              ...prev,
              name: userData.name || '',
              email: currentUser.email || ''
            }));
          } else {
            setFormData(prev => ({
              ...prev,
              name: currentUser.displayName || '',
              email: currentUser.email || ''
            }));
          }
        }
      } catch (err) {
        setError('Kullanıcı bilgileri yüklenemedi.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [currentUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const updateUserProfile = async () => {
    try {
      if (!currentUser) return false;
      
      // Check if the document exists first
      const userDocRef = doc(db, 'users', currentUser.uid);
      const userDoc = await getDoc(userDocRef);
      
      // Use setDoc with merge option to handle both create and update
      await setDoc(userDocRef, {
        name: formData.name,
        email: currentUser.email,
        updatedAt: new Date(),
        ...(userDoc.exists() ? {} : { createdAt: new Date() }) // Add createdAt only if document doesn't exist
      }, { merge: true });

      // Update Firebase Auth profile
      await updateProfile(currentUser, {
        displayName: formData.name
      });

      return true;
    } catch (err) {
      console.error("Error updating profile:", err);
      return false;
    }
  };

  const updateUserPassword = async () => {
    if (!formData.currentPassword || !formData.newPassword) return true; // Skip if no password provided
    
    if (formData.newPassword !== formData.confirmPassword) {
      setError('Yeni şifreler eşleşmiyor.');
      return false;
    }

    try {
      // Re-authenticate user
      const credential = EmailAuthProvider.credential(
        currentUser.email,
        formData.currentPassword
      );
      
      await reauthenticateWithCredential(currentUser, credential);
      
      // Update password
      await updatePassword(currentUser, formData.newPassword);
      
      return true;
    } catch (err) {
      console.error("Error updating password:", err);
      if (err.code === 'auth/wrong-password') {
        setError('Mevcut şifre yanlış.');
      } else {
        setError('Şifre güncellenirken bir hata oluştu.');
      }
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setError('');
    setSuccess('');

    try {
      if (!currentUser) throw new Error('Kullanıcı oturumu bulunamadı');

      // Validate password fields if attempting to change password
      if (formData.newPassword || formData.confirmPassword || formData.currentPassword) {
        if (formData.newPassword !== formData.confirmPassword) {
          setError('Yeni şifreler eşleşmiyor.');
          setUpdating(false);
          return;
        }
        
        if (formData.newPassword && !formData.currentPassword) {
          setError('Şifre değiştirmek için mevcut şifrenizi girmelisiniz.');
          setUpdating(false);
          return;
        }
      }

      // Update profile information
      const profileUpdated = await updateUserProfile();
      
      // Update password if provided
      let passwordChanged = true;
      if (formData.newPassword) {
        passwordChanged = await updateUserPassword();
      }

      if (profileUpdated && passwordChanged) {
        setSuccess('Profiliniz başarıyla güncellendi.');
        
        // Clear password fields
        setFormData(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }));
      }
    } catch (err) {
      console.error("Profile update error:", err);
      setError(`Profil güncellenirken bir hata oluştu: ${err.message || 'Bilinmeyen hata'}`);
    } finally {
      setUpdating(false);
    }
  };

  // Delete Account Functions
  const handleDeleteAccount = () => {
    if (window.confirm(
      'Bu işlem geri alınamaz! Hesabınızı ve tüm verilerinizi kalıcı olarak silecektir. Devam etmek istediğinizden emin misiniz?'
    )) {
      setDeleteAccountVisible(true);
    }
  };

  const confirmDeleteAccount = async () => {
    if (!currentUser) return;
    
    setIsDeleting(true);
    setError('');
    
    try {
      await deleteAccount(deletePassword);
      
      // Close the modal immediately
      setDeleteAccountVisible(false);
      setIsDeleting(false);
      setDeletePassword('');
      
      // Navigate to home page and show success message
      navigate('/', { replace: true });
      
      // Show success message after navigation
      setTimeout(() => {
        alert('Hesap verileriniz başarıyla silindi ve oturumunuz kapatıldı.');
      }, 100);
      
    } catch (error) {
      setIsDeleting(false);
      console.error('Delete account error:', error);
      
      let errorMessage = 'Hesap silinirken bir hata oluştu. Lütfen tekrar deneyin.';
      
      if (error.code === 'auth/wrong-password') {
        errorMessage = 'Şifre yanlış. Lütfen doğru şifrenizi girin.';
      } else if (error.code === 'auth/requires-recent-login') {
        errorMessage = 'Güvenlik nedeniyle lütfen çıkış yapıp tekrar giriş yapın, sonra hesabınızı silin.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
    }
  };

  if (loading) return <div className={styles.loading}>Yükleniyor...</div>;

  return (
    <div className={styles.editProfileContainer}>
      <div className={styles.editProfileCard}>
        <h2>Profili Düzenle</h2>
        
        {error && <div className={styles.error}>{error}</div>}
        {success && <div className={styles.success}>{success}</div>}
        
        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Basic Info Section */}
          <div className={styles.formSection}>
            <h3>Kullanıcı Bilgileri</h3>
            
            <div className={styles.formGroup}>
              <label htmlFor="name">Ad Soyad</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Ad Soyad"
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
                disabled
                className={styles.disabledInput}
              />
              <small>E-posta adresi değiştirilemez</small>
            </div>
          </div>
          
          {/* Password Section */}
          <div className={styles.formSection}>
            <h3>Şifre Değiştir</h3>
            <div className={styles.formGroup}>
              <label htmlFor="currentPassword">Mevcut Şifre</label>
              <div className={styles.passwordInputContainer}>
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  id="currentPassword"
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  placeholder="Mevcut şifreniz"
                />
                <button
                  type="button"
                  className={styles.passwordToggle}
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  aria-label={showCurrentPassword ? "Şifreyi gizle" : "Şifreyi göster"}
                >
                  {showCurrentPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="newPassword">Yeni Şifre</label>
              <div className={styles.passwordInputContainer}>
                <input
                  type={showNewPassword ? "text" : "password"}
                  id="newPassword"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  placeholder="Yeni şifre"
                />
                <button
                  type="button"
                  className={styles.passwordToggle}
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  aria-label={showNewPassword ? "Şifreyi gizle" : "Şifreyi göster"}
                >
                  {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="confirmPassword">Yeni Şifre (Tekrar)</label>
              <div className={styles.passwordInputContainer}>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Yeni şifre tekrar"
                />
                <button
                  type="button"
                  className={styles.passwordToggle}
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? "Şifreyi gizle" : "Şifreyi göster"}
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>
            <small className={styles.passwordNote}>Şifrenizi değiştirmek istemiyorsanız bu alanları boş bırakın.</small>
          </div>
          
          <div className={styles.formActions}>
            <button 
              type="button" 
              className={styles.cancelButton}
              onClick={() => navigate('/')}
            >
              İptal
            </button>
            <button 
              type="submit" 
              className={styles.saveButton}
              disabled={updating}
            >
              {updating ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
          </div>
        </form>

        {/* Delete Account Section */}
        <div className={styles.dangerZone}>
          <h3>Tehlike Bölgesi</h3>
          <p>Bu işlem geri alınamaz. Hesabınızı ve tüm verilerinizi kalıcı olarak siler.</p>
          <button 
            type="button" 
            className={styles.deleteButton}
            onClick={handleDeleteAccount}
          >
            Hesabı Sil
          </button>
        </div>
      </div>

      {/* Delete Account Modal */}
      {deleteAccountVisible && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h3>Hesabı Sil</h3>
            <p>Bu işlem geri alınamaz! Tüm verileriniz kalıcı olarak silinecektir.</p>
            <div className={styles.formGroup}>
              <label htmlFor="deletePassword">Şifrenizi girin:</label>
              <div className={styles.passwordInputContainer}>
                <input
                  type={showDeletePassword ? "text" : "password"}
                  id="deletePassword"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  placeholder="Mevcut şifreniz"
                  disabled={isDeleting}
                />
                <button
                  type="button"
                  className={styles.passwordToggle}
                  onClick={() => setShowDeletePassword(!showDeletePassword)}
                  disabled={isDeleting}
                  aria-label={showDeletePassword ? "Şifreyi gizle" : "Şifreyi göster"}
                >
                  {showDeletePassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>
            {error && <div className={styles.error}>{error}</div>}
            <div className={styles.modalActions}>
              <button 
                type="button" 
                className={styles.cancelButton}
                onClick={() => {
                  setDeleteAccountVisible(false);
                  setDeletePassword('');
                  setError('');
                }}
                disabled={isDeleting}
              >
                İptal
              </button>
              <button 
                type="button" 
                className={styles.confirmDeleteButton}
                onClick={confirmDeleteAccount}
                disabled={!deletePassword || isDeleting}
              >
                {isDeleting ? 'Siliniyor...' : 'Hesabı Sil'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditProfile; 