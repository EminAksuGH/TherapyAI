import React, { useState, useEffect } from 'react';
import { useMemory } from '../context/MemoryContext';
import styles from './MemoryManager.module.css';
import { useTranslation } from 'react-i18next';

const MemoryManager = () => {
  const { 
    memoryEnabled, 
    toggleMemoryEnabled, 
    recentMemories, 
    importantMemories,
    searchMemories,
    deleteMemory 
  } = useMemory();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [activeTab, setActiveTab] = useState('recent');
  const [isDeleting, setIsDeleting] = useState(false);
  const { t, i18n } = useTranslation();
  
  // Display memories based on the active tab
  const displayMemories = activeTab === 'recent' 
    ? recentMemories 
    : activeTab === 'important' 
    ? importantMemories 
    : searchResults;
  
  // Handle memory search
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim() || !memoryEnabled) return;
    
    setIsSearching(true);
    try {
      const results = await searchMemories(searchQuery);
      setSearchResults(results);
      setActiveTab('search');
    } catch (error) {
      console.error("Error searching memories:", error);
    } finally {
      setIsSearching(false);
    }
  };
  
  // Handle memory deletion
  const handleDeleteMemory = async (memoryId) => {
    if (!memoryEnabled || isDeleting) return;
    
    setIsDeleting(true);
    try {
      const success = await deleteMemory(memoryId);
      
      if (success) {
        // If we were in search results, update the search results
        if (activeTab === 'search' && searchQuery) {
          const results = await searchMemories(searchQuery);
          setSearchResults(results);
        }
      }
    } catch (error) {
      console.error("Error deleting memory:", error);
    } finally {
      setIsDeleting(false);
    }
  };
  
  // Format timestamp from Firestore to readable date
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return t('memory.unknownDate');
    const locale = i18n.language === 'tr' ? 'tr-TR' : 'en-US';
    
    // Firestore timestamp has seconds and nanoseconds
    if (timestamp.seconds) {
      const date = new Date(timestamp.seconds * 1000);
      return date.toLocaleString(locale);
    }
    
    // Regular date object
    if (timestamp instanceof Date) {
      return timestamp.toLocaleString(locale);
    }
    
    return t('memory.invalidDate');
  };
  
  return (
    <div className={styles.memoryManager}>
      <div className={styles.memoryHeader}>
        <h2>{t('memory.managerTitle')}</h2>
        <div className={styles.memoryToggle}>
          <label className={styles.toggleSwitch}>
            <input 
              type="checkbox" 
              checked={memoryEnabled} 
              onChange={toggleMemoryEnabled}
            />
            <span className={styles.toggleSlider}></span>
          </label>
          <span>{memoryEnabled ? t('memory.enabled') : t('memory.disabled')}</span>
        </div>
      </div>
      
      <div className={styles.searchContainer}>
        <form onSubmit={handleSearch}>
          <input
            type="text"
            placeholder={t('memory.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
            disabled={!memoryEnabled}
          />
          <button 
            type="submit" 
            className={styles.searchButton}
            disabled={isSearching || !memoryEnabled}
          >
            {isSearching ? t('memory.searchLoading') : t('memory.searchButton')}
          </button>
        </form>
      </div>
      
      <div className={styles.memoryTabs}>
        <button 
          className={`${styles.tabButton} ${activeTab === 'recent' ? styles.active : ''}`}
          onClick={() => setActiveTab('recent')}
          disabled={!memoryEnabled}
        >
          {t('memory.tabRecent')}
        </button>
        <button 
          className={`${styles.tabButton} ${activeTab === 'important' ? styles.active : ''}`}
          onClick={() => setActiveTab('important')}
          disabled={!memoryEnabled}
        >
          {t('memory.tabImportant')}
        </button>
        {searchResults.length > 0 && (
          <button 
            className={`${styles.tabButton} ${activeTab === 'search' ? styles.active : ''}`}
            onClick={() => setActiveTab('search')}
            disabled={!memoryEnabled}
          >
            {t('memory.tabSearch')}
          </button>
        )}
      </div>
      
      <div className={styles.memoriesList}>
        {!memoryEnabled ? (
          <div className={styles.memoryDisabled}>
            <p>{t('memory.disabledTitle')}</p>
            <p>{t('memory.disabledHint')}</p>
          </div>
        ) : displayMemories.length === 0 ? (
          <div className={styles.emptyState}>
            {activeTab === 'search' 
              ? t('memory.noSearchResults') 
              : t('memory.noMemories')}
          </div>
        ) : (
          displayMemories.map(memory => (
            <div key={memory.id} className={styles.memoryCard}>
              <div className={styles.memoryHeader}>
                <span className={styles.memoryTopic}>{memory.topic}</span>
                <span className={styles.memoryImportance}>
                  {t('memory.importance')}: {memory.importance}/10
                </span>
              </div>
              <div className={styles.memoryContent}>
                {memory.content}
              </div>
              {memory.reasoning && (
                <div className={styles.memoryReasoning}>
                  <span className={styles.reasoningLabel}>{t('memory.reasonLabel')}</span>
                  {memory.reasoning}
                </div>
              )}
              <div className={styles.memoryFooter}>
                <span className={styles.memoryDate}>
                  {t('memory.createdAt')}: {formatTimestamp(memory.createdAt)}
                </span>
                <div className={styles.memoryControls}>
                  {memory.recallCount > 0 && (
                    <span className={styles.memoryRecalls}>
                      {t('memory.recallCount', { count: memory.recallCount })}
                    </span>
                  )}
                  <button 
                    className={styles.deleteButton}
                    onClick={() => handleDeleteMemory(memory.id)}
                    disabled={isDeleting}
                    title={t('memory.deleteTitle')}
                  >
                    ×
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MemoryManager; 