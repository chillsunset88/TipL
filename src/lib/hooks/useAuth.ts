import { useEffect } from 'react';
import { supabase } from '@/src/lib/supabase';
import { useAuthStore } from '@/src/store/authStore';
import { getProfile } from '@/src/services/supabase/profiles';
import { signIn, signUp, signOut, resetPassword } from '@/src/services/supabase/auth';

export function useAuthListener() {
  const setUser = useAuthStore((s) => s.setUser);
  const setLoading = useAuthStore((s) => s.setLoading);

  useEffect(() => {
<<<<<<< Updated upstream
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
=======
    setLoading(true);

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        try {
          const profile = await getProfile(session.user.id);
          setUser({
            id: session.user.id,
            email: session.user.email ?? '',
            displayName: profile?.full_name ?? session.user.email?.split('@')[0] ?? 'User',
            avatarUrl: profile?.avatar_url ?? null,
            phone: profile?.phone ?? '',
            rating: profile?.rating ?? 0,
            reviewCount: profile?.total_reviews ?? 0,
            verified: (profile?.total_trips ?? 0) >= 10,
            createdAt: new Date(profile?.created_at ?? Date.now()).getTime(),
            bio: profile?.bio ?? undefined,
            role: (profile?.role as 'tiper' | 'triper') ?? 'tiper',
          });
        } catch {
          setUser({
            id: session.user.id,
            email: session.user.email ?? '',
            displayName: session.user.email?.split('@')[0] ?? 'User',
            avatarUrl: null,
>>>>>>> Stashed changes
            phone: '',
            rating: 0,
            reviewCount: 0,
            verified: false,
            createdAt: Date.now(),
<<<<<<< Updated upstream
          };
          await setDoc(doc(db, 'users', firebaseUser.uid), newUser);
          setUser(newUser);
=======
            role: 'tiper',
          });
>>>>>>> Stashed changes
        }
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [setUser, setLoading]);
}

export { signIn as loginWithEmail, signUp as registerWithEmail, signOut as logoutUser, resetPassword };
