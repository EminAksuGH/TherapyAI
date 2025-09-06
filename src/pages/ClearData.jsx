import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useMemory } from '../context/MemoryContext';
import { FaTrash, FaExclamationTriangle, FaArrowLeft, FaDatabase, FaShieldAlt } from 'react-icons/fa';
import styles from './ClearData.module.css';

const ClearData = () => {
  const { currentUser, reloadUser, clearUserData } = useAuth();
  const { refreshMemoryData } = useMemory();
  const navigate = useNavigate();

  const [isClearing, setIsClearing] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [error, setError] = useState('');

  const clearHistory = async () => {
    if (!currentUser) {
      setError('Kullanıcı oturumu bulunamadı.');
      return;
    }

    setIsClearing(true);
    setError('');
    
    try {
      // Use the clearUserData function from AuthContext
      await clearUserData(currentUser.uid);

      // Refresh memory context to clear the memory state immediately
      await refreshMemoryData();

      setConfirmVisible(false);
      setIsClearing(false);
      
      // Show success message and navigate back
      alert('Sohbet geçmişiniz ve hatıralarınız başarıyla temizlendi.');
      navigate('/');
    } catch (e) {
      setIsClearing(false);
      setError(e.message || 'Veriler silinirken bir hata oluştu. Lütfen tekrar deneyin.');
      console.error('Clear data error:', e);
    }
  };

  const handleConfirmDelete = () => {
    if (window.confirm(
      'Bu işlem geri alınamaz! Tüm sohbet geçmişiniz ve hatıralarınız kalıcı olarak silinecektir. Devam etmek istediğinizden emin misiniz?'
    )) {
      setConfirmVisible(true);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.contentWrapper}>
        <div className={styles.header}>
          <button 
            className={styles.infoContent} 
            onClick={() => navigate(-1)}
            disabled={isClearing}
          >
            <FaArrowLeft />
          </button>
          <div className={styles.headerContent}>
            <h1 className={styles.title}>Veri Yönetimi</h1>
            <p className={styles.subtitle}>Sohbet geçmişinizi ve hatıralarınızı yönetin</p>
          </div>
        </div>

        {error && (
          <div className={styles.errorCard}>
            <FaExclamationTriangle className={styles.errorIcon} />
            <div className={styles.errorContent}>
              <h4>Hata Oluştu</h4>
              <p>{error}</p>
            </div>
          </div>
        )}

        <div className={styles.infoCards}>
          <div className={styles.infoCard}>
            <div className={styles.infoIcon}>
              <FaDatabase />
            </div>
            <div className={styles.infoContent}>
              <h3>Ne Silinecek?</h3>
              <ul>
                <li>Tüm sohbet geçmişiniz</li>
                <li>Kaydedilen hatıralarınız</li>
                <li>Konuşma verileriniz</li>
              </ul>
            </div>
          </div>

          <div className={styles.infoCard}>
            <div className={styles.infoIcon}>
              <FaShieldAlt />
            </div>
            <div className={styles.infoContent}>
              <h3>Ne Korunacak?</h3>
              <ul>
                <li>Hesap bilgileriniz</li>
                <li>Profil ayarlarınız</li>
                <li>Giriş bilgileriniz</li>
              </ul>
            </div>
          </div>
        </div>

        <div className={styles.warningCard}>
          <div className={styles.warningHeader}>
            <FaExclamationTriangle className={styles.warningIcon} />
            <h3>Önemli Uyarı</h3>
          </div>
          <div className={styles.warningContent}>
            <p>Bu işlem <strong>geri alınamaz</strong>. Silinen veriler hiçbir şekilde kurtarılamaz.</p>
            <p>Devam etmeden önce bu kararınızdan emin olduğunuzdan emin olun.</p>
          </div>
        </div>

        <div className={styles.actionSection}>
          <button
            className={styles.clearButton}
            onClick={handleConfirmDelete}
            disabled={isClearing}
          >
            {isClearing ? (
              <div className={styles.loadingContent}>
                <div className={styles.spinner}></div>
                <span>Veriler Temizleniyor...</span>
              </div>
            ) : (
              <div className={styles.buttonContent}>
                <FaTrash />
                <span>Tüm Verileri Temizle</span>
              </div>
            )}
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmVisible && (
        <div className={styles.modalOverlay} onClick={() => !isClearing && setConfirmVisible(false)}>
          <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div className={styles.modalIcon}>
                <FaExclamationTriangle />
              </div>
              <h3 className={styles.modalTitle}>Son Onay</h3>
            </div>
            <div className={styles.modalBody}>
              <p className={styles.modalMessage}>
                Bu işlemle <strong>tüm sohbet geçmişiniz ve hatıralarınız</strong> kalıcı olarak silinecek.
              </p>
              <div className={styles.modalWarning}>
                Bu işlem geri alınamaz!
              </div>
            </div>
            <div className={styles.modalActions}>
              <button 
                className={styles.modalCancelButton} 
                onClick={() => setConfirmVisible(false)} 
                disabled={isClearing}
              >
                İptal Et
              </button>
              <button 
                className={styles.modalDeleteButton} 
                onClick={clearHistory} 
                disabled={isClearing}
              >
                {isClearing ? (
                  <div className={styles.loadingContent}>
                    <div className={styles.spinner}></div>
                    <span>Siliniyor...</span>
                  </div>
                ) : (
                  'Evet, Sil'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClearData;
