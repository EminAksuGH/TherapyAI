import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useMemory } from '../context/MemoryContext';
import { FaTrash, FaExclamationTriangle, FaArrowLeft, FaDatabase, FaShieldAlt } from 'react-icons/fa';
import styles from './ClearData.module.css';
import { useTranslation } from 'react-i18next';

const ClearData = () => {
  const { currentUser, reloadUser, clearUserData } = useAuth();
  const { refreshMemoryData } = useMemory();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [isClearing, setIsClearing] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [error, setError] = useState('');

  const clearHistory = async () => {
    if (!currentUser) {
      setError(t('clearData.sessionMissing'));
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
      alert(t('clearData.deleteSuccess'));
      navigate('/');
    } catch (e) {
      setIsClearing(false);
      setError(e.message || t('clearData.deleteError'));
      console.error('Clear data error:', e);
    }
  };

  const handleConfirmDelete = () => {
    if (window.confirm(
      t('clearData.deleteConfirmPrompt')
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
            <h1 className={styles.title}>{t('clearData.title')}</h1>
            <p className={styles.subtitle}>{t('clearData.subtitle')}</p>
          </div>
        </div>

        {error && (
          <div className={styles.errorCard}>
            <FaExclamationTriangle className={styles.errorIcon} />
            <div className={styles.errorContent}>
              <h4>{t('clearData.errorTitle')}</h4>
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
              <h3>{t('clearData.whatDeleted')}</h3>
              <ul>
                <li>{t('clearData.whatDeletedItems.chatHistory')}</li>
                <li>{t('clearData.whatDeletedItems.memories')}</li>
                <li>{t('clearData.whatDeletedItems.conversations')}</li>
              </ul>
            </div>
          </div>

          <div className={styles.infoCard}>
            <div className={styles.infoIcon}>
              <FaShieldAlt />
            </div>
            <div className={styles.infoContent}>
              <h3>{t('clearData.whatPreserved')}</h3>
              <ul>
                <li>{t('clearData.whatPreservedItems.account')}</li>
                <li>{t('clearData.whatPreservedItems.profile')}</li>
                <li>{t('clearData.whatPreservedItems.login')}</li>
              </ul>
            </div>
          </div>
        </div>

        <div className={styles.warningCard}>
          <div className={styles.warningHeader}>
            <FaExclamationTriangle className={styles.warningIcon} />
            <h3>{t('clearData.warningTitle')}</h3>
          </div>
          <div className={styles.warningContent}>
            <p>{t('clearData.warningLine1')}</p>
            <p>{t('clearData.warningLine2')}</p>
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
                <span>{t('clearData.clearing')}</span>
              </div>
            ) : (
              <div className={styles.buttonContent}>
                <FaTrash />
                <span>{t('clearData.clearButton')}</span>
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
              <h3 className={styles.modalTitle}>{t('clearData.confirmTitle')}</h3>
            </div>
            <div className={styles.modalBody}>
              <p className={styles.modalMessage}>
                {t('clearData.confirmMessage')}
              </p>
              <div className={styles.modalWarning}>
                {t('clearData.confirmWarning')}
              </div>
            </div>
            <div className={styles.modalActions}>
              <button 
                className={styles.modalCancelButton} 
                onClick={() => setConfirmVisible(false)} 
                disabled={isClearing}
              >
                {t('clearData.cancel')}
              </button>
              <button 
                className={styles.modalDeleteButton} 
                onClick={clearHistory} 
                disabled={isClearing}
              >
                {isClearing ? (
                  <div className={styles.loadingContent}>
                    <div className={styles.spinner}></div>
                    <span>{t('clearData.deleting')}</span>
                  </div>
                ) : (
                  t('clearData.confirmYes')
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
