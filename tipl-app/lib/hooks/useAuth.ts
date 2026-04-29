/**
 * TipL — Auth Hook
 * Firebase Auth state observer with Zustand integration.
 */

import { useEffect } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, updateProfile } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useAuthStore } from '@/stores/authStore';
import { User } from '@/lib/types';

/** Subscribe to Firebase Auth state changes */
export function useAuthListener() {
  const setUser = useAuthStore((s) => s.setUser);
  const setLoading = useAuthStore((s) => s.setLoading);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Fetch extended user profile from Firestore
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (userDoc.exists()) {
          setUser(userDoc.data() as User);
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
      } else {
        setUser(null);
      }
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
