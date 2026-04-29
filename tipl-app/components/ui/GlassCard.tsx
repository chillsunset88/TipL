/**
 * TipL — GlassCard Component
 * Glassmorphism card with backdrop blur and subtle border.
 */

import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { Colors, BorderRadius, Shadows } from '@/lib/constants';

interface GlassCardProps {
  children: React.ReactNode;
  intensity?: number;
  tint?: 'light' | 'dark' | 'default';
  style?: ViewStyle;
  noPadding?: boolean;
}

export function GlassCard({
  children,
  intensity = 60,
  tint = 'light',
  style,
  noPadding = false,
}: GlassCardProps) {
  return (
    <View style={[styles.container, Shadows.md, style]}>
      <BlurView intensity={intensity} tint={tint} style={styles.blur}>
        <View style={[styles.content, noPadding && { padding: 0 }]}>
          {children}
        </View>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  blur: {
    overflow: 'hidden',
  },
  content: {
    padding: 16,
    backgroundColor: Colors.glassBg,
  },
});
