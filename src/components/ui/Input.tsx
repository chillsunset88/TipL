/**
 * TipL — Input Component
 * Styled text input with static label above, icon, and error state.
 * Theme-aware: supports Dark Mode & Light Mode.
 */

import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TextInputProps,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Typography, BorderRadius, Spacing } from '@/src/lib/constants';
import { useThemeColors } from '@/src/lib/hooks/useThemeColors';

interface InputProps extends TextInputProps {
  label: string;
  error?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  containerStyle?: ViewStyle;
}

export function Input({
  label,
  error,
  icon,
  containerStyle,
  value,
  onFocus,
  onBlur,
  ...props
}: InputProps) {
  const C = useThemeColors();
  const [isFocused, setIsFocused] = useState(false);

  const s = React.useMemo(() => StyleSheet.create({
    wrapper: {
      marginBottom: Spacing.base,
    },
    label: {
      fontFamily: Typography.medium.fontFamily,
      fontSize: Typography.sizes.sm,
      color: C.darkGray,
      marginBottom: 6,
      marginLeft: 2,
    },
    labelFocused: {
      color: C.primary,
    },
    labelError: {
      color: C.error,
    },
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: C.offWhite,
      borderRadius: BorderRadius.md,
      borderWidth: 1.5,
      borderColor: C.lightGray,
      paddingHorizontal: Spacing.base,
      minHeight: 50,
    },
    focused: {
      borderColor: C.primary,
      backgroundColor: C.white,
    },
    errorContainer: {
      borderColor: C.error,
      backgroundColor: C.error + '22',
    },
    icon: {
      marginRight: Spacing.sm,
    },
    input: {
      flex: 1,
      fontFamily: Typography.regular.fontFamily,
      fontSize: Typography.sizes.base,
      color: C.nearBlack,
      paddingVertical: 12,
    },
    errorText: {
      fontFamily: Typography.regular.fontFamily,
      fontSize: Typography.sizes.xs,
      color: C.error,
      marginTop: 4,
      marginLeft: 2,
    },
  }), [C]);

  return (
    <View style={[s.wrapper, containerStyle]}>
      {/* Static label above */}
      <Text
        style={[
          s.label,
          isFocused && s.labelFocused,
          error && s.labelError,
        ]}
      >
        {label}
      </Text>

      {/* Input container */}
      <View
        style={[
          s.container,
          isFocused && s.focused,
          error && s.errorContainer,
        ]}
      >
        {icon && (
          <Ionicons
            name={icon}
            size={20}
            color={isFocused ? C.primary : C.gray}
            style={s.icon}
          />
        )}
        <TextInput
          {...props}
          value={value}
          style={[s.input, icon && { paddingLeft: 0 }]}
          placeholderTextColor={C.gray}
          onFocus={(e) => {
            setIsFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            onBlur?.(e);
          }}
        />
      </View>
      {error && <Text style={s.errorText}>{error}</Text>}
    </View>
  );
}
