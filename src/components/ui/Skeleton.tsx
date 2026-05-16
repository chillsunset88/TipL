import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, ViewStyle, Dimensions } from 'react-native';
import { Colors, BorderRadius, Spacing } from '@/src/lib/constants';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export function Skeleton({ width = '100%', height = 16, borderRadius = BorderRadius.sm, style }: SkeletonProps) {
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.4, duration: 800, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        { width: width as any, height, borderRadius, backgroundColor: Colors.midGray, opacity },
        style,
      ]}
    />
  );
}

export function SkeletonTripCard() {
  return (
    <View style={sk.card}>
      <View style={sk.headerRow}>
        <Skeleton width={44} height={44} borderRadius={22} />
        <View style={{ flex: 1, gap: 6, marginLeft: 12 }}>
          <Skeleton height={14} width="60%" />
          <Skeleton height={11} width="40%" />
        </View>
        <Skeleton width={60} height={24} borderRadius={12} />
      </View>
      <Skeleton height={12} width="80%" style={{ marginTop: 12 }} />
      <Skeleton height={12} width="60%" style={{ marginTop: 6 }} />
      <View style={[sk.headerRow, { marginTop: 16 }]}>
        <Skeleton height={36} width="45%" borderRadius={12} />
        <Skeleton height={36} width="45%" borderRadius={12} />
      </View>
    </View>
  );
}

export function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonTripCard key={i} />
      ))}
    </>
  );
}

export function SkeletonOrderCard() {
  return (
    <View style={sk.card}>
      <View style={sk.headerRow}>
        <Skeleton width={48} height={48} borderRadius={BorderRadius.md} />
        <View style={{ flex: 1, gap: 6, marginLeft: 12 }}>
          <Skeleton height={14} width="70%" />
          <Skeleton height={11} width="50%" />
          <Skeleton height={11} width="30%" />
        </View>
      </View>
      <View style={[sk.headerRow, { marginTop: 12 }]}>
        <Skeleton height={24} width="30%" borderRadius={12} />
        <Skeleton height={14} width="25%" />
      </View>
    </View>
  );
}

export function SkeletonProfile() {
  return (
    <View style={{ padding: 16, gap: 16, alignItems: 'center' }}>
      <Skeleton width={88} height={88} borderRadius={44} />
      <Skeleton height={18} width="50%" />
      <Skeleton height={13} width="70%" />
      <View style={{ flexDirection: 'row', gap: 24, marginTop: 8 }}>
        {[0, 1, 2].map((i) => (
          <View key={i} style={{ alignItems: 'center', gap: 4 }}>
            <Skeleton height={22} width={40} />
            <Skeleton height={11} width={50} />
          </View>
        ))}
      </View>
    </View>
  );
}

export function SkeletonProductCard() {
  return (
    <View style={sk.productCard}>
      <Skeleton width="100%" height={130} borderRadius={BorderRadius.md} style={{ marginBottom: 8 }} />
      <Skeleton height={14} width="85%" style={{ marginBottom: 6 }} />
      <Skeleton height={14} width="70%" style={{ marginBottom: 8 }} />
      <Skeleton height={18} width="60%" style={{ marginBottom: 8 }} />
      <View style={sk.headerRow}>
        <Skeleton width={12} height={12} borderRadius={6} />
        <Skeleton height={10} width="60%" />
      </View>
    </View>
  );
}

export function SkeletonProductGrid({ count = 4 }: { count?: number }) {
  return (
    <View style={sk.prodGrid}>
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} style={sk.prodGridItem}>
          <SkeletonProductCard />
        </View>
      ))}
    </View>
  );
}

const sk = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.lightGray,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  productCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.lightGray,
    padding: 8,
  },
  prodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  prodGridItem: {
    width: (Dimensions.get('window').width - Spacing.xl * 2 - Spacing.md) / 2,
  },
});
