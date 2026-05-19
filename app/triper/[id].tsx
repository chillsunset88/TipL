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
import { Typography, Spacing, BorderRadius, Shadows, CATEGORY_MAP } from '@/src/lib/constants';
import { Avatar } from '@/src/components/ui/Avatar';
import { useAuthStore } from '@/src/store/authStore';
import { useSettingsStore } from '@/src/store/settingsStore';
import { getProfile } from '@/src/services/supabase/profiles';
import { getMyTrips, getProductsByTriper } from '@/src/services/supabase/trips';
import { isFavoriteTriper, toggleFavoriteTriper } from '@/src/services/supabase/favorites';
import { getReviewsForUser, type ReviewWithProfile } from '@/src/services/supabase/reviews';
import type { Database } from '@/src/lib/database.types';
import { useThemeColors } from '@/src/lib/hooks/useThemeColors';

type Profile = Database['public']['Tables']['profiles']['Row'];
type Trip = Database['public']['Tables']['trips']['Row'];
type Product = Database['public']['Tables']['products']['Row'];

const { width: SW } = Dimensions.get('window');
const PROD_W = (SW - Spacing.xl * 2 - Spacing.md) / 2;

const fmtIDR = (v: number | null) => v != null ? 'Rp ' + v.toLocaleString('id-ID') : null;

function fmtDate(iso: string | null | undefined) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

function fmtDateRange(dep: string | null | undefined, ret: string | null | undefined, departingLabel = 'Departing') {
  const d = fmtDate(dep);
  const r = fmtDate(ret);
  if (d && r) return `${d}  –  ${r}`;
  if (d) return `${departingLabel} ${d}`;
  return null;
}

export default function TriperProfileScreen() {
  const C = useThemeColors();
  const { id } = useLocalSearchParams<{ id: string }>();
  const currentUser = useAuthStore((s) => s.user);
  const isOwnProfile = currentUser?.id === id;

  const { t } = useSettingsStore();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<ReviewWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [followed, setFollowed] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      getProfile(id),
      getMyTrips(id),
      getProductsByTriper(id),
      getReviewsForUser(id),
    ]).then(([prof, trps, prods, revs]) => {
      setProfile(prof);
      setTrips(trps.filter((t) => t.status === 'open'));
      setProducts(prods);
      setReviews(revs);
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

  const s = React.useMemo(() => StyleSheet.create({
    safe: { flex: 1, backgroundColor: C.offWhite },
    loadWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: C.offWhite },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md },
    centerTxt: { fontFamily: Typography.medium.fontFamily, fontSize: Typography.sizes.base, color: C.darkGray },
    centerLink: { fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.sm, color: C.primary },

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
      color: '#FFFFFF',
      letterSpacing: 0.3,
    },
    ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
    ratingTxt: { fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.sm, color: 'rgba(255,255,255,0.9)', marginLeft: 5 },
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
    statNum: { fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.xl, color: '#FFFFFF' },
    statLbl: { fontFamily: Typography.regular.fontFamily, fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 2 },
    statSep: { width: 1, height: 36, backgroundColor: 'rgba(255,255,255,0.18)' },

    followBtn: {
      flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
      backgroundColor: C.primary,
      paddingHorizontal: Spacing['2xl'], paddingVertical: 11,
      borderRadius: BorderRadius.full, minWidth: 160, justifyContent: 'center',
    },
    followBtnDone: {
      backgroundColor: 'rgba(255,255,255,0.15)',
      borderWidth: 1.5,
      borderColor: 'rgba(248,113,113,0.6)',
    },
    followTxt: { fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.base, color: '#FFFFFF' },
    followTxtDone: { fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.base, color: '#F87171' },

    // ── Sections
    section: { paddingHorizontal: Spacing.xl, marginTop: Spacing.xl },
    sectionHead: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.md },
    sectionLabel: {
      fontFamily: Typography.regular.fontFamily,
      fontSize: 11, letterSpacing: 1.2,
      color: C.darkGray,
    },
    pill: {
      backgroundColor: C.primary + '15', borderRadius: BorderRadius.full,
      paddingHorizontal: 8, paddingVertical: 2,
      borderWidth: 1, borderColor: C.primary,
    },
    pillTxt: { fontFamily: Typography.regular.fontFamily, fontSize: 11, color: C.primary },

    // ── Trip cards
    tripCard: {
      flexDirection: 'row', alignItems: 'center',
      backgroundColor: C.white, borderRadius: BorderRadius.xl,
      borderWidth: 1, borderColor: C.lightGray,
      padding: Spacing.base, marginBottom: Spacing.sm,
      gap: Spacing.md, ...Shadows.sm,
    },
    tripIconCol: { alignItems: 'center' },
    tripPlaneCircle: {
      width: 36, height: 36, borderRadius: 18,
      backgroundColor: C.primary + '15',
      borderWidth: 1, borderColor: C.primary,
      alignItems: 'center', justifyContent: 'center',
    },
    tripInfo: { flex: 1, gap: 5 },
    tripRouteRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, flexWrap: 'wrap' },
    tripOrigin: { fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.sm, color: C.darkGray },
    tripDest: { fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.base, color: C.nearBlack },
    tripDate: { fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.xs, color: C.darkGray },
    tripRight: { alignItems: 'flex-end', gap: 6 },
    tripCapBadge: {
      backgroundColor: C.primary + '15', borderRadius: BorderRadius.full,
      paddingHorizontal: Spacing.sm, paddingVertical: 3,
      borderWidth: 1, borderColor: C.primary,
    },
    tripCapTxt: { fontFamily: Typography.regular.fontFamily, fontSize: 10, color: C.primary },

    // ── Product grid
    prodGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md },
    prodCard: {
      width: PROD_W, backgroundColor: C.white,
      borderRadius: BorderRadius.lg, overflow: 'hidden',
      borderWidth: 1, borderColor: C.lightGray,
      ...Shadows.sm,
    },
    prodImg: { width: '100%', height: 130 },
    prodImgEmpty: { alignItems: 'center', justifyContent: 'center' },
    catBadge: {
      position: 'absolute', top: Spacing.sm, left: Spacing.sm,
      paddingHorizontal: 6, paddingVertical: 2, borderRadius: BorderRadius.full,
    },
    catBadgeTxt: { fontFamily: Typography.medium.fontFamily, fontSize: 9, color: '#FFFFFF', letterSpacing: 0.3 },
    prodBody: { padding: Spacing.sm },
    prodName: { fontFamily: Typography.medium.fontFamily, fontSize: Typography.sizes.sm, color: C.charcoal, lineHeight: 18, marginBottom: 4 },
    prodPrice: { fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.sm, color: C.nearBlack },
    prodPriceMuted: { fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.xs, color: C.gray, fontStyle: 'italic' },

    emptyProd: { alignItems: 'center', paddingVertical: Spacing['2xl'], gap: Spacing.sm },
    emptyProdTxt: { fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.sm, color: C.darkGray },

    reviewList: { gap: Spacing.md },
    reviewCard: {
      backgroundColor: C.white, borderRadius: BorderRadius.lg,
      padding: Spacing.base, borderWidth: 1, borderColor: C.lightGray, ...Shadows.sm,
    },
    reviewHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.sm },
    reviewAvatar: {
      width: 36, height: 36, borderRadius: 18,
      backgroundColor: C.primary + '15', alignItems: 'center', justifyContent: 'center',
      overflow: 'hidden',
    },
    reviewAvatarImg: { width: 36, height: 36 },
    reviewAvatarTxt: { fontFamily: Typography.medium.fontFamily, fontSize: Typography.sizes.base, color: C.primary },
    reviewerName: { fontFamily: Typography.medium.fontFamily, fontSize: Typography.sizes.sm, color: C.nearBlack },
    reviewDate: { fontFamily: Typography.regular.fontFamily, fontSize: 10, color: C.gray, marginTop: 1 },
    reviewStars: { flexDirection: 'row', gap: 2 },
    reviewComment: {
      fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.sm,
      color: C.charcoal, lineHeight: 20,
      paddingTop: Spacing.sm, borderTopWidth: 1, borderTopColor: C.lightGray,
    },
  }), [C]);

  if (loading) {
    return (
      <View style={s.loadWrap}>
        <ActivityIndicator size="large" color={C.primary} />
      </View>
    );
  }

  if (!profile) {
    return (
      <SafeAreaView style={s.safe} edges={['top']}>
        <View style={s.center}>
          <Ionicons name="person-outline" size={48} color={C.midGray} />
          <Text style={s.centerTxt}>{t.profileNotFound}</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={s.centerLink}>{t.back}</Text>
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
            colors={['#8B6914', '#1A1A1A']}
            style={StyleSheet.absoluteFill}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
          <SafeAreaView edges={['top']}>
            <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
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
                    color={C.primary}
                  />
                ))}
                <Text style={s.ratingTxt}>{profile.rating!.toFixed(1)}</Text>
              </View>
            ) : (
              <Text style={s.noRatingTxt}>{t.noReviews}</Text>
            )}

            {/* Stats */}
            <View style={s.statsCard}>
              <View style={s.statItem}>
                <Text style={s.statNum}>{profile.total_trips ?? 0}</Text>
                <Text style={s.statLbl}>{t.tripsStatLabel}</Text>
              </View>
              <View style={s.statSep} />
              <View style={s.statItem}>
                <Text style={s.statNum}>{visibleProducts.length}</Text>
                <Text style={s.statLbl}>{t.productsStatLabel}</Text>
              </View>
              <View style={s.statSep} />
              <View style={s.statItem}>
                <Text style={s.statNum}>{profile.total_reviews ?? 0}</Text>
                <Text style={s.statLbl}>{t.reviewsStatLabel}</Text>
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
                  <ActivityIndicator size="small" color={followed ? C.error : '#FFFFFF'} />
                ) : followed ? (
                  <>
                    <Ionicons name="heart" size={16} color={C.error} />
                    <Text style={s.followTxtDone}>{t.following}</Text>
                  </>
                ) : (
                  <>
                    <Ionicons name="heart-outline" size={16} color="#FFFFFF" />
                    <Text style={s.followTxt}>{t.followTriper}</Text>
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
              <Text style={s.sectionLabel}>{t.activeTripsSectionTitle}</Text>
              <View style={s.pill}>
                <Text style={s.pillTxt}>{trips.length}</Text>
              </View>
            </View>

            {trips.map((trip) => {
              const dest = trip.destination_city ?? trip.destination_country;
              const dateRange = fmtDateRange(trip.departure_date, trip.return_date, t.departingOn);
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
                      <Ionicons name="airplane" size={16} color={C.primary} />
                    </View>
                  </View>

                  {/* Info */}
                  <View style={s.tripInfo}>
                    <View style={s.tripRouteRow}>
                      <Text style={s.tripOrigin}>{trip.origin_country}</Text>
                      <Ionicons name="arrow-forward" size={13} color={C.primary} />
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
                    <Ionicons name="chevron-forward" size={16} color={C.midGray} />
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* ── Produk ── */}
        <View style={s.section}>
          <View style={s.sectionHead}>
            <Text style={s.sectionLabel}>{t.productsSectionTitle}</Text>
            {visibleProducts.length > 0 && (
              <View style={s.pill}>
                <Text style={s.pillTxt}>{visibleProducts.length}</Text>
              </View>
            )}
          </View>

          {visibleProducts.length === 0 ? (
            <View style={s.emptyProd}>
              <Ionicons name="cube-outline" size={36} color={C.midGray} />
              <Text style={s.emptyProdTxt}>{t.triperNoProducts}</Text>
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
                        <Ionicons name={(catInfo?.icon ?? 'cube-outline') as any} size={34} color={catInfo?.color ?? C.midGray} />
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
                        : <Text style={s.prodPriceMuted}>{t.priceTbd}</Text>
                      }
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

        {/* ── Ulasan ── */}
        <View style={s.section}>
          <View style={s.sectionHead}>
            <Text style={s.sectionLabel}>ULASAN PEMBELI</Text>
            {reviews.length > 0 && (
              <View style={s.pill}>
                <Text style={s.pillTxt}>{reviews.length}</Text>
              </View>
            )}
          </View>

          {reviews.length === 0 ? (
            <View style={s.emptyProd}>
              <Ionicons name="star-outline" size={36} color={C.midGray} />
              <Text style={s.emptyProdTxt}>Belum ada ulasan</Text>
            </View>
          ) : (
            <View style={s.reviewList}>
              {reviews.map((r) => {
                const reviewer = r.reviewer as any;
                const name = reviewer?.full_name ?? 'Pengguna';
                const avatar = reviewer?.avatar_url ?? null;
                const date = r.created_at
                  ? new Date(r.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
                  : '';
                return (
                  <View key={r.id} style={s.reviewCard}>
                    <View style={s.reviewHeader}>
                      <View style={s.reviewAvatar}>
                        {avatar ? (
                          <Image source={{ uri: avatar }} style={s.reviewAvatarImg} contentFit="cover" />
                        ) : (
                          <Text style={s.reviewAvatarTxt}>{name[0]?.toUpperCase()}</Text>
                        )}
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={s.reviewerName}>{name}</Text>
                        <Text style={s.reviewDate}>{date}</Text>
                      </View>
                      <View style={s.reviewStars}>
                        {[1,2,3,4,5].map((i) => (
                          <Ionicons
                            key={i}
                            name={i <= r.rating ? 'star' : 'star-outline'}
                            size={13}
                            color={C.primary}
                          />
                        ))}
                      </View>
                    </View>
                    {r.comment ? (
                      <Text style={s.reviewComment}>{r.comment}</Text>
                    ) : null}
                  </View>
                );
              })}
            </View>
          )}
        </View>

      </ScrollView>
    </View>
  );
}
