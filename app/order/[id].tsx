/**
 * TipL — Order Status / Tracking Screen
 * Escrow state machine UI with Midtrans integration hooks.
 * Matches Stitch "Order Tracking" design.
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Typography, Spacing, BorderRadius, Shadows, OrderStatus } from '@/src/lib/constants';
import { Timeline } from '@/src/components/ui/Timeline';
import { Badge, getOrderStatusBadge } from '@/src/components/ui/Badge';
import { Button } from '@/src/components/ui/Button';
import { GlassCard } from '@/src/components/ui/GlassCard';
import { MOCK_ORDER } from '@/src/lib/mockData';

export default function OrderStatusScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  // In production: const { order, loading } = useOrder(id);
  const order = MOCK_ORDER;

  const statusBadge = getOrderStatusBadge(order.status);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.nearBlack} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Order Tracking</Text>
          <Text style={styles.orderNumber}>Order {order.orderNumber}</Text>
        </View>
        <TouchableOpacity style={styles.moreButton}>
          <Ionicons name="ellipsis-horizontal" size={22} color={Colors.nearBlack} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Status Card */}
        <LinearGradient
          colors={['#F5E6C8', '#EDD9A3']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.statusCard}
        >
          <Text style={styles.statusLabel}>CURRENT STATUS</Text>
          <Text style={styles.statusTitle}>Payment{'\n'}Confirmed</Text>
          <Text style={styles.statusSubtext}>
            Your funds are securely held in escrow
          </Text>
        </LinearGradient>

        {/* Item Card */}
        <View style={styles.itemCard}>
          <Image
            source={{ uri: order.itemImageUrl || '' }}
            style={styles.itemImage}
            contentFit="cover"
            transition={200}
          />
          <View style={styles.itemInfo}>
            <Text style={styles.itemName}>{order.itemName}</Text>
            <Text style={styles.itemDesc}>{order.itemDescription}</Text>
            <Text style={styles.itemQty}>Qty: {order.quantity}</Text>
          </View>
          <Text style={styles.itemPrice}>
            ${order.paymentSummary.totalAmount.toFixed(2)}
          </Text>
        </View>

        {/* Timeline */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Timeline</Text>
          <Timeline events={order.timeline} currentStatus={order.status} />
        </View>

        {/* Payment Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Summary</Text>
          <View style={styles.summaryCard}>
            <SummaryRow label="Item Price" value={`$${order.paymentSummary.itemPrice.toFixed(2)}`} />
            <SummaryRow label="Traveler Service" value={`$${order.paymentSummary.travelerFee.toFixed(2)}`} />
            <SummaryRow label="Platform Fee" value={`$${order.paymentSummary.platformFee.toFixed(2)}`} />
            <View style={styles.summaryDivider} />
            <SummaryRow
              label="Total Paid"
              value={`$${order.paymentSummary.totalAmount.toFixed(2)}`}
              bold
            />
          </View>
        </View>

        {/* Proof of Purchase */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Proof of Purchase</Text>
          {order.proofOfPurchaseUrls.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {order.proofOfPurchaseUrls.map((url, idx) => (
                <Image
                  key={idx}
                  source={{ uri: url }}
                  style={styles.proofImage}
                  contentFit="cover"
                />
              ))}
            </ScrollView>
          ) : (
            <View style={styles.proofPlaceholder}>
              <Ionicons name="receipt-outline" size={32} color={Colors.gray} />
              <Text style={styles.proofPlaceholderText}>
                Waiting for traveler to upload
              </Text>
            </View>
          )}
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <Button
            title="Contact Traveler"
            onPress={() => router.push('/chat/cr1')}
            variant="secondary"
            fullWidth
            icon={<Ionicons name="chatbubble-outline" size={18} color={Colors.primary} />}
          />
          {order.status === OrderStatus.DELIVERED && (
            <Button
              title="Confirm & Release Payment"
              onPress={() => {/* TODO: Release escrow */}}
              fullWidth
              size="lg"
              style={{ marginTop: Spacing.md }}
            />
          )}
          <Button
            title="Add Review"
            onPress={() => {}}
            variant="ghost"
            fullWidth
            style={{ marginTop: Spacing.sm }}
          />
        </View>

        <View style={{ height: 60 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function SummaryRow({
  label,
  value,
  bold = false,
}: {
  label: string;
  value: string;
  bold?: boolean;
}) {
  return (
    <View style={styles.summaryRow}>
      <Text style={[styles.summaryLabel, bold && styles.summaryBold]}>{label}</Text>
      <Text style={[styles.summaryValue, bold && styles.summaryBold]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.white,
  },
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
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.offWhite,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    alignItems: 'center',
  },
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
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
  },

  // Status Card
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
    fontSize: 10,
    color: Colors.charcoal,
    letterSpacing: 1.5,
    marginBottom: Spacing.sm,
  },
  statusTitle: {
    fontFamily: Typography.serifBold.fontFamily,
    fontSize: Typography.sizes['2xl'],
    color: Colors.nearBlack,
    textAlign: 'center',
    lineHeight: 34,
  },
  statusSubtext: {
    fontFamily: Typography.regular.fontFamily,
    fontSize: Typography.sizes.sm,
    color: Colors.charcoal,
    marginTop: Spacing.sm,
  },

  // Item Card
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
    width: 70,
    height: 70,
    borderRadius: BorderRadius.md,
  },
  itemInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  itemName: {
    fontFamily: Typography.semiBold.fontFamily,
    fontSize: Typography.sizes.base,
    color: Colors.nearBlack,
  },
  itemDesc: {
    fontFamily: Typography.regular.fontFamily,
    fontSize: Typography.sizes.xs,
    color: Colors.darkGray,
    marginTop: 2,
  },
  itemQty: {
    fontFamily: Typography.medium.fontFamily,
    fontSize: Typography.sizes.xs,
    color: Colors.gray,
    marginTop: 4,
  },
  itemPrice: {
    fontFamily: Typography.bold.fontFamily,
    fontSize: Typography.sizes.md,
    color: Colors.nearBlack,
  },

  // Sections
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontFamily: Typography.serifBold.fontFamily,
    fontSize: Typography.sizes.lg,
    color: Colors.nearBlack,
    marginBottom: Spacing.base,
  },

  // Payment Summary
  summaryCard: {
    backgroundColor: Colors.offWhite,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.lightGray,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
  },
  summaryLabel: {
    fontFamily: Typography.regular.fontFamily,
    fontSize: Typography.sizes.sm,
    color: Colors.darkGray,
  },
  summaryValue: {
    fontFamily: Typography.medium.fontFamily,
    fontSize: Typography.sizes.sm,
    color: Colors.nearBlack,
  },
  summaryBold: {
    fontFamily: Typography.bold.fontFamily,
    fontSize: Typography.sizes.base,
    color: Colors.nearBlack,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: Colors.midGray,
    marginVertical: Spacing.sm,
  },

  // Proof
  proofImage: {
    width: 120,
    height: 120,
    borderRadius: BorderRadius.md,
    marginRight: Spacing.sm,
  },
  proofPlaceholder: {
    height: 120,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.offWhite,
    borderWidth: 2,
    borderColor: Colors.midGray,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  proofPlaceholderText: {
    fontFamily: Typography.regular.fontFamily,
    fontSize: Typography.sizes.sm,
    color: Colors.gray,
    marginTop: Spacing.sm,
  },

  // Actions
  actions: {
    marginBottom: Spacing['2xl'],
  },
});
