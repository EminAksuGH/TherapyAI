import React, { useState, useEffect } from 'react';
import { db } from '../firebase/firebase';
import { useAuth } from '../context/AuthContext';
import { collection, query, where, orderBy, getDocs, doc, deleteDoc, writeBatch, onSnapshot } from 'firebase/firestore';
import styles from './ConversationSidebar.module.css';

const ConversationSidebar = ({ onSelectConversation, currentConversationId }) => {
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);
    const { currentUser } = useAuth();

    // Listen for real-time updates to conversations
    useEffect(() => {
        if (!currentUser) {
            setConversations([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        
        const q = query(
            collection(db, 'conversations'),
            where('userId', '==', currentUser.uid),
            orderBy('updatedAt', 'desc')
        );

        // Use onSnapshot for real-time updates
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const conversationsList = querySnapshot.docs
                .map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    updatedAt: doc.data().updatedAt?.toDate() || new Date()
                }))
                .filter(conv => conv.messageCount > 0);

            setConversations(conversationsList);
            setLoading(false);
        }, (error) => {
            console.error('Error fetching conversations:', error);
            setLoading(false);
        });

        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, [currentUser]);

    const handleDeleteConversation = async (e, conversationId) => {
        e.stopPropagation();
        if (!window.confirm('Bu konuşmayı silmek istediğinizden emin misiniz?')) {
            return;
        }

        try {
            // First check if the conversation has messages
            const messagesQuery = query(
                collection(db, 'conversations', conversationId, 'messages')
            );
            const messagesSnapshot = await getDocs(messagesQuery);
            
            // Delete all messages in the conversation
            const batch = writeBatch(db);
            messagesSnapshot.forEach((messageDoc) => {
                batch.delete(doc(db, 'conversations', conversationId, 'messages', messageDoc.id));
            });
            
            // Execute the batch
            if (messagesSnapshot.size > 0) {
                await batch.commit();
                console.log(`Deleted ${messagesSnapshot.size} messages from conversation ${conversationId}`);
            }
            
            // Now delete the conversation document
            await deleteDoc(doc(db, 'conversations', conversationId));
            console.log(`Deleted conversation ${conversationId}`);
            
            // Update the local state to remove the deleted conversation
            setConversations(conversations.filter(conv => conv.id !== conversationId));
            
            // If the currently selected conversation is deleted, select a new one
            if (currentConversationId === conversationId) {
                if (conversations.length > 1) {
                    // Find the next conversation to select
                    const nextConversation = conversations.find(conv => conv.id !== conversationId);
                    if (nextConversation) {
                        onSelectConversation(nextConversation.id);
                    }
                } else {
                    // No more conversations, create a new one
                    onSelectConversation(null);
                }
            }
        } catch (error) {
            console.error('Error deleting conversation:', error);
            alert('Konuşmayı silerken bir hata oluştu. Lütfen tekrar deneyin.');
        }
    };

    const formatDate = (date) => {
        if (!date) return '';
        
        const now = new Date();
        const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
        
        if (diffInDays === 0) {
            return 'Bugün';
        } else if (diffInDays === 1) {
            return 'Dün';
        } else if (diffInDays < 7) {
            return `${diffInDays} gün önce`;
        } else {
            return date.toLocaleDateString('tr-TR', { 
                day: 'numeric', 
                month: 'short'
            });
        }
    };

    if (!currentUser) {
        return null;
    }

    return (
        <div className={styles.sidebar}>
            <div className={styles.sidebarHeader}>
                <h3>Konuşmalarım</h3>
            </div>
            
            {loading ? (
                <div className={styles.loading}>Yükleniyor...</div>
            ) : conversations.length === 0 ? (
                <div className={styles.noConversations}>
                    Henüz konuşma bulunmuyor.
                </div>
            ) : (
                <div className={styles.conversationList}>
                    {conversations.map(conversation => (
                        <div 
                            key={conversation.id} 
                            className={`${styles.conversationItem} ${currentConversationId === conversation.id ? styles.active : ''}`}
                            onClick={() => onSelectConversation(conversation.id)}
                        >
                            <div className={styles.conversationInfo}>
                                <div className={styles.title}>{conversation.title || 'Yeni Konuşma'}</div>
                                <div className={styles.date}>{formatDate(conversation.updatedAt)}</div>
                            </div>
                            <button 
                                className={styles.deleteButton}
                                onClick={(e) => handleDeleteConversation(e, conversation.id)}
                            >
                                ×
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ConversationSidebar; 