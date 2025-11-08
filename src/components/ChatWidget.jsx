import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { franc } from "franc-min";
import styles from "./ChatWidget.module.css";
import { db } from "../firebase/firebase";
import { useAuth } from "../context/AuthContext";
import { useMemory } from "../context/MemoryContext";
import { encryptMessage, decryptMessage, decryptMessages } from "../firebase/encryptionService";
import { saveFeedback } from "../firebase/feedbackService";
import { 
    collection, 
    addDoc, 
    query, 
    where, 
    orderBy, 
    getDocs, 
    serverTimestamp,
    doc,
    getDoc,
    setDoc,
    deleteDoc,
    increment,
    limit
} from "firebase/firestore";
import { Link, Navigate } from "react-router-dom";
import ConversationSidebar from "./ConversationSidebar";
import FeedbackModal from "./FeedbackModal";

const ChatWidget = () => {
    const [message, setMessage] = useState("");
    const [chatLog, setChatLog] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentConversationId, setCurrentConversationId] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
    const [selectedFeedback, setSelectedFeedback] = useState(null);
    const messagesEndRef = useRef(null);
    const chatLogRef = useRef(null);
    const { currentUser } = useAuth();
    const { 
        memoryEnabled, 
        toggleMemoryEnabled, 
        createMemory,
        createMemoryFromConversation,
        getFormattedMemories,
        recentMemories,
        importantMemories,
        refreshMemoryData,
        MAX_TOPICS
    } = useMemory();

    // Prevent access for unauthenticated users
    if (!currentUser) {
        return (
            <div className={styles.authRequired}>
                <h2>TherapyAI'a Hoş Geldiniz</h2>
                <p>Duygusal destek ve zihinsel iyi oluş konusunda size yardımcı olmak için buradayız.</p>
                <p>Sohbeti kullanmak için lütfen giriş yapın veya kaydolun.</p>
                <div className={styles.authButtons}>
                    <Link to="/login" className={styles.authButton}>Giriş Yap</Link>
                    <Link to="/signup" className={styles.authButton}>Kaydol</Link>
                </div>
            </div>
        );
    }

    const detectLanguage = (text) => {
        const lang = franc(text);
        return lang === "und" ? "en" : lang;
    };

    // Get all user memories from MemoryContext
    const getAllUserMemories = () => {
        return [...recentMemories, ...importantMemories].sort((a, b) => b.importance - a.importance);
    };

    const scrollToBottom = () => {
        if (messagesEndRef.current) {
            // Use a slight delay to ensure DOM has updated
            setTimeout(() => {
                messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
            }, 100);
        }
    };

    // Create a new conversation ID
    const createNewConversation = async () => {
        if (!currentUser) return null;
        
        try {
            
            // Create a conversation document
            const conversationRef = await addDoc(collection(db, "conversations"), {
                userId: currentUser.uid,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                title: await encryptMessage("Yeni Konuşma"), // Encrypt initial conversation title
                messageCount: 0 // Add a counter to track messages
            });
            
            return conversationRef.id;
        } catch (error) {
            console.error("Error creating new conversation:", error);
            
            // Check for permission errors specifically
            if (error.code === 'permission-denied') {
                console.error("Permission denied. Please check Firestore security rules.");
            }
            
            return null;
        }
    };

    // Load the most recent conversation if available
    const loadMostRecentConversation = async () => {
        if (!currentUser) return;
        
        // We're modifying this function to not load any conversation at startup
        // Instead, we'll just set the currentConversationId to null and clear the chat log
        setCurrentConversationId(null);
        setChatLog([]);
        
        // No conversation will be loaded until the user explicitly selects one
        // or starts a new conversation by sending a message
    };

    // Load messages for a specific conversation
    const loadConversationMessages = async (conversationId) => {
        if (!currentUser || !conversationId) return;
        
        try {
            // Clear existing messages first
            setChatLog([]);
            
            const q = query(
                collection(db, "conversations", conversationId, "messages"),
                orderBy("timestamp", "asc")
            );
            
            const querySnapshot = await getDocs(q);
            const messages = [];
            
            for (const doc of querySnapshot.docs) {
                const data = doc.data();
                messages.push({
                    sender: data.sender,
                    text: await decryptMessage(data.text) // Decrypt message text after fetching
                });
            }
            
            setChatLog(messages);
            
            // Ensure we scroll to bottom after loading messages
            setTimeout(scrollToBottom, 200);
        } catch (error) {
            console.error("Error loading conversation messages:", error);
        }
    };

    // Handle selecting a conversation from the sidebar
    const handleSelectConversation = async (conversationId) => {
        if (conversationId === null) {
            // For new conversation, we don't create it in the database yet
            // We'll only create it when the user sends their first message
            setCurrentConversationId(null);
            setChatLog([]);
            
            // Close sidebar on mobile after selection
            if (window.innerWidth <= 768) {
                setSidebarOpen(false);
            }
        } else {
            // Load an existing conversation
            setCurrentConversationId(conversationId);
            
            // Clear current chat log immediately to avoid showing the wrong messages
            setChatLog([]);
            
            // Then load the selected conversation messages
            await loadConversationMessages(conversationId);
            
            // Close sidebar on mobile after selection
            if (window.innerWidth <= 768) {
                setSidebarOpen(false);
            }
        }
    };

    // Load chat history and memories when component mounts
    useEffect(() => {
        const loadChatHistory = async () => {
            if (currentUser) {
                // User is logged in, fetch from Firestore
                await loadMostRecentConversation();
                // Memories are automatically loaded by MemoryContext
            }
            // No else branch for unauthenticated users since they can't use the chat
        };
        
        loadChatHistory();
    }, [currentUser]);

    // Memories are automatically refreshed by MemoryContext when memoryEnabled changes
    
    // Load messages when currentConversationId changes
    useEffect(() => {
        const loadCurrentConversationMessages = async () => {
            if (currentUser && currentConversationId) {
                await loadConversationMessages(currentConversationId);
            }
        };
        
        loadCurrentConversationMessages();
    }, [currentConversationId, currentUser]);
    
    // Adjust the existing useEffect for scrolling to be more reliable
    useEffect(() => {
        if (chatLog.length > 0) {
            scrollToBottom();
        }
    }, [chatLog]);

    // Save message to Firestore if user is authenticated
    const saveMessageToFirestore = async (message, providedConversationId = null) => {
        if (!currentUser) return null;
        
        try {
            // Ensure we have a conversation ID
            let conversationIdToUse = providedConversationId || currentConversationId;
            
            // Only create a new conversation if:
            // 1. We don't have a conversation ID AND
            // 2. This is a user message (not an AI response)
            if (!conversationIdToUse && message.sender === "user") {
                // Create a new conversation only when a user message is being sent
                const newConversationId = await createNewConversation();
                if (!newConversationId) {
                    throw new Error("Failed to create conversation");
                }
                conversationIdToUse = newConversationId;
                setCurrentConversationId(newConversationId);
            } else if (!conversationIdToUse) {
                // This is an AI message but we don't have a conversation yet
                // This shouldn't happen in normal flow, but we'll handle it
                console.error("Attempted to save AI message without a conversation ID");
                return null;
            }
            
            // Add message to conversation's messages subcollection (encrypt the text)
            await addDoc(collection(db, "conversations", conversationIdToUse, "messages"), {
                sender: message.sender,
                text: await encryptMessage(message.text), // Encrypt message text before saving
                timestamp: serverTimestamp()
            });
            
            // Update conversation's 'updatedAt' field and increment message count
            await setDoc(doc(db, "conversations", conversationIdToUse), {
                updatedAt: serverTimestamp(),
                messageCount: increment(1)
            }, { merge: true });
            
            // Update conversation title if it's the first user message
            if (message.sender === "user") {
                const q = query(
                    collection(db, "conversations", conversationIdToUse, "messages"),
                    where("sender", "==", "user")
                );
                const querySnapshot = await getDocs(q);
                
                if (querySnapshot.size === 1) {
                    // This is the first user message, use it as the conversation title
                    let title = message.text;
                    if (title.length > 30) {
                        title = title.substring(0, 30) + "...";
                    }
                    
                    await setDoc(doc(db, "conversations", conversationIdToUse), {
                        title: await encryptMessage(title) // Encrypt conversation title before saving
                    }, { merge: true });
                }
            }
            
            return conversationIdToUse;
            
        } catch (error) {
            console.error("Error saving message to Firestore:", error);
            // Don't throw the error further, just log it to not break the chat experience
            return null;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (message.trim() === "") return;

        const detectedLang = detectLanguage(message);
        const userMessageText = message;
        setMessage("");

        const newUserMessage = { sender: "user", text: userMessageText };
        setChatLog((prevLog) => [...prevLog, newUserMessage]);
        
        // Save user message to Firestore and store the returned conversation ID
        let activeConversationId = currentConversationId;
        if (!activeConversationId) {
            // If there's no conversation yet, the saveMessageToFirestore function will create one
            // and we need to capture that new ID
            const newConversationId = await saveMessageToFirestore(newUserMessage);
            if (newConversationId) {
                activeConversationId = newConversationId;
                setCurrentConversationId(newConversationId);
            }
        } else {
            // If we already have a conversation, just save the message
            await saveMessageToFirestore(newUserMessage, activeConversationId);
        }
        
        // Set loading state to true before API call
        setLoading(true);

        try {
            // Retrieve relevant memories for the current conversation
            let userMemoriesText = "Memory feature is disabled.";
            
            const allUserMemories = getAllUserMemories();
            if (memoryEnabled && allUserMemories.length > 0) {
                // Use ALL memories as context - much simpler and more effective!
                userMemoriesText = `User's memories:
${allUserMemories.map((memory, index) => 
    `Memory ${index+1} [${memory.topic}]: ${memory.content} (Importance: ${memory.importance}/10)`
).join('\n')}

IMPORTANT INSTRUCTIONS FOR MEMORY USE:
1. You have access to ALL of the user's memories above. Use them to provide personalized responses.
2. If the user asks about their name, preferences, or anything mentioned in these memories, you can reference them naturally.
3. Don't mention "I remember from our conversation" - just respond naturally as if you know them.
4. For questions like "What's my name?" or "How should I address you?", use the relevant memory directly.
5. Never invent or add details not in the memories above.
6. Use the memories to provide context-aware, personalized emotional support.`;
            } else if (memoryEnabled && allUserMemories.length === 0) {
                userMemoriesText = `No previous memories available for this user.

IMPORTANT: Since no memories exist yet, if the user asks if you remember something specific, you MUST truthfully respond that you don't recall that information. Be honest about not having memories while still showing willingness to discuss the topic.`;
            } else {
                // Memory is disabled - provide clear instructions to the AI about this state
                userMemoriesText = `Memory feature is currently DISABLED.

IMPORTANT: Since memory is disabled, you cannot access or save memories.
If the user asks you to remember something, inform them: "Maalesef şu anda hafıza özelliğim devre dışı, bu yüzden bunu kaydedemiyorum. Ama konuşmaya devam edebiliriz."
If the user asks if you remember something: "Maalesef hafıza özelliğim şu anda devre dışı olduğu için geçmiş konuşmalarımızı hatırlayamıyorum."`;
            }

            // Check if this is an explicit memory save request
            const isExplicitSaveRequest = /(?:(?:remember|save|store|keep|hatırla|kaydet|sakla|tut) this|bunu (?:hatırla|kaydet|sakla|tut|aklında tut)|(?:bana|sana).+(?:hitap|böyle|şekilde).+istiyorum|(?:adım|ismim).+(?:bana|sana).+(?:hitap|çağır|de)|bundan böyle.+istiyorum)/i.test(message.trim());

            // Call Next.js API route instead of OpenAI directly
            const response = await axios.post(
                "/api/chat",
                {
                    messages: [
                        ...chatLog.map((msg) => ({
                            role: msg.sender === "ai" ? "assistant" : "user",
                            content: msg.text
                        })),
                        { role: "user", content: message }
                    ],
                    userMemoriesText,
                    memoryEnabled,
                    detectedLang
                }
            );

            if (!response.data || !response.data.content) {
                throw new Error("Invalid API response");
            }

            const aiResponse = response.data.content;
            const newAiMessage = { sender: "ai", text: aiResponse };
            
            // Set loading to false immediately after getting the response
            setLoading(false);
            
            // Update chat log with the new message
            setChatLog((prevLog) => [...prevLog, newAiMessage]);
            
            // Save AI response to Firestore using the active conversation ID
            if (activeConversationId) {
                await saveMessageToFirestore(newAiMessage, activeConversationId);
                
                // Create AI-analyzed memory from this interaction
                if (memoryEnabled) {
                    try {
                        // Get the last few messages as context
                        const lastMessages = chatLog.slice(-3).map(msg => `${msg.sender}: ${msg.text}`).join('\n');
                        
                        // Check if this was an explicit memory save request
                        const isExplicitSaveRequest = /(?:(?:remember|save|store|keep|hatırla|kaydet|sakla|tut) this|bunu (?:hatırla|kaydet|sakla|tut|aklında tut)|(?:bana|sana).+(?:hitap|böyle|şekilde).+istiyorum|(?:adım|ismim).+(?:bana|sana).+(?:hitap|çağır|de)|bundan böyle.+istiyorum)/i.test(message.trim());
                        
                        // Use AI to analyze and create memory with appropriate importance
                        const result = await createMemoryFromConversation(
                            message,
                            lastMessages,
                            activeConversationId
                        );
                        
                        // If a new memory was created, refresh memory context
                        if (result && result.memoryId) {
                            await refreshMemoryData();
                        }

                        // If this was an explicit save request, send an additional system message to the AI
                        if (isExplicitSaveRequest) {
                            // Check if save was successful (result exists and has a memoryId)
                            const saveSuccessful = result && result.memoryId;
                            
                            if (saveSuccessful) {
                                // Send a hidden system message about the successful save that the user won't see
                                // This will be included in the next API call for context
                                chatLog.push({
                                    sender: "system",
                                    text: `MEMORY SAVED SUCCESSFULLY: The user's request to save information was processed. The memory with content "${result.analysis.extractedMemory}" was saved with importance ${result.analysis.importance}/10.`
                                });
                            } else if (result && result.isDuplicate) {
                                // Duplicate was detected for an EXPLICIT save request
                                // Only show message when user explicitly asked to save something
                                const duplicateMessage = { 
                                    sender: "ai", 
                                    text: `Bu bilgiyi zaten hafızamda tutuyorum. Benzer bir kayıt mevcut, bu yüzden tekrar kaydetmiyorum.` 
                                };
                                
                                // Add duplicate message to chat
                                setChatLog(prevLog => [...prevLog, duplicateMessage]);
                                
                                // Save the duplicate message to Firestore
                                await saveMessageToFirestore(duplicateMessage, activeConversationId);
                            } else if (result && result.limitReached) {
                                // Memory limit was reached
                                // Send a message to the user about reaching memory limits
                                const limitMessage = { 
                                    sender: "ai", 
                                    text: `Maalesef hafıza limitine ulaştım. Yeni bilgileri kaydetmeden önce bazı eski konuları temizlemen gerekiyor.` 
                                };
                                
                                // Add limit message to chat
                                setChatLog(prevLog => [...prevLog, limitMessage]);
                                
                                // Save the limit message to Firestore
                                await saveMessageToFirestore(limitMessage, activeConversationId);
                            } else {
                                // Save failed for some other reason
                                chatLog.push({
                                    sender: "system",
                                    text: `MEMORY SAVE FAILED: The user's request to save information could not be processed. The information may not have been important enough or there may have been a technical issue.`
                                });
                            }
                        } else {
                            // For automatic memory creation (not explicit user request)
                            // Just log duplicates silently - don't interrupt the conversation
                            if (result && result.isDuplicate) {
                                console.log(`Duplicate memory detected and prevented: ${result.analysis.reasoning}`);
                            }
                        }
                    } catch (memoryError) {
                        console.error("Error creating AI-analyzed memory:", memoryError);
                        // Don't interrupt the flow if memory creation fails
                    }
                }
            }
            
            // Make sure to set loading to false here once all operations are complete
            // This is a second check to ensure loading is false even if there were delays
            setLoading(false);
            
        } catch (error) {
            console.error("API Error:", error);
            const errorMessage = { sender: "ai", text: "An error occurred. Please try again later." };
            
            // Set loading to false before updating the UI
            setLoading(false);
            
            setChatLog((prevLog) => [...prevLog, errorMessage]);
            
            // Only save error message if we have a valid conversation
            if (activeConversationId) {
                await saveMessageToFirestore(errorMessage, activeConversationId);
            }
        }
        
        // Make sure we scroll to the bottom after submitting a message
        setTimeout(scrollToBottom, 200);
    };

    // Start a new conversation by clearing the chat log and creating a new conversation in Firebase
    const startNewConversation = async () => {
        // Clear chat log from state
        setChatLog([]);
        
        // Set currentConversationId to null instead of creating a new empty conversation
        // The conversation will be created when the user sends their first message
        setCurrentConversationId(null);
    };

    // Toggle sidebar visibility
    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    // Handle feedback button click
    const handleFeedbackClick = (aiMessage, userMessage) => {
        setSelectedFeedback({
            aiMessage,
            userMessage
        });
        setFeedbackModalOpen(true);
    };

    // Handle feedback submission
    const handleFeedbackSubmit = async (feedbackData) => {
        if (!currentUser) {
            throw new Error("User not authenticated");
        }

        try {
            await saveFeedback(
                currentUser.uid,
                feedbackData.userMessage,
                feedbackData.aiMessage,
                feedbackData.reason,
                feedbackData.description
            );
            
            // Show success message
            alert("Geri bildiriminiz başarıyla gönderildi. Teşekkür ederiz!");
        } catch (error) {
            console.error("Error submitting feedback:", error);
            throw error; // Re-throw to let modal handle the error
        }
    };

    // Close feedback modal
    const closeFeedbackModal = () => {
        setFeedbackModalOpen(false);
        setSelectedFeedback(null);
    };

    // Function to ensure chat log has appropriate height
    const adjustChatLogHeight = () => {
        if (typeof window === 'undefined' || typeof document === 'undefined' || !chatLogRef.current) return;
        
        const chatContainer = chatLogRef.current.parentElement;
        if (chatContainer) {
            const containerHeight = chatContainer.clientHeight;
            const headerHeight = document.querySelector(`.${styles.chatHeader}`)?.clientHeight || 60;
            const formHeight = document.querySelector(`.${styles.chatForm}`)?.clientHeight || 60;
            const padding = 40; // Increased padding to ensure no overflow
            
            const availableHeight = containerHeight - headerHeight - formHeight - padding;
            chatLogRef.current.style.height = `${Math.max(200, availableHeight)}px`;
            chatLogRef.current.style.maxHeight = `${Math.max(200, availableHeight)}px`;
            
            // Ensure scrolling works by setting overflow explicitly
            chatLogRef.current.style.overflowY = 'auto';
            chatLogRef.current.style.display = 'flex';
            chatLogRef.current.style.flexDirection = 'column';
        }
    };
    
    // Adjust chat log height on window resize
    useEffect(() => {
        if (typeof window === 'undefined') return;
        
        adjustChatLogHeight();
        
        const handleResize = () => {
            adjustChatLogHeight();
        };
        
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    
    // Adjust chat log height when chat log content changes
    useEffect(() => {
        adjustChatLogHeight();
    }, [chatLog]);

    return (
        <div className={styles.chatPageContainer}>
            <div className={`${styles.sidebarContainer} ${sidebarOpen ? styles.open : ''}`}>
                <ConversationSidebar 
                    onSelectConversation={handleSelectConversation}
                    currentConversationId={currentConversationId}
                    onClose={toggleSidebar}
                />
            </div>
            
            <div className={styles.mainChatContainer}>
                <div className={styles.chatContainer}>
                    <div className={styles.chatHeader}>
                        <button 
                            className={styles.toggleSidebarButton}
                            onClick={toggleSidebar}
                        >
                            ☰
                        </button>
                        <h3>TherapyAI</h3>
                        <div className={styles.chatControls}>
                            <button 
                                className={`${styles.memoryButton} ${memoryEnabled ? styles.enabled : styles.disabled}`}
                                onClick={toggleMemoryEnabled}
                                title={memoryEnabled ? "Memory is enabled" : "Memory is disabled"}
                                type="button"
                            >
                                {memoryEnabled ? "🧠" : "🧠"}
                            </button>
                            
                            {(currentConversationId !== null) && chatLog.length > 0 && (
                                <button 
                                    className={styles.newChatButton}
                                    onClick={startNewConversation}
                                    type="button"
                                >
                                    Yeni Konuşma
                                </button>
                            )}
                        </div>
                    </div>
                    
                    {chatLog.length > 0 ? (
                        <div className={`${styles.chatLog} ${chatLog.length > 0 ? styles.filled : ''}`} ref={chatLogRef}>
                            {chatLog.map((msg, index) => {
                                const isLast = index === chatLog.length - 1;
                                const userMessage = msg.sender === "ai" && index > 0 ? chatLog[index - 1]?.text : null;
                                
                                return (
                                    <div
                                        key={index}
                                        className={`${msg.sender === "ai" ? styles.aiMessage : styles.userMessage} ${isLast ? styles.lastMessage : ''}`}
                                    >
                                        <p>{msg.text}</p>
                                        {msg.sender === "ai" && userMessage && (
                                            <button 
                                                className={styles.feedbackButton}
                                                onClick={() => handleFeedbackClick(msg.text, userMessage)}
                                                title="Bu yanıt hakkında geri bildirim ver"
                                            >
                                                💬
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                            {loading && <div className={styles.loadingMessage}>
                                <p>Yazıyor...</p>
                            </div>}
                            <div ref={messagesEndRef} />
                        </div>
                    ) : (
                        <div className={styles.emptyChat}>
                            <h2>TherapyAI'a Hoş Geldiniz</h2>
                            <p>Duygusal destek ve zihinsel iyi oluş konusunda size yardımcı olmak için buradayım.</p>
                            <p>Konuşmaya başlamak için bir mesaj gönderin veya sol menüden önceki bir konuşmayı seçin.</p>
                        </div>
                    )}
                    
                    <form onSubmit={handleSubmit} className={styles.chatForm}>
                        <input
                            type="text"
                            placeholder="Mesaj yazın..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            className={styles.chatInput}
                        />
                        <button type="submit" className={styles.sendButton} disabled={loading}>
                            {loading ? "Gönderiliyor..." : "Gönder"}
                        </button>
                    </form>
                </div>
            </div>
            
            {/* Overlay for mobile sidebar */}
            {sidebarOpen && (
                <div className={styles.overlay} onClick={toggleSidebar}></div>
            )}

            {/* Feedback Modal */}
            <FeedbackModal
                isOpen={feedbackModalOpen}
                onClose={closeFeedbackModal}
                onSubmit={handleFeedbackSubmit}
                aiMessage={selectedFeedback?.aiMessage}
                userMessage={selectedFeedback?.userMessage}
            />
        </div>
    );
};

export default ChatWidget;
