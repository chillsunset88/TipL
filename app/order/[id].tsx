/**
 * TipL — Order Detail / Escrow State Machine
 * Role-aware action buttons, Supabase real-time data, Supabase escrow.
 * Theme-aware: supports Dark Mode & Light Mode.
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

import { Typography, Spacing, BorderRadius, Shadows } from '@/src/lib/constants';
import { Button } from '@/src/components/ui/Button';
import { ReviewModal } from '@/src/components/ui/ReviewModal';
import { useSettingsStore } from '@/src/store/settingsStore';
import { useOrder, updateOrderStatus } from '@/src/lib/hooks/useOrders';
import { useAuthStore } from '@/src/store/authStore';
import { createXenditInvoice } from '@/src/lib/xendit';
import { createEscrowPayment, releaseEscrow, disputeEscrow } from '@/src/services/supabase/escrow';
import { hasReviewed, submitReview, recalculateProfileRating } from '@/src/services/supabase/reviews';
import { addDeliveryReminderEvent } from '@/src/services/calendar';
import * as Clipboard from 'expo-clipboard';
import * as Sharing from 'expo-sharing';
import type { OrderWithProfiles } from '@/src/services/supabase/orders';
import { sendMessage } from '@/src/services/supabase/messages';
import { useThemeColors, useIsDark } from '@/src/lib/hooks/useThemeColors';

// ─── Status config (computed from translations) ───────────────────────────────
import type { Translations } from '@/src/lib/i18n';

type StatusCfgMap = Record<string, { label: string; gradient: [string, string]; sub: string }>;

function getStatusConfig(t: Translations, isDark: boolean): StatusCfgMap {
  return {
    pending:   { label: t.statusWaiting,       gradient: isDark ? ['#2D2D2D', '#1A1A1A'] : ['#E8E8E8', '#D0D0D0'], sub: t.statusWaitingDesc },
    accepted:  { label: t.statusOfferAccepted, gradient: isDark ? ['#1A364A', '#0D1E2D'] : ['#E8F4FD', '#C8E6F9'], sub: t.statusOfferAcceptedDesc },
    in_escrow: { label: t.statusInEscrow,      gradient: isDark ? ['#3D2E14', '#261C0A'] : ['#F5E6C8', '#EDD9A3'], sub: t.statusInEscrowDesc },
    purchased: { label: t.statusItemPurchased, gradient: isDark ? ['#1F3A15', '#10200A'] : ['#F0F8E8', '#D4EDBA'], sub: t.statusItemPurchasedDesc },
    shipped:   { label: t.statusInTransit,     gradient: isDark ? ['#1B2E4F', '#0E1D36'] : ['#E8F0FE', '#C5D8F8'], sub: t.statusInTransitDesc },
    delivered: { label: t.statusDelivered,     gradient: isDark ? ['#123A21', '#092010'] : ['#E8F9EE', '#B8ECC8'], sub: t.statusDeliveredDesc },
    completed: { label: t.statusCompleted,     gradient: isDark ? ['#123A21', '#092010'] : ['#E8F9EE', '#B8ECC8'], sub: t.statusCompletedDesc },
    cancelled: { label: t.statusCancelled,     gradient: isDark ? ['#4C1F1B', '#2E100D'] : ['#FFEBE9', '#FFD0CC'], sub: t.statusCancelledDesc },
    disputed:  { label: t.statusDisputed,      gradient: isDark ? ['#472E0F', '#2C1B06'] : ['#FFF4E5', '#FFE0A8'], sub: t.statusDisputedDesc },
  };
}

function getTriperStatusConfig(t: Translations, isDark: boolean): StatusCfgMap {
  return {
    pending:   { label: t.triperStatusPending,   gradient: isDark ? ['#2D2D2D', '#1A1A1A'] : ['#E8E8E8', '#D0D0D0'], sub: t.triperStatusPendingDesc },
    accepted:  { label: t.triperStatusAccepted,  gradient: isDark ? ['#1A364A', '#0D1E2D'] : ['#E8F4FD', '#C8E6F9'], sub: t.triperStatusAcceptedDesc },
    in_escrow: { label: t.triperStatusInEscrow,  gradient: isDark ? ['#3D2E14', '#261C0A'] : ['#F5E6C8', '#EDD9A3'], sub: t.triperStatusInEscrowDesc },
    purchased: { label: t.triperStatusPurchased, gradient: isDark ? ['#1F3A15', '#10200A'] : ['#F0F8E8', '#D4EDBA'], sub: t.triperStatusPurchasedDesc },
    shipped:   { label: t.triperStatusShipped,   gradient: isDark ? ['#1B2E4F', '#0E1D36'] : ['#E8F0FE', '#C5D8F8'], sub: t.triperStatusShippedDesc },
    delivered: { label: t.triperStatusDelivered, gradient: isDark ? ['#123A21', '#092010'] : ['#E8F9EE', '#B8ECC8'], sub: t.triperStatusDeliveredDesc },
    completed: { label: t.statusCompleted,       gradient: isDark ? ['#123A21', '#092010'] : ['#E8F9EE', '#B8ECC8'], sub: t.statusCompletedDesc },
    cancelled: { label: t.statusCancelled,       gradient: isDark ? ['#4C1F1B', '#2E100D'] : ['#FFEBE9', '#FFD0CC'], sub: t.statusCancelledDesc },
    disputed:  { label: t.statusDisputed,        gradient: isDark ? ['#472E0F', '#2C1B06'] : ['#FFF4E5', '#FFE0A8'], sub: t.statusDisputedDesc },
  };
}

export default function OrderDetailScreen() {
  const C = useThemeColors();
  const isDark = useIsDark();
  const { id } = useLocalSearchParams<{ id: string }>();
  const user = useAuthStore((s) => s.user);
  const { order, loading } = useOrder(id);

  const [actionLoading, setActionLoading] = useState(false);
  const [reviewVisible, setReviewVisible] = useState(false);
  const [alreadyReviewed, setAlreadyReviewed] = useState(false);
  const { t } = useSettingsStore();

  useEffect(() => {
    if (!order || !user) return;
    const isTiperCheck = order.tiper_id === user.id;
    if (order.status === 'completed' && isTiperCheck) {
      hasReviewed(order.id, user.id).then(setAlreadyReviewed).catch(() => {});
    }
  }, [order?.id, order?.status, user?.id]);

  const s = React.useMemo(() => StyleSheet.create({
    safe: { flex: 1, backgroundColor: C.white },

    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: Spacing.xl,
      paddingVertical: Spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: C.lightGray,
      backgroundColor: C.white,
    },
    backButton: {
      width: 44, height: 44, borderRadius: 22,
      backgroundColor: C.offWhite,
      alignItems: 'center', justifyContent: 'center',
    },
    headerCenter: { alignItems: 'center' },
    headerActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 2,
    },
    headerTitle: {
      fontFamily: Typography.regular.fontFamily,
      fontSize: Typography.sizes.md,
      color: C.nearBlack,
    },
    orderNumber: {
      fontFamily: Typography.regular.fontFamily,
      fontSize: Typography.sizes.xs,
      color: C.darkGray,
      marginTop: 2,
    },
    moreButton: {
      width: 44, height: 44, borderRadius: 22,
      alignItems: 'center', justifyContent: 'center',
    },

    container: { flex: 1, paddingHorizontal: Spacing.xl, backgroundColor: C.offWhite },

    statusCard: {
      borderRadius: BorderRadius.lg,
      padding: Spacing.xl,
      marginTop: Spacing.lg,
      marginBottom: Spacing.lg,
      alignItems: 'center',
      ...Shadows.md,
    },
    statusLabel: {
      fontFamily: Typography.medium.fontFamily,
      fontSize: 10, color: isDark ? '#FFFFFF88' : C.charcoal,
      letterSpacing: 1.5, marginBottom: Spacing.sm,
    },
    statusTitle: {
      fontFamily: Typography.serifBold.fontFamily,
      fontSize: Typography.sizes['2xl'],
      color: isDark ? '#FFFFFF' : C.nearBlack, textAlign: 'center',
    },
    statusSubtext: {
      fontFamily: Typography.regular.fontFamily,
      fontSize: Typography.sizes.sm,
      color: isDark ? '#FFFFFFDD' : C.charcoal, marginTop: Spacing.sm,
      textAlign: 'center',
    },
    escrowBadge: {
      flexDirection: 'row', alignItems: 'center',
      backgroundColor: 'rgba(196,162,101,0.15)',
      borderRadius: BorderRadius.full,
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.xs,
      marginTop: Spacing.md,
      gap: Spacing.xs,
    },
    escrowBadgeText: {
      fontFamily: Typography.medium.fontFamily,
      fontSize: Typography.sizes.xs,
      color: C.primary,
    },

    itemCard: {
      flexDirection: 'row',
      backgroundColor: C.white,
      borderRadius: BorderRadius.lg,
      padding: Spacing.base,
      marginBottom: Spacing.xl,
      borderWidth: 1,
      borderColor: C.lightGray,
      alignItems: 'center',
    },
    itemImage: {
      width: 70, height: 70,
      borderRadius: BorderRadius.md,
    },
    itemImagePlaceholder: {
      backgroundColor: C.lightGray,
      alignItems: 'center', justifyContent: 'center',
    },
    itemInfo: { flex: 1, marginLeft: Spacing.md },
    itemName: {
      fontFamily: Typography.regular.fontFamily,
      fontSize: Typography.sizes.base, color: C.nearBlack,
    },
    itemDesc: {
      fontFamily: Typography.regular.fontFamily,
      fontSize: Typography.sizes.xs, color: C.darkGray, marginTop: 2,
    },
    itemQty: {
      fontFamily: Typography.medium.fontFamily,
      fontSize: Typography.sizes.xs, color: C.gray, marginTop: 4,
    },
    itemPrice: {
      fontFamily: Typography.regular.fontFamily,
      fontSize: Typography.sizes.sm, color: C.nearBlack,
    },

    section: { marginBottom: Spacing.xl },
    sectionTitle: {
      fontFamily: Typography.serifBold.fontFamily,
      fontSize: Typography.sizes.lg, color: C.nearBlack,
      marginBottom: Spacing.base,
    },

    summaryCard: {
      backgroundColor: C.white,
      borderRadius: BorderRadius.lg,
      padding: Spacing.base,
      borderWidth: 1, borderColor: C.lightGray,
    },
    summaryRow: {
      flexDirection: 'row', justifyContent: 'space-between',
      paddingVertical: Spacing.sm,
    },
    summaryLabel: {
      fontFamily: Typography.regular.fontFamily,
      fontSize: Typography.sizes.sm, color: C.darkGray,
    },
    summaryValue: {
      fontFamily: Typography.medium.fontFamily,
      fontSize: Typography.sizes.sm, color: C.nearBlack,
    },
    summaryBold: {
      fontFamily: Typography.regular.fontFamily,
      fontSize: Typography.sizes.base, color: C.nearBlack,
    },
    summaryDivider: {
      height: 1, backgroundColor: C.midGray,
      marginVertical: Spacing.sm,
    },

    actionBar: {
      backgroundColor: C.white,
      paddingHorizontal: Spacing.xl,
      paddingVertical: Spacing.xl,
      marginTop: Spacing.xl,
      borderTopWidth: 1,
      borderTopColor: C.lightGray,
      borderRadius: BorderRadius.lg,
      marginBottom: Spacing.xl,
    },

    adminHeader: {
      flexDirection: 'row', alignItems: 'center', gap: Spacing.xs,
      marginBottom: Spacing.sm,
    },
    adminHeaderTxt: {
      fontFamily: Typography.medium.fontFamily,
      fontSize: Typography.sizes.xs,
      color: C.primary, letterSpacing: 0.5,
    },
    adminGrid: {
      flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm,
    },
    adminBtn: {
      flexDirection: 'row', alignItems: 'center', gap: 4,
      paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
      borderRadius: BorderRadius.full, borderWidth: 1,
      backgroundColor: C.white, position: 'relative',
    },
    adminBtnTxt: {
      fontFamily: Typography.regular.fontFamily,
      fontSize: Typography.sizes.xs, color: C.charcoal,
    },
    activeDot: {
      width: 6, height: 6, borderRadius: 3,
      position: 'absolute', top: 4, right: 4,
    },
    terminalBadge: {
      flexDirection: 'row', alignItems: 'center',
      justifyContent: 'center', gap: Spacing.sm,
      paddingVertical: Spacing.md,
    },
    terminalText: {
      fontFamily: Typography.medium.fontFamily,
      fontSize: Typography.sizes.sm, color: C.darkGray,
    },
    adminReviewDivider: {
      marginTop: Spacing.md,
      paddingTop: Spacing.md,
      borderTopWidth: 1,
      borderTopColor: C.lightGray,
    },
    reviewedBadge: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
      gap: Spacing.xs, marginTop: Spacing.sm,
      paddingVertical: Spacing.sm,
      backgroundColor: C.primary + '15',
      borderRadius: BorderRadius.full,
    },
    reviewedBadgeText: {
      fontFamily: Typography.medium.fontFamily,
      fontSize: Typography.sizes.sm,
      color: C.primary,
    },
    waitingText: {
      fontFamily: Typography.regular.fontFamily,
      fontSize: Typography.sizes.sm, color: C.gray,
      textAlign: 'center',
    },
  }), [C, isDark]);

  if (loading) {
    return (
      <SafeAreaView style={[styles.safeLoader, { backgroundColor: C.white, alignItems: 'center', justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color={C.primary} />
      </SafeAreaView>
    );
  }

  if (!order) {
    return (
      <SafeAreaView style={[styles.safeLoader, { backgroundColor: C.white, alignItems: 'center', justifyContent: 'center' }]}>
        <Text style={{ color: C.darkGray }}>{t.orderNotFound}</Text>
      </SafeAreaView>
    );
  }

  const status = order.status ?? 'pending';
  const isTiper = order.tiper_id === (user?.id ?? '');
  const isTriper = order.triper_id === (user?.id ?? '');
  const isAdmin = user?.role === 'admin';
  const chatPartnerId = isTiper ? order.triper_id : isTriper ? order.tiper_id : null;

  const STATUS_CONFIG = getStatusConfig(t, isDark);
  const statusCfg = (isTriper && !isTiper ? getTriperStatusConfig(t, isDark) : STATUS_CONFIG)[status]
    ?? STATUS_CONFIG['pending'];

  const totalAmount = order.total_amount ?? 0;
  const agreedPrice = order.agreed_price ?? 0;
  const serviceFee = order.service_fee ?? 0;
  const currency = order.currency ?? 'IDR';

  const fmt = (n: number) =>
    n.toLocaleString('id-ID', { style: 'currency', currency, maximumFractionDigits: 0 });

  // ─── Actions ──────────────────────────────────────────────────────────────
  const withLoading = async (fn: () => Promise<void>) => {
    setActionLoading(true);
    try {
      await fn();
    } catch (e: unknown) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', e instanceof Error ? e.message : 'Action failed. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  /** Tiper: Pay Now → Xendit hosted checkout */
  const handlePayNow = () => withLoading(async () => {
    if (!user) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const externalId = `tipl-${order.id}-${Date.now()}`;
    const { invoice_url } = await createXenditInvoice({
      externalId,
      amount: totalAmount,
      payerEmail: user.email,
      description: `TipL Order - ${order.item_name}`,
      currency,
    });
    router.push({
      pathname: '/payment/xendit-qr',
      params: {
        invoiceUrl: invoice_url,
        orderId: order.id,
        buyerId: order.tiper_id,
        travelerId: order.triper_id,
        amount: String(totalAmount),
        currency,
      },
    });
  });

  /** Triper: Accept order */
  const handleAccept = () => withLoading(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await updateOrderStatus(order.id, 'accepted');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  });

  /** Triper: Mark as shipped */
  const handleMarkShipped = () => withLoading(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await updateOrderStatus(order.id, 'shipped');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const estimatedDelivery = Date.now() + 7 * 24 * 60 * 60 * 1000;
    addDeliveryReminderEvent(order.id, order.item_name, estimatedDelivery).catch(() => {});
  });

  /** Tiper: Confirm receipt → release escrow */
  const handleConfirmReceipt = () => {
    Alert.alert(
      t.confirmDelivery,
      t.confirmDeliveryMsg,
      [
        { text: t.cancel, style: 'cancel' },
        {
          text: t.confirmAndRelease,
          style: 'default',
          onPress: () => withLoading(async () => {
            await releaseEscrow(order.id);
            await updateOrderStatus(order.id, 'completed');
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Alert.alert(t.paymentReleased, t.paymentReleasedMsg);
          }),
        },
      ],
    );
  };

  /** Tiper: Dispute */
  const handleDispute = () => {
    Alert.alert(
      t.fileDispute,
      t.fileDisputeMsg,
      [
        { text: t.cancel, style: 'cancel' },
        {
          text: t.fileDispute,
          style: 'destructive',
          onPress: () => withLoading(async () => {
            await disputeEscrow(order.id, 'Buyer filed dispute from app');
            await updateOrderStatus(order.id, 'disputed');
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            Alert.alert(t.disputeFiled, t.disputeFiledMsg);
          }),
        },
      ],
    );
  };

  const escrowStatuses = ['in_escrow', 'purchased', 'shipped'];

  const handleSubmitReview = async (rating: number, comment: string) => {
    if (!user || !order) return;
    await submitReview({
      order_id: order.id,
      reviewer_id: user.id,
      reviewee_id: order.triper_id,
      rating,
      comment: comment || null,
    });
    await recalculateProfileRating(order.triper_id).catch(() => {});
    setAlreadyReviewed(true);
  };

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backButton}>
          <Ionicons name="arrow-back" size={24} color={C.nearBlack} />
        </TouchableOpacity>
        <View style={s.headerCenter}>
          <Text style={s.headerTitle}>{t.orderTracking}</Text>
          <TouchableOpacity
            onPress={async () => {
              await Clipboard.setStringAsync(order.id);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              Alert.alert(t.orderIdCopied, t.orderIdCopiedMsg);
            }}
          >
            <Text style={s.orderNumber}>#{order.id.slice(0, 8)} ⎘</Text>
          </TouchableOpacity>
        </View>
        <View style={s.headerActions}>
          <TouchableOpacity
            style={s.moreButton}
            onPress={async () => {
              const canShare = await Sharing.isAvailableAsync();
              if (canShare) {
                await Sharing.shareAsync('', {
                  dialogTitle: `Order ${order.id.slice(0, 8)}`,
                  UTI: 'public.plain-text',
                }).catch(() => {});
              } else {
                await Clipboard.setStringAsync(
                  `TipL Order #${order.id.slice(0, 8)}\nItem: ${order.item_name}\nStatus: ${STATUS_CONFIG[status]?.label ?? status}`,
                );
                Alert.alert(t.summaryCopied, t.summaryCopiedMsg);
              }
            }}
          >
            <Ionicons name="share-outline" size={20} color={C.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={s.moreButton}
            onPress={() => {
              if (!chatPartnerId) return;
              withLoading(async () => {
                // Send an order-linked message so the chat shows a receipt card
                if (user) {
                  try {
                    await sendMessage({
                      sender_id: user.id,
                      receiver_id: chatPartnerId,
                      order_id: order.id,
                      content: `${order.item_name} — ${fmt(totalAmount)}`,
                      message_type: 'order',
                    });
                  } catch (e) {
                    // ignore send errors; still navigate to chat
                  }
                }

                router.push({
                  pathname: '/chat/[id]' as any,
                  params: {
                    id: chatPartnerId,
                    receiverId: chatPartnerId,
                    orderId: order.id,
                  },
                });
              });
            }}
          >
            <Ionicons name="chatbubble-outline" size={20} color={C.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={s.container} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Status Card */}
        <LinearGradient
          colors={statusCfg.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={s.statusCard}
        >
          <Text style={s.statusLabel}>{t.currentStatus}</Text>
          <Text style={s.statusTitle}>{statusCfg.label}</Text>
          <Text style={s.statusSubtext}>{statusCfg.sub}</Text>

          {escrowStatuses.includes(status) && (
            <View style={s.escrowBadge}>
              <Ionicons name="shield-checkmark" size={14} color={C.primary} />
              <Text style={s.escrowBadgeText}>{t.fundsInEscrowBadge}</Text>
            </View>
          )}
        </LinearGradient>

        {/* Item card */}
        <View style={s.itemCard}>
          <View style={[s.itemImage, s.itemImagePlaceholder]}>
            <Ionicons name="cube-outline" size={28} color={C.gray} />
          </View>
          <View style={s.itemInfo}>
            <Text style={s.itemName} numberOfLines={2}>{order.item_name}</Text>
            {order.notes ? (
              <Text style={s.itemDesc} numberOfLines={2}>{order.notes}</Text>
            ) : null}
            <Text style={s.itemQty}>Qty: {order.quantity ?? 1}</Text>
          </View>
          <Text style={s.itemPrice}>{fmt(totalAmount)}</Text>
        </View>

        {/* Payment Summary */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>{t.paymentSummary}</Text>
          <View style={s.summaryCard}>
            <SummaryRow label={t.itemPrice} value={fmt(agreedPrice)} styles={s} />
            <SummaryRow label={t.serviceFee} value={fmt(serviceFee)} styles={s} />
            <View style={s.summaryDivider} />
            <SummaryRow label={t.total} value={fmt(totalAmount)} bold styles={s} />
          </View>
        </View>

        {/* Participants */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>{t.participants}</Text>
          <View style={s.summaryCard}>
            <View style={s.summaryRow}>
              <Text style={s.summaryLabel}>{t.buyer}</Text>
              <Text style={s.summaryValue}>
                {order.tiper?.full_name ?? order.tiper_id.slice(0, 8)}
                {isTiper ? ' (Anda)' : ''}
              </Text>
            </View>
            <View style={s.summaryRow}>
              <Text style={s.summaryLabel}>{t.traveler}</Text>
              <Text style={s.summaryValue}>
                {order.triper?.full_name ?? order.triper_id.slice(0, 8)}
                {isTriper ? ' (Anda)' : ''}
              </Text>
            </View>
          </View>
        </View>

        {/* Action section — di dalam scroll agar tidak menutupi konten */}
        <ActionBar
          order={order}
          status={status}
          isTiper={isTiper}
          isTriper={isTriper}
          isAdmin={isAdmin}
          loading={actionLoading}
          alreadyReviewed={alreadyReviewed}
          onPayNow={handlePayNow}
          onAccept={handleAccept}
          onMarkShipped={handleMarkShipped}
          onConfirmReceipt={handleConfirmReceipt}
          onDispute={handleDispute}
          onAdminSetStatus={(stVal) => withLoading(() => updateOrderStatus(order.id, stVal))}
          onLeaveReview={() => setReviewVisible(true)}
          styles={s}
          C={C}
        />
      </ScrollView>

      <ReviewModal
        visible={reviewVisible}
        travelerName={order.triper?.full_name ?? 'Traveler'}
        onClose={() => setReviewVisible(false)}
        onSubmit={handleSubmitReview}
      />
    </SafeAreaView>
  );
}

// ─── Status config untuk admin ────────────────────────────────────────────────
type OrderStatus = 'pending' | 'accepted' | 'in_escrow' | 'purchased' | 'shipped' | 'delivered' | 'completed' | 'cancelled' | 'disputed';

const ADMIN_STATUSES: { status: OrderStatus; label: string; color: string; icon: string }[] = [
  { status: 'pending',    label: 'Pending',   color: '#9E9E9E', icon: 'time-outline' },
  { status: 'accepted',   label: 'Diterima',  color: '#2196F3', icon: 'checkmark-outline' },
  { status: 'in_escrow',  label: 'Escrow',    color: '#F59E0B', icon: 'lock-closed-outline' },
  { status: 'purchased',  label: 'Dibeli',    color: '#66BB6A', icon: 'bag-outline' },
  { status: 'shipped',    label: 'Dikirim',   color: '#42A5F5', icon: 'airplane-outline' },
  { status: 'delivered',  label: 'Tiba',      color: '#26A69A', icon: 'home-outline' },
  { status: 'completed',  label: 'Selesai',   color: '#43A047', icon: 'checkmark-circle-outline' },
  { status: 'cancelled',  label: 'Dibatal',   color: '#EF5350', icon: 'close-circle-outline' },
  { status: 'disputed',   label: 'Dispute',   color: '#FF7043', icon: 'alert-circle-outline' },
];

// ─── Action bar ───────────────────────────────────────────────────────────────
interface ActionBarProps {
  order: OrderWithProfiles;
  status: string;
  isTiper: boolean;
  isTriper: boolean;
  isAdmin: boolean;
  loading: boolean;
  alreadyReviewed: boolean;
  onPayNow: () => void;
  onAccept: () => void;
  onMarkShipped: () => void;
  onConfirmReceipt: () => void;
  onDispute: () => void;
  onAdminSetStatus: (s: OrderStatus) => void;
  onLeaveReview: () => void;
  styles: any;
  C: ReturnType<typeof useThemeColors>;
}

function ActionBar({ status, isTiper, isTriper, isAdmin, loading, alreadyReviewed, onPayNow, onAccept, onMarkShipped, onConfirmReceipt, onDispute, onAdminSetStatus, onLeaveReview, styles, C }: ActionBarProps) {
  const { t } = useSettingsStore();
  const terminal = ['completed', 'cancelled', 'disputed'].includes(status);

  // ── Admin override panel ────────────────────────────────────────────────────
  if (isAdmin) {
    return (
      <View style={styles.actionBar}>
        {loading && <ActivityIndicator color={C.primary} style={{ marginBottom: Spacing.sm }} />}
        <View style={styles.adminHeader}>
          <Ionicons name="shield-checkmark" size={14} color={C.primary} />
          <Text style={styles.adminHeaderTxt}>Admin Controls (Demo)</Text>
        </View>
        <View style={styles.adminGrid}>
          {ADMIN_STATUSES.map(({ status: stVal, label, color, icon }) => {
            const isCurrent = status === stVal;
            return (
              <TouchableOpacity
                key={stVal}
                style={[
                  styles.adminBtn,
                  { borderColor: isCurrent ? color : C.lightGray },
                  isCurrent && { backgroundColor: `${color}15` },
                ]}
                activeOpacity={0.7}
                disabled={loading || isCurrent}
                onPress={() => {
                  Alert.alert(
                    'Ubah Status',
                    `Set status ke "${label}"?`,
                    [
                      { text: 'Batal', style: 'cancel' },
                      { text: 'Ya, Ubah', onPress: () => onAdminSetStatus(stVal) },
                    ],
                  );
                }}
              >
                <Ionicons name={icon as any} size={16} color={isCurrent ? color : C.charcoal} />
                <Text style={[styles.adminBtnTxt, isCurrent && { color }]}>{label}</Text>
                {isCurrent && (
                  <View style={[styles.activeDot, { backgroundColor: color }]} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Review section tetap muncul meski admin, kalau user juga tiper di order ini */}
        {status === 'completed' && isTiper && (
          <View style={styles.adminReviewDivider}>
            {alreadyReviewed ? (
              <View style={styles.reviewedBadge}>
                <Ionicons name="star" size={14} color={C.primary} />
                <Text style={styles.reviewedBadgeText}>{t.alreadyReviewed}</Text>
              </View>
            ) : (
              <Button
                title={t.leaveReview}
                onPress={onLeaveReview}
                fullWidth
                size="lg"
                icon={<Ionicons name="star-outline" size={18} color="#FFFFFF" />}
              />
            )}
          </View>
        )}
      </View>
    );
  }

  // ── Tripper waiting for payment — nothing to do, hide bar entirely ──────────
  if (isTriper && !isTiper && status === 'accepted') return null;

  // ── Normal user bar ─────────────────────────────────────────────────────────
  if (terminal) {
    return (
      <View style={styles.actionBar}>
        <View style={styles.terminalBadge}>
          <Ionicons
            name={status === 'completed' ? 'checkmark-circle' : status === 'cancelled' ? 'close-circle' : 'alert-circle'}
            size={18}
            color={status === 'completed' ? C.success : status === 'cancelled' ? C.error : C.warning}
          />
          <Text style={styles.terminalText}>
            {status === 'completed' ? t.orderCompletedMsg : status === 'cancelled' ? t.orderCancelledMsg : t.disputeFiledStatus}
          </Text>
        </View>

        {status === 'completed' && isTiper && (
          alreadyReviewed ? (
            <View style={styles.reviewedBadge}>
              <Ionicons name="star" size={14} color={C.primary} />
              <Text style={styles.reviewedBadgeText}>{t.alreadyReviewed}</Text>
            </View>
          ) : (
            <Button
              title={t.leaveReview}
              onPress={onLeaveReview}
              fullWidth
              size="lg"
              icon={<Ionicons name="star-outline" size={18} color="#FFFFFF" />}
            />
          )
        )}
      </View>
    );
  }

  return (
    <View style={styles.actionBar}>
      {loading && <ActivityIndicator color={C.primary} style={{ marginBottom: Spacing.sm }} />}

      {/* Tiper actions */}
      {isTiper && (status === 'pending' || status === 'accepted') && (
        <Button title={t.payNow} onPress={onPayNow} fullWidth size="lg" disabled={loading}
          icon={<Ionicons name="card-outline" size={18} color="#FFFFFF" />} />
      )}
      {isTiper && status === 'shipped' && (
        <View style={{ gap: Spacing.sm }}>
          <Button title={t.confirmReceipt} onPress={onConfirmReceipt} fullWidth size="lg" disabled={loading}
            icon={<Ionicons name="checkmark-circle-outline" size={18} color="#FFFFFF" />} />
          <Button title={t.fileDispute} onPress={onDispute} variant="secondary" fullWidth disabled={loading}
            icon={<Ionicons name="alert-circle-outline" size={18} color={C.error} />}
            style={{ borderColor: C.error }} />
        </View>
      )}

      {/* Triper actions — only when not also the buyer */}
      {isTriper && !isTiper && status === 'pending' && (
        <Button title={t.acceptOrder} onPress={onAccept} fullWidth size="lg" disabled={loading}
          icon={<Ionicons name="checkmark-outline" size={18} color="#FFFFFF" />} />
      )}
      {isTriper && !isTiper && status === 'in_escrow' && (
        <Button title={t.markAsShipped} onPress={onMarkShipped} fullWidth size="lg" disabled={loading}
          icon={<Ionicons name="airplane-outline" size={18} color="#FFFFFF" />} />
      )}

      {/* Waiting state */}
      {!isTiper && !isTriper && (
        <Text style={styles.waitingText}>{t.viewOnly}</Text>
      )}
    </View>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function SummaryRow({ label, value, bold = false, styles }: { label: string; value: string; bold?: boolean; styles: any }) {
  return (
    <View style={styles.summaryRow}>
      <Text style={[styles.summaryLabel, bold && styles.summaryBold]}>{label}</Text>
      <Text style={[styles.summaryValue, bold && styles.summaryBold]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeLoader: { flex: 1 },
});
