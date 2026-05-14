/**
 * TipL — Chat List Screen
 * Real conversations from Supabase messages, grouped by order/counterpart.
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius } from '@/src/lib/constants';
import { Avatar } from '@/src/components/ui/Avatar';
import { useAuthStore } from '@/src/store/authStore';
import { getConversations, getUnreadCount } from '@/src/services/supabase/messages';
import { getProfilesByIds } from '@/src/services/supabase/profiles';

interface ConversationItem {
  orderId: string;
  orderItemName: string;
  otherUserId: string;
  otherUserName: string;
  otherUserAvatar: string | null;
  lastMessage: string;
  lastMessageAt: string;
  unread: boolean;
}

function formatTime(iso: string) {
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

export default function ChatsScreen() {
  const user = useAuthStore((s) => s.user);
  const userId = user?.id ?? '';

  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [totalUnread, setTotalUnread] = useState(0);

  const load = useCallback(async () => {
    if (!userId) { setLoading(false); return; }
    try {
      const [msgs, unreadCount] = await Promise.all([
        getConversations(userId),
        getUnreadCount(userId),
      ]);
      setTotalUnread(unreadCount);

      // Group by order_id — keep only latest message per order
      const byOrder = new Map<string, typeof msgs[0]>();
      for (const msg of msgs) {
        const key = (msg.order_id as string) ?? 'no-order';
        if (!byOrder.has(key)) byOrder.set(key, msg);
      }

      // Resolve counterpart profiles
      const counterpartIds = [...byOrder.values()].map((m) =>
        (m.sender_id as string) === userId ? (m.receiver_id as string) : (m.sender_id as string)
      );
      const uniqueIds = [...new Set(counterpartIds)].filter(Boolean);
      const profiles = uniqueIds.length > 0 ? await getProfilesByIds(uniqueIds) : [];
      const profileMap = new Map((profiles as any[]).map((p) => [p.id, p]));

      const items: ConversationItem[] = [];
      for (const [, msg] of byOrder) {
        const otherId = (msg.sender_id as string) === userId ? (msg.receiver_id as string) : (msg.sender_id as string);
        const profile = profileMap.get(otherId) as any;
        const order = (msg as any).orders;
        items.push({
          orderId: (msg.order_id as string) ?? '',
          orderItemName: order?.item_name ?? 'Item',
          otherUserId: otherId,
          otherUserName: profile?.full_name ?? 'User',
          otherUserAvatar: profile?.avatar_url ?? null,
          lastMessage: (msg.content as string) ?? ((msg as any).image_url ? '📷 Image' : ''),
          lastMessageAt: msg.created_at as string,
          unread: !(msg as any).read_at && (msg.receiver_id as string) === userId,
        });
      }
      setConversations(items.sort((a, b) => b.lastMessageAt.localeCompare(a.lastMessageAt)));
    } catch {
      // silently fail
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userId]);

  useEffect(() => { load(); }, [load]);

  const onRefresh = () => { setRefreshing(true); load(); };

  const filtered = search
    ? conversations.filter((c) =>
        c.otherUserName.toLowerCase().includes(search.toLowerCase()) ||
        c.orderItemName.toLowerCase().includes(search.toLowerCase())
      )
    : conversations;

  const renderItem = ({ item }: { item: ConversationItem }) => (
    <TouchableOpacity
      style={styles.chatItem}
      activeOpacity={0.7}
      onPress={() => router.push({ pathname: `/chat/${item.orderId}` as any, params: { receiverId: item.otherUserId } })}
    >
      <Avatar uri={item.otherUserAvatar} name={item.otherUserName} size="lg" />
      <View style={styles.chatInfo}>
        <View style={styles.chatTopRow}>
          <Text style={[styles.chatName, item.unread && styles.chatNameUnread]} numberOfLines={1}>
            {item.otherUserName}
          </Text>
          <Text style={styles.chatTime}>{formatTime(item.lastMessageAt)}</Text>
        </View>
        <View style={styles.chatBottomRow}>
          <Text style={[styles.chatPreview, item.unread && styles.chatPreviewUnread]} numberOfLines={1}>
            {item.orderItemName} · {item.lastMessage}
          </Text>
          {item.unread && <View style={styles.unreadDot} />}
        </View>
      </View>
    </TouchableOpacity>
  );

  if (!userId) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.centered}>
          <Ionicons name="chatbubbles-outline" size={48} color={Colors.gray} />
          <Text style={styles.emptyTitle}>Sign in to see messages</Text>
          <TouchableOpacity style={styles.signInBtn} onPress={() => router.push('/(auth)/login' as any)}>
            <Text style={styles.signInText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
        {totalUnread > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadBadgeText}>{totalUnread}</Text>
          </View>
        )}
      </View>

      {/* Search */}
      <View style={styles.searchWrap}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={16} color={Colors.gray} />
          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="Search conversations…"
            placeholderTextColor={Colors.gray}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={16} color={Colors.gray} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.orderId || item.otherUserId}
          renderItem={renderItem}
          contentContainerStyle={filtered.length === 0 ? styles.centered : styles.list}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="chatbubbles-outline" size={56} color={Colors.midGray} />
              <Text style={styles.emptyTitle}>No conversations yet</Text>
              <Text style={styles.emptySubtext}>
                Order from a traveler to start chatting about your jastip items.
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  headerTitle: {
    fontFamily: Typography.serifBold.fontFamily,
    fontSize: Typography.sizes.xl,
    color: Colors.nearBlack,
    flex: 1,
  },
  unreadBadge: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  unreadBadgeText: {
    fontFamily: Typography.bold.fontFamily,
    fontSize: 12,
    color: Colors.white,
  },
  searchWrap: { paddingHorizontal: Spacing.xl, paddingBottom: Spacing.md },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cream,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    height: 42,
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.lightGray,
  },
  searchInput: {
    flex: 1,
    fontFamily: Typography.regular.fontFamily,
    fontSize: Typography.sizes.sm,
    color: Colors.nearBlack,
    paddingVertical: 0,
  },
  list: { paddingHorizontal: Spacing.xl },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.base,
    gap: Spacing.md,
  },
  chatInfo: { flex: 1 },
  chatTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  chatName: {
    flex: 1,
    fontFamily: Typography.medium.fontFamily,
    fontSize: Typography.sizes.base,
    color: Colors.nearBlack,
    marginRight: Spacing.sm,
  },
  chatNameUnread: { fontFamily: Typography.semiBold.fontFamily },
  chatTime: {
    fontFamily: Typography.regular.fontFamily,
    fontSize: Typography.sizes.xs,
    color: Colors.darkGray,
  },
  chatBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  chatPreview: {
    flex: 1,
    fontFamily: Typography.regular.fontFamily,
    fontSize: Typography.sizes.sm,
    color: Colors.darkGray,
    marginRight: Spacing.sm,
  },
  chatPreviewUnread: {
    fontFamily: Typography.medium.fontFamily,
    color: Colors.nearBlack,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  separator: { height: 1, backgroundColor: Colors.lightGray },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing['2xl'] },
  emptyContainer: { alignItems: 'center', paddingTop: Spacing['5xl'], paddingHorizontal: Spacing['2xl'] },
  emptyTitle: {
    fontFamily: Typography.semiBold.fontFamily,
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
  signInBtn: {
    marginTop: Spacing.lg,
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  signInText: {
    fontFamily: Typography.semiBold.fontFamily,
    fontSize: Typography.sizes.base,
    color: Colors.white,
  },
});
