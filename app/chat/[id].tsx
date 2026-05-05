/**
 * TipL — Chat Room Screen
 * Real-time messaging UI with dark theme.
 * Matches Stitch "Chat Room" design.
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/src/lib/constants';
import { Avatar } from '@/src/components/ui/Avatar';
import { ChatMessage, ProductCard } from '@/src/lib/types';
import { MOCK_CHAT_MESSAGES, MOCK_CHAT_MESSAGES_2, MOCK_CHAT_ROOM, MOCK_USERS } from '@/src/lib/mockData';
import { ChatRoom as ChatRoomType } from '@/src/lib/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CURRENT_USER_ID = 'u2'; // Simulated current user

// Lookup maps for different chat rooms
const CHAT_ROOMS_MAP: Record<string, ChatRoomType> = {
  cr1: MOCK_CHAT_ROOM,
  cr2: {
    id: 'cr2',
    participants: ['u2', 'u3'],
    participantNames: { u2: 'Adriana V.', u3: 'Marcus T.' },
    participantAvatars: { u2: MOCK_USERS[1].avatarUrl, u3: MOCK_USERS[2].avatarUrl },
    lastMessage: 'I can pick up the bag from Harrods this weekend!',
    lastMessageTimestamp: Date.now() - 3600000 * 5,
    unreadCount: { u2: 2, u3: 0 },
    createdAt: Date.now() - 86400000 * 2,
  },
};

const MESSAGES_MAP: Record<string, ChatMessage[]> = {
  cr1: MOCK_CHAT_MESSAGES,
  cr2: MOCK_CHAT_MESSAGES_2,
};

export default function ChatRoomScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const chatRoom = CHAT_ROOMS_MAP[id ?? 'cr1'] ?? MOCK_CHAT_ROOM;
  const initialMessages = MESSAGES_MAP[id ?? 'cr1'] ?? MOCK_CHAT_MESSAGES;
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [inputText, setInputText] = useState('');
  const flatListRef = useRef<FlatList>(null);

  const otherUserId = chatRoom.participants.find((p) => p !== CURRENT_USER_ID) || '';
  const otherUserName = chatRoom.participantNames[otherUserId] || 'User';
  const otherUserAvatar = chatRoom.participantAvatars[otherUserId] || null;

  const sendMessage = () => {
    if (!inputText.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const newMsg: ChatMessage = {
      id: `m${Date.now()}`,
      senderId: CURRENT_USER_ID,
      senderName: 'You',
      senderAvatar: MOCK_USERS[1].avatarUrl,
      text: inputText.trim(),
      timestamp: Date.now(),
      read: false,
    };

    setMessages([newMsg, ...messages]);
    setInputText('');
  };

  const formatTime = (ts: number) => {
    const date = new Date(ts);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isMe = item.senderId === CURRENT_USER_ID;

    return (
      <View style={[styles.messageRow, isMe && styles.messageRowMe]}>
        {!isMe && (
          <Avatar uri={item.senderAvatar} name={item.senderName} size="sm" />
        )}
        <View style={[styles.messageBubble, isMe ? styles.bubbleMe : styles.bubbleOther]}>
          {/* Product Card */}
          {item.productCard && (
            <View style={styles.productCard}>
              <Image
                source={{ uri: item.productCard.imageUrl }}
                style={styles.productImage}
                contentFit="cover"
                transition={200}
              />
              <View style={styles.productInfo}>
                <Text style={styles.productName}>{item.productCard.name}</Text>
                {item.productCard.description && (
                  <Text style={styles.productDesc}>{item.productCard.description}</Text>
                )}
                <Text style={styles.productPrice}>{item.productCard.price}</Text>
              </View>
            </View>
          )}

          {/* Image Message */}
          {item.imageUrl && (
            <Image
              source={{ uri: item.imageUrl }}
              style={styles.chatImage}
              contentFit="cover"
              transition={200}
            />
          )}

          {/* Text */}
          {item.text && (
            <Text style={[styles.messageText, isMe && styles.messageTextMe]}>
              {item.text}
            </Text>
          )}

          <Text style={[styles.timestamp, isMe && styles.timestampMe]}>
            {formatTime(item.timestamp)}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color={Colors.darkTextPrimary} />
        </TouchableOpacity>
        <Avatar uri={otherUserAvatar} name={otherUserName} size="sm" />
        <View style={styles.headerInfo}>
          <Text style={styles.headerName}>{otherUserName}</Text>
          <Text style={styles.headerStatus}>Online</Text>
        </View>
        <TouchableOpacity style={styles.headerAction}>
          <Ionicons name="call-outline" size={20} color={Colors.darkTextPrimary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerAction}>
          <Ionicons name="ellipsis-vertical" size={20} color={Colors.darkTextPrimary} />
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
        keyboardVerticalOffset={0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          inverted
          contentContainerStyle={styles.messageList}
          showsVerticalScrollIndicator={false}
        />

        {/* Input Bar */}
        <View style={styles.inputBar}>
          <TouchableOpacity style={styles.attachButton}>
            <Ionicons name="add-circle-outline" size={26} color={Colors.darkTextSecondary} />
          </TouchableOpacity>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder="Type a message..."
              placeholderTextColor={Colors.darkTextSecondary}
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={2000}
            />
          </View>
          <TouchableOpacity
            style={[styles.sendButton, inputText.trim() && styles.sendButtonActive]}
            onPress={sendMessage}
            disabled={!inputText.trim()}
          >
            <Ionicons
              name="send"
              size={20}
              color={inputText.trim() ? Colors.white : Colors.darkTextSecondary}
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.darkBg,
  },
  flex: {
    flex: 1,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.darkBorder,
    gap: Spacing.sm,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerInfo: {
    flex: 1,
    marginLeft: Spacing.xs,
  },
  headerName: {
    fontFamily: Typography.semiBold.fontFamily,
    fontSize: Typography.sizes.base,
    color: Colors.darkTextPrimary,
  },
  headerStatus: {
    fontFamily: Typography.regular.fontFamily,
    fontSize: Typography.sizes.xs,
    color: Colors.success,
  },
  headerAction: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Messages
  messageList: {
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
    alignItems: 'flex-end',
    gap: Spacing.sm,
  },
  messageRowMe: {
    flexDirection: 'row-reverse',
  },
  messageBubble: {
    maxWidth: SCREEN_WIDTH * 0.72,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
  },
  bubbleMe: {
    backgroundColor: Colors.primary,
    borderBottomRightRadius: 4,
  },
  bubbleOther: {
    backgroundColor: Colors.darkCard,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontFamily: Typography.regular.fontFamily,
    fontSize: Typography.sizes.base,
    color: Colors.darkTextPrimary,
    lineHeight: 21,
  },
  messageTextMe: {
    color: Colors.white,
  },
  timestamp: {
    fontFamily: Typography.regular.fontFamily,
    fontSize: 10,
    color: Colors.darkTextSecondary,
    marginTop: Spacing.xs,
    alignSelf: 'flex-end',
  },
  timestampMe: {
    color: 'rgba(255,255,255,0.6)',
  },

  // Product Card
  productCard: {
    backgroundColor: Colors.darkCardLight,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
  },
  productImage: {
    width: '100%',
    height: 140,
  },
  productInfo: {
    padding: Spacing.md,
  },
  productName: {
    fontFamily: Typography.semiBold.fontFamily,
    fontSize: Typography.sizes.base,
    color: Colors.darkTextPrimary,
  },
  productDesc: {
    fontFamily: Typography.regular.fontFamily,
    fontSize: Typography.sizes.xs,
    color: Colors.darkTextSecondary,
    marginTop: 2,
  },
  productPrice: {
    fontFamily: Typography.bold.fontFamily,
    fontSize: Typography.sizes.base,
    color: Colors.primary,
    marginTop: Spacing.xs,
  },

  // Chat Image
  chatImage: {
    width: SCREEN_WIDTH * 0.55,
    height: SCREEN_WIDTH * 0.4,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.xs,
  },

  // Input Bar
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.darkBorder,
    backgroundColor: Colors.darkBg,
    gap: Spacing.sm,
  },
  attachButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputContainer: {
    flex: 1,
    backgroundColor: Colors.darkCard,
    borderRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.base,
    paddingVertical: Platform.OS === 'ios' ? Spacing.sm : 0,
    maxHeight: 100,
  },
  textInput: {
    fontFamily: Typography.regular.fontFamily,
    fontSize: Typography.sizes.base,
    color: Colors.darkTextPrimary,
    minHeight: 36,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.darkCard,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonActive: {
    backgroundColor: Colors.primary,
  },
});
