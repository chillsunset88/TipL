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
import { useChatStore } from '@/src/store/chatStore';

export default function TabLayout() {
  const totalUnread = useChatStore((s) => s.totalUnread);
  const insets = useSafeAreaInsets();

  const TAB_CONTENT_HEIGHT = Platform.OS === 'ios' ? 50 : 54;
  const tabBarHeight = TAB_CONTENT_HEIGHT + insets.bottom;

  return (
    <Tabs
      screenListeners={{
        tabPress: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
      }}
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.midGray,
        tabBarLabelStyle: {
          fontFamily: Typography.medium.fontFamily,
          fontSize: 11,
          marginTop: -2,
          letterSpacing: 0.2,
        },
        tabBarStyle: {
          backgroundColor: Colors.offWhite,
          borderTopWidth: 1,
          borderTopColor: Colors.lightGray,
          height: tabBarHeight,
          paddingTop: 8,
          paddingBottom: insets.bottom + (Platform.OS === 'ios' ? 0 : 6),
          ...Shadows.sm,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
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
          title: 'Order',
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
          title: 'Trips',
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
          title: 'Chats',
          tabBarBadge: totalUnread > 0 ? totalUnread : undefined,
          tabBarBadgeStyle: {
            backgroundColor: Colors.primary,
            fontSize: 10,
            fontFamily: Typography.bold.fontFamily,
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
          title: 'Profile',
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
  );
}

