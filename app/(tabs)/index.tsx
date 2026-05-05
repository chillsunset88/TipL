/**
 * TipL — Home Unified Marketplace Screen
 * Aggregated feed: hero section, trending destinations, upcoming journeys.
 * Matches the Stitch "Home - Unified Marketplace" design.
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/src/lib/constants';
import { Avatar } from '@/src/components/ui/Avatar';
import { Button } from '@/src/components/ui/Button';
import { Badge } from '@/src/components/ui/Badge';
import { MOCK_TRIPS, TRENDING_DESTINATIONS, MOCK_USERS } from '@/src/lib/mockData';
import { Trip } from '@/src/lib/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.42;

const CAROUSEL_DATA = [
  {
    id: 'b1',
    title: 'Tokyo Exclusive',
    subtitle: 'Limited edition goods from Shibuya & Akihabara',
    imageUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800',
    color: ['#1a1a2e', '#16213e'] as const,
  },
  {
    id: 'b2',
    title: 'Seoul Beauty',
    subtitle: 'K-Beauty & skincare favorites delivered to you',
    imageUrl: 'https://images.unsplash.com/photo-1538485399081-7191377e8241?w=800',
    color: ['#0f3460', '#533483'] as const,
  },
  {
    id: 'b3',
    title: 'Paris Luxe',
    subtitle: 'Designer pieces from Le Marais & Champs-Élysées',
    imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800',
    color: ['#3a0ca3', '#7209b7'] as const,
  },
];

export default function HomeScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate network fetch
    await new Promise((r) => setTimeout(r, 1000));
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={Colors.primary}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.brandName}>TipL</Text>
        </View>

        {/* Carousel */}
        <CarouselBanner />

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Ionicons name="search-outline" size={20} color={Colors.gray} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search products, items, brands..."
              placeholderTextColor={Colors.gray}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <TouchableOpacity>
            <LinearGradient
              colors={[Colors.primaryGradientStart, Colors.primaryGradientEnd]}
              style={styles.exploreButton}
            >
              <Text style={styles.exploreText}>Explore</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Trending Destinations */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Trending Destinations</Text>
            <TouchableOpacity style={styles.filterRow}>
              <Ionicons name="options-outline" size={18} color={Colors.darkGray} />
            </TouchableOpacity>
          </View>

          <FlatList
            horizontal
            data={TRENDING_DESTINATIONS}
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingRight: Spacing.xl }}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.destinationCard}>
                <Image
                  source={{ uri: item.imageUrl }}
                  style={styles.destinationImage}
                  contentFit="cover"
                  transition={300}
                />
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.6)']}
                  style={styles.destinationOverlay}
                >
                  <Text style={styles.destinationName}>{item.name}</Text>
                  <Text style={styles.destinationCountry}>{item.country}</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
          />
        </View>

        {/* Upcoming Journeys */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Upcoming Journeys</Text>
            <TouchableOpacity style={styles.filterPill}>
              <Text style={styles.filterText}>Filter</Text>
              <Ionicons name="funnel-outline" size={14} color={Colors.darkGray} />
            </TouchableOpacity>
          </View>

          {MOCK_TRIPS.map((trip) => (
            <TravelerCard key={trip.id} trip={trip} />
          ))}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

/** Auto-scrolling promotional carousel */
function CarouselBanner() {
  const scrollRef = useRef<ScrollView>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      const nextIndex = (activeIndex + 1) % CAROUSEL_DATA.length;
      scrollRef.current?.scrollTo({ x: nextIndex * (SCREEN_WIDTH - Spacing.xl * 2), animated: true });
      setActiveIndex(nextIndex);
    }, 4000);
    return () => clearInterval(timer);
  }, [activeIndex]);

  const handleScroll = useCallback((event: any) => {
    const idx = Math.round(event.nativeEvent.contentOffset.x / (SCREEN_WIDTH - Spacing.xl * 2));
    setActiveIndex(idx);
  }, []);

  return (
    <View style={styles.carouselContainer}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        decelerationRate="fast"
        snapToInterval={SCREEN_WIDTH - Spacing.xl * 2}
      >
        {CAROUSEL_DATA.map((item) => (
          <View key={item.id} style={styles.carouselSlide}>
            <Image
              source={{ uri: item.imageUrl }}
              style={styles.carouselImage}
              contentFit="cover"
              transition={300}
            />
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.7)']}
              style={styles.carouselOverlay}
            >
              <Text style={styles.carouselTitle}>{item.title}</Text>
              <Text style={styles.carouselSubtitle}>{item.subtitle}</Text>
            </LinearGradient>
          </View>
        ))}
      </ScrollView>
      {/* Dots */}
      <View style={styles.carouselDots}>
        {CAROUSEL_DATA.map((_, idx) => (
          <View
            key={idx}
            style={[
              styles.carouselDot,
              idx === activeIndex && styles.carouselDotActive,
            ]}
          />
        ))}
      </View>
    </View>
  );
}

/** Traveler Journey Card — matches Stitch design */
function TravelerCard({ trip }: { trip: Trip }) {
  return (
    <TouchableOpacity
      style={styles.travelerCard}
      activeOpacity={0.7}
      onPress={() => router.push(`/trip/${trip.id}`)}
    >
      <View style={styles.travelerRow}>
        <Avatar
          uri={trip.travelerAvatar}
          name={trip.travelerName}
          size="md"
          verified={trip.travelerVerified}
        />
        <View style={styles.travelerInfo}>
          <Text style={styles.travelerName}>{trip.travelerName}</Text>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={13} color={Colors.primary} />
            <Text style={styles.ratingText}>{trip.travelerRating}</Text>
            <Text style={styles.reviewCount}>({trip.travelerVerified ? 'Verified' : ''})</Text>
          </View>
        </View>
      </View>

      {/* Route */}
      <View style={styles.routeRow}>
        <View style={styles.routeCity}>
          <Text style={styles.routeLabel}>ORIGIN</Text>
          <Text style={styles.routeCityName}>{trip.origin}</Text>
        </View>
        <View style={styles.routeArrow}>
          <View style={styles.routeLine} />
          <Ionicons name="airplane" size={16} color={Colors.primary} />
          <View style={styles.routeLine} />
        </View>
        <View style={[styles.routeCity, { alignItems: 'flex-end' }]}>
          <Text style={styles.routeLabel}>DESTINATION</Text>
          <Text style={styles.routeCityName}>{trip.destination}</Text>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <Text style={styles.dateText}>
          <Ionicons name="calendar-outline" size={13} color={Colors.darkGray} />{' '}
          {trip.departDate}
        </Text>
        <Button
          title="Request Item"
          onPress={() => router.push(`/trip/${trip.id}`)}
          size="sm"
          variant="secondary"
        />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  container: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.base,
  },
  brandName: {
    fontFamily: Typography.serifBold.fontFamily,
    fontSize: Typography.sizes.xl,
    color: Colors.nearBlack,
    letterSpacing: -0.5,
  },

  // Carousel
  carouselContainer: {
    marginBottom: Spacing.xl,
  },
  carouselSlide: {
    width: SCREEN_WIDTH - Spacing.xl * 2,
    height: 180,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  carouselImage: {
    width: '100%',
    height: '100%',
  },
  carouselOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    padding: Spacing.base,
  },
  carouselTitle: {
    fontFamily: Typography.serifBold.fontFamily,
    fontSize: Typography.sizes.xl,
    color: Colors.white,
  },
  carouselSubtitle: {
    fontFamily: Typography.regular.fontFamily,
    fontSize: Typography.sizes.sm,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 2,
  },
  carouselDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: Spacing.md,
    gap: 6,
  },
  carouselDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.midGray,
  },
  carouselDotActive: {
    backgroundColor: Colors.primary,
    width: 20,
  },

  // Search
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing['2xl'],
    gap: Spacing.sm,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cream,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    height: 48,
    borderWidth: 1,
    borderColor: Colors.midGray,
  },
  searchInput: {
    flex: 1,
    fontFamily: Typography.regular.fontFamily,
    fontSize: Typography.sizes.sm,
    color: Colors.nearBlack,
    marginLeft: Spacing.sm,
  },
  exploreButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    height: 48,
    justifyContent: 'center',
  },
  exploreText: {
    fontFamily: Typography.semiBold.fontFamily,
    fontSize: Typography.sizes.sm,
    color: Colors.white,
    letterSpacing: 0.3,
  },

  // Sections
  section: {
    marginBottom: Spacing['2xl'],
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.base,
  },
  sectionTitle: {
    fontFamily: Typography.serifBold.fontFamily,
    fontSize: Typography.sizes.lg,
    color: Colors.nearBlack,
  },
  filterRow: {
    padding: Spacing.xs,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.midGray,
    gap: 4,
  },
  filterText: {
    fontFamily: Typography.medium.fontFamily,
    fontSize: Typography.sizes.xs,
    color: Colors.darkGray,
  },

  // Destination Cards
  destinationCard: {
    width: CARD_WIDTH,
    height: CARD_WIDTH * 1.3,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    marginRight: Spacing.md,
    ...Shadows.md,
  },
  destinationImage: {
    width: '100%',
    height: '100%',
  },
  destinationOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    padding: Spacing.base,
  },
  destinationName: {
    fontFamily: Typography.semiBold.fontFamily,
    fontSize: Typography.sizes.lg,
    color: Colors.white,
  },
  destinationCountry: {
    fontFamily: Typography.regular.fontFamily,
    fontSize: Typography.sizes.sm,
    color: 'rgba(255,255,255,0.8)',
  },

  // Traveler Card
  travelerCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.lightGray,
    ...Shadows.sm,
  },
  travelerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.base,
  },
  travelerInfo: {
    marginLeft: Spacing.md,
    flex: 1,
  },
  travelerName: {
    fontFamily: Typography.semiBold.fontFamily,
    fontSize: Typography.sizes.base,
    color: Colors.nearBlack,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    gap: 3,
  },
  ratingText: {
    fontFamily: Typography.medium.fontFamily,
    fontSize: Typography.sizes.sm,
    color: Colors.nearBlack,
  },
  reviewCount: {
    fontFamily: Typography.regular.fontFamily,
    fontSize: Typography.sizes.xs,
    color: Colors.darkGray,
  },

  // Route
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.base,
    paddingHorizontal: Spacing.sm,
  },
  routeCity: {
    flex: 1,
  },
  routeLabel: {
    fontFamily: Typography.medium.fontFamily,
    fontSize: 10,
    color: Colors.darkGray,
    letterSpacing: 1,
    marginBottom: 2,
  },
  routeCityName: {
    fontFamily: Typography.bold.fontFamily,
    fontSize: Typography.sizes.md,
    color: Colors.nearBlack,
  },
  routeArrow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: Spacing.sm,
  },
  routeLine: {
    width: 16,
    height: 1.5,
    backgroundColor: Colors.midGray,
  },

  // Footer
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.lightGray,
    paddingTop: Spacing.md,
  },
  dateText: {
    fontFamily: Typography.regular.fontFamily,
    fontSize: Typography.sizes.sm,
    color: Colors.darkGray,
  },
});
