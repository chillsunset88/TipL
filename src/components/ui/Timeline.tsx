/**
 * TipL — Timeline Component
 * Vertical timeline for order status progression.
 * Theme-aware: supports Dark Mode & Light Mode.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Typography, Spacing } from '@/src/lib/constants';
import { TimelineEvent } from '@/src/lib/types';
import { useThemeColors } from '@/src/lib/hooks/useThemeColors';

interface TimelineProps {
  events: TimelineEvent[];
  currentStatus: string;
}

export default function Timeline({ events, currentStatus }: TimelineProps) {
  const C = useThemeColors();
  const currentIndex = events.findIndex((e) => e.status === currentStatus);

  const s = React.useMemo(() => StyleSheet.create({
    container: {
      paddingLeft: Spacing.sm,
    },
    row: {
      flexDirection: 'row',
      minHeight: 52,
    },
    dotColumn: {
      alignItems: 'center',
      width: 28,
    },
    dot: {
      width: 22,
      height: 22,
      borderRadius: 11,
      backgroundColor: C.midGray,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: C.midGray,
    },
    dotCompleted: {
      backgroundColor: C.primary,
      borderColor: C.primary,
    },
    dotCurrent: {
      backgroundColor: C.primary,
      borderColor: C.primary,
      borderWidth: 3,
    },
    line: {
      width: 2,
      flex: 1,
      backgroundColor: C.midGray,
      minHeight: 20,
    },
    lineCompleted: {
      backgroundColor: C.primary,
    },
    content: {
      flex: 1,
      paddingLeft: Spacing.md,
      paddingBottom: Spacing.lg,
    },
    label: {
      fontFamily: Typography.medium.fontFamily,
      fontSize: Typography.sizes.base,
      color: C.gray,
    },
    labelCompleted: {
      color: C.nearBlack,
    },
    labelCurrent: {
      fontFamily: Typography.semiBold.fontFamily,
      color: C.primary,
    },
    description: {
      fontFamily: Typography.regular.fontFamily,
      fontSize: Typography.sizes.sm,
      color: C.darkGray,
      marginTop: 2,
    },
  }), [C]);

  return (
    <View style={s.container}>
      {events.map((event, index) => {
        const isCompleted = index <= currentIndex;
        const isCurrent = index === currentIndex;
        const isLast = index === events.length - 1;

        return (
          <View key={event.status} style={s.row}>
            {/* Dot + Line */}
            <View style={s.dotColumn}>
              <View
                style={[
                  s.dot,
                  isCompleted && s.dotCompleted,
                  isCurrent && s.dotCurrent,
                ]}
              >
                {isCompleted && (
                  <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                )}
              </View>
              {!isLast && (
                <View
                  style={[
                    s.line,
                    isCompleted && index < currentIndex && s.lineCompleted,
                  ]}
                />
              )}
            </View>

            {/* Content */}
            <View style={s.content}>
              <Text
                style={[
                  s.label,
                  isCompleted && s.labelCompleted,
                  isCurrent && s.labelCurrent,
                ]}
              >
                {event.label}
              </Text>
              {event.description && (
                <Text style={s.description}>{event.description}</Text>
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
}
