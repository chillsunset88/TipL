/**
 * TipL — Chat Room Screen
 * Real-time messaging with image send, read receipts, and Supabase integration.
 * Theme-aware: supports Dark Mode & Light Mode.
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

import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/src/lib/constants';
import { useSettingsStore } from '@/src/store/settingsStore';
import { Avatar } from '@/src/components/ui/Avatar';
import { useChat } from '@/src/lib/hooks/useChat';
import { useAuthStore } from '@/src/store/authStore';
import { useChatStore } from '@/src/store/chatStore';
import { getProfile } from '@/src/services/supabase/profiles';
import { getOrderById, OrderWithProfiles } from '@/src/services/supabase/orders';
import type { Database } from '@/src/lib/database.types';
import { useThemeColors } from '@/src/lib/hooks/useThemeColors';

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

function OrderReceiptPreview({ orderId }: { orderId: string }) {
  const C = useThemeColors();
  const [order, setOrder] = useState<OrderWithProfiles | null>(null);
  const [loadingOrder, setLoadingOrder] = useState(true);
  const { t } = useSettingsStore();

  useEffect(() => {
    let mounted = true;
    setLoadingOrder(true);
    getOrderById(orderId)
      .then((o) => { if (mounted) setOrder(o); })
      .catch(() => {})
      .finally(() => { if (mounted) setLoadingOrder(false); });
    return () => { mounted = false; };
  }, [orderId]);

  const s = React.useMemo(() => StyleSheet.create({
    receiptCard: {
      backgroundColor: C.white,
      borderRadius: BorderRadius.lg,
      padding: Spacing.sm,
      borderWidth: 1,
      borderColor: C.lightGray,
      marginBottom: Spacing.sm,
      ...Shadows.sm,
    },
    receiptImage: {
      width: '100%',
      height: 140,
      borderRadius: BorderRadius.md,
      marginBottom: Spacing.sm,
      backgroundColor: C.lightGray,
    },
    receiptImagePlaceholder: {
      width: '100%',
      height: 140,
      borderRadius: BorderRadius.md,
      backgroundColor: C.lightGray,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: Spacing.sm,
    },
    receiptContent: {
      flex: 1,
    },
    receiptLabel: {
      fontFamily: Typography.medium.fontFamily,
      fontSize: Typography.sizes.xs,
      color: C.darkGray,
      marginBottom: Spacing.xs,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    receiptTitle: {
      fontFamily: Typography.medium.fontFamily,
      fontSize: Typography.sizes.sm,
      color: C.nearBlack,
      marginBottom: Spacing.xs,
    },
    receiptSubtitle: {
      fontFamily: Typography.regular.fontFamily,
      fontSize: Typography.sizes.xs,
      color: C.darkGray,
      marginBottom: Spacing.sm,
    },
    receiptPrice: {
      fontFamily: Typography.semiBold.fontFamily,
      fontSize: Typography.sizes.base,
      color: C.primary,
    },
    receiptBtn: {
      marginTop: Spacing.sm,
      backgroundColor: C.primary,
      paddingHorizontal: Spacing.sm,
      paddingVertical: Spacing.xs,
      borderRadius: BorderRadius.full,
      alignSelf: 'flex-start',
    },
    receiptBtnText: {
      fontFamily: Typography.medium.fontFamily,
      fontSize: Typography.sizes.xs,
      color: '#FFFFFF',
    },
  }), [C]);

  if (loadingOrder) return (
    <View style={s.receiptCard}>
      <ActivityIndicator size="small" color={C.primary} />
    </View>
  );
  if (!order) return null;

  const price = order.total_amount ?? order.agreed_price ?? 0;
  const currency = order.currency ?? 'IDR';

  const imageUrl = order.item_url;

  return (
    <TouchableOpacity style={s.receiptCard} activeOpacity={0.85} onPress={() => router.push(`/order/${order.id}`)}>
      {imageUrl ? (
        <Image source={{ uri: imageUrl }} style={s.receiptImage} contentFit="cover" transition={200} />
      ) : (
        <View style={s.receiptImagePlaceholder}>
          <Ionicons name="receipt-outline" size={28} color={C.gray} />
        </View>
      )}
      <View style={s.receiptContent}>
        <Text style={s.receiptLabel}>{(t as any).orderReceiptPreview || 'Receipt'}</Text>
        <Text style={s.receiptTitle} numberOfLines={2}>{order.item_name}</Text>
        <Text style={s.receiptPrice}>{price?.toLocaleString ? price.toLocaleString('id-ID', { style: 'currency', currency }) : `${currency} ${price}`}</Text>
        <View style={s.receiptBtn}>
          <Text style={s.receiptBtnText}>{(t as any).viewReceipt || 'View Receipt'}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function ChatRoomScreen() {
  const C = useThemeColors();
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

  // ─── Send image from gallery ────────────────────────────────────────────
  const handlePickImage = useCallback(async () => {
    if (!currentUserId || !otherUserId) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(t.permissionRequired, t.galleryPermission);
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

  // ─── Take photo with camera ─────────────────────────────────────────────
  const handleTakePhoto = useCallback(async () => {
    if (!currentUserId || !otherUserId) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(t.permissionRequired, t.cameraPermission);
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
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
      Alert.alert(t.error, e?.message ?? t.failedSendProduct);
    }
  }, [pendingProduct, sendProductCard]);

  // ─── Helpers ──────────────────────────────────────────────────────────────
  const formatTime = (iso: string | null) => {
    if (!iso) return '';
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const s = React.useMemo(() => StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: C.offWhite,
    },
    flex: { flex: 1 },

    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: Spacing.base,
      paddingVertical: Spacing.md,
      backgroundColor: C.white,
      borderBottomWidth: 1,
      borderBottomColor: C.lightGray,
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
      fontFamily: Typography.regular.fontFamily,
      fontSize: Typography.sizes.base,
      color: C.nearBlack,
    },
    headerStatus: {
      fontFamily: Typography.regular.fontFamily,
      fontSize: Typography.sizes.xs,
      color: C.success,
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
      backgroundColor: C.primary,
      borderBottomRightRadius: 4,
    },
    bubbleOther: {
      backgroundColor: C.white,
      borderBottomLeftRadius: 4,
      borderWidth: 1,
      borderColor: C.lightGray,
    },
    messageText: {
      fontFamily: Typography.regular.fontFamily,
      fontSize: Typography.sizes.base,
      color: C.charcoal,
      lineHeight: 21,
    },
    messageTextMe: {
      color: '#FFFFFF',
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
      color: C.gray,
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

    inputBar: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      paddingHorizontal: Spacing.md,
      paddingTop: Spacing.md,
      paddingBottom: Spacing.md,
      borderTopWidth: 1,
      borderTopColor: C.lightGray,
      backgroundColor: C.white,
      gap: Spacing.sm,
    },
    attachButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
    },
    attachGroup: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.xs,
    },
    inputContainer: {
      flex: 1,
      backgroundColor: C.offWhite,
      borderRadius: BorderRadius.xl,
      borderWidth: 1,
      borderColor: C.lightGray,
      paddingHorizontal: Spacing.base,
      paddingVertical: Platform.OS === 'ios' ? Spacing.sm : 0,
      maxHeight: 100,
    },
    textInput: {
      fontFamily: Typography.regular.fontFamily,
      fontSize: Typography.sizes.base,
      color: C.nearBlack,
      minHeight: 36,
    },
    sendButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: C.offWhite,
      alignItems: 'center',
      justifyContent: 'center',
    },
    sendButtonActive: {
      backgroundColor: C.primary,
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
    headerProfile: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
      gap: Spacing.sm,
    },
    productPreview: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: Spacing.sm,
      backgroundColor: C.white,
      borderTopWidth: 1,
      borderTopColor: C.lightGray,
      gap: Spacing.sm,
    },
    productPreviewImg: {
      width: 40,
      height: 40,
      borderRadius: BorderRadius.sm,
    },
    productPreviewInfo: {
      flex: 1,
      gap: 2,
    },
    productPreviewName: {
      fontFamily: Typography.medium.fontFamily,
      fontSize: Typography.sizes.sm,
      color: C.nearBlack,
    },
    productPreviewPrice: {
      fontFamily: Typography.regular.fontFamily,
      fontSize: Typography.sizes.xs,
      color: C.primary,
    },
    productPreviewSend: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: C.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    productPreviewDismiss: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: C.offWhite,
      alignItems: 'center',
      justifyContent: 'center',
    },
    productCard: {
      flexDirection: 'row',
      backgroundColor: C.offWhite,
      borderRadius: BorderRadius.md,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: C.lightGray,
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
      color: C.nearBlack,
      lineHeight: 16,
    },
    productCardPrice: {
      fontFamily: Typography.regular.fontFamily,
      fontSize: Typography.sizes.xs,
      color: C.primary,
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
      color: C.primary,
    },
  }), [C]);

  // ─── Message renderer ────────────────────────────────────────────────────
  const renderMessage = useCallback(({ item }: { item: Message }) => {
    const isMe = item.sender_id === currentUserId;
    const productCard = parseProductCard(item.content);

    return (
      <View style={[s.messageRow, isMe && s.messageRowMe]}>
        {!isMe && (
          <Avatar uri={otherUserAvatar} name={otherUserName} size="sm" />
        )}

        <View style={[s.messageBubble, isMe ? s.bubbleMe : s.bubbleOther]}>
          {/* Order receipt preview */}
          {item.order_id ? <OrderReceiptPreview orderId={item.order_id} /> : null}
          {/* Image message */}
          {item.image_url ? (
            <TouchableOpacity activeOpacity={0.85} onPress={() => setViewingImage(item.image_url!)}>
              <Image
                source={{ uri: item.image_url }}
                style={s.chatImage}
                contentFit="cover"
                transition={200}
              />
            </TouchableOpacity>
          ) : null}

          {/* Product card */}
          {productCard ? (
            <TouchableOpacity
              style={[s.productCard, isMe && s.productCardMe]}
              activeOpacity={0.8}
              onPress={() => router.push(`/product/${productCard.id}` as any)}
            >
              <Image source={{ uri: productCard.imageUrl }} style={s.productCardImg} contentFit="cover" />
              <View style={s.productCardInfo}>
                <Text style={[s.productCardName, isMe && { color: '#FFFFFF' }]} numberOfLines={2}>
                  {productCard.name}
                </Text>
                <Text style={[s.productCardPrice, isMe && { color: 'rgba(255,255,255,0.85)' }]}>
                  {'Rp ' + Number(productCard.price).toLocaleString('id-ID')}
                </Text>
                <View style={s.productCardLink}>
                  <Ionicons name="arrow-forward-circle" size={13} color={isMe ? 'rgba(255,255,255,0.7)' : C.primary} />
                  <Text style={[s.productCardLinkTxt, isMe && { color: 'rgba(255,255,255,0.7)' }]}>
                    Lihat produk
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ) : item.content ? (
            <Text style={[s.messageText, isMe && s.messageTextMe]}>
              {item.content}
            </Text>
          ) : null}

          {/* Timestamp + read receipt */}
          <View style={[s.metaRow, isMe && s.metaRowMe]}>
            <Text style={[s.timestamp, isMe && s.timestampMe]}>
              {formatTime(item.created_at)}
            </Text>
            {isMe && <ReadReceipt read={item.read_at !== null} C={C} />}
          </View>
        </View>
      </View>
    );
  }, [currentUserId, otherUserName, otherUserAvatar, s, C]);

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backButton}>
          <Ionicons name="arrow-back" size={22} color={C.nearBlack} />
        </TouchableOpacity>
        <TouchableOpacity
          style={s.headerProfile}
          activeOpacity={0.7}
          onPress={() => router.push(`/triper/${otherUserId}` as any)}
        >
          <Avatar uri={otherUserAvatar} name={otherUserName} size="sm" />
          <View style={s.headerInfo}>
            <Text style={s.headerName}>{otherUserName}</Text>
            <Text style={s.headerStatus}>{t.online}</Text>
          </View>
        </TouchableOpacity>
        {orderId && (
          <TouchableOpacity
            style={s.headerAction}
            onPress={() => router.push(`/order/${orderId}`)}
          >
            <Ionicons name="receipt-outline" size={20} color={C.primary} />
          </TouchableOpacity>
        )}
        <TouchableOpacity style={s.headerAction}>
          <Ionicons name="ellipsis-vertical" size={20} color={C.darkGray} />
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <KeyboardAvoidingView
        behavior="padding"
        style={s.flex}
        keyboardVerticalOffset={0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          inverted
          contentContainerStyle={s.messageList}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            orderId ? (
              <View style={{ paddingHorizontal: Spacing.base, marginBottom: Spacing.sm }}>
                <OrderReceiptPreview orderId={orderId} />
              </View>
            ) : null
          }
          ListFooterComponent={
            loading
              ? <ActivityIndicator color={C.primary} style={{ margin: Spacing.base }} />
              : null
          }
        />

        {/* Product attachment preview */}
        {pendingProduct && (
          <View style={s.productPreview}>
            <Image source={{ uri: pendingProduct.imageUrl }} style={s.productPreviewImg} contentFit="cover" />
            <View style={s.productPreviewInfo}>
              <Text style={s.productPreviewName} numberOfLines={1}>{pendingProduct.name}</Text>
              <Text style={s.productPreviewPrice}>
                {'Rp ' + Number(pendingProduct.price).toLocaleString('id-ID')}
              </Text>
            </View>
            <TouchableOpacity onPress={handleSendProduct} style={s.productPreviewSend}>
              <Ionicons name="send" size={18} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setPendingProduct(null)} style={s.productPreviewDismiss}>
              <Ionicons name="close" size={16} color={C.darkGray} />
            </TouchableOpacity>
          </View>
        )}

        {/* Input bar */}
        <View style={[s.inputBar, { paddingBottom: insets.bottom + Spacing.md }]}>
          <View style={s.attachGroup}>
            <TouchableOpacity
              style={s.attachButton}
              onPress={handlePickImage}
              disabled={uploadingImage}
            >
              {uploadingImage
                ? <ActivityIndicator size="small" color={C.primary} />
                : <Ionicons name="image-outline" size={24} color={C.darkGray} />
              }
            </TouchableOpacity>
            <TouchableOpacity
              style={s.attachButton}
              onPress={handleTakePhoto}
              disabled={uploadingImage}
            >
              <Ionicons name="camera-outline" size={24} color={C.darkGray} />
            </TouchableOpacity>
          </View>
          <View style={s.inputContainer}>
            <TextInput
              style={s.textInput}
              placeholder={t.typeMessage}
              placeholderTextColor={C.darkGray}
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={2000}
              onSubmitEditing={handleSend}
            />
          </View>

          <TouchableOpacity
            style={[s.sendButton, inputText.trim() && s.sendButtonActive]}
            onPress={handleSend}
            disabled={!inputText.trim() || sending}
          >
            {sending
              ? <ActivityIndicator size="small" color="#FFFFFF" />
              : <Ionicons name="send" size={20} color={inputText.trim() ? '#FFFFFF' : C.darkGray} />
            }
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Full-screen image viewer */}
      <Modal visible={!!viewingImage} transparent animationType="fade" onRequestClose={() => setViewingImage(null)}>
        <StatusBar hidden />
        <View style={s.imageViewerBg}>
          <TouchableOpacity style={s.imageViewerClose} onPress={() => setViewingImage(null)}>
            <Ionicons name="close" size={28} color="#FFFFFF" />
          </TouchableOpacity>
          {viewingImage && (
            <Image
              source={{ uri: viewingImage }}
              style={s.imageViewerImg}
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
function ReadReceipt({ read, C }: { read: boolean; C: ReturnType<typeof useThemeColors> }) {
  return (
    <View style={{ marginLeft: 2 }}>
      <Ionicons
        name="checkmark-done"
        size={13}
        color={read ? C.primary : 'rgba(255,255,255,0.5)'}
      />
    </View>
  );
}


