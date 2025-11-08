# Railway Environment Variables Setup for Next.js

## Required Changes

Since we migrated from Vite to Next.js, you need to update your Railway environment variables:

### 1. **Client-Side Variables** (Change `VITE_` to `NEXT_PUBLIC_`)

**Rename these in Railway:**
- `VITE_FIREBASE_API_KEY` → `NEXT_PUBLIC_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN` → `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID` → `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET` → `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID` → `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID` → `NEXT_PUBLIC_FIREBASE_APP_ID`
- `VITE_FIREBASE_MEASUREMENT_ID` → `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`
- `VITE_ENCRYPTION_KEY` → `NEXT_PUBLIC_ENCRYPTION_KEY`

### 2. **Server-Side Variables** (Remove `VITE_` prefix)

**Rename this:**
- `VITE_OPENAI_API_KEY` → `OPENAI_API_KEY` (NO prefix - server-side only!)

## Steps to Update in Railway

1. Go to your Railway project dashboard
2. Navigate to your service → Variables tab
3. For each `VITE_*` variable:
   - Click the variable name
   - Rename it (change `VITE_` to `NEXT_PUBLIC_` for client-side, or remove prefix for server-side)
   - Keep the same value
   - Save

**OR** (easier method):
1. Delete all old `VITE_*` variables
2. Add new variables with `NEXT_PUBLIC_` prefix (copy values from old ones)
3. Add `OPENAI_API_KEY` without prefix (copy value from `VITE_OPENAI_API_KEY`)

## Important Notes

- **`OPENAI_API_KEY`** should NOT have `NEXT_PUBLIC_` prefix - it's server-side only and will never be exposed to the client
- All Firebase variables MUST have `NEXT_PUBLIC_` prefix - they're used in client-side code
- After updating variables, Railway will automatically redeploy your app
- The old `VITE_*` variables can be deleted after migration is complete

## Verification

After deployment, check:
1. Firebase should initialize correctly (no API key errors)
2. Chat functionality should work
3. Check browser console - should NOT see any environment variable errors
4. Your OpenAI API key should NOT appear in browser DevTools (security check)

