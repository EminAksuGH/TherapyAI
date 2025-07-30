// Get encryption key from environment variables
// In production, consider using a more secure key management solution
const ENCRYPTION_KEY_STRING = import.meta.env.VITE_ENCRYPTION_KEY;

// Convert string key to CryptoKey object
let cryptoKey = null;

/**
 * Initialize the crypto key from the string
 */
const initializeCryptoKey = async () => {
    if (cryptoKey) return cryptoKey;
    
    try {
        // Ensure key is exactly 32 bytes (256 bits)
        const keyString = ENCRYPTION_KEY_STRING.padEnd(32, '0').substring(0, 32);
        const keyBuffer = new TextEncoder().encode(keyString);
        
        cryptoKey = await window.crypto.subtle.importKey(
            'raw',
            keyBuffer,
            { name: 'AES-GCM' },
            false,
            ['encrypt', 'decrypt']
        );
        
        return cryptoKey;
    } catch (error) {
        console.error('Error initializing crypto key:', error);
        throw error;
    }
};

/**
 * Encrypt a message using AES-GCM
 * @param {string} message - The message to encrypt
 * @returns {Promise<string>} - The encrypted message (base64 encoded)
 */
export const encryptMessage = async (message) => {
    try {
        if (!message || typeof message !== 'string') {
            return message;
        }
        
        const key = await initializeCryptoKey();
        const encoder = new TextEncoder();
        const data = encoder.encode(message);
        
        // Generate a random IV (12 bytes for GCM)
        const iv = window.crypto.getRandomValues(new Uint8Array(12));
        
        // Encrypt the data
        const encrypted = await window.crypto.subtle.encrypt(
            {
                name: 'AES-GCM',
                iv: iv
            },
            key,
            data
        );
        
        // Combine IV and encrypted data
        const combined = new Uint8Array(iv.length + encrypted.byteLength);
        combined.set(iv);
        combined.set(new Uint8Array(encrypted), iv.length);
        
        // Convert to base64
        return btoa(String.fromCharCode(...combined));
    } catch (error) {
        console.error('Error encrypting message:', error);
        // In case of encryption failure, return original message
        return message;
    }
};

/**
 * Decrypt a message using AES-GCM
 * @param {string} encryptedMessage - The encrypted message to decrypt (base64 encoded)
 * @returns {Promise<string>} - The decrypted message
 */
export const decryptMessage = async (encryptedMessage) => {
    try {
        if (!encryptedMessage || typeof encryptedMessage !== 'string') {
            return encryptedMessage;
        }
        
        // Check if the message looks like it's encrypted
        if (!isEncrypted(encryptedMessage)) {
            return encryptedMessage;
        }
        
        const key = await initializeCryptoKey();
        
        // Convert from base64
        const combined = new Uint8Array(
            atob(encryptedMessage)
                .split('')
                .map(char => char.charCodeAt(0))
        );
        
        // Extract IV (first 12 bytes) and encrypted data
        const iv = combined.slice(0, 12);
        const encryptedData = combined.slice(12);
        
        // Decrypt the data
        const decrypted = await window.crypto.subtle.decrypt(
            {
                name: 'AES-GCM',
                iv: iv
            },
            key,
            encryptedData
        );
        
        // Convert back to string
        const decoder = new TextDecoder();
        return decoder.decode(decrypted);
    } catch (error) {
        console.error('Error decrypting message:', error);
        // In case of decryption failure, return original message
        return encryptedMessage;
    }
};

/**
 * Simple heuristic to check if a message appears to be encrypted
 * @param {string} message - The message to check
 * @returns {boolean} - Whether the message appears to be encrypted
 */
const isEncrypted = (message) => {
    // Encrypted messages are base64-encoded and should be at least 16 characters
    if (message.length < 16) return false;
    
    // Check for base64 pattern - if it matches base64 and is long enough, it's likely encrypted
    const base64Pattern = /^[A-Za-z0-9+/]+=*$/;
    if (!base64Pattern.test(message)) return false;
    
    // Additional heuristics for encrypted content:
    // 1. Encrypted messages are typically longer than 32 characters (due to IV + encrypted data)
    // 2. They have a more random character distribution
    // 3. They don't have spaces (base64 doesn't contain spaces)
    
    if (message.length < 24) return false; // Too short to be our encrypted format
    
    // Check if it contains spaces - encrypted base64 shouldn't have spaces
    if (message.includes(' ')) return false;
    
    // Check for very obvious plain text patterns (but be more careful about short sequences)
    const obviousPlainTextPatterns = [
        /\b(hello|merhaba|nasılsın|how are you|selam)\b/i,  // Full words only
        /^[a-zA-Z\s]{3,}$/,  // Only letters and spaces (plain text)
        /\.(com|org|net|tr)$/i,  // URLs
        /@[a-zA-Z0-9]/i  // Email addresses
    ];
    
    for (const pattern of obviousPlainTextPatterns) {
        if (pattern.test(message)) {
            return false; // Likely plain text
        }
    }
    
    return true; // Likely encrypted
};

/**
 * Encrypt memory content
 * @param {string} content - The memory content to encrypt
 * @returns {Promise<string>} - The encrypted content
 */
export const encryptMemoryContent = async (content) => {
    return await encryptMessage(content);
};

/**
 * Decrypt memory content
 * @param {string} encryptedContent - The encrypted memory content to decrypt
 * @returns {Promise<string>} - The decrypted content
 */
export const decryptMemoryContent = async (encryptedContent) => {
    return await decryptMessage(encryptedContent);
};

/**
 * Batch encrypt multiple messages
 * @param {Array} messages - Array of message objects with text property
 * @returns {Promise<Array>} - Array of messages with encrypted text
 */
export const encryptMessages = async (messages) => {
    const encryptedMessages = [];
    for (const message of messages) {
        const encryptedText = await encryptMessage(message.text);
        encryptedMessages.push({
            ...message,
            text: encryptedText
        });
    }
    return encryptedMessages;
};

/**
 * Batch decrypt multiple messages
 * @param {Array} messages - Array of message objects with encrypted text
 * @returns {Promise<Array>} - Array of messages with decrypted text
 */
export const decryptMessages = async (messages) => {
    const decryptedMessages = [];
    for (const message of messages) {
        const decryptedText = await decryptMessage(message.text);
        decryptedMessages.push({
            ...message,
            text: decryptedText
        });
    }
    return decryptedMessages;
}; 