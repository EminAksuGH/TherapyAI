import React, { useState, useEffect } from 'react';
import { useMemory } from '../context/MemoryContext';
import styles from './MemoryManager.module.css';

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
    if (!timestamp) return 'Unknown date';
    
    // Firestore timestamp has seconds and nanoseconds
    if (timestamp.seconds) {
      const date = new Date(timestamp.seconds * 1000);
      return date.toLocaleString();
    }
    
    // Regular date object
    if (timestamp instanceof Date) {
      return timestamp.toLocaleString();
    }
    
    return 'Invalid date';
  };
  
  return (
    <div className={styles.memoryManager}>
      <div className={styles.memoryHeader}>
        <h2>Memory Manager</h2>
        <div className={styles.memoryToggle}>
          <label className={styles.toggleSwitch}>
            <input 
              type="checkbox" 
              checked={memoryEnabled} 
              onChange={toggleMemoryEnabled}
            />
            <span className={styles.toggleSlider}></span>
          </label>
          <span>{memoryEnabled ? 'Memory Enabled' : 'Memory Disabled'}</span>
        </div>
      </div>
      
      <div className={styles.searchContainer}>
        <form onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search memories..."
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
            {isSearching ? 'Searching...' : 'Search'}
          </button>
        </form>
      </div>
      
      <div className={styles.memoryTabs}>
        <button 
          className={`${styles.tabButton} ${activeTab === 'recent' ? styles.active : ''}`}
          onClick={() => setActiveTab('recent')}
          disabled={!memoryEnabled}
        >
          Recent
        </button>
        <button 
          className={`${styles.tabButton} ${activeTab === 'important' ? styles.active : ''}`}
          onClick={() => setActiveTab('important')}
          disabled={!memoryEnabled}
        >
          Important
        </button>
        {searchResults.length > 0 && (
          <button 
            className={`${styles.tabButton} ${activeTab === 'search' ? styles.active : ''}`}
            onClick={() => setActiveTab('search')}
            disabled={!memoryEnabled}
          >
            Search Results
          </button>
        )}
      </div>
      
      <div className={styles.memoriesList}>
        {!memoryEnabled ? (
          <div className={styles.memoryDisabled}>
            <p>Memory feature is currently disabled.</p>
            <p>Enable memory to view, search, and manage stored memories.</p>
          </div>
        ) : displayMemories.length === 0 ? (
          <div className={styles.emptyState}>
            {activeTab === 'search' 
              ? 'No search results found.' 
              : 'No memories stored yet.'}
          </div>
        ) : (
          displayMemories.map(memory => (
            <div key={memory.id} className={styles.memoryCard}>
              <div className={styles.memoryHeader}>
                <span className={styles.memoryTopic}>{memory.topic}</span>
                <span className={styles.memoryImportance}>
                  Importance: {memory.importance}/10
                </span>
              </div>
              <div className={styles.memoryContent}>
                {memory.content}
              </div>
              {memory.reasoning && (
                <div className={styles.memoryReasoning}>
                  <span className={styles.reasoningLabel}>Why this matters:</span>
                  {memory.reasoning}
                </div>
              )}
              <div className={styles.memoryFooter}>
                <span className={styles.memoryDate}>
                  Created: {formatTimestamp(memory.createdAt)}
                </span>
                <div className={styles.memoryControls}>
                  {memory.recallCount > 0 && (
                    <span className={styles.memoryRecalls}>
                      Recalled {memory.recallCount} times
                    </span>
                  )}
                  <button 
                    className={styles.deleteButton}
                    onClick={() => handleDeleteMemory(memory.id)}
                    disabled={isDeleting}
                    title="Delete this memory"
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