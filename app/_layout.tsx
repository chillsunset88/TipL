import React, { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { ThemeProvider, DefaultTheme } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { onAuthChange, supabase } from '@/src/services/supabase';
import type { User } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Linking from 'expo-linking';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

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

export { ErrorBoundary } from 'expo-router';
export const unstable_settings = { initialRouteName: '(tabs)' };

SplashScreen.preventAutoHideAsync();

const TipLTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: Colors.primary,
    background: Colors.white,
    card: Colors.white,
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

  useEffect(() => { if (error) throw error; }, [error]);
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
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  const segments = useSegments();

  // Auth listener pakai onAuthChange dari supabase.js
  useEffect(() => {
    const unsub = onAuthChange((u: User | null) => {
      setUser(u);
      setInitializing(false);
    });
    return () => unsub();
  }, []);

  // Handle Supabase email confirmation / magic link deep links
  useEffect(() => {
    const handleDeepLink = async (url: string | null) => {
      if (!url) return;

      // PKCE flow: URL contains ?code=xxx
      const parsed = Linking.parse(url);
      const code = parsed.queryParams?.code as string | undefined;
      if (code) {
        await supabase.auth.exchangeCodeForSession(code);
        return;
      }

      // Implicit flow fallback: URL fragment contains access_token & refresh_token
      const fragment = url.split('#')[1];
      if (fragment) {
        const params = new URLSearchParams(fragment);
        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');
        if (accessToken && refreshToken) {
          await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
        }
      }

      // Xendit Redirects
      if (url.includes('payment-finished')) {
        Alert.alert('Payment Success', 'Your payment has been processed successfully!', [
          { text: 'View Orders', onPress: () => router.push('/profile/orders') }
        ]);
      } else if (url.includes('payment-failed')) {
        Alert.alert('Payment Failed', 'Something went wrong with your payment. Please try again.');
      }
    };

    Linking.getInitialURL().then(handleDeepLink);

    const subscription = Linking.addEventListener('url', (event) => {
      handleDeepLink(event.url);
    });

    return () => subscription.remove();
  }, []);

  // Auth guard
  useEffect(() => {
    if (initializing) return;
    const inAuthGroup = segments[0] === '(auth)';
    if (!user && !inAuthGroup) {
      router.replace('/(auth)/login' as any);
    } else if (user && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [user, initializing, segments]);

  if (initializing) return null;

  return (
    <ThemeProvider value={TipLTheme}>
      <StatusBar style="dark" />
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="search" options={{ headerShown: false, presentation: 'card', animation: 'fade' }} />
        <Stack.Screen name="product/[id]" options={{ headerShown: false, presentation: 'card' }} />
        <Stack.Screen name="(auth)/login" options={{ headerShown: false, presentation: 'fullScreenModal' }} />
        <Stack.Screen name="(auth)/register" options={{ headerShown: false, presentation: 'card' }} />
        <Stack.Screen name="trip/[id]" options={{ headerShown: false, presentation: 'card' }} />
        <Stack.Screen name="order/[id]" options={{ headerShown: false, presentation: 'card' }} />
        <Stack.Screen name="chat/[id]" options={{ headerShown: false, presentation: 'card' }} />
        <Stack.Screen name="cart" options={{ headerShown: false }} />
        <Stack.Screen name="payment/midtrans" options={{ headerShown: false, presentation: 'modal', gestureEnabled: false }} />
        <Stack.Screen name="payment/xendit-qr" options={{ headerShown: false, presentation: 'modal' }} />
        <Stack.Screen name="profile/settings" options={{ headerShown: false, presentation: 'card' }} />
        <Stack.Screen name="profile/edit" options={{ headerShown: false, presentation: 'card' }} />
        <Stack.Screen name="profile/trips" options={{ headerShown: false, presentation: 'card' }} />
        <Stack.Screen name="profile/orders" options={{ headerShown: false }} />
        <Stack.Screen name="profile/payments" options={{ headerShown: false, presentation: 'card' }} />
        <Stack.Screen name="profile/wishlist" options={{ headerShown: false, presentation: 'card' }} />
      </Stack>
    </ThemeProvider>
  );
}