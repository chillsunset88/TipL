/**
 * TipL — Input Component
 * Styled text input with static label above, icon, and error state.
 * Uses a simple top-label pattern to avoid text overlap issues.
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
import { Colors, Typography, BorderRadius, Spacing } from '@/lib/constants';

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
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={[styles.wrapper, containerStyle]}>
      {/* Static label above */}
      <Text
        style={[
          styles.label,
          isFocused && styles.labelFocused,
          error && styles.labelError,
        ]}
      >
        {label}
      </Text>

      {/* Input container */}
      <View
        style={[
          styles.container,
          isFocused && styles.focused,
          error && styles.errorContainer,
        ]}
      >
        {icon && (
          <Ionicons
            name={icon}
            size={20}
            color={isFocused ? Colors.primary : Colors.gray}
            style={styles.icon}
          />
        )}
        <TextInput
          {...props}
          value={value}
          style={[styles.input, icon && { paddingLeft: 0 }]}
          placeholderTextColor={Colors.gray}
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
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: Spacing.base,
  },
  label: {
    fontFamily: Typography.medium.fontFamily,
    fontSize: Typography.sizes.sm,
    color: Colors.darkGray,
    marginBottom: 6,
    marginLeft: 2,
  },
  labelFocused: {
    color: Colors.primary,
  },
  labelError: {
    color: Colors.error,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cream,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderColor: Colors.midGray,
    paddingHorizontal: Spacing.base,
    minHeight: 50,
  },
  focused: {
    borderColor: Colors.primary,
    backgroundColor: Colors.white,
  },
  errorContainer: {
    borderColor: Colors.error,
    backgroundColor: Colors.errorLight,
  },
  icon: {
    marginRight: Spacing.sm,
  },
  input: {
    flex: 1,
    fontFamily: Typography.regular.fontFamily,
    fontSize: Typography.sizes.base,
    color: Colors.nearBlack,
    paddingVertical: 12,
  },
  errorText: {
    fontFamily: Typography.regular.fontFamily,
    fontSize: Typography.sizes.xs,
    color: Colors.error,
    marginTop: 4,
    marginLeft: 2,
  },
});
