import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Dimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/src/lib/constants';
import { Avatar } from '@/src/components/ui/Avatar';
import { useAuthStore } from '@/src/store/authStore';
import { getProfile } from '@/src/services/supabase/profiles';
import { getMyTrips, getProductsByTriper } from '@/src/services/supabase/trips';
import { isFavoriteTriper, toggleFavoriteTriper } from '@/src/services/supabase/favorites';
import type { Database } from '@/src/lib/database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];
type Trip = Database['public']['Tables']['trips']['Row'];
type Product = Database['public']['Tables']['products']['Row'];

const { width: SW } = Dimensions.get('window');
const PROD_W = (SW - Spacing.xl * 2 - Spacing.md) / 2;

const CATEGORY_MAP: Record<string, { label: string; icon: string; color: string }> = {
  luxury:      { label: 'Luxury Goods',     icon: 'diamond-outline',         color: '#A78BFA' },
  skincare:    { label: 'Skincare',          icon: 'leaf-outline',            color: '#34D399' },
  food:        { label: 'Food & Beverages',  icon: 'restaurant-outline',      color: '#F97316' },
  electronics: { label: 'Electronics',       icon: 'hardware-chip-outline',   color: '#60A5FA' },
  fashion:     { label: 'Fashion',           icon: 'shirt-outline',           color: '#F472B6' },
  toys:        { label: 'Toys & Games',      icon: 'game-controller-outline', color: '#FBBF24' },
  books:       { label: 'Books',             icon: 'book-outline',            color: '#6EE7B7' },
  other:       { label: 'Other',             icon: 'grid-outline',            color: '#94A3B8' },
};

const fmtIDR = (v: number | null) => v != null ? 'Rp ' + v.toLocaleString('id-ID') : null;

function fmtDate(iso: string | null | undefined) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

function fmtDateRange(dep: string | null | undefined, ret: string | null | undefined) {
  const d = fmtDate(dep);
  const r = fmtDate(ret);
  if (d && r) return `${d}  –  ${r}`;
  if (d) return `Berangkat ${d}`;
  return null;
}

export default function TriperProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const currentUser = useAuthStore((s) => s.user);
  const isOwnProfile = currentUser?.id === id;

  const [profile, setProfile] = useState<Profile | null>(null);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [followed, setFollowed] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      getProfile(id),
      getMyTrips(id),
      getProductsByTriper(id),
    ]).then(([prof, trps, prods]) => {
      setProfile(prof);
      setTrips(trps.filter((t) => t.status === 'open'));
      setProducts(prods);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!currentUser || !id || isOwnProfile) return;
    isFavoriteTriper(currentUser.id, id).then(setFollowed).catch(() => {});
  }, [currentUser, id, isOwnProfile]);

  const handleFollow = async () => {
    if (!currentUser || !id) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setFollowLoading(true);
    try {
      const now = await toggleFavoriteTriper(currentUser.id, id);
      setFollowed(now);
    } finally {
      setFollowLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={s.loadWrap}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!profile) {
    return (
      <SafeAreaView style={s.safe} edges={['top']}>
        <View style={s.center}>
          <Ionicons name="person-outline" size={48} color={Colors.midGray} />
          <Text style={s.centerTxt}>Profil tidak ditemukan</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={s.centerLink}>Kembali</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const visibleProducts = products.filter((p) => p.name?.trim());

  return (
    <View style={s.safe}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

        {/* ── Hero ── */}
        <View style={s.hero}>
          <LinearGradient
            colors={['#8B6914', Colors.charcoal]}
            style={StyleSheet.absoluteFill}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
          <SafeAreaView edges={['top']}>
            <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={20} color={Colors.white} />
            </TouchableOpacity>
          </SafeAreaView>

          <View style={s.heroBody}>
            {/* Avatar */}
            <View style={s.avatarRing}>
              <Avatar uri={profile.avatar_url ?? null} name={profile.full_name ?? 'T'} size="xl" />
            </View>

            <Text style={s.heroName}>{profile.full_name ?? 'Tripper'}</Text>

            {/* Rating */}
            {(profile.rating ?? 0) > 0 ? (
              <View style={s.ratingRow}>
                {[1,2,3,4,5].map((i) => (
                  <Ionicons
                    key={i}
                    name={i <= Math.round(profile.rating ?? 0) ? 'star' : 'star-outline'}
                    size={15}
                    color={Colors.primary}
                  />
                ))}
                <Text style={s.ratingTxt}>{profile.rating!.toFixed(1)}</Text>
              </View>
            ) : (
              <Text style={s.noRatingTxt}>Belum ada ulasan</Text>
            )}

            {/* Stats */}
            <View style={s.statsCard}>
              <View style={s.statItem}>
                <Text style={s.statNum}>{profile.total_trips ?? 0}</Text>
                <Text style={s.statLbl}>Trips</Text>
              </View>
              <View style={s.statSep} />
              <View style={s.statItem}>
                <Text style={s.statNum}>{visibleProducts.length}</Text>
                <Text style={s.statLbl}>Produk</Text>
              </View>
              <View style={s.statSep} />
              <View style={s.statItem}>
                <Text style={s.statNum}>{profile.total_reviews ?? 0}</Text>
                <Text style={s.statLbl}>Ulasan</Text>
              </View>
            </View>

            {/* Follow button */}
            {!isOwnProfile && (
              <TouchableOpacity
                style={[s.followBtn, followed && s.followBtnDone]}
                onPress={handleFollow}
                disabled={followLoading}
                activeOpacity={0.85}
              >
                {followLoading ? (
                  <ActivityIndicator size="small" color={followed ? Colors.error : Colors.white} />
                ) : followed ? (
                  <>
                    <Ionicons name="heart" size={16} color={Colors.error} />
                    <Text style={s.followTxtDone}>Mengikuti</Text>
                  </>
                ) : (
                  <>
                    <Ionicons name="heart-outline" size={16} color={Colors.white} />
                    <Text style={s.followTxt}>Ikuti Tripper</Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* ── Trip Aktif ── */}
        {trips.length > 0 && (
          <View style={s.section}>
            <View style={s.sectionHead}>
              <Text style={s.sectionLabel}>TRIP AKTIF</Text>
              <View style={s.pill}>
                <Text style={s.pillTxt}>{trips.length}</Text>
              </View>
            </View>

            {trips.map((trip) => {
              const dest = trip.destination_city ?? trip.destination_country;
              const dateRange = fmtDateRange(trip.departure_date, trip.return_date);
              return (
                <TouchableOpacity
                  key={trip.id}
                  style={s.tripCard}
                  activeOpacity={0.8}
                  onPress={() => router.push(`/trip/${trip.id}`)}
                >
                  {/* Plane icon strip */}
                  <View style={s.tripIconCol}>
                    <View style={s.tripPlaneCircle}>
                      <Ionicons name="airplane" size={16} color={Colors.primary} />
                    </View>
                  </View>

                  {/* Info */}
                  <View style={s.tripInfo}>
                    <View style={s.tripRouteRow}>
                      <Text style={s.tripOrigin}>{trip.origin_country}</Text>
                      <Ionicons name="arrow-forward" size={13} color={Colors.primary} />
                      <Text style={s.tripDest}>{dest}</Text>
                    </View>
                    {dateRange && (
                      <Text style={s.tripDate}>{dateRange}</Text>
                    )}
                  </View>

                  {/* Right: cap + chevron */}
                  <View style={s.tripRight}>
                    {trip.capacity_kg != null && (
                      <View style={s.tripCapBadge}>
                        <Text style={s.tripCapTxt}>{trip.capacity_kg} kg</Text>
                      </View>
                    )}
                    <Ionicons name="chevron-forward" size={16} color={Colors.midGray} />
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* ── Produk ── */}
        <View style={s.section}>
          <View style={s.sectionHead}>
            <Text style={s.sectionLabel}>PRODUK</Text>
            {visibleProducts.length > 0 && (
              <View style={s.pill}>
                <Text style={s.pillTxt}>{visibleProducts.length}</Text>
              </View>
            )}
          </View>

          {visibleProducts.length === 0 ? (
            <View style={s.emptyProd}>
              <Ionicons name="cube-outline" size={36} color={Colors.midGray} />
              <Text style={s.emptyProdTxt}>Tripper belum menambahkan produk</Text>
            </View>
          ) : (
            <View style={s.prodGrid}>
              {visibleProducts.map((p) => {
                const img = Array.isArray(p.image_urls) && p.image_urls.length > 0
                  ? (p.image_urls as string[])[0] : null;
                const catInfo = p.category ? CATEGORY_MAP[p.category] ?? null : null;
                const price = fmtIDR(p.price_min ?? null);
                return (
                  <TouchableOpacity
                    key={p.id}
                    style={s.prodCard}
                    activeOpacity={0.85}
                    onPress={() => router.push(`/product/${p.id}`)}
                  >
                    {img ? (
                      <Image source={{ uri: img }} style={s.prodImg} contentFit="cover" transition={200} />
                    ) : (
                      <View style={[s.prodImg, s.prodImgEmpty, catInfo ? { backgroundColor: catInfo.color + '1A' } : undefined]}>
                        <Ionicons name={(catInfo?.icon ?? 'cube-outline') as any} size={34} color={catInfo?.color ?? Colors.midGray} />
                      </View>
                    )}
                    {catInfo && (
                      <View style={[s.catBadge, { backgroundColor: catInfo.color + 'DD' }]}>
                        <Text style={s.catBadgeTxt}>{catInfo.label}</Text>
                      </View>
                    )}
                    <View style={s.prodBody}>
                      <Text style={s.prodName} numberOfLines={2}>{p.name}</Text>
                      {price
                        ? <Text style={s.prodPrice}>{price}</Text>
                        : <Text style={s.prodPriceMuted}>Harga belum diset</Text>
                      }
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.offWhite },
  loadWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.offWhite },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md },
  centerTxt: { fontFamily: Typography.medium.fontFamily, fontSize: Typography.sizes.base, color: Colors.darkGray },
  centerLink: { fontFamily: Typography.semiBold.fontFamily, fontSize: Typography.sizes.sm, color: Colors.primary },

  // ── Hero
  hero: { paddingBottom: Spacing['3xl'] },
  backBtn: {
    margin: Spacing.base,
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: 'rgba(0,0,0,0.22)',
    alignItems: 'center', justifyContent: 'center',
  },
  heroBody: { alignItems: 'center', paddingHorizontal: Spacing.xl, gap: Spacing.md },
  avatarRing: {
    borderRadius: 50, borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.35)',
    padding: 3,
  },
  heroName: {
    fontFamily: Typography.serifBold.fontFamily,
    fontSize: Typography.sizes['2xl'],
    color: Colors.white,
    letterSpacing: 0.3,
  },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  ratingTxt: { fontFamily: Typography.semiBold.fontFamily, fontSize: Typography.sizes.sm, color: 'rgba(255,255,255,0.9)', marginLeft: 5 },
  noRatingTxt: { fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.xs, color: 'rgba(255,255,255,0.55)' },

  statsCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.13)',
    borderRadius: BorderRadius.xl,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing['2xl'],
    gap: Spacing['2xl'],
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  statItem: { alignItems: 'center', minWidth: 44 },
  statNum: { fontFamily: Typography.bold.fontFamily, fontSize: Typography.sizes.xl, color: Colors.white },
  statLbl: { fontFamily: Typography.regular.fontFamily, fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 2 },
  statSep: { width: 1, height: 36, backgroundColor: 'rgba(255,255,255,0.18)' },

  followBtn: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing['2xl'], paddingVertical: 11,
    borderRadius: BorderRadius.full, minWidth: 160, justifyContent: 'center',
  },
  followBtnDone: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1.5,
    borderColor: 'rgba(248,113,113,0.6)',
  },
  followTxt: { fontFamily: Typography.semiBold.fontFamily, fontSize: Typography.sizes.base, color: Colors.white },
  followTxtDone: { fontFamily: Typography.semiBold.fontFamily, fontSize: Typography.sizes.base, color: '#F87171' },

  // ── Sections
  section: { paddingHorizontal: Spacing.xl, marginTop: Spacing.xl },
  sectionHead: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.md },
  sectionLabel: {
    fontFamily: Typography.semiBold.fontFamily,
    fontSize: 11, letterSpacing: 1.2,
    color: Colors.darkGray,
  },
  pill: {
    backgroundColor: Colors.primaryPale, borderRadius: BorderRadius.full,
    paddingHorizontal: 8, paddingVertical: 2,
    borderWidth: 1, borderColor: Colors.primaryLight,
  },
  pillTxt: { fontFamily: Typography.bold.fontFamily, fontSize: 11, color: Colors.primary },

  // ── Trip cards
  tripCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.white, borderRadius: BorderRadius.xl,
    borderWidth: 1, borderColor: Colors.lightGray,
    padding: Spacing.base, marginBottom: Spacing.sm,
    gap: Spacing.md, ...Shadows.sm,
  },
  tripIconCol: { alignItems: 'center' },
  tripPlaneCircle: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.primaryPale,
    borderWidth: 1, borderColor: Colors.primaryLight,
    alignItems: 'center', justifyContent: 'center',
  },
  tripInfo: { flex: 1, gap: 5 },
  tripRouteRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, flexWrap: 'wrap' },
  tripOrigin: { fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.sm, color: Colors.darkGray },
  tripDest: { fontFamily: Typography.semiBold.fontFamily, fontSize: Typography.sizes.base, color: Colors.nearBlack },
  tripDate: { fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.xs, color: Colors.darkGray },
  tripRight: { alignItems: 'flex-end', gap: 6 },
  tripCapBadge: {
    backgroundColor: Colors.primaryPale, borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.sm, paddingVertical: 3,
    borderWidth: 1, borderColor: Colors.primaryLight,
  },
  tripCapTxt: { fontFamily: Typography.semiBold.fontFamily, fontSize: 10, color: Colors.primary },

  // ── Product grid
  prodGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md },
  prodCard: {
    width: PROD_W, backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg, overflow: 'hidden',
    borderWidth: 1, borderColor: Colors.lightGray,
    ...Shadows.sm,
  },
  prodImg: { width: '100%', height: 130 },
  prodImgEmpty: { alignItems: 'center', justifyContent: 'center' },
  catBadge: {
    position: 'absolute', top: Spacing.sm, left: Spacing.sm,
    paddingHorizontal: 6, paddingVertical: 2, borderRadius: BorderRadius.full,
  },
  catBadgeTxt: { fontFamily: Typography.medium.fontFamily, fontSize: 9, color: Colors.white, letterSpacing: 0.3 },
  prodBody: { padding: Spacing.sm },
  prodName: { fontFamily: Typography.medium.fontFamily, fontSize: Typography.sizes.sm, color: Colors.charcoal, lineHeight: 18, marginBottom: 4 },
  prodPrice: { fontFamily: Typography.bold.fontFamily, fontSize: Typography.sizes.sm, color: Colors.nearBlack },
  prodPriceMuted: { fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.xs, color: Colors.gray, fontStyle: 'italic' },

  emptyProd: { alignItems: 'center', paddingVertical: Spacing['2xl'], gap: Spacing.sm },
  emptyProdTxt: { fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.sm, color: Colors.darkGray },
});
