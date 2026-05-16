import { useEffect } from 'react';
import { supabase } from '@/src/lib/supabase';
import { useAuthStore } from '@/src/store/authStore';
import { getProfile } from '@/src/services/supabase/profiles';
import { signIn, signUp, signOut, resetPassword } from '@/src/services/supabase/auth';

function buildUserFromProfile(
  userId: string,
  email: string,
  profile: Awaited<ReturnType<typeof getProfile>>,
) {
  const role = (profile?.role as 'tiper' | 'triper' | 'admin') ?? 'tiper';
  const rawStatus = profile?.verification_status;
  const verificationStatus = (rawStatus as 'none' | 'pending' | 'approved' | 'rejected') ??
    (role === 'triper' ? 'approved' : 'none');
  return {
    id: userId,
    email,
    displayName: profile?.full_name ?? email.split('@')[0] ?? 'User',
    avatarUrl: profile?.avatar_url ?? null,
    phone: profile?.phone ?? '',
    rating: profile?.rating ?? 0,
    reviewCount: profile?.total_reviews ?? 0,
    verified: (profile?.total_trips ?? 0) >= 10,
    createdAt: new Date(profile?.created_at ?? Date.now()).getTime(),
    bio: profile?.bio ?? undefined,
    role,
    verificationStatus,
  };
}

export function useAuthListener() {
  const setUser = useAuthStore((s) => s.setUser);
  const setLoading = useAuthStore((s) => s.setLoading);

  useEffect(() => {
    setLoading(true);
    let profileChannel: ReturnType<typeof supabase.channel> | null = null;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      // Tear down old profile subscription when user changes
      if (profileChannel) {
        supabase.removeChannel(profileChannel);
        profileChannel = null;
      }

      if (session?.user) {
        const userId = session.user.id;
        const email = session.user.email ?? '';

        try {
          const profile = await getProfile(userId);
          setUser(buildUserFromProfile(userId, email, profile));
        } catch {
          setUser({
            id: userId,
            email,
            displayName: email.split('@')[0] ?? 'User',
            avatarUrl: null,
            phone: '',
            rating: 0,
            reviewCount: 0,
            verified: false,
            createdAt: Date.now(),
            role: 'tiper' as const,
            verificationStatus: 'none' as const,
          });
        }

        // Listen for profile updates (e.g. admin approves verification)
        profileChannel = supabase
          .channel(`profile:${userId}`)
          .on(
            'postgres_changes',
            {
              event: 'UPDATE',
              schema: 'public',
              table: 'profiles',
              filter: `id=eq.${userId}`,
            },
            async () => {
              try {
                const updated = await getProfile(userId);
                setUser(buildUserFromProfile(userId, email, updated));
              } catch {
                // silently ignore — user will see updated state on next focus
              }
            },
          )
          .subscribe();
      } else {
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
      if (profileChannel) supabase.removeChannel(profileChannel);
    };
  }, [setUser, setLoading]);
}

export { signIn as loginWithEmail, signUp as registerWithEmail, signOut as logoutUser, resetPassword };
