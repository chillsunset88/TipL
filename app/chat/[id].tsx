import React, { useState, useRef, useEffect } from 'react';
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
import { supabase } from '@/src/services/supabase';
import { useChat } from '@/src/lib/hooks/useChat';
import { ChatMessageWithSender } from '@/src/types/chat';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function ChatRoomScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [currentUserId, setCurrentUserId] = useState<string | undefined>();
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const insets = useSafeAreaInsets();

  // Animated value: lifts the whole chat area when keyboard opens
  const keyboardPadding = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setCurrentUserId(data.user?.id);
    });
  }, []);

  // Manual keyboard listener — reliable on Android edge-to-edge
  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, (e) => {
      setKeyboardVisible(true);
      Animated.timing(keyboardPadding, {
        toValue: e.endCoordinates.height,
        // iOS: keyboardWillShow fires before keyboard appears → animate smoothly
        // Android: keyboardDidShow fires after keyboard is already visible → jump instantly
        duration: Platform.OS === 'ios' ? e.duration : 0,
        useNativeDriver: false,
      }).start();
    });

    const hideSub = Keyboard.addListener(hideEvent, (e) => {
      Animated.timing(keyboardPadding, {
        toValue: 0,
        duration: Platform.OS === 'ios' ? e.duration : 180,
        useNativeDriver: false,
      }).start(() => setKeyboardVisible(false));
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const { messages, loading, otherUser, sendMessage, sendImage } = useChat(id, currentUserId);

  const handleSend = async () => {
    if (!inputText.trim() || sending) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSending(true);
    try {
      await sendMessage(inputText.trim());
      setInputText('');
    } finally {
      setSending(false);
    }
  };

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });
    if (result.canceled) return;
    setSending(true);
    try {
      await sendImage(result.assets[0].uri);
    } catch {
      // silently fail — storage bucket may not be configured yet
    } finally {
      setSending(false);
    }
  };

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const renderMessage = ({ item }: { item: ChatMessageWithSender }) => {
    const isMe = item.sender_id === currentUserId;
    const senderName = item.sender?.full_name ?? 'User';
    const senderAvatar = item.sender?.profile_image ?? null;

    return (
      <View style={[styles.messageRow, isMe && styles.messageRowMe]}>
        {!isMe && <Avatar uri={senderAvatar} name={senderName} size="sm" />}
        <View style={[styles.messageBubble, isMe ? styles.bubbleMe : styles.bubbleOther]}>
          {item.image_url && (
            <Image
              source={{ uri: item.image_url }}
              style={styles.chatImage}
              contentFit="cover"
              transition={200}
            />
          )}
          {item.text && (
            <Text style={[styles.messageText, isMe && styles.messageTextMe]}>
              {item.text}
            </Text>
          )}
          <Text style={[styles.timestamp, isMe && styles.timestampMe]}>
            {formatTime(item.created_at)}
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
        <Avatar uri={otherUser?.profile_image ?? null} name={otherUser?.full_name ?? ''} size="sm" />
        <View style={styles.headerInfo}>
          <Text style={styles.headerName}>{otherUser?.full_name ?? '...'}</Text>
        </View>
      </View>

      {/* Animated.View naik saat keyboard muncul, turun saat keyboard tutup */}
      <Animated.View style={[styles.flex, { paddingBottom: keyboardPadding }]}>
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
            contentContainerStyle={styles.messageList}
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

        {/* Input Bar */}
        <View style={[styles.inputBar, { paddingBottom: keyboardVisible ? Spacing.sm : insets.bottom + Spacing.sm }]}>
          <TouchableOpacity style={styles.attachButton} onPress={handlePickImage} disabled={sending}>
            <Ionicons name="image-outline" size={26} color={Colors.darkTextSecondary} />
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
            <Ionicons
              name="send"
              size={20}
              color={inputText.trim() ? Colors.white : Colors.darkTextSecondary}
            />
          </TouchableOpacity>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}

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

  messageList: { paddingHorizontal: Spacing.base, paddingVertical: Spacing.md },
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
  timestamp: {
    fontFamily: Typography.regular.fontFamily,
    fontSize: 10,
    color: Colors.darkTextSecondary,
    marginTop: Spacing.xs,
    alignSelf: 'flex-end',
  },
  timestampMe: { color: 'rgba(255,255,255,0.6)' },
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
