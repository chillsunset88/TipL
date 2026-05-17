import { useEffect } from 'react';
import { Platform } from 'react-native';
import { supabase } from '@/src/lib/supabase';
import { useAuthStore } from '@/src/store/authStore';
import { getProfile } from '@/src/services/supabase/profiles';
import { signIn, signUp, signOut, resetPassword } from '@/src/services/supabase/auth';
import { registerForPushNotifications, unregisterPushToken } from '@/src/services/notifications/pushNotifications';
import { getUnreadNotifCount } from '@/src/services/supabase/notifications';
import { useNotificationStore } from '@/src/store/notificationStore';

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
    let notifChannel: ReturnType<typeof supabase.channel> | null = null;
    let lastUserId: string | null = null;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      // Tear down old subscriptions when user changes
      if (profileChannel) { supabase.removeChannel(profileChannel); profileChannel = null; }
      if (notifChannel) { supabase.removeChannel(notifChannel); notifChannel = null; }

      if (session?.user) {
        const userId = session.user.id;
        const email = session.user.email ?? '';
        lastUserId = userId;

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

        // Register push token (no-op di Expo Go)
        registerForPushNotifications(userId).catch(() => {});

        // Sync badge count ke store
        getUnreadNotifCount(userId)
          .then((n) => useNotificationStore.getState().setCount(n))
          .catch(() => {});

        // Subscribe realtime: increment badge saat notifikasi baru masuk
        notifChannel = supabase
          .channel(`notifs-badge:${userId}`)
          .on('postgres_changes', {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${userId}`,
          }, () => {
            useNotificationStore.getState().incrementCount();
          })
          .subscribe();

        // Subscribe profile updates (e.g. admin approves verification)
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
              } catch {}
            },
          )
          .subscribe();
      } else {
        // Logout — bersihkan push token dan reset badge
        if (lastUserId) {
          unregisterPushToken(lastUserId).catch(() => {});
          lastUserId = null;
        }
        useNotificationStore.getState().setCount(0);
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
      if (profileChannel) supabase.removeChannel(profileChannel);
      if (notifChannel) supabase.removeChannel(notifChannel);
    };
  }, [setUser, setLoading]);
}

export { signIn as loginWithEmail, signUp as registerWithEmail, signOut as logoutUser, resetPassword };
