/**
 * TipL — Avatar Component
 * Circular avatar with verified badge, online indicator, and fallback initials.
 * Theme-aware: supports Dark Mode & Light Mode.
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Typography, BorderRadius } from '@/src/lib/constants';
import { useThemeColors } from '@/src/lib/hooks/useThemeColors';

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
  const C = useThemeColors();
  const dim = SIZE_MAP[size];
  const [imgError, setImgError] = useState(false);
  useEffect(() => { setImgError(false); }, [uri]);
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const badgeSize = size === 'sm' ? 14 : size === 'md' ? 18 : 22;

  const s = React.useMemo(() => StyleSheet.create({
    image: {
      borderWidth: 2,
      borderColor: C.white,
    },
    fallback: {
      backgroundColor: C.offWhite,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: C.lightGray,
    },
    initials: {
      fontFamily: Typography.semiBold.fontFamily,
      color: C.darkGray,
    },
    badge: {
      position: 'absolute',
      backgroundColor: C.primary,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: C.white,
    },
    onlineIndicator: {
      position: 'absolute',
      borderWidth: 2,
      borderColor: C.white,
    },
  }), [C]);

  return (
    <View style={[{ width: dim, height: dim }, style]}>
      {uri && !imgError ? (
        <Image
          source={{ uri }}
          style={[
            s.image,
            { width: dim, height: dim, borderRadius: dim / 2 },
          ]}
          contentFit="cover"
          transition={200}
          onError={() => setImgError(true)}
        />
      ) : (
        <View
          style={[
            s.fallback,
            { width: dim, height: dim, borderRadius: dim / 2 },
          ]}
        >
          <Text
            style={[
              s.initials,
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
            s.badge,
            {
              width: badgeSize,
              height: badgeSize,
              borderRadius: badgeSize / 2,
              bottom: 0,
              right: -2,
            },
          ]}
        >
          <Ionicons name="checkmark" size={badgeSize * 0.65} color="#FFFFFF" />
        </View>
      )}

      {online !== undefined && (
        <View
          style={[
            s.onlineIndicator,
            {
              width: badgeSize * 0.6,
              height: badgeSize * 0.6,
              borderRadius: badgeSize * 0.3,
              backgroundColor: online ? C.success : C.gray,
              top: 0,
              right: 0,
            },
          ]}
        />
      )}
    </View>
  );
}
