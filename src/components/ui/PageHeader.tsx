import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Typography, Spacing } from '@/src/lib/constants';
import { useThemeColors } from '@/src/lib/hooks/useThemeColors';

interface Props {
  title?: string;
  onBack?: () => void;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  rightIconColor?: string;
  onRightPress?: () => void;
  rightLabel?: string;
}

export function PageHeader({ title, onBack, rightIcon, rightIconColor, onRightPress, rightLabel }: Props) {
  const insets = useSafeAreaInsets();
  const C = useThemeColors();

  return (
    <View style={[
      styles.container,
      {
        paddingTop: insets.top,
        backgroundColor: C.white,
        borderBottomColor: C.lightGray,
      },
    ]}>
      <TouchableOpacity
        style={styles.btn}
        onPress={onBack}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        disabled={!onBack}
      >
        {onBack ? <Ionicons name="arrow-back" size={22} color={C.nearBlack} /> : null}
      </TouchableOpacity>

      <Text style={[styles.title, { color: C.nearBlack }]} numberOfLines={1}>{title ?? ''}</Text>

      {rightIcon && onRightPress ? (
        <TouchableOpacity
          style={styles.btn}
          onPress={onRightPress}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name={rightIcon} size={22} color={rightIconColor ?? C.nearBlack} />
        </TouchableOpacity>
      ) : rightLabel && onRightPress ? (
        <TouchableOpacity
          style={styles.rightLabelBtn}
          onPress={onRightPress}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.rightLabelTxt}>{rightLabel}</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.btn} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
  },
  btn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    fontFamily: Typography.medium.fontFamily,
    fontSize: Typography.sizes.base,
    textAlign: 'center',
  },
  rightLabelBtn: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    minWidth: 40,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  rightLabelTxt: {
    fontFamily: Typography.medium.fontFamily,
    fontSize: Typography.sizes.sm,
    color: '#C5A267',
  },
});
