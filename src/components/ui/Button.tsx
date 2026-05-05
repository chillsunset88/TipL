/**
 * TipL — Button Component
 * Primary (gold gradient), Secondary (outlined), Ghost variants.
 * Includes haptic feedback and press animation.
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Colors, Typography, BorderRadius, Shadows } from '@/src/lib/constants';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  fullWidth?: boolean;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  style,
  fullWidth = false,
}: ButtonProps) {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  const sizeStyles = SIZE_MAP[size];
  const isDisabled = disabled || loading;

  if (variant === 'primary') {
    return (
      <TouchableOpacity
        onPress={handlePress}
        disabled={isDisabled}
        activeOpacity={0.85}
        style={[fullWidth && { width: '100%' }, style]}
      >
        <LinearGradient
          colors={
            isDisabled
              ? [Colors.midGray, Colors.gray]
              : [Colors.primaryGradientStart, Colors.primaryGradientEnd]
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.base,
            sizeStyles.container,
            Shadows.glow,
            isDisabled && styles.disabledPrimary,
          ]}
        >
          {loading ? (
            <ActivityIndicator color={Colors.white} size="small" />
          ) : (
            <>
              {icon && <>{icon}</>}
              <Text style={[styles.primaryText, sizeStyles.text, icon ? { marginLeft: 8 } : undefined]}>
                {title}
              </Text>
            </>
          )}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  const variantStyle = VARIANT_MAP[variant];

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={isDisabled}
      activeOpacity={0.7}
      style={[
        styles.base,
        sizeStyles.container,
        variantStyle.container,
        isDisabled && styles.disabled,
        fullWidth && { width: '100%' },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variantStyle.textColor} size="small" />
      ) : (
        <>
          {icon && <>{icon}</>}
          <Text
            style={[
              styles.text,
              sizeStyles.text,
              { color: variantStyle.textColor },
              icon ? { marginLeft: 8 } : undefined,
            ]}
          >
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const SIZE_MAP: Record<ButtonSize, { container: ViewStyle; text: TextStyle }> = {
  sm: {
    container: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: BorderRadius.md },
    text: { fontSize: Typography.sizes.sm },
  },
  md: {
    container: { paddingVertical: 14, paddingHorizontal: 24, borderRadius: BorderRadius.xl },
    text: { fontSize: Typography.sizes.base },
  },
  lg: {
    container: { paddingVertical: 18, paddingHorizontal: 32, borderRadius: BorderRadius['2xl'] },
    text: { fontSize: Typography.sizes.md },
  },
};

const VARIANT_MAP: Record<Exclude<ButtonVariant, 'primary'>, { container: ViewStyle; textColor: string }> = {
  secondary: {
    container: {
      backgroundColor: 'transparent',
      borderWidth: 1.5,
      borderColor: Colors.primary,
    },
    textColor: Colors.primary,
  },
  ghost: {
    container: { backgroundColor: 'transparent' },
    textColor: Colors.nearBlack,
  },
  danger: {
    container: { backgroundColor: Colors.errorLight, borderWidth: 1, borderColor: Colors.error },
    textColor: Colors.error,
  },
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryText: {
    color: Colors.white,
    fontFamily: Typography.semiBold.fontFamily,
    letterSpacing: 0.3,
  },
  text: {
    fontFamily: Typography.semiBold.fontFamily,
    letterSpacing: 0.3,
  },
  disabled: {
    opacity: 0.5,
  },
  disabledPrimary: {
    opacity: 0.6,
  },
});
