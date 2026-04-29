/**
 * TipL — Timeline Component
 * Vertical timeline for order status progression.
 * Matches the Stitch Order Tracking design.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing } from '@/lib/constants';
import { TimelineEvent } from '@/lib/types';

interface TimelineProps {
  events: TimelineEvent[];
  currentStatus: string;
}

export function Timeline({ events, currentStatus }: TimelineProps) {
  const currentIndex = events.findIndex((e) => e.status === currentStatus);

  return (
    <View style={styles.container}>
      {events.map((event, index) => {
        const isCompleted = index <= currentIndex;
        const isCurrent = index === currentIndex;
        const isLast = index === events.length - 1;

        return (
          <View key={event.status} style={styles.row}>
            {/* Dot + Line */}
            <View style={styles.dotColumn}>
              <View
                style={[
                  styles.dot,
                  isCompleted && styles.dotCompleted,
                  isCurrent && styles.dotCurrent,
                ]}
              >
                {isCompleted && (
                  <Ionicons name="checkmark" size={12} color={Colors.white} />
                )}
              </View>
              {!isLast && (
                <View
                  style={[
                    styles.line,
                    isCompleted && index < currentIndex && styles.lineCompleted,
                  ]}
                />
              )}
            </View>

            {/* Content */}
            <View style={styles.content}>
              <Text
                style={[
                  styles.label,
                  isCompleted && styles.labelCompleted,
                  isCurrent && styles.labelCurrent,
                ]}
              >
                {event.label}
              </Text>
              {event.description && (
                <Text style={styles.description}>{event.description}</Text>
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
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
    backgroundColor: Colors.midGray,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.midGray,
  },
  dotCompleted: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  dotCurrent: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primaryGradientStart,
    borderWidth: 3,
  },
  line: {
    width: 2,
    flex: 1,
    backgroundColor: Colors.midGray,
    minHeight: 20,
  },
  lineCompleted: {
    backgroundColor: Colors.primary,
  },
  content: {
    flex: 1,
    paddingLeft: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  label: {
    fontFamily: Typography.medium.fontFamily,
    fontSize: Typography.sizes.base,
    color: Colors.gray,
  },
  labelCompleted: {
    color: Colors.nearBlack,
  },
  labelCurrent: {
    fontFamily: Typography.semiBold.fontFamily,
    color: Colors.primary,
  },
  description: {
    fontFamily: Typography.regular.fontFamily,
    fontSize: Typography.sizes.sm,
    color: Colors.darkGray,
    marginTop: 2,
  },
});
