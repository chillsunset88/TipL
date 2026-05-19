/**
 * TipL — Chat List Screen
 * Conversations grouped by partner user ID (direct messages, no order_id dependency).
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
import { router, useFocusEffect } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius } from '@/src/lib/constants';
import { Avatar } from '@/src/components/ui/Avatar';
import { useAuthStore } from '@/src/store/authStore';
import { useSettingsStore } from '@/src/store/settingsStore';
import { getConversations, getUnreadCount } from '@/src/services/supabase/messages';
import { getProfilesByIds } from '@/src/services/supabase/profiles';
import { supabase } from '@/src/lib/supabase';

interface ConversationItem {
  partnerId: string;
  partnerName: string;
  partnerAvatar: string | null;
  lastMessage: string;
  lastMessageAt: string;
  unread: boolean;
}

function formatTime(iso: string) {
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return d.toLocaleDateString('id-ID', { month: 'short', day: 'numeric' });
}

// ─── Helper: format last message for preview ──────────────────────────────────
function formatLastMessage(content: string): string {
  if (content === '§IMAGE§') return content;
  try {
    const parsed = JSON.parse(content);
    if (parsed._type === 'product') return `🛍️ ${parsed.name}`;
  } catch {}
  return content;
}

export default function ChatsScreen() {
  const user = useAuthStore((s) => s.user);
  const userId = user?.id ?? '';
  const insets = useSafeAreaInsets();
  const { t } = useSettingsStore();

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

      // Group by partner ID — keep only latest message per conversation partner
      // Messages are already ordered DESC by created_at so first occurrence = latest
      const byPartner = new Map<string, typeof msgs[0]>();
      for (const msg of msgs) {
        const partnerId = msg.sender_id === userId ? msg.receiver_id : msg.sender_id;
        if (!partnerId) continue;
        if (!byPartner.has(partnerId)) byPartner.set(partnerId, msg);
      }

      // Resolve partner profiles
      const partnerIds = [...byPartner.keys()].filter(Boolean);
      const profiles = partnerIds.length > 0 ? await getProfilesByIds(partnerIds) : [];
      const profileMap = new Map((profiles as any[]).map((p) => [p.id, p]));

      const items: ConversationItem[] = [];
      for (const [partnerId, msg] of byPartner) {
        const profile = profileMap.get(partnerId) as any;
        const rawContent = (msg.content as string) ?? ((msg as any).image_url ? '§IMAGE§' : '');
        items.push({
          partnerId,
          partnerName: profile?.full_name ?? 'User',
          partnerAvatar: profile?.avatar_url ?? null,
          lastMessage: formatLastMessage(rawContent),
          lastMessageAt: msg.created_at as string,
          unread: !(msg as any).read_at && msg.receiver_id === userId,
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

  // Reload whenever the tab comes into focus (returning from a chat room)
  useFocusEffect(useCallback(() => { load(); }, [load]));

  // Real-time: reload when a new message arrives for this user
  useEffect(() => {
    if (!userId) return;
    const channel = supabase
      .channel(`chat-list-${userId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `receiver_id=eq.${userId}`,
      }, () => { load(); })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [userId, load]);

  const onRefresh = () => { setRefreshing(true); load(); };

  const filtered = search
    ? conversations.filter((c) =>
        c.partnerName.toLowerCase().includes(search.toLowerCase())
      )
    : conversations;

  const openChat = (item: ConversationItem) => {
    router.push({
      pathname: '/chat/[id]',
      params: { id: item.partnerId, receiverId: item.partnerId },
    } as any);
  };

  const renderItem = ({ item }: { item: ConversationItem }) => (
    <TouchableOpacity
      style={styles.chatItem}
      activeOpacity={0.7}
      onPress={() => openChat(item)}
    >
      <Avatar uri={item.partnerAvatar} name={item.partnerName} size="lg" />
      <View style={styles.chatInfo}>
        <View style={styles.chatTopRow}>
          <Text style={[styles.chatName, item.unread && styles.chatNameUnread]} numberOfLines={1}>
            {item.partnerName}
          </Text>
          <Text style={styles.chatTime}>{formatTime(item.lastMessageAt)}</Text>
        </View>
        <View style={styles.chatBottomRow}>
          <Text
            style={[styles.chatPreview, item.unread && styles.chatPreviewUnread]}
            numberOfLines={1}
          >
            {item.lastMessage === '§IMAGE§' ? t.imageMessage : item.lastMessage}
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
          <Ionicons name="chatbubbles-outline" size={48} color={Colors.midGray} />
          <Text style={styles.emptyTitle}>{t.loginToViewMessages}</Text>
          <TouchableOpacity style={styles.signInBtn} onPress={() => router.push('/(auth)/login' as any)}>
            <Text style={styles.signInText}>{t.signIn}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>

      {/* Search */}
      <View style={styles.searchWrap}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={16} color={Colors.darkGray} />
          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder={t.searchConversations}
            placeholderTextColor={Colors.darkGray}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={16} color={Colors.darkGray} />
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
          keyExtractor={(item) => item.partnerId}
          renderItem={renderItem}
          contentContainerStyle={[
            filtered.length === 0 ? styles.centered : styles.list,
            { paddingBottom: insets.bottom + Spacing.xl },
          ]}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="chatbubbles-outline" size={56} color={Colors.midGray} />
              <Text style={styles.emptyTitle}>{t.noConversations}</Text>
              <Text style={styles.emptySubtext}>{t.noConversationsDesc}</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.white },
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
    fontFamily: Typography.regular.fontFamily,
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
  chatNameUnread: { fontFamily: Typography.regular.fontFamily },
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
  signInBtn: {
    marginTop: Spacing.lg,
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  signInText: {
    fontFamily: Typography.regular.fontFamily,
    fontSize: Typography.sizes.base,
    color: Colors.white,
  },
});