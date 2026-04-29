/**
 * TipL — Avatar Component
 * Circular avatar with verified badge, online indicator, and fallback initials.
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, BorderRadius } from '@/lib/constants';

type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';

interface AvatarProps {
  uri: string | null;
  name: string;
  size?: AvatarSize;
  verified?: boolean;
  online?: boolean;
  style?: ViewStyle;
}

const SIZE_MAP: Record<AvatarSize, number> = {
  sm: 32,
  md: 44,
  lg: 56,
  xl: 80,
};

export function Avatar({
  uri,
  name,
  size = 'md',
  verified = false,
  online,
  style,
}: AvatarProps) {
  const dim = SIZE_MAP[size];
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const badgeSize = size === 'sm' ? 14 : size === 'md' ? 18 : 22;

  return (
    <View style={[{ width: dim, height: dim }, style]}>
      {uri ? (
        <Image
          source={{ uri }}
          style={[
            styles.image,
            { width: dim, height: dim, borderRadius: dim / 2 },
          ]}
          contentFit="cover"
          placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
          transition={200}
        />
      ) : (
        <View
          style={[
            styles.fallback,
            { width: dim, height: dim, borderRadius: dim / 2 },
          ]}
        >
          <Text
            style={[
              styles.initials,
              { fontSize: dim * 0.35 },
            ]}
          >
            {initials}
          </Text>
        </View>
      )}

      {verified && (
        <View
          style={[
            styles.badge,
            {
              width: badgeSize,
              height: badgeSize,
              borderRadius: badgeSize / 2,
              bottom: 0,
              right: -2,
            },
          ]}
        >
          <Ionicons name="checkmark" size={badgeSize * 0.65} color={Colors.white} />
        </View>
      )}

      {online !== undefined && (
        <View
          style={[
            styles.onlineIndicator,
            {
              width: badgeSize * 0.6,
              height: badgeSize * 0.6,
              borderRadius: badgeSize * 0.3,
              backgroundColor: online ? Colors.success : Colors.gray,
              top: 0,
              right: 0,
            },
          ]}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    borderWidth: 2,
    borderColor: Colors.white,
  },
  fallback: {
    backgroundColor: Colors.cream,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.midGray,
  },
  initials: {
    fontFamily: Typography.semiBold.fontFamily,
    color: Colors.darkGray,
  },
  badge: {
    position: 'absolute',
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.white,
  },
  onlineIndicator: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: Colors.white,
  },
});
