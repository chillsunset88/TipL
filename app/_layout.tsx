/**
 * TipL — Root Layout
 * Mounts auth listener, deep link handler, navigation guard, fonts, and biometric lock.
 */

import React, { useEffect, useRef } from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { ThemeProvider, DefaultTheme } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, router, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { AppState, type AppStateStatus } from 'react-native';
import 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as Linking from 'expo-linking';

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

import Constants from 'expo-constants';
import { Colors } from '@/src/lib/constants';
import { useSettingsStore } from '@/src/store/settingsStore';
import { useAuthStore } from '@/src/store/authStore';
import { useAuthListener } from '@/src/lib/hooks/useAuth';
import { supabase } from '@/src/lib/supabase';
import { useBiometricStore } from '@/src/store/biometricStore';
import { LockScreen } from '@/src/components/LockScreen';
import { NotificationBanner } from '@/src/components/ui/NotificationBanner';

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
      useBiometricStore.getState().hydrate();
    }
  }, [loaded]);

  if (!loaded) return null;

  return <RootLayoutNav />;
}

const isExpoGo = Constants.executionEnvironment === 'storeClient';

function RootLayoutNav() {
  useAuthListener();

  const { isAuthenticated, isLoading } = useAuthStore();
  const { isEnabled, isLocked, lock, hydrated } = useBiometricStore();
  const segments = useSegments();
  const responseListener = useRef<{ remove: () => void } | null>(null);
  const appState = useRef<AppStateStatus>(AppState.currentState);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (nextState) => {
      if (
        appState.current === 'active' &&
        (nextState === 'background' || nextState === 'inactive')
      ) {
        appState.current = nextState;
      } else if (
        appState.current !== 'active' &&
        nextState === 'active' &&
        isEnabled &&
        isAuthenticated
      ) {
        // Baca langsung dari store — hindari stale closure.
        // Jangan lock kalau lock screen sudah tampil (isLocked = true),
        // karena itu berarti biometric/passcode dialog yang bikin app inactive,
        // bukan user yang beneran minimize app.
        const { isLocked: currentlyLocked } = useBiometricStore.getState();
        if (!currentlyLocked) {
          lock();
        }
        appState.current = nextState;
      } else {
        appState.current = nextState;
      }
    });
    return () => sub.remove();
  }, [isEnabled, isAuthenticated, lock]);

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (isAuthenticated && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, isLoading, segments]);

  useEffect(() => {
    const handleDeepLink = async ({ url }: { url: string }) => {
      if (!url) return;

      if (url.includes('?code=') || url.includes('&code=')) {
        try {
          const { error } = await supabase.auth.exchangeCodeForSession(url);
          if (error) console.warn('PKCE exchange error:', error.message);
        } catch (e) {
          console.warn('PKCE exchange failed:', e);
        }
        return;
      }

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

    const subscription = Linking.addEventListener('url', handleDeepLink);
    Linking.getInitialURL().then((url) => {
      if (url) handleDeepLink({ url });
    });

    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (!isExpoGo) {
      try {
        const Notifs = require('expo-notifications') as typeof import('expo-notifications');
        responseListener.current = Notifs.addNotificationResponseReceivedListener((response) => {
          const data = response.notification.request.content.data as Record<string, string>;
          if (data.type === 'order' && data.orderId) {
            router.push(`/order/${data.orderId}`);
          } else if (data.type === 'chat' && data.chatId) {
            router.push(`/chat/${data.chatId}`);
          }
        });
      } catch {}
    }

    return () => {
      responseListener.current?.remove();
    };
  }, []);

  const showLock = !isExpoGo && hydrated && isEnabled && isLocked && isAuthenticated;


  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={TipLTheme}>
        <StatusBar style={showLock ? 'light' : 'dark'} />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="cart" options={{ presentation: 'card' }} />
          <Stack.Screen name="search" options={{ presentation: 'card', animation: 'fade' }} />
          <Stack.Screen name="product/[id]" options={{ presentation: 'card' }} />
          <Stack.Screen name="auth/reset" options={{ presentation: 'card' }} />
          <Stack.Screen name="trip/[id]" options={{ presentation: 'card' }} />
          <Stack.Screen name="trip/create" options={{ presentation: 'card' }} />
          <Stack.Screen name="order/[id]" options={{ presentation: 'card' }} />
          <Stack.Screen name="chat/[id]" options={{ presentation: 'card' }} />
          <Stack.Screen name="profile/orders" options={{ presentation: 'card' }} />
          <Stack.Screen name="profile/settings" options={{ presentation: 'card' }} />
          <Stack.Screen name="profile/edit" options={{ presentation: 'card' }} />
          <Stack.Screen name="profile/trips" options={{ presentation: 'card' }} />
          <Stack.Screen name="profile/payments" options={{ presentation: 'card' }} />
          <Stack.Screen name="profile/wishlist" options={{ presentation: 'card' }} />
          <Stack.Screen name="request/create" options={{ presentation: 'card' }} />
          <Stack.Screen name="request/index" options={{ presentation: 'card' }} />
          <Stack.Screen name="notifications" options={{ presentation: 'card' }} />
          <Stack.Screen name="wallet/topup" options={{ presentation: 'card' }} />
          <Stack.Screen name="destination/[name]" options={{ presentation: 'card' }} />
          <Stack.Screen name="verification" options={{ presentation: 'card', headerShown: false }} />
          <Stack.Screen name="admin/verifications" options={{ presentation: 'card', headerShown: false }} />
          <Stack.Screen name="admin/orders" options={{ presentation: 'card', headerShown: false }} />
        </Stack>

        {showLock && <LockScreen />}
        <NotificationBanner />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}