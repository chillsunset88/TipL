/**
 * TipL — Button Component
 * Primary (gold gradient), Secondary (outlined), Ghost variants.
 * Theme-aware: supports Dark Mode & Light Mode.
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
import { Typography, BorderRadius, Shadows } from '@/src/lib/constants';
import { useThemeColors } from '@/src/lib/hooks/useThemeColors';

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
  const C = useThemeColors();
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  const sizeStyles = SIZE_MAP[size];
  const isDisabled = disabled || loading;

  const s = React.useMemo(() => StyleSheet.create({
    base: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    primaryText: {
      color: '#FFFFFF',
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
  }), []);

  const variantStyle = React.useMemo(() => {
    const MAP: Record<Exclude<ButtonVariant, 'primary'>, { container: ViewStyle; textColor: string }> = {
      secondary: {
        container: {
          backgroundColor: 'transparent',
          borderWidth: 1.5,
          borderColor: C.primary,
        },
        textColor: C.primary,
      },
      ghost: {
        container: { backgroundColor: 'transparent' },
        textColor: C.nearBlack,
      },
      danger: {
        container: { backgroundColor: C.error + '22', borderWidth: 1, borderColor: C.error },
        textColor: C.error,
      },
    };
    return MAP[variant === 'primary' ? 'secondary' : variant];
  }, [C, variant]);

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
              ? [C.midGray, C.gray]
              : ['#C5A267', '#A37E43']
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            s.base,
            sizeStyles.container,
            Shadows.glow,
            isDisabled && s.disabledPrimary,
          ]}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <>
              {icon && <>{icon}</>}
              <Text style={[s.primaryText, sizeStyles.text, icon ? { marginLeft: 8 } : undefined]}>
                {title}
              </Text>
            </>
          )}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={isDisabled}
      activeOpacity={0.7}
      style={[
        s.base,
        sizeStyles.container,
        variantStyle.container,
        isDisabled && s.disabled,
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
              s.text,
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
