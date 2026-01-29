import React from 'react';
import MemoryManager from '../components/MemoryManager';
import styles from './MemoryList.module.css';
import { useTranslation } from 'react-i18next';

const MemoryList = () => {
  const { t } = useTranslation();
  return (
    <div className={styles.memoryListContainer}>
      <div className={styles.pageTitle}>
        <h2>{t('memory.listTitle')}</h2>
        <p>{t('memory.listDescription')}</p>
      </div>
      <div className={styles.memoryManagerWrapper}>
        <MemoryManager />
      </div>
    </div>
  );
};

export default MemoryList; 