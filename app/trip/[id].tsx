/**
 * TipL — Trip Detail Screen
 * Connected to Supabase via useTrip hook.
 * Shows hero, triper profile, capacity badges, products, and CTA to request/create.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/src/lib/constants';
import { Avatar } from '@/src/components/ui/Avatar';
import { Badge } from '@/src/components/ui/Badge';
import { Skeleton } from '@/src/components/ui/Skeleton';
import { useTrip } from '@/src/lib/hooks/useTrips';
import { deleteTrip } from '@/src/services/supabase/trips';
import { useAuthStore } from '@/src/store/authStore';
import * as Haptics from 'expo-haptics';

const { width: W } = Dimensions.get('window');

// Country → image mapping using picsum (deterministic hash)
function countryImageUrl(country: string) {
  const seed = country.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return `https://picsum.photos/seed/${seed}/800/600`;
}

function formatDate(iso: string | null | undefined) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatPrice(min?: number | null, max?: number | null, currency?: string | null) {
  if (!min && !max) return null;
  const c = currency ?? 'IDR';
  if (min && max) return `${c} ${min.toLocaleString()} – ${max.toLocaleString()}`;
  if (min) return `${c} ${min.toLocaleString()}+`;
  return `up to ${c} ${max!.toLocaleString()}`;
}

export default function TripDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { trip, products, loading } = useTrip(id);
  const user = useAuthStore((s) => s.user);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      'Hapus Trip',
      'Trip ini akan dihapus permanen beserta semua datanya. Yakin?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            try {
              setDeleting(true);
              await deleteTrip(id);
              router.back();
            } catch {
              setDeleting(false);
              Alert.alert('Gagal', 'Gagal menghapus trip. Coba lagi.');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.white }}>
        <Skeleton width={W} height={W * 0.7} borderRadius={0} />
        <View style={{ padding: Spacing.xl }}>
          <Skeleton width={200} height={24} borderRadius={BorderRadius.sm} />
          <View style={{ marginTop: Spacing.md }}>
            <Skeleton width={150} height={16} borderRadius={BorderRadius.sm} />
          </View>
          <View style={{ marginTop: Spacing.xl }}>
            <Skeleton width={W - Spacing.xl * 2} height={80} borderRadius={BorderRadius.lg} />
          </View>
        </View>
      </View>
    );
  }

  if (!trip) {
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: Colors.white, alignItems: 'center', justifyContent: 'center' }}
        edges={['top']}
      >
        <Ionicons name="alert-circle-outline" size={48} color={Colors.error} />
        <Text
          style={{
            fontFamily: Typography.regular.fontFamily,
            fontSize: Typography.sizes.md,
            color: Colors.nearBlack,
            marginTop: Spacing.md,
          }}
        >
          Trip not found
        </Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: Spacing.base }}>
          <Text
            style={{
              fontFamily: Typography.medium.fontFamily,
              fontSize: Typography.sizes.base,
              color: Colors.primary,
            }}
          >
            Go Back
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const profile = trip.profiles;
  const priceStr = formatPrice(trip.price_range_min, trip.price_range_max, trip.currency);
  const isSelf = user?.id === trip.triper_id;

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={styles.hero}>
          <Image
            source={{ uri: countryImageUrl(trip.destination_country) }}
            style={styles.heroImg}
            contentFit="cover"
            transition={300}
          />
          <LinearGradient
            colors={['rgba(0,0,0,0.35)', 'transparent', 'rgba(0,0,0,0.65)']}
            locations={[0, 0.35, 1]}
            style={StyleSheet.absoluteFill}
          >
            <SafeAreaView edges={['top']}>
              <View style={styles.heroHeader}>
                <TouchableOpacity onPress={() => router.back()} style={styles.heroBtn}>
                  <Ionicons name="arrow-back" size={22} color={Colors.white} />
                </TouchableOpacity>
                {isSelf && (
                  <TouchableOpacity
                    style={styles.heroBtn}
                    onPress={handleDelete}
                    disabled={deleting}
                  >
                    {deleting ? (
                      <ActivityIndicator size="small" color={Colors.white} />
                    ) : (
                      <Ionicons name="trash-outline" size={22} color="#F87171" />
                    )}
                  </TouchableOpacity>
                )}
              </View>
            </SafeAreaView>
            <View style={styles.heroContent}>
              <View style={styles.routeRow}>
                <Text style={styles.heroOrigin}>{trip.origin_country}</Text>
                <Ionicons name="arrow-forward" size={18} color="rgba(255,255,255,0.8)" />
                <Text style={styles.heroDestination}>{trip.destination_country}</Text>
              </View>
              {trip.destination_city && (
                <Text style={styles.heroCity}>{trip.destination_city}</Text>
              )}
              <Text style={styles.heroDates}>
                {formatDate(trip.departure_date)} — {formatDate(trip.return_date)}
              </Text>
            </View>
          </LinearGradient>
        </View>

        {/* Quick info badges */}
        <View style={styles.badgesRow}>
          {trip.capacity_kg != null && (
            <View style={styles.badge}>
              <Ionicons name="cube-outline" size={14} color={Colors.primary} />
              <Text style={styles.badgeText}>{trip.capacity_kg} kg</Text>
            </View>
          )}
          {trip.capacity_items != null && (
            <View style={styles.badge}>
              <Ionicons name="bag-outline" size={14} color={Colors.secondary} />
              <Text style={[styles.badgeText, { color: Colors.secondary }]}>{trip.capacity_items} items max</Text>
            </View>
          )}
          {priceStr && (
            <View style={styles.badge}>
              <Ionicons name="cash-outline" size={14} color={Colors.success} />
              <Text style={[styles.badgeText, { color: Colors.success }]}>{priceStr}</Text>
            </View>
          )}
        </View>

        {/* Triper profile */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Your Traveler</Text>
          <TouchableOpacity
            style={styles.profileRow}
            activeOpacity={0.75}
            onPress={() => router.push(`/triper/${trip.triper_id}` as any)}
          >
            <Avatar
              uri={profile?.avatar_url ?? null}
              name={profile?.full_name ?? 'Traveler'}
              size="xl"
              verified={(profile?.total_trips ?? 0) >= 10}
            />
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{profile?.full_name ?? 'Traveler'}</Text>
              {profile?.rating != null && profile.rating > 0 && (
                <View style={styles.ratingRow}>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Ionicons
                      key={s}
                      name={s <= Math.round(profile.rating ?? 0) ? 'star' : 'star-outline'}
                      size={14}
                      color={Colors.warning}
                    />
                  ))}
                  <Text style={styles.ratingText}>{profile.rating.toFixed(1)}</Text>
                </View>
              )}
              <Text style={styles.profileStat}>{profile?.total_trips ?? 0} trips completed</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.midGray} />
          </TouchableOpacity>
        </View>

        {/* Notes */}
        {trip.notes && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Traveler's Notes</Text>
            <Text style={styles.notesText}>{trip.notes}</Text>
          </View>
        )}

        {/* Products */}
        {products.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Available Products</Text>
            {products.map((p) => (
              <View key={p.id} style={styles.productRow}>
                {p.image_urls && p.image_urls.length > 0 ? (
                  <Image
                    source={{ uri: p.image_urls[0] }}
                    style={styles.productThumb}
                    contentFit="cover"
                  />
                ) : (
                  <View style={[styles.productThumb, styles.productThumbEmpty]}>
                    <Ionicons name="image-outline" size={20} color={Colors.gray} />
                  </View>
                )}
                <View style={styles.productInfo}>
                  <Text style={styles.productName}>{p.name}</Text>
                  {p.category && (
                    <Text style={styles.productCategory}>{p.category}</Text>
                  )}
                  {(p.price_min || p.price_max) && (
                    <Text style={styles.productPrice}>
                      {formatPrice(p.price_min, p.price_max, p.currency)}
                    </Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* CTA */}
      {isSelf ? (
        <View style={styles.cta}>
          <TouchableOpacity
            style={styles.ctaBtn}
            activeOpacity={0.85}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              router.push({ pathname: '/product/create', params: { tripId: id } });
            }}
          >
            <LinearGradient
              colors={[Colors.primaryLight, Colors.primaryDark]}
              style={styles.ctaGrad}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Ionicons name="add-circle-outline" size={22} color={Colors.white} />
              <Text style={styles.ctaText}>Tambah Produk ke Trip</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.cta}>
          <TouchableOpacity
            style={styles.ctaBtn}
            activeOpacity={0.85}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              router.push({
                pathname: '/request/create',
                params: { tripId: id, triperId: trip.triper_id, triperName: profile?.full_name ?? 'Traveler' },
              });
            }}
          >
            <LinearGradient
              colors={[Colors.primaryLight, Colors.primaryDark]}
              style={styles.ctaGrad}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Ionicons name="bag-add-outline" size={22} color={Colors.white} />
              <Text style={styles.ctaText}>Request Item from This Trip</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  hero: { width: W, height: W * 0.72 },
  heroImg: { width: '100%', height: '100%' },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.sm,
  },
  heroBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xl,
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: 2,
  },
  heroOrigin: {
    fontFamily: Typography.regular.fontFamily,
    fontSize: Typography.sizes.sm,
    color: 'rgba(255,255,255,0.8)',
  },
  heroDestination: {
    fontFamily: Typography.serifBold.fontFamily,
    fontSize: Typography.sizes['2xl'],
    color: Colors.white,
  },
  heroCity: {
    fontFamily: Typography.regular.fontFamily,
    fontSize: Typography.sizes.sm,
    color: 'rgba(255,255,255,0.85)',
    marginBottom: 4,
  },
  heroDates: {
    fontFamily: Typography.medium.fontFamily,
    fontSize: Typography.sizes.sm,
    color: 'rgba(255,255,255,0.8)',
  },
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.base,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primaryPale,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.primaryLight,
  },
  badgeText: {
    fontFamily: Typography.medium.fontFamily,
    fontSize: Typography.sizes.xs,
    color: Colors.primary,
  },
  card: {
    marginHorizontal: Spacing.xl,
    marginBottom: Spacing.xl,
    backgroundColor: Colors.offWhite,
    borderRadius: BorderRadius.xl,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.lightGray,
    ...Shadows.sm,
  },
  sectionTitle: {
    fontFamily: Typography.serifBold.fontFamily,
    fontSize: Typography.sizes.md,
    color: Colors.nearBlack,
    marginBottom: Spacing.base,
  },
  profileRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.base },
  profileInfo: { flex: 1 },
  profileName: {
    fontFamily: Typography.regular.fontFamily,
    fontSize: Typography.sizes.base,
    color: Colors.nearBlack,
  },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 2, marginTop: 4 },
  ratingText: {
    fontFamily: Typography.medium.fontFamily,
    fontSize: Typography.sizes.sm,
    color: Colors.charcoal,
    marginLeft: 4,
  },
  profileStat: {
    fontFamily: Typography.regular.fontFamily,
    fontSize: Typography.sizes.sm,
    color: Colors.darkGray,
    marginTop: 2,
  },
  notesText: {
    fontFamily: Typography.regular.fontFamily,
    fontSize: Typography.sizes.base,
    color: Colors.charcoal,
    lineHeight: 22,
  },
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  productThumb: { width: 56, height: 56, borderRadius: BorderRadius.md, overflow: 'hidden' },
  productThumbEmpty: {
    backgroundColor: Colors.cream,
    alignItems: 'center',
    justifyContent: 'center',
  },
  productInfo: { flex: 1 },
  productName: {
    fontFamily: Typography.medium.fontFamily,
    fontSize: Typography.sizes.base,
    color: Colors.nearBlack,
  },
  productCategory: {
    fontFamily: Typography.regular.fontFamily,
    fontSize: Typography.sizes.xs,
    color: Colors.darkGray,
    marginTop: 2,
    textTransform: 'capitalize',
  },
  productPrice: {
    fontFamily: Typography.regular.fontFamily,
    fontSize: Typography.sizes.sm,
    color: Colors.primary,
    marginTop: 2,
  },
  cta: {
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
  ctaBtn: { borderRadius: BorderRadius.xl, overflow: 'hidden' },
  ctaGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.base,
    gap: Spacing.sm,
  },
  ctaText: {
    fontFamily: Typography.regular.fontFamily,
    fontSize: Typography.sizes.base,
    color: Colors.white,
    letterSpacing: 0.3,
  },
});
