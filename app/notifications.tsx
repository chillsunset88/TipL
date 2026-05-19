/**
 * TipL — Notifications Center
 * Real-time notifications from Supabase with read/unread state, mark-all-read, and deep links.
 * Theme-aware: supports Dark Mode & Light Mode.
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
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { PageHeader } from '@/src/components/ui/PageHeader';
import * as Haptics from 'expo-haptics';
import { Typography, Spacing, BorderRadius } from '@/src/lib/constants';
import { useSettingsStore } from '@/src/store/settingsStore';
import { useAuthStore } from '@/src/store/authStore';
import { useNotificationStore } from '@/src/store/notificationStore';
import {
  getNotifications,
  markNotificationRead,
  markAllRead,
  subscribeToNotifications,
} from '@/src/services/supabase/notifications';
import { useThemeColors } from '@/src/lib/hooks/useThemeColors';

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

function formatTime(iso: string | null, t: { justNow: string; minutesAgoSuffix: string; hoursAgoSuffix: string }) {
  if (!iso) return '';
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  if (diff < 60000) return t.justNow;
  if (diff < 3600000) return `${Math.floor(diff / 60000)}${t.minutesAgoSuffix}`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}${t.hoursAgoSuffix}`;
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

function formatNotifBody(body: string | null): string {
  if (!body) return '';
  try {
    const parsed = JSON.parse(body);
    if (parsed._type === 'product') {
      return `📦 ${parsed.name} · Rp ${Number(parsed.price).toLocaleString('id-ID')}`;
    }
  } catch {}
  return body;
}


export default function NotificationsScreen() {
  const C = useThemeColors();
  const { t } = useSettingsStore();
  const user = useAuthStore((s) => s.user);
  const userId = user?.id ?? '';
  const setStoreCount = useNotificationStore((s) => s.setCount);
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
      const remaining = notifications.filter((n) => n.id !== notif.id && !n.read_at).length;
      setStoreCount(remaining);
    }

    const data: Record<string, string> = notif.data
      ? (typeof notif.data === 'string' ? JSON.parse(notif.data) : notif.data as Record<string, string>)
      : {};

    const orderId = data.orderId ?? data.order_id ?? data.orderID ?? data.orderId ?? data.id;
    const chatUserId = data.chatId ?? data.chat_id ?? data.senderId ?? data.sender_id
      ?? data.userId ?? data.user_id ?? data.receiverId;
    const requestId = data.requestId ?? data.request_id ?? data.requestID;
    const tripId = data.tripId ?? data.trip_id ?? data.tripID;
    const productId = data.productId ?? data.product_id ?? data.productID;
    const targetPath = data.path ?? data.route ?? data.url ?? data.target ?? data.link;

    const type = notif.type?.toLowerCase() ?? '';
    const isOrder = type.includes('order') || type === 'payment';
    const isChat = type.includes('chat') || type.includes('message');
    const isRequest = type.includes('request');
    const isTrip = type.includes('trip');
    const isProduct = type.includes('product');

    if (targetPath) {
      router.push(targetPath as any);
      return;
    }

    if (isChat && chatUserId) {
      router.push(`/chat/${chatUserId}` as any);
      return;
    }

    if (isOrder && orderId) {
      router.push(`/order/${orderId}` as any);
      return;
    }

    if (isRequest && requestId) {
      router.push(`/request/${requestId}` as any);
      return;
    }

    if (isTrip && tripId) {
      router.push(`/trip/${tripId}` as any);
      return;
    }

    if (isProduct && productId) {
      router.push(`/product/${productId}` as any);
      return;
    }

    if (orderId) {
      router.push(`/order/${orderId}` as any);
      return;
    }

    if (requestId) {
      router.push(`/request/${requestId}` as any);
      return;
    }

    if (tripId) {
      router.push(`/trip/${tripId}` as any);
      return;
    }

    if (productId) {
      router.push(`/product/${productId}` as any);
      return;
    }
  };

  const handleMarkAllRead = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await markAllRead(userId).catch(() => {});
    const now = new Date().toISOString();
    setNotifications((prev) => prev.map((n) => ({ ...n, read_at: n.read_at ?? now })));
    setStoreCount(0);
  };

  const unreadCount = notifications.filter((n) => !n.read_at).length;

  const notifIcon = (type: string): { name: string; color: string } => {
    const t = type?.toLowerCase() ?? '';
    if (t.includes('order') || t.includes('payment')) return { name: 'receipt-outline', color: C.primary };
    if (t.includes('chat') || t.includes('message')) return { name: 'chatbubble-outline', color: C.secondary };
    if (t === 'system') return { name: 'information-circle-outline', color: C.info };
    return { name: 'notifications-outline', color: C.charcoal };
  };

  const st = React.useMemo(() => StyleSheet.create({
    safe: { flex: 1, backgroundColor: C.white },
    centered: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: Spacing['2xl'],
      backgroundColor: C.white,
    },
    list: { paddingBottom: Spacing.sm },
    item: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      paddingHorizontal: Spacing.xl,
      paddingVertical: Spacing.base,
      gap: Spacing.md,
      backgroundColor: C.white,
    },
    itemUnread: { backgroundColor: C.primary + '12' },
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
      color: C.nearBlack,
      marginBottom: 2,
    },
    itemTitleUnread: { fontFamily: Typography.regular.fontFamily },
    itemBody: {
      fontFamily: Typography.regular.fontFamily,
      fontSize: Typography.sizes.sm,
      color: C.darkGray,
      lineHeight: 18,
      marginBottom: 4,
    },
    itemTime: {
      fontFamily: Typography.regular.fontFamily,
      fontSize: Typography.sizes.xs,
      color: C.gray,
    },
    dot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: C.primary,
      marginTop: 6,
      flexShrink: 0,
    },
    separator: { height: 1, backgroundColor: C.lightGray },
    emptyContainer: {
      alignItems: 'center',
      paddingTop: Spacing['5xl'],
      paddingHorizontal: Spacing['2xl'],
    },
    emptyTitle: {
      fontFamily: Typography.regular.fontFamily,
      fontSize: Typography.sizes.md,
      color: C.nearBlack,
      marginTop: Spacing.base,
    },
    emptySubtext: {
      fontFamily: Typography.regular.fontFamily,
      fontSize: Typography.sizes.sm,
      color: C.darkGray,
      textAlign: 'center',
      marginTop: Spacing.sm,
      lineHeight: 20,
    },
  }), [C]);

  const renderItem = ({ item }: { item: Notification }) => {
    const { name, color } = notifIcon(item.type);
    const isUnread = !item.read_at;
    return (
      <TouchableOpacity
        style={[st.item, isUnread && st.itemUnread]}
        activeOpacity={0.7}
        onPress={() => handlePress(item)}
      >
        <View style={[st.iconWrap, { backgroundColor: `${color}18` }]}>
          <Ionicons name={name as any} size={22} color={color} />
        </View>
        <View style={st.itemContent}>
          <Text style={[st.itemTitle, isUnread && st.itemTitleUnread]}>{item.title}</Text>
          {item.body ? (
            <Text style={st.itemBody} numberOfLines={2}>
              {formatNotifBody(item.body)}
            </Text>
          ) : null}
          <Text style={st.itemTime}>{formatTime(item.created_at, t)}</Text>
        </View>
        {isUnread && <View style={st.dot} />}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={st.safe} edges={["bottom"]}>
      <PageHeader
        title={t.notifications}
        onBack={() => router.back()}
        rightLabel={unreadCount > 0 ? t.markAllRead : undefined}
        onRightPress={unreadCount > 0 ? handleMarkAllRead : undefined}
      />

      {loading ? (
        <View style={st.centered}>
          <ActivityIndicator size="large" color={C.primary} />
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={notifications.length === 0 ? st.centered : st.list}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={st.separator} />}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={C.primary}
            />
          }
          ListEmptyComponent={
            <View style={st.emptyContainer}>
              <Ionicons name="notifications-off-outline" size={56} color={C.midGray} />
              <Text style={st.emptyTitle}>{t.noNotifications}</Text>
              <Text style={st.emptySubtext}>{t.noNotificationsDesc}</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
