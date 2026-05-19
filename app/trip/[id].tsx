/**
 * TipL — Trip Detail Screen
 * Connected to Supabase via useTrip hook.
 * Theme-aware: supports Dark Mode & Light Mode.
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
import { Typography, Spacing, BorderRadius, Shadows } from '@/src/lib/constants';
import { Avatar } from '@/src/components/ui/Avatar';
import { useSettingsStore } from '@/src/store/settingsStore';
import { Skeleton } from '@/src/components/ui/Skeleton';
import { useTrip } from '@/src/lib/hooks/useTrips';
import { deleteTrip, deleteProduct } from '@/src/services/supabase/trips';
import { useAuthStore } from '@/src/store/authStore';
import { supabase } from '@/src/lib/supabase';
import { useThemeColors } from '@/src/lib/hooks/useThemeColors';
import * as Haptics from 'expo-haptics';

const ACTIVE_ORDER_STATUSES = ['pending', 'accepted', 'in_escrow', 'purchased', 'shipped', 'delivered'];

async function getActiveOrderCountForProduct(productId: string): Promise<number> {
  const { count } = await supabase
    .from('orders')
    .select('id', { count: 'exact', head: true })
    .eq('product_id', productId)
    .in('status', ACTIVE_ORDER_STATUSES);
  return count ?? 0;
}

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
  const C = useThemeColors();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { trip, products, loading } = useTrip(id);
  const user = useAuthStore((s) => s.user);
  const { t } = useSettingsStore();
  const [deleting, setDeleting] = useState(false);
  const [deletedProductIds, setDeletedProductIds] = useState<Set<string>>(new Set());

  const handleDelete = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      t.deleteTrip,
      t.deleteTripConfirm,
      [
        { text: t.cancel, style: 'cancel' },
        {
          text: t.delete,
          style: 'destructive',
          onPress: async () => {
            try {
              setDeleting(true);
              await deleteTrip(id);
              router.back();
            } catch {
              setDeleting(false);
              Alert.alert(t.error, t.deleteTripFailed);
            }
          },
        },
      ]
    );
  };

  const styles = React.useMemo(() => StyleSheet.create({
    container: { flex: 1, backgroundColor: C.white },
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
      color: '#FFFFFF',
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
    badgeWeight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: C.primary + '15',
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.xs,
      borderRadius: BorderRadius.full,
      borderWidth: 1,
      borderColor: C.primary,
    },
    badgeWeightText: {
      fontFamily: Typography.medium.fontFamily,
      fontSize: Typography.sizes.xs,
      color: C.primary,
    },
    badgeItems: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: C.secondary + '15',
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.xs,
      borderRadius: BorderRadius.full,
      borderWidth: 1,
      borderColor: C.secondary,
    },
    badgeItemsText: {
      fontFamily: Typography.medium.fontFamily,
      fontSize: Typography.sizes.xs,
      color: C.secondary,
    },
    badgePrice: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: C.success + '15',
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.xs,
      borderRadius: BorderRadius.full,
      borderWidth: 1,
      borderColor: C.success,
    },
    badgePriceText: {
      fontFamily: Typography.medium.fontFamily,
      fontSize: Typography.sizes.xs,
      color: C.success,
    },
    card: {
      marginHorizontal: Spacing.xl,
      marginBottom: Spacing.xl,
      backgroundColor: C.offWhite,
      borderRadius: BorderRadius.xl,
      padding: Spacing.base,
      borderWidth: 1,
      borderColor: C.lightGray,
      ...Shadows.sm,
    },
    sectionTitle: {
      fontFamily: Typography.serifBold.fontFamily,
      fontSize: Typography.sizes.md,
      color: C.nearBlack,
      marginBottom: Spacing.base,
    },
    profileRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.base },
    profileInfo: { flex: 1 },
    profileName: {
      fontFamily: Typography.regular.fontFamily,
      fontSize: Typography.sizes.base,
      color: C.nearBlack,
    },
    ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 2, marginTop: 4 },
    ratingText: {
      fontFamily: Typography.medium.fontFamily,
      fontSize: Typography.sizes.sm,
      color: C.charcoal,
      marginLeft: 4,
    },
    profileStat: {
      fontFamily: Typography.regular.fontFamily,
      fontSize: Typography.sizes.sm,
      color: C.darkGray,
      marginTop: 2,
    },
    notesText: {
      fontFamily: Typography.regular.fontFamily,
      fontSize: Typography.sizes.base,
      color: C.charcoal,
      lineHeight: 22,
    },
    productRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.md,
      paddingVertical: Spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: C.lightGray,
    },
    productThumb: { width: 56, height: 56, borderRadius: BorderRadius.md, overflow: 'hidden' },
    productThumbEmpty: {
      backgroundColor: C.offWhite,
      alignItems: 'center',
      justifyContent: 'center',
    },
    productInfo: { flex: 1 },
    productActions: { flexDirection: 'row', gap: Spacing.xs },
    productActionBtn: {
      width: 32, height: 32, borderRadius: 16,
      backgroundColor: C.offWhite, borderWidth: 1, borderColor: C.lightGray,
      alignItems: 'center', justifyContent: 'center',
    },
    productName: {
      fontFamily: Typography.medium.fontFamily,
      fontSize: Typography.sizes.base,
      color: C.nearBlack,
    },
    productCategory: {
      fontFamily: Typography.regular.fontFamily,
      fontSize: Typography.sizes.xs,
      color: C.darkGray,
      marginTop: 2,
      textTransform: 'capitalize',
    },
    productPrice: {
      fontFamily: Typography.regular.fontFamily,
      fontSize: Typography.sizes.sm,
      color: C.primary,
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
      backgroundColor: C.white,
      borderTopWidth: 1,
      borderTopColor: C.lightGray,
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
      color: '#FFFFFF',
      letterSpacing: 0.3,
    },
  }), [C]);

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: C.white }}>
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
        style={{ flex: 1, backgroundColor: C.white, alignItems: 'center', justifyContent: 'center' }}
        edges={['top']}
      >
        <Ionicons name="alert-circle-outline" size={48} color={C.error} />
        <Text
          style={{
            fontFamily: Typography.regular.fontFamily,
            fontSize: Typography.sizes.md,
            color: C.nearBlack,
            marginTop: Spacing.md,
          }}
        >
          {t.tripNotFound}
        </Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: Spacing.base }}>
          <Text
            style={{
              fontFamily: Typography.medium.fontFamily,
              fontSize: Typography.sizes.base,
              color: C.primary,
            }}
          >
            {t.back}
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
                  <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
                </TouchableOpacity>
                {isSelf && (
                  <TouchableOpacity
                    style={styles.heroBtn}
                    onPress={handleDelete}
                    disabled={deleting}
                  >
                    {deleting ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
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
            <View style={styles.badgeWeight}>
              <Ionicons name="cube-outline" size={14} color={C.primary} />
              <Text style={styles.badgeWeightText}>{trip.capacity_kg} kg</Text>
            </View>
          )}
          {trip.capacity_items != null && (
            <View style={styles.badgeItems}>
              <Ionicons name="bag-outline" size={14} color={C.secondary} />
              <Text style={styles.badgeItemsText}>{trip.capacity_items} {t.itemsMax}</Text>
            </View>
          )}
          {priceStr && (
            <View style={styles.badgePrice}>
              <Ionicons name="cash-outline" size={14} color={C.success} />
              <Text style={styles.badgePriceText}>{priceStr}</Text>
            </View>
          )}
        </View>

        {/* Triper profile */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>{t.yourTraveler}</Text>
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
                      color={C.warning}
                    />
                  ))}
                  <Text style={styles.ratingText}>{profile.rating.toFixed(1)}</Text>
                </View>
              )}
              <Text style={styles.profileStat}>{profile?.total_trips ?? 0} {t.tripsCompleted}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={C.midGray} />
          </TouchableOpacity>
        </View>

        {/* Notes */}
        {trip.notes && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>{t.travelersNotes}</Text>
            <Text style={styles.notesText}>{trip.notes}</Text>
          </View>
        )}

        {/* Products */}
        {products.filter((p) => !deletedProductIds.has(p.id)).length > 0 && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>{t.availableProducts}</Text>
            {products.filter((p) => !deletedProductIds.has(p.id)).map((p) => (
              <View key={p.id} style={styles.productRow}>
                {p.image_urls && p.image_urls.length > 0 ? (
                  <Image
                    source={{ uri: p.image_urls[0] }}
                    style={styles.productThumb}
                    contentFit="cover"
                  />
                ) : (
                  <View style={[styles.productThumb, styles.productThumbEmpty]}>
                    <Ionicons name="image-outline" size={20} color={C.gray} />
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

                {isSelf && (
                  <View style={styles.productActions}>
                    <TouchableOpacity
                      style={styles.productActionBtn}
                      onPress={() => router.push({
                        pathname: '/product/create',
                        params: {
                          productId: p.id,
                          tripId: id,
                          productName: p.name,
                          productCategory: p.category ?? '',
                          productPriceMin: p.price_min ? String(p.price_min) : '',
                          productPriceMax: p.price_max ? String(p.price_max) : '',
                          productDescription: p.description ?? '',
                          productImages: JSON.stringify(p.image_urls ?? []),
                        },
                      })}
                    >
                      <Ionicons name="pencil-outline" size={16} color={C.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.productActionBtn}
                      onPress={async () => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                        const activeCount = await getActiveOrderCountForProduct(p.id);
                        if (activeCount > 0) {
                          Alert.alert(
                            'Tidak Bisa Dihapus',
                            `Ada ${activeCount} pesanan aktif untuk produk ini. Selesaikan semua pesanan terlebih dahulu.`,
                          );
                          return;
                        }
                        Alert.alert('Hapus Produk', `Hapus "${p.name}"?`, [
                          { text: 'Batal', style: 'cancel' },
                          {
                            text: 'Hapus',
                            style: 'destructive',
                            onPress: async () => {
                              try {
                                await deleteProduct(p.id);
                                setDeletedProductIds((prev) => new Set([...prev, p.id]));
                              } catch {
                                Alert.alert(t.error, 'Gagal menghapus produk.');
                              }
                            },
                          },
                        ]);
                      }}
                    >
                      <Ionicons name="trash-outline" size={16} color={C.error} />
                    </TouchableOpacity>
                  </View>
                )}
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
              colors={[C.primaryLight, C.primaryDark]}
              style={styles.ctaGrad}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Ionicons name="add-circle-outline" size={22} color="#FFFFFF" />
              <Text style={styles.ctaText}>{t.addProductToTrip}</Text>
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
              colors={[C.primaryLight, C.primaryDark]}
              style={styles.ctaGrad}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Ionicons name="bag-add-outline" size={22} color="#FFFFFF" />
              <Text style={styles.ctaText}>{t.requestItemFromTrip}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
