/**
 * TipL — Trip Detail Screen
 * Parallax hero, traveler profile, itinerary timeline, category chips.
 * Matches Stitch "Trip Detail" design.
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Typography, Spacing, BorderRadius, Shadows, ITEM_CATEGORIES } from '@/src/lib/constants';
import { Avatar } from '@/src/components/ui/Avatar';
import { Badge } from '@/src/components/ui/Badge';
import { Button } from '@/src/components/ui/Button';
import { MOCK_TRIPS } from '@/src/lib/mockData';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function TripDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  // In production: const { trip, loading } = useTrip(id);
  const trip = MOCK_TRIPS.find((t) => t.id === id) || MOCK_TRIPS[0];

  const categoryItems = ITEM_CATEGORIES.filter((c) =>
    trip.categories.includes(c.id)
  );

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Hero Image */}
        <View style={styles.heroContainer}>
          <Image
            source={{ uri: trip.imageUrl || 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800' }}
            style={styles.heroImage}
            contentFit="cover"
            transition={300}
          />
          <LinearGradient
            colors={['rgba(0,0,0,0.3)', 'transparent', 'rgba(0,0,0,0.6)']}
            locations={[0, 0.3, 1]}
            style={styles.heroOverlay}
          >
            {/* Back Button */}
            <SafeAreaView edges={['top']}>
              <View style={styles.heroHeader}>
                <TouchableOpacity
                  onPress={() => router.back()}
                  style={styles.heroBackButton}
                >
                  <Ionicons name="arrow-back" size={22} color={Colors.white} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.heroBackButton}>
                  <Ionicons name="heart-outline" size={22} color={Colors.white} />
                </TouchableOpacity>
              </View>
            </SafeAreaView>

            {/* Destination Label */}
            <View style={styles.heroContent}>
              <Text style={styles.heroCity}>{trip.destination},</Text>
              <Text style={styles.heroCountry}>
                {trip.itinerary.find((s) => s.city === trip.destination)?.country || ''}
              </Text>
              <Text style={styles.heroDates}>
                {trip.departDate} — {trip.returnDate}
              </Text>
            </View>
          </LinearGradient>
        </View>

        {/* Traveler Profile */}
        <View style={styles.profileCard}>
          <Avatar
            uri={trip.travelerAvatar}
            name={trip.travelerName}
            size="xl"
            verified={trip.travelerVerified}
          />
          <View style={styles.profileInfo}>
            <View style={styles.profileNameRow}>
              <Text style={styles.profileName}>{trip.travelerName}</Text>
              {trip.travelerVerified && (
                <Badge label="Verified" variant="gold" icon="checkmark-circle" small />
              )}
            </View>
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={15} color={Colors.primary} />
              <Text style={styles.ratingText}>{trip.travelerRating}</Text>
              <Text style={styles.reviewText}>• Trusted Traveler</Text>
            </View>
          </View>
        </View>

        {/* Trip Itinerary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Trip Itinerary</Text>
          {trip.itinerary.map((stop, index) => (
            <View key={index} style={styles.itineraryRow}>
              <View style={styles.itineraryDot}>
                <View
                  style={[
                    styles.dot,
                    index === 0 && styles.dotStart,
                    index === trip.itinerary.length - 1 && styles.dotEnd,
                  ]}
                />
                {index < trip.itinerary.length - 1 && (
                  <View style={styles.itineraryLine} />
                )}
              </View>
              <View style={styles.itineraryContent}>
                <View style={styles.itineraryHeader}>
                  <Text style={styles.itineraryCity}>{stop.city}</Text>
                  {index === 0 && (
                    <Badge label="Origin" variant="info" small />
                  )}
                </View>
                <Text style={styles.itineraryDate}>
                  {stop.arrivalDate}
                  {stop.departureDate ? ` — ${stop.departureDate}` : ''}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* What I can bring back */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What I can bring back</Text>
          <View style={styles.categoryGrid}>
            {categoryItems.map((cat) => (
              <View key={cat.id} style={styles.categoryCard}>
                <View style={styles.categoryIconContainer}>
                  <Ionicons name={cat.icon as any} size={24} color={Colors.primary} />
                </View>
                <Text style={styles.categoryLabel}>{cat.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Capacity Info */}
        {trip.maxWeight && (
          <View style={styles.capacityCard}>
            <Ionicons name="cube-outline" size={22} color={Colors.primary} />
            <View style={styles.capacityInfo}>
              <Text style={styles.capacityTitle}>Available Capacity</Text>
              <Text style={styles.capacityValue}>{trip.maxWeight} kg spare luggage</Text>
            </View>
          </View>
        )}

        {/* Description */}
        {trip.description && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notes from Traveler</Text>
            <Text style={styles.descriptionText}>{trip.description}</Text>
          </View>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Fixed Bottom CTA */}
      <View style={styles.bottomBar}>
        <Button
          title="Request Item"
          onPress={() => router.push('/(tabs)/create')}
          fullWidth
          size="lg"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  scroll: {
    flex: 1,
  },

  // Hero
  heroContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH * 0.75,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.sm,
  },
  heroBackButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroContent: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xl,
  },
  heroCity: {
    fontFamily: Typography.serifBold.fontFamily,
    fontSize: Typography.sizes['3xl'],
    color: Colors.white,
    lineHeight: 40,
  },
  heroCountry: {
    fontFamily: Typography.serif.fontFamily,
    fontSize: Typography.sizes['3xl'],
    color: Colors.white,
    lineHeight: 40,
  },
  heroDates: {
    fontFamily: Typography.regular.fontFamily,
    fontSize: Typography.sizes.sm,
    color: 'rgba(255,255,255,0.8)',
    marginTop: Spacing.xs,
  },

  // Profile
  profileCard: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    marginTop: -40,
  },
  profileInfo: {
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  profileNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  profileName: {
    fontFamily: Typography.semiBold.fontFamily,
    fontSize: Typography.sizes.lg,
    color: Colors.nearBlack,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.xs,
    gap: 4,
  },
  ratingText: {
    fontFamily: Typography.medium.fontFamily,
    fontSize: Typography.sizes.sm,
    color: Colors.nearBlack,
  },
  reviewText: {
    fontFamily: Typography.regular.fontFamily,
    fontSize: Typography.sizes.sm,
    color: Colors.darkGray,
  },

  // Sections
  section: {
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontFamily: Typography.serifBold.fontFamily,
    fontSize: Typography.sizes.lg,
    color: Colors.nearBlack,
    marginBottom: Spacing.base,
  },

  // Itinerary
  itineraryRow: {
    flexDirection: 'row',
    minHeight: 56,
  },
  itineraryDot: {
    alignItems: 'center',
    width: 24,
    marginRight: Spacing.md,
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: Colors.midGray,
    borderWidth: 2,
    borderColor: Colors.midGray,
  },
  dotStart: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  dotEnd: {
    backgroundColor: Colors.success,
    borderColor: Colors.success,
  },
  itineraryLine: {
    width: 2,
    flex: 1,
    backgroundColor: Colors.midGray,
    minHeight: 24,
  },
  itineraryContent: {
    flex: 1,
    paddingBottom: Spacing.lg,
  },
  itineraryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  itineraryCity: {
    fontFamily: Typography.semiBold.fontFamily,
    fontSize: Typography.sizes.base,
    color: Colors.nearBlack,
  },
  itineraryDate: {
    fontFamily: Typography.regular.fontFamily,
    fontSize: Typography.sizes.sm,
    color: Colors.darkGray,
    marginTop: 2,
  },

  // Categories
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  categoryCard: {
    width: (SCREEN_WIDTH - Spacing.xl * 2 - Spacing.md) / 2,
    backgroundColor: Colors.offWhite,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.lightGray,
    alignItems: 'center',
  },
  categoryIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFF8E7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  categoryLabel: {
    fontFamily: Typography.medium.fontFamily,
    fontSize: Typography.sizes.sm,
    color: Colors.nearBlack,
    textAlign: 'center',
  },

  // Capacity
  capacityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: Spacing.xl,
    marginBottom: Spacing.xl,
    padding: Spacing.base,
    backgroundColor: '#FFF8E7',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.primaryLight,
    gap: Spacing.md,
  },
  capacityInfo: {
    flex: 1,
  },
  capacityTitle: {
    fontFamily: Typography.semiBold.fontFamily,
    fontSize: Typography.sizes.sm,
    color: Colors.nearBlack,
  },
  capacityValue: {
    fontFamily: Typography.regular.fontFamily,
    fontSize: Typography.sizes.sm,
    color: Colors.darkGray,
    marginTop: 2,
  },

  // Description
  descriptionText: {
    fontFamily: Typography.regular.fontFamily,
    fontSize: Typography.sizes.base,
    color: Colors.charcoal,
    lineHeight: 22,
  },

  // Bottom Bar
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.base,
    paddingBottom: Spacing['2xl'],
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.lightGray,
    ...Shadows.lg,
  },
});
