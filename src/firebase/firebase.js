// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
// Uses Next.js environment variables (process.env.NEXT_PUBLIC_*)
// In Next.js, these are replaced at build time for client-side code
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Debug: Check if API key is loaded (remove in production)
if (!firebaseConfig.apiKey) {
  console.error('❌ Firebase API key is missing!');
  console.error('Make sure .env.local has NEXT_PUBLIC_FIREBASE_API_KEY and restart the dev server');
  console.log('Current process.env keys:', typeof process !== 'undefined' ? Object.keys(process.env || {}).filter(k => k.startsWith('NEXT_PUBLIC_')) : 'process not available');
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Set custom action handler URL for password reset and email verification
auth.config.actionCodeUrl = 'https://eminaksu.tr/action-handler';

export { auth, db }; 