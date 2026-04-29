/**
 * TipL — Root Layout
 * Global providers: fonts (Playfair Display + Inter), auth listener, navigation.
 */

import React, { useEffect } from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { ThemeProvider, DefaultTheme } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

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

import { Colors } from '@/lib/constants';

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
    background: Colors.white,
    card: Colors.white,
    text: Colors.nearBlack,
    border: Colors.lightGray,
    notification: Colors.primary,
  },
};

export default function RootLayout() {
  const [loaded, error] = useFonts({
    // Serif — Playfair Display
    PlayfairDisplay: PlayfairDisplay_400Regular,
    'PlayfairDisplay-Bold': PlayfairDisplay_700Bold,
    // Sans — Inter
    'Inter-Regular': Inter_400Regular,
    'Inter-Medium': Inter_500Medium,
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Bold': Inter_700Bold,
    // FontAwesome for vector icons fallback
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  return (
    <ThemeProvider value={TipLTheme}>
      <StatusBar style="dark" />
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
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
  );
}
