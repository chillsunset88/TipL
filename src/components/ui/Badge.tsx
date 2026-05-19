/**
 * TipL — Badge Component
 * Color-coded status badges for order status, verification, etc.
 * Theme-aware: supports Dark Mode & Light Mode.
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Typography, BorderRadius } from '@/src/lib/constants';
import { OrderStatus } from '@/src/lib/constants';
import { useThemeColors } from '@/src/lib/hooks/useThemeColors';

type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'gold';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  icon?: keyof typeof Ionicons.glyphMap;
  style?: ViewStyle;
  small?: boolean;
}

export function Badge({ label, variant = 'neutral', icon, style, small = false }: BadgeProps) {
  const C = useThemeColors();

  const colors = React.useMemo(() => {
    const MAP: Record<BadgeVariant, { bg: string; text: string; border: string }> = {
      success: { bg: C.success + '22', text: C.success, border: C.success },
      warning: { bg: C.warning + '22', text: C.warning, border: C.warning },
      error: { bg: C.error + '22', text: C.error, border: C.error },
      info: { bg: C.info + '22', text: C.info, border: C.info },
      neutral: { bg: C.lightGray, text: C.darkGray, border: C.midGray },
      gold: { bg: C.primary + '18', text: C.primary, border: C.primary },
    };
    return MAP[variant];
  }, [C, variant]);

  const s = React.useMemo(() => StyleSheet.create({
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
  }), []);

  return (
    <View
      style={[
        s.container,
        {
          backgroundColor: colors.bg,
          borderColor: colors.border,
        },
        small && s.small,
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
          s.text,
          { color: colors.text },
          small && s.smallText,
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
