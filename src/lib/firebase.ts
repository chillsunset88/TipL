/**
 * TipL — Firebase Configuration
 * Modular Firebase v10+ with isolated listeners pattern.
 * Replace the config values with your actual Firebase project credentials.
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, initializeAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

// TODO: Replace with your actual Firebase config
const firebaseConfig = {
  apiKey: 'YOUR_API_KEY',
  authDomain: 'YOUR_PROJECT.firebaseapp.com',
  projectId: 'YOUR_PROJECT_ID',
  storageBucket: 'YOUR_PROJECT.appspot.com',
  messagingSenderId: 'YOUR_SENDER_ID',
  appId: 'YOUR_APP_ID',
};

// Singleton initialization — prevents re-init on hot reload
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Auth with AsyncStorage persistence for React Native
export const auth = getAuth(app);

// Firestore — primary data store
export const db = getFirestore(app);

// Storage — for images (proof of purchase, chat images, avatars)
export const storage = getStorage(app);

export default app;
