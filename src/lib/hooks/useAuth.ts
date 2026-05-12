/**
 * TipL — Auth Hook
 * Firebase Auth state observer with Zustand integration.
 */

import { useEffect } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, updateProfile } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/src/lib/firebase';
import { useAuthStore } from '@/src/store/authStore';
import { User } from '@/src/lib/types';

/** Subscribe to Firebase Auth state changes */
export function useAuthListener() {
  const setUser = useAuthStore((s) => s.setUser);
  const setLoading = useAuthStore((s) => s.setLoading);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Fetch extended user profile from Firestore
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            // Ensure the data matches our User interface
            const user: User = {
              id: firebaseUser.uid,
              email: userData.email || firebaseUser.email || '',
              displayName: userData.displayName || userData.name || firebaseUser.displayName || 'User',
              avatarUrl: userData.avatarUrl || firebaseUser.photoURL || null,
              phone: userData.phone || '',
              rating: userData.rating || 0,
              reviewCount: userData.reviewCount || 0,
              verified: userData.verified || false,
              createdAt: userData.createdAt || userData.created_at?.toMillis?.() || Date.now(),
              bio: userData.bio,
            };
            setUser(user);
          } else {
            // First-time user — create profile
            const newUser: User = {
              id: firebaseUser.uid,
              email: firebaseUser.email ?? '',
              displayName: firebaseUser.displayName ?? 'User',
              avatarUrl: firebaseUser.photoURL,
              phone: '',
              rating: 0,
              reviewCount: 0,
              verified: false,
              createdAt: Date.now(),
            };
            await setDoc(doc(db, 'users', firebaseUser.uid), newUser);
            setUser(newUser);
          }
        } catch (error) {
          console.error('Error loading user profile:', error);
          // Fallback to basic Firebase user data
          const fallbackUser: User = {
            id: firebaseUser.uid,
            email: firebaseUser.email ?? '',
            displayName: firebaseUser.displayName ?? 'User',
            avatarUrl: firebaseUser.photoURL,
            phone: '',
            rating: 0,
            reviewCount: 0,
            verified: false,
            createdAt: Date.now(),
          };
          setUser(fallbackUser);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [setUser, setLoading]);
}

/** Sign in with email + password */
export async function loginWithEmail(email: string, password: string) {
  return signInWithEmailAndPassword(auth, email, password);
}

/** Register with email + password + display name */
export async function registerWithEmail(
  email: string,
  password: string,
  displayName: string
) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(cred.user, { displayName });

  const newUser: User = {
    id: cred.user.uid,
    email,
    displayName,
    avatarUrl: null,
    phone: '',
    rating: 0,
    reviewCount: 0,
    verified: false,
    createdAt: Date.now(),
  };
  await setDoc(doc(db, 'users', cred.user.uid), newUser);
  return cred;
}

/** Sign out */
export async function logoutUser() {
  return signOut(auth);
}
