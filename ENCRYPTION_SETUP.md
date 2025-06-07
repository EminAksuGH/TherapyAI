# Message and Memory Encryption Setup

This application now includes end-to-end encryption for all user messages and AI responses, as well as memory content stored in the database.

## Encryption Method

- **Algorithm**: AES-GCM (256-bit)
- **Implementation**: Web Crypto API (built into modern browsers)
- **IV**: Randomly generated 12-byte initialization vector for each encryption
- **Format**: Base64-encoded (IV + encrypted data)

## Environment Configuration

Add the following environment variable to your `.env` file:

```env
VITE_ENCRYPTION_KEY=your-32-character-encryption-key-here-change-this-in-production
```

**Important Security Notes:**

1. **Change the default key**: The default key should only be used for development
2. **Key length**: Must be exactly 32 characters for AES-256
3. **Production security**: Consider using a proper key management service (AWS KMS, Azure Key Vault, etc.)
4. **Key rotation**: Implement key rotation strategy for production use

## What Gets Encrypted

### Messages
- ✅ User messages in conversations
- ✅ AI response messages  
- ✅ All conversation message content

### Conversation Titles
- ✅ Conversation titles (derived from first user message)
- ✅ Initial "Yeni Konuşma" titles
- ✅ Auto-generated titles from message content

### Memory System
- ✅ Memory content/descriptions
- ✅ User-requested memories
- ✅ AI-analyzed memories
- ❌ Memory topics (kept unencrypted for categorization)
- ❌ Metadata (timestamps, importance scores, etc.)

## How It Works

### Encryption Process
1. User sends a message → encrypted before saving to Firestore
2. AI generates response → encrypted before saving to Firestore  
3. Conversation title → encrypted when created/updated
4. Memory created → content encrypted before saving

### Decryption Process
1. Load conversation → decrypt each message for display
2. Load conversation list → decrypt titles for sidebar display
3. Load memories → decrypt content for AI context
4. Search memories → decrypt content for searching

## Technical Implementation

### Encryption Service
Located in `src/firebase/encryptionService.js`:

- `encryptMessage(message)` - Encrypts a single message
- `decryptMessage(encryptedMessage)` - Decrypts a single message
- `encryptMemoryContent(content)` - Encrypts memory content
- `decryptMemoryContent(encryptedContent)` - Decrypts memory content

### Integration Points
- **ChatWidget**: Encrypts messages and titles before Firestore save, decrypts on load
- **ConversationSidebar**: Decrypts conversation titles for display in sidebar
- **Memory Service**: Encrypts memory content before save, decrypts on retrieval
- **Search Functions**: Decrypt content for client-side searching

## Benefits

1. **Privacy Protection**: Message content encrypted at rest in database
2. **Security**: Even database administrators cannot read conversation content
3. **Compliance**: Helps meet privacy regulations (GDPR, HIPAA, etc.)
4. **Zero-Knowledge**: Only the client with the correct key can decrypt content

## Limitations

1. **Client-Side Decryption**: Encryption key must be available to client
2. **Search Performance**: Content must be decrypted client-side for searching
3. **Key Management**: Manual key management (consider upgrading for production)
4. **Backward Compatibility**: Existing unencrypted data remains unencrypted

## Migration Notes

- Existing messages and memories are NOT automatically encrypted
- New messages and memories will be encrypted going forward
- The system gracefully handles both encrypted and unencrypted content
- Use the `isEncrypted()` function to detect content type

## Future Improvements

1. **Server-Side Search**: Implement searchable encryption or encrypted search indices
2. **Key Management**: Integrate with proper key management services
3. **Key Rotation**: Implement automatic key rotation
4. **Migration Tool**: Create utility to encrypt existing data
5. **User-Specific Keys**: Individual encryption keys per user 