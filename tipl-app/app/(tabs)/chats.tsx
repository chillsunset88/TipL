/**
 * TipL — Chat List Screen
 * List of active conversations with last message preview.
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/lib/constants';
import { Avatar } from '@/components/ui/Avatar';
import { MOCK_CHAT_ROOM, MOCK_USERS } from '@/lib/mockData';
import { ChatRoom } from '@/lib/types';

const CURRENT_USER_ID = 'u2';

// Mock multiple chat rooms for the list
const CHAT_ROOMS: ChatRoom[] = [
  MOCK_CHAT_ROOM,
  {
    id: 'cr2',
    participants: ['u2', 'u3'],
    participantNames: { u2: 'Adriana V.', u3: 'Marcus T.' },
    participantAvatars: {
      u2: MOCK_USERS[1].avatarUrl,
      u3: MOCK_USERS[2].avatarUrl,
    },
    lastMessage: 'I can pick up the bag from Harrods this weekend!',
    lastMessageTimestamp: Date.now() - 3600000 * 5,
    unreadCount: { u2: 2, u3: 0 },
    createdAt: Date.now() - 86400000 * 2,
  },
];

export default function ChatsScreen() {
  const formatTime = (ts?: number) => {
    if (!ts) return '';
    const diff = Date.now() - ts;
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return new Date(ts).toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const renderChatItem = ({ item }: { item: ChatRoom }) => {
    const otherUserId = item.participants.find((p) => p !== CURRENT_USER_ID) || '';
    const otherName = item.participantNames[otherUserId] || 'User';
    const otherAvatar = item.participantAvatars[otherUserId] || null;
    const unread = item.unreadCount[CURRENT_USER_ID] || 0;

    return (
      <TouchableOpacity
        style={styles.chatItem}
        activeOpacity={0.7}
        onPress={() => router.push(`/chat/${item.id}`)}
      >
        <Avatar uri={otherAvatar} name={otherName} size="lg" />
        <View style={styles.chatInfo}>
          <View style={styles.chatTopRow}>
            <Text style={[styles.chatName, unread > 0 && styles.chatNameUnread]}>
              {otherName}
            </Text>
            <Text style={styles.chatTime}>{formatTime(item.lastMessageTimestamp)}</Text>
          </View>
          <View style={styles.chatBottomRow}>
            <Text
              style={[styles.chatPreview, unread > 0 && styles.chatPreviewUnread]}
              numberOfLines={1}
            >
              {item.lastMessage || 'Start a conversation'}
            </Text>
            {unread > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadText}>{unread}</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
        <TouchableOpacity style={styles.composeButton}>
          <Ionicons name="create-outline" size={22} color={Colors.nearBlack} />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={18} color={Colors.gray} />
          <Text style={styles.searchPlaceholder}>Search conversations</Text>
        </View>
      </View>

      {/* Chat List */}
      <FlatList
        data={CHAT_ROOMS}
        keyExtractor={(item) => item.id}
        renderItem={renderChatItem}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="chatbubbles-outline" size={48} color={Colors.gray} />
            <Text style={styles.emptyTitle}>No conversations yet</Text>
            <Text style={styles.emptySubtext}>
              Start chatting with travelers to arrange your jastip orders.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
  },
  headerTitle: {
    fontFamily: Typography.serifBold.fontFamily,
    fontSize: Typography.sizes.xl,
    color: Colors.nearBlack,
  },
  composeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.offWhite,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Search
  searchContainer: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.md,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cream,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    height: 40,
    gap: Spacing.sm,
  },
  searchPlaceholder: {
    fontFamily: Typography.regular.fontFamily,
    fontSize: Typography.sizes.sm,
    color: Colors.gray,
  },

  // List
  list: {
    paddingHorizontal: Spacing.xl,
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.base,
    gap: Spacing.md,
  },
  chatInfo: {
    flex: 1,
  },
  chatTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  chatName: {
    fontFamily: Typography.medium.fontFamily,
    fontSize: Typography.sizes.base,
    color: Colors.nearBlack,
  },
  chatNameUnread: {
    fontFamily: Typography.semiBold.fontFamily,
  },
  chatTime: {
    fontFamily: Typography.regular.fontFamily,
    fontSize: Typography.sizes.xs,
    color: Colors.darkGray,
  },
  chatBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  unreadBadge: {
    backgroundColor: Colors.primary,
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  unreadText: {
    fontFamily: Typography.bold.fontFamily,
    fontSize: 11,
    color: Colors.white,
  },
  separator: {
    height: 1,
    backgroundColor: Colors.lightGray,
  },

  // Empty
  emptyState: {
    alignItems: 'center',
    paddingTop: Spacing['5xl'],
    paddingHorizontal: Spacing['2xl'],
  },
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
});
