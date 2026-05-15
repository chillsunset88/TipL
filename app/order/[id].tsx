/**
 * TipL — Order Detail / Escrow State Machine
 * Role-aware action buttons, Supabase real-time data, Supabase escrow.
 */

import React, { useState } from 'react';
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

import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/src/lib/constants';
import { Button } from '@/src/components/ui/Button';
import { useOrder, updateOrderStatus } from '@/src/lib/hooks/useOrders';
import { useAuthStore } from '@/src/store/authStore';
import { createMidtransTransaction } from '@/src/lib/midtrans';
import { createEscrowPayment, releaseEscrow, disputeEscrow } from '@/src/services/supabase/escrow';
import { addDeliveryReminderEvent } from '@/src/services/calendar';
import * as Clipboard from 'expo-clipboard';
import * as Sharing from 'expo-sharing';
import type { OrderWithProfiles } from '@/src/services/supabase/orders';

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<string, { label: string; gradient: [string, string]; sub: string }> = {
  pending: {
    label: 'Waiting for Traveler',
    gradient: ['#E8E8E8', '#D0D0D0'],
    sub: 'Your request is pending traveler acceptance.',
  },
  accepted: {
    label: 'Offer Accepted',
    gradient: ['#E8F4FD', '#C8E6F9'],
    sub: 'Traveler accepted. Please proceed to payment.',
  },
  in_escrow: {
    label: 'Funds in Escrow',
    gradient: ['#F5E6C8', '#EDD9A3'],
    sub: 'Your funds are securely held in escrow.',
  },
  purchased: {
    label: 'Item Purchased',
    gradient: ['#F0F8E8', '#D4EDBA'],
    sub: 'Traveler has purchased your item.',
  },
  shipped: {
    label: 'In Transit',
    gradient: ['#E8F0FE', '#C5D8F8'],
    sub: 'Your item is on the way.',
  },
  delivered: {
    label: 'Delivered',
    gradient: ['#E8F9EE', '#B8ECC8'],
    sub: 'Item delivered. Confirm to release payment.',
  },
  completed: {
    label: 'Completed',
    gradient: ['#E8F9EE', '#B8ECC8'],
    sub: 'Transaction complete. Funds released.',
  },
  cancelled: {
    label: 'Cancelled',
    gradient: ['#FFEBE9', '#FFD0CC'],
    sub: 'This order has been cancelled.',
  },
  disputed: {
    label: 'Disputed',
    gradient: ['#FFF4E5', '#FFE0A8'],
    sub: 'A dispute has been filed. Support will contact you.',
  },
};

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const user = useAuthStore((s) => s.user);
  const { order, loading } = useOrder(id);

  const [actionLoading, setActionLoading] = useState(false);

  if (loading) {
    return (
      <SafeAreaView style={[styles.safe, { alignItems: 'center', justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </SafeAreaView>
    );
  }

  if (!order) {
    return (
      <SafeAreaView style={[styles.safe, { alignItems: 'center', justifyContent: 'center' }]}>
        <Text style={{ color: Colors.darkGray }}>Order not found.</Text>
      </SafeAreaView>
    );
  }

  const status = order.status ?? 'pending';
  const isTiper = order.tiper_id === (user?.id ?? '');
  const isTriper = order.triper_id === (user?.id ?? '');

  const statusCfg = STATUS_CONFIG[status] ?? STATUS_CONFIG['pending'];

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

  /** Tiper: Pay Now → Midtrans WebView */
  const handlePayNow = () => withLoading(async () => {
    if (!user) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const { token } = await createMidtransTransaction({
      orderId: order.id,
      amount: totalAmount,
      buyerName: user.displayName,
      buyerEmail: user.email,
      itemName: order.item_name,
    });
    router.push({
      pathname: '/payment/midtrans',
      params: {
        token,
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
      'Confirm Delivery',
      'This will release the escrow funds to the traveler. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm & Release',
          style: 'default',
          onPress: () => withLoading(async () => {
            await releaseEscrow(order.id);
            await updateOrderStatus(order.id, 'completed');
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Alert.alert('Payment Released', 'Funds have been released to the traveler.');
          }),
        },
      ],
    );
  };

  /** Tiper: Dispute */
  const handleDispute = () => {
    Alert.alert(
      'File a Dispute',
      'Describe the issue with your order.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'File Dispute',
          style: 'destructive',
          onPress: () => withLoading(async () => {
            await disputeEscrow(order.id, 'Buyer filed dispute from app');
            await updateOrderStatus(order.id, 'disputed');
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            Alert.alert('Dispute Filed', 'Our support team will contact you within 24 hours.');
          }),
        },
      ],
    );
  };

  const escrowStatuses = ['in_escrow', 'purchased', 'shipped'];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.nearBlack} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Order Tracking</Text>
          <TouchableOpacity
            onPress={async () => {
              await Clipboard.setStringAsync(order.id);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              Alert.alert('Copied!', `Order ID copied to clipboard.`);
            }}
          >
            <Text style={styles.orderNumber}>#{order.id.slice(0, 8)} ⎘</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={styles.moreButton}
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
              Alert.alert('Copied!', 'Order summary copied to clipboard.');
            }
          }}
        >
          <Ionicons name="share-outline" size={20} color={Colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.moreButton}
          onPress={() => router.push({ pathname: '/chat/[id]' as any, params: { id: order.id, orderId: order.id } })}
        >
          <Ionicons name="chatbubble-outline" size={20} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Status Card */}
        <LinearGradient
          colors={statusCfg.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.statusCard}
        >
          <Text style={styles.statusLabel}>CURRENT STATUS</Text>
          <Text style={styles.statusTitle}>{statusCfg.label}</Text>
          <Text style={styles.statusSubtext}>{statusCfg.sub}</Text>

          {escrowStatuses.includes(status) && (
            <View style={styles.escrowBadge}>
              <Ionicons name="shield-checkmark" size={14} color={Colors.primary} />
              <Text style={styles.escrowBadgeText}>Funds in Escrow</Text>
            </View>
          )}
        </LinearGradient>

        {/* Item card */}
        <View style={styles.itemCard}>
          <View style={[styles.itemImage, styles.itemImagePlaceholder]}>
            <Ionicons name="cube-outline" size={28} color={Colors.gray} />
          </View>
          <View style={styles.itemInfo}>
            <Text style={styles.itemName} numberOfLines={2}>{order.item_name}</Text>
            {order.notes ? (
              <Text style={styles.itemDesc} numberOfLines={2}>{order.notes}</Text>
            ) : null}
            <Text style={styles.itemQty}>Qty: {order.quantity ?? 1}</Text>
          </View>
          <Text style={styles.itemPrice}>{fmt(totalAmount)}</Text>
        </View>

        {/* Payment Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Summary</Text>
          <View style={styles.summaryCard}>
            <SummaryRow label="Item Price" value={fmt(agreedPrice)} />
            <SummaryRow label="Service Fee" value={fmt(serviceFee)} />
            <View style={styles.summaryDivider} />
            <SummaryRow label="Total" value={fmt(totalAmount)} bold />
          </View>
        </View>

        {/* Participants */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Participants</Text>
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Buyer</Text>
              <Text style={styles.summaryValue}>{order.tiper?.full_name ?? order.tiper_id.slice(0, 8)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Traveler</Text>
              <Text style={styles.summaryValue}>{order.triper?.full_name ?? order.triper_id.slice(0, 8)}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Action buttons (fixed bottom) */}
      <ActionBar
        order={order}
        status={status}
        isTiper={isTiper}
        isTriper={isTriper}
        loading={actionLoading}
        onPayNow={handlePayNow}
        onAccept={handleAccept}
        onMarkShipped={handleMarkShipped}
        onConfirmReceipt={handleConfirmReceipt}
        onDispute={handleDispute}
      />
    </SafeAreaView>
  );
}

// ─── Action bar ───────────────────────────────────────────────────────────────
interface ActionBarProps {
  order: OrderWithProfiles;
  status: string;
  isTiper: boolean;
  isTriper: boolean;
  loading: boolean;
  onPayNow: () => void;
  onAccept: () => void;
  onMarkShipped: () => void;
  onConfirmReceipt: () => void;
  onDispute: () => void;
}

function ActionBar({ status, isTiper, isTriper, loading, onPayNow, onAccept, onMarkShipped, onConfirmReceipt, onDispute }: ActionBarProps) {
  const terminal = ['completed', 'cancelled', 'disputed'].includes(status);

  if (terminal) {
    return (
      <View style={styles.actionBar}>
        <View style={styles.terminalBadge}>
          <Ionicons
            name={status === 'completed' ? 'checkmark-circle' : status === 'cancelled' ? 'close-circle' : 'alert-circle'}
            size={18}
            color={status === 'completed' ? Colors.success : status === 'cancelled' ? Colors.error : Colors.warning}
          />
          <Text style={styles.terminalText}>
            {status === 'completed' ? 'Order Completed' : status === 'cancelled' ? 'Order Cancelled' : 'Dispute Filed — Support will contact you'}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.actionBar}>
      {loading && <ActivityIndicator color={Colors.primary} style={{ marginBottom: Spacing.sm }} />}

      {/* Tiper actions */}
      {isTiper && (status === 'pending' || status === 'accepted') && (
        <Button title="Pay Now" onPress={onPayNow} fullWidth size="lg" disabled={loading}
          icon={<Ionicons name="card-outline" size={18} color={Colors.white} />} />
      )}
      {isTiper && status === 'shipped' && (
        <View style={{ gap: Spacing.sm }}>
          <Button title="Confirm Receipt" onPress={onConfirmReceipt} fullWidth size="lg" disabled={loading}
            icon={<Ionicons name="checkmark-circle-outline" size={18} color={Colors.white} />} />
          <Button title="File a Dispute" onPress={onDispute} variant="secondary" fullWidth disabled={loading}
            icon={<Ionicons name="alert-circle-outline" size={18} color={Colors.error} />}
            style={{ borderColor: Colors.error }} />
        </View>
      )}

      {/* Triper actions */}
      {isTriper && status === 'pending' && (
        <Button title="Accept Order" onPress={onAccept} fullWidth size="lg" disabled={loading}
          icon={<Ionicons name="checkmark-outline" size={18} color={Colors.white} />} />
      )}
      {isTriper && status === 'in_escrow' && (
        <Button title="Mark as Shipped" onPress={onMarkShipped} fullWidth size="lg" disabled={loading}
          icon={<Ionicons name="airplane-outline" size={18} color={Colors.white} />} />
      )}

      {/* Waiting state */}
      {!isTiper && !isTriper && (
        <Text style={styles.waitingText}>View only — you are not a participant in this order.</Text>
      )}
    </View>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function SummaryRow({ label, value, bold = false }: { label: string; value: string; bold?: boolean }) {
  return (
    <View style={styles.summaryRow}>
      <Text style={[styles.summaryLabel, bold && styles.summaryBold]}>{label}</Text>
      <Text style={[styles.summaryValue, bold && styles.summaryBold]}>{value}</Text>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.white },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  backButton: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: Colors.offWhite,
    alignItems: 'center', justifyContent: 'center',
  },
  headerCenter: { alignItems: 'center' },
  headerTitle: {
    fontFamily: Typography.serifBold.fontFamily,
    fontSize: Typography.sizes.md,
    color: Colors.nearBlack,
  },
  orderNumber: {
    fontFamily: Typography.regular.fontFamily,
    fontSize: Typography.sizes.xs,
    color: Colors.darkGray,
    marginTop: 2,
  },
  moreButton: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center',
  },

  container: { flex: 1, paddingHorizontal: Spacing.xl },

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
    fontSize: 10, color: Colors.charcoal,
    letterSpacing: 1.5, marginBottom: Spacing.sm,
  },
  statusTitle: {
    fontFamily: Typography.serifBold.fontFamily,
    fontSize: Typography.sizes['2xl'],
    color: Colors.nearBlack, textAlign: 'center',
  },
  statusSubtext: {
    fontFamily: Typography.regular.fontFamily,
    fontSize: Typography.sizes.sm,
    color: Colors.charcoal, marginTop: Spacing.sm,
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
    color: Colors.primaryDark,
  },

  itemCard: {
    flexDirection: 'row',
    backgroundColor: Colors.offWhite,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.lightGray,
    alignItems: 'center',
  },
  itemImage: {
    width: 70, height: 70,
    borderRadius: BorderRadius.md,
  },
  itemImagePlaceholder: {
    backgroundColor: Colors.lightGray,
    alignItems: 'center', justifyContent: 'center',
  },
  itemInfo: { flex: 1, marginLeft: Spacing.md },
  itemName: {
    fontFamily: Typography.semiBold.fontFamily,
    fontSize: Typography.sizes.base, color: Colors.nearBlack,
  },
  itemDesc: {
    fontFamily: Typography.regular.fontFamily,
    fontSize: Typography.sizes.xs, color: Colors.darkGray, marginTop: 2,
  },
  itemQty: {
    fontFamily: Typography.medium.fontFamily,
    fontSize: Typography.sizes.xs, color: Colors.gray, marginTop: 4,
  },
  itemPrice: {
    fontFamily: Typography.bold.fontFamily,
    fontSize: Typography.sizes.sm, color: Colors.nearBlack,
  },

  section: { marginBottom: Spacing.xl },
  sectionTitle: {
    fontFamily: Typography.serifBold.fontFamily,
    fontSize: Typography.sizes.lg, color: Colors.nearBlack,
    marginBottom: Spacing.base,
  },

  summaryCard: {
    backgroundColor: Colors.offWhite,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    borderWidth: 1, borderColor: Colors.lightGray,
  },
  summaryRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
  },
  summaryLabel: {
    fontFamily: Typography.regular.fontFamily,
    fontSize: Typography.sizes.sm, color: Colors.darkGray,
  },
  summaryValue: {
    fontFamily: Typography.medium.fontFamily,
    fontSize: Typography.sizes.sm, color: Colors.nearBlack,
  },
  summaryBold: {
    fontFamily: Typography.bold.fontFamily,
    fontSize: Typography.sizes.base, color: Colors.nearBlack,
  },
  summaryDivider: {
    height: 1, backgroundColor: Colors.midGray,
    marginVertical: Spacing.sm,
  },

  actionBar: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.base,
    paddingBottom: Spacing.xl,
    borderTopWidth: 1,
    borderTopColor: Colors.lightGray,
    ...Shadows.lg,
  },
  terminalBadge: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: Spacing.sm,
    paddingVertical: Spacing.md,
  },
  terminalText: {
    fontFamily: Typography.medium.fontFamily,
    fontSize: Typography.sizes.sm, color: Colors.darkGray,
  },
  waitingText: {
    fontFamily: Typography.regular.fontFamily,
    fontSize: Typography.sizes.sm, color: Colors.gray,
    textAlign: 'center',
  },
});
