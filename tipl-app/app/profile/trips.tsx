/**
 * TipL — My Trips Screen
 * List of user's created/upcoming trips.
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/lib/constants';
import { Badge } from '@/components/ui/Badge';
import { MOCK_TRIPS } from '@/lib/mockData';

export default function MyTripsScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.nearBlack} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Trips</Text>
        <View style={{ width: 44 }} />
      </View>

      <FlatList
        data={MOCK_TRIPS}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.tripCard}
            activeOpacity={0.7}
            onPress={() => router.push(`/trip/${item.id}`)}
          >
            <Image
              source={{ uri: item.imageUrl || 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400' }}
              style={styles.tripImage}
              contentFit="cover"
              transition={200}
            />
            <View style={styles.tripInfo}>
              <Text style={styles.tripRoute}>{item.origin} → {item.destination}</Text>
              <Text style={styles.tripDates}>{item.departDate} — {item.returnDate}</Text>
              <Badge
                label={item.status === 'upcoming' ? 'Upcoming' : item.status}
                variant={item.status === 'upcoming' ? 'info' : 'success'}
                small
              />
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.gray} />
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="airplane-outline" size={48} color={Colors.gray} />
            <Text style={styles.emptyText}>No trips yet</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.white },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md,
    borderBottomWidth: 1, borderBottomColor: Colors.lightGray,
  },
  backButton: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: Colors.offWhite, alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: Typography.serifBold.fontFamily, fontSize: Typography.sizes.md, color: Colors.nearBlack,
  },
  list: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.base },
  tripCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.white, borderRadius: BorderRadius.lg,
    padding: Spacing.md, marginBottom: Spacing.md,
    borderWidth: 1, borderColor: Colors.lightGray, ...Shadows.sm,
    gap: Spacing.md,
  },
  tripImage: { width: 70, height: 70, borderRadius: BorderRadius.md },
  tripInfo: { flex: 1, gap: 4 },
  tripRoute: {
    fontFamily: Typography.semiBold.fontFamily, fontSize: Typography.sizes.base, color: Colors.nearBlack,
  },
  tripDates: {
    fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.sm, color: Colors.darkGray,
  },
  empty: { alignItems: 'center', paddingTop: Spacing['5xl'] },
  emptyText: {
    fontFamily: Typography.medium.fontFamily, fontSize: Typography.sizes.md,
    color: Colors.darkGray, marginTop: Spacing.md,
  },
});
