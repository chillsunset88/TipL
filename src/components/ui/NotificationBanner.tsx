import React, { useEffect, useRef, useCallback } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useNotificationStore } from '@/src/store/notificationStore';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/src/lib/constants';

const AUTO_HIDE_MS = 4000;

export function NotificationBanner() {
  const insets = useSafeAreaInsets();
  const { banner, hideBanner } = useNotificationStore();
  const translateY = useRef(new Animated.Value(-200)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const slideOut = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    Animated.timing(translateY, {
      toValue: -200,
      duration: 250,
      useNativeDriver: true,
    }).start(() => hideBanner());
  }, [hideBanner, translateY]);

  useEffect(() => {
    if (!banner) return;
    if (timerRef.current) clearTimeout(timerRef.current);

    Animated.spring(translateY, {
      toValue: 0,
      damping: 18,
      stiffness: 160,
      useNativeDriver: true,
    }).start();

    timerRef.current = setTimeout(slideOut, AUTO_HIDE_MS);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [banner]);

  if (!banner) return null;

  const handlePress = () => {
    slideOut();
    if (banner.orderId) router.push(`/order/${banner.orderId}` as any);
  };

  return (
    <Animated.View
      style={[styles.wrapper, { transform: [{ translateY }], paddingTop: insets.top + 8 }]}
      pointerEvents="box-none"
    >
      <TouchableOpacity style={styles.card} activeOpacity={0.92} onPress={handlePress}>
        <View style={styles.iconWrap}>
          <Ionicons name="notifications" size={20} color={Colors.primary} />
        </View>
        <View style={styles.textWrap}>
          <Text style={styles.title} numberOfLines={1}>{banner.title}</Text>
          <Text style={styles.body} numberOfLines={2}>{banner.body}</Text>
        </View>
        <TouchableOpacity onPress={slideOut} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="close" size={18} color={Colors.gray} />
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    paddingHorizontal: Spacing.xl,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.lightGray,
    ...Shadows.md,
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.primaryPale,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  textWrap: {
    flex: 1,
  },
  title: {
    fontFamily: Typography.medium.fontFamily,
    fontSize: Typography.sizes.sm,
    color: Colors.nearBlack,
  },
  body: {
    fontFamily: Typography.regular.fontFamily,
    fontSize: Typography.sizes.xs,
    color: Colors.darkGray,
    marginTop: 2,
  },
});
