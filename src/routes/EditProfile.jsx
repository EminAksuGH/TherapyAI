import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { updateProfile, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { db } from '../firebase/firebase';
import { FaEye, FaEyeSlash, FaExclamationTriangle, FaShieldAlt, FaTrash } from 'react-icons/fa';
import styles from './EditProfile.module.css';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();

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
        setError(t('profile.loadError'));
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
      return t('profile.passwordMinLength');
    }
    if (password.length > 128) {
      return t('profile.passwordMaxLength');
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
      setError(t('profile.newPasswordsMismatch'));
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
        setError(t('profile.wrongPassword'));
      } else if (err.code === 'auth/weak-password') {
        setError(t('profile.weakPassword'));
      } else if (err.code === 'auth/requires-recent-login') {
        setError(t('profile.requiresRecentLogin'));
      } else {
        setError(t('profile.passwordUpdateError'));
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
          setError(t('profile.newPasswordsMismatch'));
          setUpdating(false);
          return;
        }
        
        if (formData.newPassword && !formData.currentPassword) {
          setError(t('profile.currentPasswordRequired'));
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
        setSuccess(t('profile.updateSuccess'));
        
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
      setError(t('profile.updateError', { error: err.message || 'Bilinmeyen hata' }));
      
    } finally {
      setUpdating(false);
    }
  };

  // Delete Account Functions
  const handleDeleteAccount = () => {
    if (window.confirm(
      t('profile.deleteConfirmPrompt')
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
        alert(t('profile.deleteSuccessAlert'));
      }, 100);
      
    } catch (error) {
      setIsDeleting(false);
      console.error('Delete account error:', error);
      
      let errorMessage = 'Hesap silinirken bir hata oluştu. Lütfen tekrar deneyin.';
      
      if (error.code === 'auth/wrong-password') {
        errorMessage = t('profile.deleteWrongPassword');
      } else if (error.code === 'auth/requires-recent-login') {
        errorMessage = t('profile.deleteRequiresRecentLogin');
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
    }
  };

  if (loading) return <div className={styles.loading}>{t('common.loading')}</div>;

  return (
    <div className={styles.editProfileContainer}>
      <div className={styles.editProfileCard}>
        <h2>{t('profile.title')}</h2>
        
        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Basic Info Section */}
          <div className={styles.formSection}>
            <h3>{t('profile.userInfo')}</h3>
            
            <div className={styles.formGroup}>
              <label htmlFor="name">{t('auth.labels.name')}</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder={t('auth.placeholders.fullName')}
                required
              />
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="email">{t('auth.labels.email')}</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                disabled
                className={styles.disabledInput}
              />
              <small>{t('profile.emailImmutable')}</small>
            </div>
          </div>
          
          {/* Password Section */}
          <div className={styles.formSection}>
            <h3>{t('profile.passwordSection')}</h3>
            <div className={styles.formGroup}>
              <label htmlFor="currentPassword">{t('auth.labels.currentPassword')}</label>
              <div className={styles.passwordInputContainer}>
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  id="currentPassword"
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleChange}
                placeholder={t('auth.placeholders.currentPassword')}
                />
                <button
                  type="button"
                  className={styles.passwordToggle}
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  aria-label={showCurrentPassword ? t('auth.showHide.hidePassword') : t('auth.showHide.showPassword')}
                >
                  {showCurrentPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="newPassword">{t('auth.labels.newPassword')}</label>
              <div className={styles.passwordInputContainer}>
                <input
                  type={showNewPassword ? "text" : "password"}
                  id="newPassword"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                placeholder={t('auth.placeholders.newPassword')}
                />
                <button
                  type="button"
                  className={styles.passwordToggle}
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  aria-label={showNewPassword ? t('auth.showHide.hidePassword') : t('auth.showHide.showPassword')}
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
              <label htmlFor="confirmPassword">{t('auth.labels.confirmNewPassword')}</label>
              <div className={styles.passwordInputContainer}>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                placeholder={t('auth.placeholders.confirmNewPassword')}
                />
                <button
                  type="button"
                  className={styles.passwordToggle}
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? t('auth.showHide.hidePassword') : t('auth.showHide.showPassword')}
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>
            <small className={styles.passwordNote}>{t('profile.passwordNote')}</small>
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
              {t('profile.cancel')}
            </button>
            <button 
              type="submit" 
              className={styles.saveButton}
              disabled={updating || !isSaveEnabled()}
            >
              {updating ? t('profile.saving') : t('profile.save')}
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
              <h3>{t('profile.deleteSectionTitle')}</h3>
              <p>{t('profile.deleteSectionSubtitle')}</p>
            </div>
          </div>
          
          <div className={styles.deleteAccountCard}>
            <div className={styles.deleteInfo}>
              <h4>{t('profile.deleteInfoTitle')}</h4>
              <ul className={styles.deleteList}>
                <li>{t('profile.deleteList.conversations')}</li>
                <li>{t('profile.deleteList.memories')}</li>
                <li>{t('profile.deleteList.profile')}</li>
                <li>{t('profile.deleteList.access')}</li>
              </ul>
            </div>
            
            <div className={styles.deleteActions}>
              <div className={styles.deleteWarning}>
                <FaShieldAlt className={styles.warningIcon} />
                <span>{t('profile.deleteWarning')}</span>
              </div>
              <button 
                type="button" 
                className={styles.deleteButton}
                onClick={handleDeleteAccount}
              >
                <FaTrash />
                {t('profile.deleteButton')}
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
              <h3>{t('profile.deleteModalTitle')}</h3>
            </div>
            
            <div className={styles.modalBody}>
              <p className={styles.modalWarning}>
                {t('profile.deleteModalWarning')}
              </p>
              
              <div className={styles.deletionDetails}>
                <h4>{t('profile.deleteDataTitle')}</h4>
                <ul>
                  <li>{t('profile.deleteData.chatHistory')}</li>
                  <li>{t('profile.deleteData.memories')}</li>
                  <li>{t('profile.deleteData.profile')}</li>
                  <li>{t('profile.deleteData.accountSettings')}</li>
                </ul>
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="deletePassword">{t('profile.deletePasswordPrompt')}</label>
                <div className={styles.passwordInputContainer}>
                  <input
                    type={showDeletePassword ? "text" : "password"}
                    id="deletePassword"
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    placeholder={t('auth.placeholders.currentPassword')}
                    disabled={isDeleting}
                  />
                  <button
                    type="button"
                    className={styles.passwordToggle}
                    onClick={() => setShowDeletePassword(!showDeletePassword)}
                    disabled={isDeleting}
                    aria-label={showDeletePassword ? t('auth.showHide.hidePassword') : t('auth.showHide.showPassword')}
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
                {t('profile.deleteCancel')}
              </button>
              <button 
                type="button" 
                className={styles.confirmDeleteButton}
                onClick={confirmDeleteAccount}
                disabled={!deletePassword || isDeleting}
              >
                <FaTrash />
                {isDeleting ? t('profile.deleting') : t('profile.deleteConfirm')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditProfile; 