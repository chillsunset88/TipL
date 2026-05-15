// app/chat/[id].tsx — MERGED
/**
 * TipL — Chat Room Screen
 * Real-time messaging with image send, read receipts, and Supabase integration.
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Keyboard,
  Animated,
  Platform,
  Dimensions,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';

import { Colors, Typography, Spacing, BorderRadius } from '@/src/lib/constants';
import { Avatar } from '@/src/components/ui/Avatar';
import { useChat } from '@/src/lib/hooks/useChat';
import { useAuthStore } from '@/src/store/authStore';
import { useChatStore } from '@/src/store/chatStore';
import type { ChatMessage } from '@/src/services/supabase/messages';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const INPUT_BAR_HEIGHT = 60;

export default function ChatRoomScreen() {
  const { id, orderId } = useLocalSearchParams<{ id: string; orderId?: string }>();
  const user = useAuthStore((s) => s.user);
  const currentUserId = user?.id ?? '';
  const setActiveChatId = useChatStore((s) => s.setActiveChatId);

  const {
    messages,
    loading,
    otherUser,
    sendMessage,
    sendImage,
    markMessagesRead,
    uploadChatImage,
  } = useChat(id, currentUserId);

  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [keyboardOpen, setKeyboardOpen] = useState(false);

  const flatListRef = useRef<FlatList>(null);
  const insets = useSafeAreaInsets();

  // Bottom offset untuk input bar — naik saat keyboard muncul
  const inputBarBottom = useRef(new Animated.Value(0)).current;

  // ─── Track active chat (untuk unread management) ──────────────────────────
  useEffect(() => {
    setActiveChatId(id ?? null);
    return () => setActiveChatId(null);
  }, [id, setActiveChatId]);

  // ─── Keyboard animation ───────────────────────────────────────────────────
  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, (e) => {
      setKeyboardOpen(true);
      Animated.timing(inputBarBottom, {
        toValue: e.endCoordinates.height,
        duration: Platform.OS === 'ios' ? e.duration : 0,
        useNativeDriver: false,
      }).start();
    });

    const hideSub = Keyboard.addListener(hideEvent, (e) => {
      Animated.timing(inputBarBottom, {
        toValue: 0,
        duration: Platform.OS === 'ios' ? e.duration : 150,
        useNativeDriver: false,
      }).start(() => setKeyboardOpen(false));
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // ─── Mark as read saat pesan baru masuk ───────────────────────────────────
  useEffect(() => {
    if (!id || messages.length === 0 || !currentUserId) return;
    markMessagesRead().catch(() => {});
  }, [messages.length, id, currentUserId, markMessagesRead]);

  // ─── Send text ────────────────────────────────────────────────────────────
  const handleSend = useCallback(async () => {
    const text = inputText.trim();
    if (!text || sending) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setInputText('');
    setSending(true);
    try {
      await sendMessage(text);
    } catch (err: any) {
      Alert.alert('Failed to send', err?.message ?? 'Unknown error');
    } finally {
      setSending(false);
    }
  }, [inputText, sending, sendMessage]);

  // ─── Send image ───────────────────────────────────────────────────────────
  const handlePickImage = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.85,
    });
    if (result.canceled || !result.assets[0]) return;

    setUploadingImage(true);
    try {
      await sendImage(result.assets[0].uri);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {
      Alert.alert('Error', 'Failed to send image.');
    } finally {
      setUploadingImage(false);
    }
  }, [sendImage]);

  // ─── Helpers ──────────────────────────────────────────────────────────────
  const formatTime = (iso: string | null) => {
    if (!iso) return '';
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // ─── Message renderer ─────────────────────────────────────────────────────
  const renderMessage = useCallback(
    ({ item }: { item: ChatMessage }) => {
      const isMe = item.sender_id === currentUserId;
      const senderName = item.sender?.full_name ?? 'User';
      const senderAvatar = item.sender?.profile_image ?? null;

      return (
        <View style={[styles.messageRow, isMe && styles.messageRowMe]}>
          {!isMe && <Avatar uri={senderAvatar} name={senderName} size="sm" />}
          <View style={[styles.messageBubble, isMe ? styles.bubbleMe : styles.bubbleOther]}>
            {item.image_url ? (
              <Image
                source={{ uri: item.image_url }}
                style={styles.chatImage}
                contentFit="cover"
                transition={200}
              />
            ) : null}

            {item.text ? (
              <Text style={[styles.messageText, isMe && styles.messageTextMe]}>
                {item.text}
              </Text>
            ) : null}

            <View style={[styles.metaRow, isMe && styles.metaRowMe]}>
              <Text style={[styles.timestamp, isMe && styles.timestampMe]}>
                {formatTime(item.created_at)}
              </Text>
              {isMe && <ReadReceipt read={item.read_at !== null} />}
            </View>
          </View>
        </View>
      );
    },
    [currentUserId]
  );

  const listBottomPad = INPUT_BAR_HEIGHT + insets.bottom + Spacing.md;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color={Colors.darkTextPrimary} />
        </TouchableOpacity>
        <Avatar
          uri={otherUser?.profile_image ?? null}
          name={otherUser?.full_name ?? ''}
          size="sm"
        />
        <View style={styles.headerInfo}>
          <Text style={styles.headerName}>{otherUser?.full_name ?? '...'}</Text>
        </View>
        {orderId && (
          <TouchableOpacity
            style={styles.headerAction}
            onPress={() => router.push(`/order/${orderId}`)}
          >
            <Ionicons name="receipt-outline" size={20} color={Colors.primary} />
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.headerAction}>
          <Ionicons name="ellipsis-vertical" size={20} color={Colors.darkTextPrimary} />
        </TouchableOpacity>
      </View>

      {/* Message list */}
      <View style={styles.flex}>
        {loading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator color={Colors.primary} />
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={renderMessage}
            inverted
            contentContainerStyle={[styles.messageList, { paddingTop: listBottomPad }]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            ListEmptyComponent={
              <View style={styles.emptyWrap}>
                <Text style={styles.emptyText}>
                  Say hi to {otherUser?.full_name ?? 'them'} 👋
                </Text>
              </View>
            }
          />
        )}

        {/* Input bar — absolute, naik bareng keyboard */}
        <Animated.View
          style={[
            styles.inputBar,
            {
              bottom: inputBarBottom,
              paddingBottom: keyboardOpen
                ? Spacing.sm
                : insets.bottom + Spacing.sm,
            },
          ]}
        >
          <TouchableOpacity
            style={styles.attachButton}
            onPress={handlePickImage}
            disabled={uploadingImage}
          >
            {uploadingImage ? (
              <ActivityIndicator size="small" color={Colors.primary} />
            ) : (
              <Ionicons name="image-outline" size={26} color={Colors.darkTextSecondary} />
            )}
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
              onSubmitEditing={handleSend}
            />
          </View>

          <TouchableOpacity
            style={[styles.sendButton, inputText.trim() && styles.sendButtonActive]}
            onPress={handleSend}
            disabled={!inputText.trim() || sending}
          >
            {sending ? (
              <ActivityIndicator size="small" color={Colors.white} />
            ) : (
              <Ionicons
                name="send"
                size={20}
                color={inputText.trim() ? Colors.white : Colors.darkTextSecondary}
              />
            )}
          </TouchableOpacity>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

// ─── Read receipt indicator ───────────────────────────────────────────────────
function ReadReceipt({ read }: { read: boolean }) {
  return (
    <View style={styles.readReceipt}>
      <Ionicons
        name="checkmark-done"
        size={13}
        color={read ? Colors.primary : 'rgba(255,255,255,0.5)'}
      />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.darkBg },
  flex: { flex: 1 },
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },

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
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
  },
  headerInfo: { flex: 1, marginLeft: Spacing.xs },
  headerName: {
    fontFamily: Typography.semiBold.fontFamily,
    fontSize: Typography.sizes.base,
    color: Colors.darkTextPrimary,
  },
  headerAction: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
  },

  messageList: { paddingHorizontal: Spacing.base, paddingBottom: Spacing.md },
  messageRow: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
    alignItems: 'flex-end',
    gap: Spacing.sm,
  },
  messageRowMe: { flexDirection: 'row-reverse' },
  messageBubble: {
    maxWidth: SCREEN_WIDTH * 0.72,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
  },
  bubbleMe: { backgroundColor: Colors.primary, borderBottomRightRadius: 4 },
  bubbleOther: { backgroundColor: Colors.darkCard, borderBottomLeftRadius: 4 },
  messageText: {
    fontFamily: Typography.regular.fontFamily,
    fontSize: Typography.sizes.base,
    color: Colors.darkTextPrimary,
    lineHeight: 21,
  },
  messageTextMe: { color: Colors.white },

  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: Spacing.xs },
  metaRowMe: { justifyContent: 'flex-end', gap: 3 },
  timestamp: {
    fontFamily: Typography.regular.fontFamily,
    fontSize: 10,
    color: Colors.darkTextSecondary,
  },
  timestampMe: { color: 'rgba(255,255,255,0.6)' },
  readReceipt: { marginLeft: 2 },

  chatImage: {
    width: SCREEN_WIDTH * 0.55,
    height: SCREEN_WIDTH * 0.4,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.xs,
  },
  emptyWrap: { flex: 1, alignItems: 'center', paddingTop: Spacing['5xl'] },
  emptyText: {
    fontFamily: Typography.regular.fontFamily,
    fontSize: Typography.sizes.base,
    color: Colors.darkTextSecondary,
  },

  inputBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.darkBorder,
    backgroundColor: Colors.darkBg,
    gap: Spacing.sm,
  },
  attachButton: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
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
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.darkCard,
    alignItems: 'center', justifyContent: 'center',
  },
  sendButtonActive: { backgroundColor: Colors.primary },
});