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
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as Notifications from 'expo-notifications';
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
  useAuthListener();

  const { isAuthenticated, isLoading } = useAuthStore();
  const segments = useSegments();
  const notificationListener = useRef<Notifications.EventSubscription | null>(null);
  const responseListener = useRef<Notifications.EventSubscription | null>(null);

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
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={TipLTheme}>
        <StatusBar style="dark" />
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
          <Stack.Screen name="payment/midtrans" options={{ presentation: 'modal', gestureEnabled: false }} />
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
        </Stack>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
