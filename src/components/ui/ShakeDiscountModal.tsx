/**
 * TipL — Shake Discount Modal
 * Animated reward modal shown after a shake gesture unlocks a discount code.
 */

import React, { useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/src/lib/constants';

interface Props {
  visible: boolean;
  discountPercent: number | null;
  discountCode: string | null;
  onClose: () => void;
}

export function ShakeDiscountModal({ visible, discountPercent, discountCode, onClose }: Props) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 60,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.timing(rotateAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
          Animated.timing(rotateAnim, { toValue: -1, duration: 150, useNativeDriver: true }),
          Animated.timing(rotateAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
        ]),
      ]).start();
    } else {
      scaleAnim.setValue(0);
      rotateAnim.setValue(0);
    }
  }, [visible, scaleAnim, rotateAnim]);

  const rotate = rotateAnim.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['-15deg', '0deg', '15deg'],
  });

  const handleCopyCode = async () => {
    if (!discountCode) return;
    await Clipboard.setStringAsync(discountCode);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable onPress={() => {}}>
          <Animated.View style={[styles.card, { transform: [{ scale: scaleAnim }, { rotate }] }]}>
            {/* Icon */}
            <View style={styles.iconWrap}>
              <Ionicons name="gift" size={48} color={Colors.primary} />
            </View>

            {/* Headline */}
            <Text style={styles.headline}>Shake Reward!</Text>
            <Text style={styles.subtitle}>
              You unlocked a special discount for your next order.
            </Text>

            {/* Discount badge */}
            <View style={styles.discountBadge}>
              <Text style={styles.discountValue}>{discountPercent}% OFF</Text>
            </View>

            {/* Code row */}
            <TouchableOpacity style={styles.codeRow} onPress={handleCopyCode} activeOpacity={0.7}>
              <Text style={styles.codeText}>{discountCode}</Text>
              <Ionicons name="copy-outline" size={18} color={Colors.primary} />
            </TouchableOpacity>
            <Text style={styles.codeHint}>Tap code to copy</Text>

            {/* Close */}
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeText}>Got it!</Text>
            </TouchableOpacity>
          </Animated.View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    backgroundColor: Colors.darkCard,
    borderRadius: BorderRadius.xl,
    padding: Spacing['2xl'],
    width: 300,
    alignItems: 'center',
    ...Shadows.lg,
    borderWidth: 1,
    borderColor: Colors.primary + '40',
  },
  iconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  headline: {
    fontFamily: Typography.bold.fontFamily,
    fontSize: Typography.sizes.xl,
    color: Colors.darkTextPrimary,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontFamily: Typography.regular.fontFamily,
    fontSize: Typography.sizes.sm,
    color: Colors.darkTextSecondary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
    lineHeight: 20,
  },
  discountBadge: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    marginBottom: Spacing.lg,
  },
  discountValue: {
    fontFamily: Typography.bold.fontFamily,
    fontSize: 28,
    color: Colors.white,
    letterSpacing: 1,
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.darkBg,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.primary + '60',
    borderStyle: 'dashed',
    marginBottom: Spacing.xs,
  },
  codeText: {
    fontFamily: Typography.semiBold.fontFamily,
    fontSize: Typography.sizes.base,
    color: Colors.primary,
    letterSpacing: 1.5,
  },
  codeHint: {
    fontFamily: Typography.regular.fontFamily,
    fontSize: Typography.sizes.xs,
    color: Colors.darkTextSecondary,
    marginBottom: Spacing.xl,
  },
  closeButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing['2xl'],
    paddingVertical: Spacing.md,
    ...Shadows.sm,
  },
  closeText: {
    fontFamily: Typography.semiBold.fontFamily,
    fontSize: Typography.sizes.base,
    color: Colors.white,
  },
});
