import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { updateProfile, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { db } from '../firebase/firebase';
import { FaEye, FaEyeSlash, FaExclamationTriangle, FaShieldAlt, FaTrash } from 'react-icons/fa';
import styles from './EditProfile.module.css';

const EditProfile = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [originalName, setOriginalName] = useState('');
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
            const userName = userData.name || '';
            setFormData(prev => ({
              ...prev,
              name: userName,
              email: currentUser.email || ''
            }));
            setOriginalName(userName);
          } else {
            const displayName = currentUser.displayName || '';
            setFormData(prev => ({
              ...prev,
              name: displayName,
              email: currentUser.email || ''
            }));
            setOriginalName(displayName);
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

  // Check if save button should be enabled
  const isSaveEnabled = () => {
    // Check if name has changed
    const nameChanged = formData.name !== originalName;
    
    // Check if password change is attempted (all three fields must be filled)
    const isPasswordChangeAttempted = formData.currentPassword && formData.newPassword && formData.confirmPassword;
    
    // Enable if name changed OR all password fields are filled for password change
    return nameChanged || isPasswordChangeAttempted;
  };

  // Get password validation message for real-time feedback
  const getPasswordValidationMessage = () => {
    if (!formData.newPassword) return null;
    return validatePassword(formData.newPassword);
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

  // Validate password requirements
  const validatePassword = (password) => {
    if (password.length < 6) {
      return 'Şifreniz en az 6 karakterden oluşmalı.';
    }
    if (password.length > 128) {
      return 'Şifreniz en fazla 128 karakter olabilir.';
    }
    return null; // No error
  };

  const updateUserPassword = async () => {
    if (!formData.currentPassword || !formData.newPassword) return true; // Skip if no password provided
    
    // Validate new password
    const passwordError = validatePassword(formData.newPassword);
    if (passwordError) {
      setError(passwordError);
      return false;
    }
    
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
      } else if (err.code === 'auth/weak-password') {
        setError('Şifre çok zayıf. Daha güçlü bir şifre seçin.');
      } else if (err.code === 'auth/requires-recent-login') {
        setError('Güvenlik nedeniyle lütfen çıkış yapıp tekrar giriş yapın, sonra şifrenizi değiştirin.');
      } else {
        setError('Şifre güncellenirken bir hata oluştu. Mevcut şifrenizi doğru girdiğinizden emin olun.');
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
        
        // Update original name to current name
        setOriginalName(formData.name);
        
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
              {getPasswordValidationMessage() && (
                <small className={styles.passwordValidationError}>
                  {getPasswordValidationMessage()}
                </small>
              )}
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
          
          {/* Error and Success Messages */}
          {error && <div className={styles.error}>{error}</div>}
          {success && <div className={styles.success}>{success}</div>}
          
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
              disabled={updating || !isSaveEnabled()}
            >
              {updating ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
          </div>
        </form>

        {/* Delete Account Section */}
        <div className={styles.dangerZone}>
          <div className={styles.dangerHeader}>
            <div className={styles.dangerIcon}>
              <FaExclamationTriangle />
            </div>
            <div className={styles.dangerTitle}>
              <h3>Hesap Silme</h3>
              <p>Bu işlem geri alınamaz ve kalıcıdır</p>
            </div>
          </div>
          
          <div className={styles.deleteAccountCard}>
            <div className={styles.deleteInfo}>
              <h4>Hesabınızı sildiğinizde:</h4>
              <ul className={styles.deleteList}>
                <li>Tüm konuşma geçmişiniz silinir</li>
                <li>Kaydedilen hatıralarınız silinir</li>
                <li>Profil bilgileriniz silinir</li>
                <li>Bu hesaba bir daha erişemezsiniz</li>
              </ul>
            </div>
            
            <div className={styles.deleteActions}>
              <div className={styles.deleteWarning}>
                <FaShieldAlt className={styles.warningIcon} />
                <span>Bu işlem geri alınamaz!</span>
              </div>
              <button 
                type="button" 
                className={styles.deleteButton}
                onClick={handleDeleteAccount}
              >
                <FaTrash />
                Hesabı Kalıcı Olarak Sil
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Account Modal */}
      {deleteAccountVisible && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <div className={styles.modalIcon}>
                <FaExclamationTriangle />
              </div>
              <h3>Hesabı Kalıcı Olarak Sil</h3>
            </div>
            
            <div className={styles.modalBody}>
              <p className={styles.modalWarning}>
                Bu işlem <strong>geri alınamaz</strong>! Hesabınız ve tüm verileriniz kalıcı olarak silinecektir.
              </p>
              
              <div className={styles.deletionDetails}>
                <h4>Silinecek veriler:</h4>
                <ul>
                  <li>Tüm konuşma geçmişi</li>
                  <li>Kaydedilen hatıralar</li>
                  <li>Profil bilgileri</li>
                  <li>Hesap ayarları</li>
                </ul>
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="deletePassword">Devam etmek için şifrenizi girin:</label>
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
            </div>
            
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
                İptal Et
              </button>
              <button 
                type="button" 
                className={styles.confirmDeleteButton}
                onClick={confirmDeleteAccount}
                disabled={!deletePassword || isDeleting}
              >
                <FaTrash />
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