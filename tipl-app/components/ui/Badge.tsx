/**
 * TipL — Badge Component
 * Color-coded status badges for order status, verification, etc.
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, BorderRadius } from '@/lib/constants';
import { OrderStatus } from '@/lib/constants';

type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'gold';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  icon?: keyof typeof Ionicons.glyphMap;
  style?: ViewStyle;
  small?: boolean;
}

const VARIANT_COLORS: Record<BadgeVariant, { bg: string; text: string; border: string }> = {
  success: { bg: Colors.successLight, text: Colors.success, border: Colors.success },
  warning: { bg: Colors.warningLight, text: Colors.warning, border: Colors.warning },
  error: { bg: Colors.errorLight, text: Colors.error, border: Colors.error },
  info: { bg: Colors.infoLight, text: Colors.info, border: Colors.info },
  neutral: { bg: Colors.lightGray, text: Colors.darkGray, border: Colors.midGray },
  gold: { bg: '#FFF8E7', text: Colors.primary, border: Colors.primary },
};

export function Badge({ label, variant = 'neutral', icon, style, small = false }: BadgeProps) {
  const colors = VARIANT_COLORS[variant];

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.bg,
          borderColor: colors.border,
        },
        small && styles.small,
        style,
      ]}
    >
      {icon && (
        <Ionicons
          name={icon}
          size={small ? 10 : 13}
          color={colors.text}
          style={{ marginRight: 4 }}
        />
      )}
      <Text
        style={[
          styles.text,
          { color: colors.text },
          small && styles.smallText,
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

/** Map OrderStatus enum to Badge variant */
export function getOrderStatusBadge(status: OrderStatus): { label: string; variant: BadgeVariant } {
  switch (status) {
    case OrderStatus.PENDING:
      return { label: 'Pending', variant: 'neutral' };
    case OrderStatus.OFFER_ACCEPTED:
      return { label: 'Accepted', variant: 'info' };
    case OrderStatus.PAYMENT_CONFIRMED:
      return { label: 'Payment Confirmed', variant: 'gold' };
    case OrderStatus.ITEM_PURCHASED:
      return { label: 'Purchased', variant: 'success' };
    case OrderStatus.IN_TRANSIT:
      return { label: 'In Transit', variant: 'warning' };
    case OrderStatus.DELIVERED:
      return { label: 'Delivered', variant: 'success' };
    case OrderStatus.COMPLETED:
      return { label: 'Completed', variant: 'success' };
    case OrderStatus.CANCELLED:
      return { label: 'Cancelled', variant: 'error' };
    case OrderStatus.DISPUTED:
      return { label: 'Disputed', variant: 'error' };
    default:
      return { label: status, variant: 'neutral' };
  }
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  text: {
    fontFamily: Typography.medium.fontFamily,
    fontSize: Typography.sizes.xs,
    letterSpacing: 0.2,
  },
  small: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  smallText: {
    fontSize: 9,
  },
});
