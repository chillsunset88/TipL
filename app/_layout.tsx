/**
 * TipL — Root Layout
 * Mounts auth listener, deep link handler, navigation guard, and fonts.
 */

import React, { useEffect, useRef } from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { ThemeProvider, DefaultTheme } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, router, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
<<<<<<< Updated upstream
=======
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as Notifications from 'expo-notifications';
import * as Linking from 'expo-linking';
>>>>>>> Stashed changes

import {
  PlayfairDisplay_400Regular,
  PlayfairDisplay_700Bold,
} from '@expo-google-fonts/playfair-display';

import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';

import { Colors } from '@/src/lib/constants';
import { useSettingsStore } from '@/src/store/settingsStore';
import { useAuthStore } from '@/src/store/authStore';
import { useAuthListener } from '@/src/lib/hooks/useAuth';
import { supabase } from '@/src/lib/supabase';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

SplashScreen.preventAutoHideAsync();

const TipLTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: Colors.primary,
    background: Colors.offWhite,
    card: Colors.offWhite,
    text: Colors.nearBlack,
    border: Colors.lightGray,
    notification: Colors.primary,
  },
};

export default function RootLayout() {
  const [loaded, error] = useFonts({
    PlayfairDisplay: PlayfairDisplay_400Regular,
    'PlayfairDisplay-Bold': PlayfairDisplay_700Bold,
    'Inter-Regular': Inter_400Regular,
    'Inter-Medium': Inter_500Medium,
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Bold': Inter_700Bold,
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
      useSettingsStore.getState().loadSettings();
    }
  }, [loaded]);

  if (!loaded) return null;

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  // ── Auth listener — MUST be mounted here so it runs for the entire app lifetime
  useAuthListener();

  const { isAuthenticated, isLoading } = useAuthStore();
  const segments = useSegments();
  const notificationListener = useRef<Notifications.EventSubscription | null>(null);
  const responseListener = useRef<Notifications.EventSubscription | null>(null);

  // ── Navigation guard: redirect based on auth state ──────────────────────────
  useEffect(() => {
    if (isLoading) return; // Wait until auth state is resolved

    const inAuthGroup = segments[0] === '(auth)';

    if (!isAuthenticated && !inAuthGroup) {
      // Not signed in — redirect to login
      router.replace('/(auth)/login');
    } else if (isAuthenticated && inAuthGroup) {
      // Already signed in — redirect away from auth screens
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, isLoading, segments]);

  // ── Deep link handler for Supabase email confirmation ──────────────────────
  useEffect(() => {
    const handleDeepLink = async ({ url }: { url: string }) => {
      if (!url) return;

      // PKCE flow: Supabase redirects with ?code=xxx
      if (url.includes('?code=') || url.includes('&code=')) {
        try {
          const { error } = await supabase.auth.exchangeCodeForSession(url);
          if (error) console.warn('PKCE exchange error:', error.message);
        } catch (e) {
          console.warn('PKCE exchange failed:', e);
        }
        return;
      }

      // Implicit flow: Supabase redirects with #access_token=xxx
      const hashIndex = url.indexOf('#');
      if (hashIndex !== -1) {
        const hash = url.slice(hashIndex + 1);
        if (hash.includes('access_token')) {
          const params = new URLSearchParams(hash);
          const accessToken = params.get('access_token');
          const refreshToken = params.get('refresh_token');
          if (accessToken && refreshToken) {
            try {
              await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken,
              });
            } catch (e) {
              console.warn('Session set failed:', e);
            }
          }
        }
      }
    };

    // Listen for URLs while app is open
    const subscription = Linking.addEventListener('url', handleDeepLink);

    // Handle URL that launched the app (cold start via deep link)
    Linking.getInitialURL().then((url) => {
      if (url) handleDeepLink({ url });
    });

    return () => subscription.remove();
  }, []);

  // ── Push notification tap handler ───────────────────────────────────────────
  useEffect(() => {
    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data as Record<string, string>;
      if (data.type === 'order' && data.orderId) {
        router.push(`/order/${data.orderId}`);
      } else if (data.type === 'chat' && data.chatId) {
        router.push(`/chat/${data.chatId}`);
      }
    });

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, []);

  return (
<<<<<<< Updated upstream
    <ThemeProvider value={TipLTheme}>
      <StatusBar style="dark" />
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="search"
          options={{ headerShown: false, presentation: 'card', animation: 'fade' }}
        />
        <Stack.Screen
          name="product/[id]"
          options={{ headerShown: false, presentation: 'card' }}
        />
        <Stack.Screen
          name="auth/login"
          options={{ headerShown: false, presentation: 'fullScreenModal' }}
        />
        <Stack.Screen
          name="auth/register"
          options={{ headerShown: false, presentation: 'card' }}
        />
        <Stack.Screen
          name="trip/[id]"
          options={{ headerShown: false, presentation: 'card' }}
        />
        <Stack.Screen
          name="order/[id]"
          options={{ headerShown: false, presentation: 'card' }}
        />
        <Stack.Screen
          name="chat/[id]"
          options={{ headerShown: false, presentation: 'card' }}
        />
        <Stack.Screen
          name="payment/midtrans"
          options={{ headerShown: false, presentation: 'modal', gestureEnabled: false }}
        />
        <Stack.Screen
          name="profile/settings"
          options={{ headerShown: false, presentation: 'card' }}
        />
        <Stack.Screen
          name="profile/edit"
          options={{ headerShown: false, presentation: 'card' }}
        />
        <Stack.Screen
          name="profile/trips"
          options={{ headerShown: false, presentation: 'card' }}
        />
        <Stack.Screen
          name="profile/payments"
          options={{ headerShown: false, presentation: 'card' }}
        />
        <Stack.Screen
          name="profile/wishlist"
          options={{ headerShown: false, presentation: 'card' }}
        />
      </Stack>
    </ThemeProvider>
=======
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={TipLTheme}>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="cart" options={{ presentation: 'card' }} />
          <Stack.Screen
            name="search"
            options={{ presentation: 'card', animation: 'fade' }}
          />
          <Stack.Screen
            name="product/[id]"
            options={{ headerShown: false, presentation: 'card' }}
          />
          <Stack.Screen
            name="auth/reset"
            options={{ headerShown: false, presentation: 'card' }}
          />
          <Stack.Screen
            name="trip/[id]"
            options={{ headerShown: false, presentation: 'card' }}
          />
          <Stack.Screen
            name="trip/create"
            options={{ headerShown: false, presentation: 'card' }}
          />
          <Stack.Screen
            name="order/[id]"
            options={{ headerShown: false, presentation: 'card' }}
          />
          <Stack.Screen
            name="chat/[id]"
            options={{ headerShown: false, presentation: 'card' }}
          />
          <Stack.Screen
            name="payment/midtrans"
            options={{ headerShown: false, presentation: 'modal', gestureEnabled: false }}
          />
          <Stack.Screen
            name="profile/orders"
            options={{ headerShown: false, presentation: 'card' }}
          />
          <Stack.Screen
            name="profile/settings"
            options={{ headerShown: false, presentation: 'card' }}
          />
          <Stack.Screen
            name="profile/edit"
            options={{ headerShown: false, presentation: 'card' }}
          />
          <Stack.Screen
            name="profile/trips"
            options={{ headerShown: false, presentation: 'card' }}
          />
          <Stack.Screen
            name="profile/payments"
            options={{ headerShown: false, presentation: 'card' }}
          />
          <Stack.Screen
            name="profile/wishlist"
            options={{ headerShown: false, presentation: 'card' }}
          />
          <Stack.Screen
            name="request/create"
            options={{ headerShown: false, presentation: 'card' }}
          />
          <Stack.Screen
            name="request/index"
            options={{ headerShown: false, presentation: 'card' }}
          />
          <Stack.Screen
            name="notifications"
            options={{ headerShown: false, presentation: 'card' }}
          />
          <Stack.Screen
            name="wallet/topup"
            options={{ headerShown: false, presentation: 'card' }}
          />
        </Stack>
      </ThemeProvider>
    </GestureHandlerRootView>
>>>>>>> Stashed changes
  );
}
