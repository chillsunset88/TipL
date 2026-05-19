/**
 * TipL — Chat List Screen
 * Conversations grouped by partner user ID.
 * Theme-aware: supports Dark Mode & Light Mode.
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
import { Typography, Spacing, BorderRadius } from '@/src/lib/constants';
import { Avatar } from '@/src/components/ui/Avatar';
import { useAuthStore } from '@/src/store/authStore';
import { useSettingsStore } from '@/src/store/settingsStore';
import { getConversations, getUnreadCount } from '@/src/services/supabase/messages';
import { getProfilesByIds } from '@/src/services/supabase/profiles';
import { supabase } from '@/src/lib/supabase';
import { useThemeColors } from '@/src/lib/hooks/useThemeColors';

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
  const C = useThemeColors();
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

  // Reload whenever the tab comes into focus
  useFocusEffect(useCallback(() => { load(); }, [load]));

  // Real-time
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

  const s = React.useMemo(() => StyleSheet.create({
    safe: { flex: 1, backgroundColor: C.white },
    unreadBadge: {
      backgroundColor: C.primary,
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
      color: '#FFFFFF',
    },
    searchWrap: { paddingHorizontal: Spacing.xl, paddingBottom: Spacing.md },
    searchBar: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: C.offWhite,
      borderRadius: BorderRadius.md,
      paddingHorizontal: Spacing.md,
      height: 42,
      gap: Spacing.sm,
      borderWidth: 1,
      borderColor: C.lightGray,
    },
    searchInput: {
      flex: 1,
      fontFamily: Typography.regular.fontFamily,
      fontSize: Typography.sizes.sm,
      color: C.nearBlack,
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
      color: C.nearBlack,
      marginRight: Spacing.sm,
    },
    chatNameUnread: { fontFamily: Typography.regular.fontFamily },
    chatTime: {
      fontFamily: Typography.regular.fontFamily,
      fontSize: Typography.sizes.xs,
      color: C.darkGray,
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
      color: C.darkGray,
      marginRight: Spacing.sm,
    },
    chatPreviewUnread: {
      fontFamily: Typography.medium.fontFamily,
      color: C.nearBlack,
    },
    unreadDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: C.primary,
    },
    separator: { height: 1, backgroundColor: C.lightGray },
    centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing['2xl'] },
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
    signInBtn: {
      marginTop: Spacing.lg,
      backgroundColor: C.primary,
      paddingHorizontal: Spacing.xl,
      paddingVertical: Spacing.md,
      borderRadius: BorderRadius.md,
    },
    signInText: {
      fontFamily: Typography.regular.fontFamily,
      fontSize: Typography.sizes.base,
      color: '#FFFFFF',
    },
  }), [C]);

  const renderItem = ({ item }: { item: ConversationItem }) => (
    <TouchableOpacity
      style={s.chatItem}
      activeOpacity={0.7}
      onPress={() => openChat(item)}
    >
      <Avatar uri={item.partnerAvatar} name={item.partnerName} size="lg" />
      <View style={s.chatInfo}>
        <View style={s.chatTopRow}>
          <Text style={[s.chatName, item.unread && s.chatNameUnread]} numberOfLines={1}>
            {item.partnerName}
          </Text>
          <Text style={s.chatTime}>{formatTime(item.lastMessageAt)}</Text>
        </View>
        <View style={s.chatBottomRow}>
          <Text
            style={[s.chatPreview, item.unread && s.chatPreviewUnread]}
            numberOfLines={1}
          >
            {item.lastMessage === '§IMAGE§' ? t.imageMessage : item.lastMessage}
          </Text>
          {item.unread && <View style={s.unreadDot} />}
        </View>
      </View>
    </TouchableOpacity>
  );

  if (!userId) {
    return (
      <SafeAreaView style={s.safe} edges={['top']}>
        <View style={s.centered}>
          <Ionicons name="chatbubbles-outline" size={48} color={C.midGray} />
          <Text style={s.emptyTitle}>{t.loginToViewMessages}</Text>
          <TouchableOpacity style={s.signInBtn} onPress={() => router.push('/(auth)/login' as any)}>
            <Text style={s.signInText}>{t.signIn}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.safe} edges={['top']}>

      {/* Search */}
      <View style={s.searchWrap}>
        <View style={s.searchBar}>
          <Ionicons name="search-outline" size={16} color={C.darkGray} />
          <TextInput
            style={s.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder={t.searchConversations}
            placeholderTextColor={C.darkGray}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={16} color={C.darkGray} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {loading ? (
        <View style={s.centered}>
          <ActivityIndicator size="large" color={C.primary} />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.partnerId}
          renderItem={renderItem}
          contentContainerStyle={[
            filtered.length === 0 ? s.centered : s.list,
            { paddingBottom: insets.bottom + Spacing.xl },
          ]}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={s.separator} />}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.primary} />
          }
          ListEmptyComponent={
            <View style={s.emptyContainer}>
              <Ionicons name="chatbubbles-outline" size={56} color={C.midGray} />
              <Text style={s.emptyTitle}>{t.noConversations}</Text>
              <Text style={s.emptySubtext}>{t.noConversationsDesc}</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

