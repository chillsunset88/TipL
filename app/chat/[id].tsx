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
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  Alert,
  ActivityIndicator,
  Modal,
  StatusBar,
} from 'react-native';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';

import { Colors, Typography, Spacing, BorderRadius } from '@/src/lib/constants';
import { useSettingsStore } from '@/src/store/settingsStore';
import { Avatar } from '@/src/components/ui/Avatar';
import { useChat } from '@/src/lib/hooks/useChat';
import { useAuthStore } from '@/src/store/authStore';
import { useChatStore } from '@/src/store/chatStore';
import { getProfile } from '@/src/services/supabase/profiles';
import type { Database } from '@/src/lib/database.types';

type Message = Database['public']['Tables']['messages']['Row'];

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ─── Helper: parse product card from message content ─────────────────────────
function parseProductCard(content: string | null) {
  if (!content) return null;
  try {
    const parsed = JSON.parse(content);
    if (parsed._type === 'product') return parsed as {
      _type: 'product'; id: string; name: string; price: string; imageUrl: string;
    };
  } catch {}
  return null;
}

export default function ChatRoomScreen() {
  const { id, receiverId, orderId, productId, productName, productPrice, productImage } =
    useLocalSearchParams<{
      id?: string;
      receiverId?: string;
      orderId?: string;
      productId?: string;
      productName?: string;
      productPrice?: string;
      productImage?: string;
    }>();
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);
  const currentUserId = user?.id ?? '';

  const otherUserId = receiverId ?? id ?? '';

  const { t } = useSettingsStore();
  const { messages, loading, sendMessage, sendImage, sendProductCard, markMessagesRead, uploadChatImage } = useChat(currentUserId, otherUserId);
  const setActiveChatId = useChatStore((s) => s.setActiveChatId);

  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [viewingImage, setViewingImage] = useState<string | null>(null);
  const [otherUserName, setOtherUserName] = useState('Chat');
  const [otherUserAvatar, setOtherUserAvatar] = useState<string | null>(null);
  const flatListRef = useRef<FlatList>(null);

  // ─── Pending product state (from product page navigation) ─────────────────
  const [pendingProduct, setPendingProduct] = useState<{
    id: string; name: string; price: string; imageUrl: string;
  } | null>(
    productId && productName && productPrice && productImage
      ? { id: productId, name: productName, price: productPrice, imageUrl: productImage }
      : null
  );

  // Fetch the other user's profile
  useEffect(() => {
    if (!otherUserId) return;
    getProfile(otherUserId)
      .then((p) => {
        if (p) {
          setOtherUserName(p.full_name || 'User');
          setOtherUserAvatar(p.avatar_url ?? null);
        }
      })
      .catch(() => {});
  }, [otherUserId]);

  // Track active chat for unread management
  useEffect(() => {
    setActiveChatId(otherUserId || null);
    return () => setActiveChatId(null);
  }, [otherUserId, setActiveChatId]);

  // Mark messages as read when screen mounts / new messages arrive
  useEffect(() => {
    if (!currentUserId || !otherUserId || messages.length === 0) return;
    markMessagesRead().catch(() => {});
  }, [messages.length, currentUserId, otherUserId, markMessagesRead]);

  // ─── Send text ──────────────────────────────────────────────────────────
  const handleSend = useCallback(async () => {
    const text = inputText.trim();
    if (!text || sending || !currentUserId || !otherUserId) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setInputText('');
    setSending(true);
    try {
      await sendMessage(text);
    } catch (e: any) {
      Alert.alert(t.failedSend, e?.message ?? 'Terjadi kesalahan.');
    } finally {
      setSending(false);
    }
  }, [inputText, sending, sendMessage, currentUserId, otherUserId]);

  // ─── Send image ──────────────────────────────────────────────────────────
  const handlePickImage = useCallback(async () => {
    if (!currentUserId || !otherUserId) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Izin Diperlukan', 'Izinkan akses galeri untuk mengirim foto.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.85,
    });
    if (result.canceled || !result.assets[0]) return;

    setUploadingImage(true);
    try {
      const url = await uploadChatImage(result.assets[0].uri);
      await sendImage(url);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (e: any) {
      Alert.alert(t.failedSendImage, e?.message ?? 'Terjadi kesalahan.');
    } finally {
      setUploadingImage(false);
    }
  }, [uploadChatImage, sendImage, currentUserId, otherUserId]);

  // ─── Send product card ───────────────────────────────────────────────────
  const handleSendProduct = useCallback(async () => {
    if (!pendingProduct) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await sendProductCard(pendingProduct);
      setPendingProduct(null);
    } catch (e: any) {
      Alert.alert('Gagal', e?.message ?? 'Tidak bisa mengirim produk.');
    }
  }, [pendingProduct, sendProductCard]);

  // ─── Helpers ──────────────────────────────────────────────────────────────
  const formatTime = (iso: string | null) => {
    if (!iso) return '';
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // ─── Message renderer ────────────────────────────────────────────────────
  const renderMessage = useCallback(({ item }: { item: Message }) => {
    const isMe = item.sender_id === currentUserId;
    const productCard = parseProductCard(item.content);

    return (
      <View style={[styles.messageRow, isMe && styles.messageRowMe]}>
        {!isMe && (
          <Avatar uri={otherUserAvatar} name={otherUserName} size="sm" />
        )}

        <View style={[styles.messageBubble, isMe ? styles.bubbleMe : styles.bubbleOther]}>
          {/* Image message */}
          {item.image_url ? (
            <TouchableOpacity activeOpacity={0.85} onPress={() => setViewingImage(item.image_url!)}>
              <Image
                source={{ uri: item.image_url }}
                style={styles.chatImage}
                contentFit="cover"
                transition={200}
              />
            </TouchableOpacity>
          ) : null}

          {/* Product card */}
          {productCard ? (
            <TouchableOpacity
              style={[styles.productCard, isMe && styles.productCardMe]}
              activeOpacity={0.8}
              onPress={() => router.push(`/product/${productCard.id}` as any)}
            >
              <Image source={{ uri: productCard.imageUrl }} style={styles.productCardImg} contentFit="cover" />
              <View style={styles.productCardInfo}>
                <Text style={[styles.productCardName, isMe && { color: Colors.white }]} numberOfLines={2}>
                  {productCard.name}
                </Text>
                <Text style={[styles.productCardPrice, isMe && { color: 'rgba(255,255,255,0.85)' }]}>
                  {'Rp ' + Number(productCard.price).toLocaleString('id-ID')}
                </Text>
                <View style={styles.productCardLink}>
                  <Ionicons name="arrow-forward-circle" size={13} color={isMe ? 'rgba(255,255,255,0.7)' : Colors.primary} />
                  <Text style={[styles.productCardLinkTxt, isMe && { color: 'rgba(255,255,255,0.7)' }]}>
                    Lihat produk
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ) : item.content ? (
            <Text style={[styles.messageText, isMe && styles.messageTextMe]}>
              {item.content}
            </Text>
          ) : null}

          {/* Timestamp + read receipt */}
          <View style={[styles.metaRow, isMe && styles.metaRowMe]}>
            <Text style={[styles.timestamp, isMe && styles.timestampMe]}>
              {formatTime(item.created_at)}
            </Text>
            {isMe && <ReadReceipt read={item.read_at !== null} />}
          </View>
        </View>
      </View>
    );
  }, [currentUserId, otherUserName, otherUserAvatar]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color={Colors.nearBlack} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.headerProfile}
          activeOpacity={0.7}
          onPress={() => router.push(`/triper/${otherUserId}` as any)}
        >
          <Avatar uri={otherUserAvatar} name={otherUserName} size="sm" />
          <View style={styles.headerInfo}>
            <Text style={styles.headerName}>{otherUserName}</Text>
            <Text style={styles.headerStatus}>{t.online}</Text>
          </View>
        </TouchableOpacity>
        {orderId && (
          <TouchableOpacity
            style={styles.headerAction}
            onPress={() => router.push(`/order/${orderId}`)}
          >
            <Ionicons name="receipt-outline" size={20} color={Colors.primary} />
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.headerAction}>
          <Ionicons name="ellipsis-vertical" size={20} color={Colors.darkGray} />
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <KeyboardAvoidingView
        behavior="padding"
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
          ListFooterComponent={
            loading
              ? <ActivityIndicator color={Colors.primary} style={{ margin: Spacing.base }} />
              : null
          }
        />

        {/* Product attachment preview */}
        {pendingProduct && (
          <View style={styles.productPreview}>
            <Image source={{ uri: pendingProduct.imageUrl }} style={styles.productPreviewImg} contentFit="cover" />
            <View style={styles.productPreviewInfo}>
              <Text style={styles.productPreviewName} numberOfLines={1}>{pendingProduct.name}</Text>
              <Text style={styles.productPreviewPrice}>
                {'Rp ' + Number(pendingProduct.price).toLocaleString('id-ID')}
              </Text>
            </View>
            <TouchableOpacity onPress={handleSendProduct} style={styles.productPreviewSend}>
              <Ionicons name="send" size={18} color={Colors.white} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setPendingProduct(null)} style={styles.productPreviewDismiss}>
              <Ionicons name="close" size={16} color={Colors.darkGray} />
            </TouchableOpacity>
          </View>
        )}

        {/* Input bar */}
        <View style={[styles.inputBar, { paddingBottom: insets.bottom + Spacing.md }]}>
          <TouchableOpacity
            style={styles.attachButton}
            onPress={handlePickImage}
            disabled={uploadingImage}
          >
            {uploadingImage
              ? <ActivityIndicator size="small" color={Colors.primary} />
              : <Ionicons name="image-outline" size={26} color={Colors.darkGray} />
            }
          </TouchableOpacity>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder={t.typeMessage}
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
            {sending
              ? <ActivityIndicator size="small" color={Colors.white} />
              : <Ionicons name="send" size={20} color={inputText.trim() ? Colors.white : Colors.darkGray} />
            }
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Full-screen image viewer */}
      <Modal visible={!!viewingImage} transparent animationType="fade" onRequestClose={() => setViewingImage(null)}>
        <StatusBar hidden />
        <View style={styles.imageViewerBg}>
          <TouchableOpacity style={styles.imageViewerClose} onPress={() => setViewingImage(null)}>
            <Ionicons name="close" size={28} color={Colors.white} />
          </TouchableOpacity>
          {viewingImage && (
            <Image
              source={{ uri: viewingImage }}
              style={styles.imageViewerImg}
              contentFit="contain"
              transition={200}
            />
          )}
        </View>
      </Modal>
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
  safe: {
    flex: 1,
    backgroundColor: Colors.offWhite,
  },
  flex: { flex: 1 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
    gap: Spacing.sm,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerProfile: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  headerInfo: {
    marginLeft: Spacing.xs,
  },
  headerName: {
    fontFamily: Typography.regular.fontFamily,
    fontSize: Typography.sizes.base,
    color: Colors.nearBlack,
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
    backgroundColor: Colors.white,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: Colors.lightGray,
  },
  messageText: {
    fontFamily: Typography.regular.fontFamily,
    fontSize: Typography.sizes.base,
    color: Colors.charcoal,
    lineHeight: 21,
  },
  messageTextMe: {
    color: Colors.white,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  metaRowMe: {
    justifyContent: 'flex-end',
    gap: 3,
  },
  timestamp: {
    fontFamily: Typography.regular.fontFamily,
    fontSize: 10,
    color: Colors.gray,
  },
  timestampMe: {
    color: 'rgba(255,255,255,0.7)',
  },
  readReceipt: {
    marginLeft: 2,
  },

  chatImage: {
    width: SCREEN_WIDTH * 0.55,
    height: SCREEN_WIDTH * 0.4,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.xs,
  },

  // ─── Product preview (attachment bar) ──────────────────────────────────
  productPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.lightGray,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  productPreviewImg: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.lightGray,
  },
  productPreviewInfo: { flex: 1 },
  productPreviewName: {
    fontFamily: Typography.medium.fontFamily,
    fontSize: Typography.sizes.sm,
    color: Colors.nearBlack,
  },
  productPreviewPrice: {
    fontFamily: Typography.regular.fontFamily,
    fontSize: Typography.sizes.xs,
    color: Colors.primary,
    marginTop: 2,
  },
  productPreviewSend: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  productPreviewDismiss: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.offWhite,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ─── Product card (message bubble) ─────────────────────────────────────
  productCard: {
    flexDirection: 'row',
    backgroundColor: Colors.offWhite,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.lightGray,
    width: SCREEN_WIDTH * 0.6,
  },
  productCardMe: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderColor: 'rgba(255,255,255,0.2)',
  },
  productCardImg: {
    width: 70,
    height: 80,
  },
  productCardInfo: {
    flex: 1,
    padding: Spacing.sm,
    justifyContent: 'center',
    gap: 3,
  },
  productCardName: {
    fontFamily: Typography.medium.fontFamily,
    fontSize: Typography.sizes.xs,
    color: Colors.nearBlack,
    lineHeight: 16,
  },
  productCardPrice: {
    fontFamily: Typography.regular.fontFamily,
    fontSize: Typography.sizes.xs,
    color: Colors.primary,
  },
  productCardLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 2,
  },
  productCardLinkTxt: {
    fontFamily: Typography.regular.fontFamily,
    fontSize: 10,
    color: Colors.primary,
  },

  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.lightGray,
    backgroundColor: Colors.white,
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
    backgroundColor: Colors.cream,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.lightGray,
    paddingHorizontal: Spacing.base,
    paddingVertical: Platform.OS === 'ios' ? Spacing.sm : 0,
    maxHeight: 100,
  },
  textInput: {
    fontFamily: Typography.regular.fontFamily,
    fontSize: Typography.sizes.base,
    color: Colors.nearBlack,
    minHeight: 36,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.cream,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonActive: {
    backgroundColor: Colors.primary,
  },

  imageViewerBg: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageViewerClose: {
    position: 'absolute',
    top: 48,
    right: 20,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageViewerImg: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH * 1.2,
  },
});