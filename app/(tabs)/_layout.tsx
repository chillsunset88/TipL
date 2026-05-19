/**
 * TipL — Tab Navigator Layout
 * Bottom tabs: Home, Marketplace, Create (+), Chats, Profile
 * Premium styling with gold accent on active tab.
 */

import React from 'react';

import { Platform } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Typography, Shadows } from '@/src/lib/constants';
import { useThemeColors, useIsDark } from '@/src/lib/hooks/useThemeColors';
import { useChatStore } from '@/src/store/chatStore';
import { useSettingsStore } from '@/src/store/settingsStore';

export default function TabLayout() {
  const totalUnread = useChatStore((s) => s.totalUnread);
  const { t } = useSettingsStore();
  const C = useThemeColors();
  const isDark = useIsDark();
  const insets = useSafeAreaInsets();

    const TAB_CONTENT_HEIGHT = Platform.OS === 'ios' ? 50 : 54;
  const tabBarHeight = TAB_CONTENT_HEIGHT + insets.bottom;

  return (
    <>
      <Tabs
      screenListeners={{
        tabPress: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
      }}
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: isDark ? C.midGray : Colors.midGray,
        tabBarLabelStyle: {
          fontFamily: Typography.medium.fontFamily,
          fontSize: 11,
          marginTop: -2,
          letterSpacing: 0.2,
        },
        tabBarStyle: {
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: C.offWhite,
          borderTopWidth: 1,
          borderTopColor: C.lightGray,
          height: tabBarHeight,
          paddingTop: 8,
          paddingBottom: insets.bottom,
          ...Shadows.sm,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t.home,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'home' : 'home-outline'}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: t.order,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'cube' : 'cube-outline'}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="trips"
        options={{
          title: t.trips,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'airplane' : 'airplane-outline'}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="chats"
        options={{
          title: t.chats,
          tabBarBadge: totalUnread > 0 ? totalUnread : undefined,
          tabBarBadgeStyle: {
            backgroundColor: Colors.primary,
            fontSize: 10,
            fontFamily: Typography.regular.fontFamily,
            minWidth: 18,
            height: 18,
            lineHeight: 18,
          },
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'chatbubbles' : 'chatbubbles-outline'}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t.profile,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'person' : 'person-outline'}
              size={24}
              color={color}
            />
          ),
        }}
      />
      </Tabs>
    </>
  );
}
