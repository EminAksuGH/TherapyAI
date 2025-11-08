# Next.js Migration Guide

This guide explains the changes made to secure your API keys by migrating to Next.js.

## What Changed

### 1. API Routes Created
- `/app/api/chat/route.js` - Handles OpenAI chat completions (server-side)
- `/app/api/analyze-memory/route.js` - Handles memory analysis (server-side)
- `/app/api/check-memory-similarity/route.js` - Handles memory similarity checks (server-side)

### 2. Client Code Updated
- `src/components/ChatWidget.jsx` - Now calls `/api/chat` instead of OpenAI directly
- `src/firebase/memoryService.js` - Now calls `/api/analyze-memory` and `/api/check-memory-similarity`

### 3. Environment Variables
- **Server-side (never exposed to client):**
  - `OPENAI_API_KEY` - Your OpenAI API key (secure, server-only)

- **Client-side (prefixed with NEXT_PUBLIC_):**
  - `NEXT_PUBLIC_FIREBASE_API_KEY`
  - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
  - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
  - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
  - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
  - `NEXT_PUBLIC_FIREBASE_APP_ID`
  - `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`

## Setup Instructions

### 1. Create `.env.local` file
Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

**Important:** 
- `OPENAI_API_KEY` is now server-side only and will NEVER be exposed to the client
- Use `NEXT_PUBLIC_` prefix for any client-side environment variables

### 2. Update Your Environment Variables
If you're migrating from Vite, update your `.env` file:
- Change `VITE_OPENAI_API_KEY` → Remove it (now server-side only)
- Change `VITE_FIREBASE_*` → `NEXT_PUBLIC_FIREBASE_*`

### 3. Run the Application

```bash
# Development
npm run dev

# Production build
npm run build
npm start
```

## Security Benefits

✅ **OpenAI API Key Protection**: Your API key is now stored server-side and never exposed to the client
✅ **Environment Variable Security**: Server-side variables (without `NEXT_PUBLIC_`) are never sent to the browser
✅ **API Route Security**: All OpenAI calls happen on the server, protecting your credentials

## Important Notes

1. **Firebase Config**: Updated to support both Next.js (`process.env`) and Vite (`import.meta.env`) during migration
2. **API Routes**: All API routes are in `/app/api/` directory using Next.js App Router format
3. **Backward Compatibility**: Firebase config will fall back to `VITE_` prefixed variables if `NEXT_PUBLIC_` are not found

## App Structure

The app now uses Next.js App Router with:
- `app/layout.jsx` - Root layout with theme script
- `app/page.jsx` - Home page (wraps your React Router app)
- `app/[...slug]/page.jsx` - Catch-all route for React Router navigation
- `app/api/` - API routes (server-side only)

Your existing React components in `src/` continue to work as before, but are now served through Next.js.

## Testing the Setup

1. **Start the dev server:**
   ```bash
   npm run dev
   ```

2. **Verify API routes work:**
   - Open browser dev tools
   - Check Network tab when sending a chat message
   - You should see requests to `/api/chat` (not `api.openai.com`)
   - Your OpenAI API key should NOT appear in any client-side code

3. **Check environment variables:**
   - Server-side vars (like `OPENAI_API_KEY`) are never exposed
   - Only `NEXT_PUBLIC_*` vars are available to the client

## Troubleshooting

### API Routes Not Working
- Ensure you're running `npm run dev` (Next.js dev server), not Vite
- Check that `.env.local` exists with `OPENAI_API_KEY` set
- Verify API routes are accessible at `/api/chat`, `/api/analyze-memory`, etc.

### Environment Variables Not Loading
- Client-side vars must be prefixed with `NEXT_PUBLIC_`
- Server-side vars (like `OPENAI_API_KEY`) should NOT have `NEXT_PUBLIC_` prefix
- Restart the dev server after changing `.env.local`

