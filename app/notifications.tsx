/**
 * TipL — Notifications Center
 * Real-time notifications from Supabase with read/unread state, mark-all-read, and deep links.
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { FloatingBackButton } from '@/src/components/ui/FloatingBackButton';
import * as Haptics from 'expo-haptics';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/src/lib/constants';
import { useAuthStore } from '@/src/store/authStore';
import {
  getNotifications,
  markNotificationRead,
  markAllRead,
  subscribeToNotifications,
} from '@/src/services/supabase/notifications';

type Notification = {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body: string | null;
  data: Record<string, string> | null;
  read_at: string | null;
  created_at: string | null;
};

function formatTime(iso: string | null) {
  if (!iso) return '';
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  if (diff < 60000) return 'just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

function notifIcon(type: string): { name: string; color: string } {
  if (type === 'order') return { name: 'receipt-outline', color: Colors.primary };
  if (type === 'chat') return { name: 'chatbubble-outline', color: Colors.secondary };
  if (type === 'payment') return { name: 'card-outline', color: Colors.success };
  if (type === 'system') return { name: 'information-circle-outline', color: Colors.info };
  return { name: 'notifications-outline', color: Colors.charcoal };
}

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);
  const userId = user?.id ?? '';
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    try {
      const data = await getNotifications(userId);
      setNotifications(data as Notification[]);
    } catch {}
    finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userId]);

  useEffect(() => {
    load();
    if (!userId) return;
    const unsub = subscribeToNotifications(userId, (n: any) => {
      setNotifications((prev) => [n as Notification, ...prev]);
    });
    return () => unsub();
  }, [userId, load]);

  const onRefresh = () => {
    setRefreshing(true);
    load();
  };

  const handlePress = async (notif: Notification) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (!notif.read_at) {
      await markNotificationRead(notif.id).catch(() => {});
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, read_at: new Date().toISOString() } : n))
      );
    }
    const data = notif.data ?? {};
    if (data.type === 'order' && data.orderId) router.push(`/order/${data.orderId}`);
    else if (data.type === 'chat' && data.chatId) router.push(`/chat/${data.chatId}`);
  };

  const handleMarkAllRead = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await markAllRead(userId).catch(() => {});
    const now = new Date().toISOString();
    setNotifications((prev) => prev.map((n) => ({ ...n, read_at: n.read_at ?? now })));
  };

  const unreadCount = notifications.filter((n) => !n.read_at).length;

  const renderItem = ({ item }: { item: Notification }) => {
    const { name, color } = notifIcon(item.type);
    const isUnread = !item.read_at;
    return (
      <TouchableOpacity
        style={[styles.item, isUnread && styles.itemUnread]}
        activeOpacity={0.7}
        onPress={() => handlePress(item)}
      >
        <View style={[styles.iconWrap, { backgroundColor: `${color}18` }]}>
          <Ionicons name={name as any} size={22} color={color} />
        </View>
        <View style={styles.itemContent}>
          <Text style={[styles.itemTitle, isUnread && styles.itemTitleUnread]}>{item.title}</Text>
          {item.body ? (
            <Text style={styles.itemBody} numberOfLines={2}>{item.body}</Text>
          ) : null}
          <Text style={styles.itemTime}>{formatTime(item.created_at)}</Text>
        </View>
        {isUnread && <View style={styles.dot} />}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <FloatingBackButton onPress={() => router.back()} />
      {unreadCount > 0 && (
        <TouchableOpacity onPress={handleMarkAllRead} style={[styles.floatingMarkAll, { top: insets.top + 18 }]}>
          <Text style={styles.markAllText}>Mark all read</Text>
        </TouchableOpacity>
      )}

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={notifications.length === 0 ? styles.centered : styles.list}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={Colors.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="notifications-off-outline" size={56} color={Colors.midGray} />
              <Text style={styles.emptyTitle}>No notifications yet</Text>
              <Text style={styles.emptySubtext}>
                We'll notify you about orders, messages, and more.
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.white },
  floatingBack: {
    position: 'absolute', top: 12, left: 20, zIndex: 10,
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: 'rgba(0,0,0,0.06)',
    alignItems: 'center', justifyContent: 'center',
  },
  floatingMarkAll: {
    position: 'absolute', right: 20, zIndex: 10,
  },
  markAllText: {
    fontFamily: Typography.medium.fontFamily,
    fontSize: Typography.sizes.sm,
    color: Colors.primary,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing['2xl'],
  },
  list: { paddingTop: 56, paddingBottom: Spacing.sm },
  item: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.base,
    gap: Spacing.md,
    backgroundColor: Colors.white,
  },
  itemUnread: { backgroundColor: Colors.primaryPale },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  itemContent: { flex: 1 },
  itemTitle: {
    fontFamily: Typography.medium.fontFamily,
    fontSize: Typography.sizes.base,
    color: Colors.nearBlack,
    marginBottom: 2,
  },
  itemTitleUnread: { fontFamily: Typography.regular.fontFamily },
  itemBody: {
    fontFamily: Typography.regular.fontFamily,
    fontSize: Typography.sizes.sm,
    color: Colors.darkGray,
    lineHeight: 18,
    marginBottom: 4,
  },
  itemTime: {
    fontFamily: Typography.regular.fontFamily,
    fontSize: Typography.sizes.xs,
    color: Colors.gray,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
    marginTop: 6,
    flexShrink: 0,
  },
  separator: { height: 1, backgroundColor: Colors.lightGray },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: Spacing['5xl'],
    paddingHorizontal: Spacing['2xl'],
  },
  emptyTitle: {
    fontFamily: Typography.regular.fontFamily,
    fontSize: Typography.sizes.md,
    color: Colors.nearBlack,
    marginTop: Spacing.base,
  },
  emptySubtext: {
    fontFamily: Typography.regular.fontFamily,
    fontSize: Typography.sizes.sm,
    color: Colors.darkGray,
    textAlign: 'center',
    marginTop: Spacing.sm,
    lineHeight: 20,
  },
});
