import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ScrollView, ActivityIndicator, Alert,
} from 'react-native';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/src/lib/constants';
import { Avatar } from '@/src/components/ui/Avatar';
import { getTripsByDestinationWithProducts, TripWithProducts } from '@/src/services/supabase/trips';
import { useAuthStore } from '@/src/store/authStore';
import { isFavoriteTriper, toggleFavoriteTriper } from '@/src/services/supabase/favorites';
import * as Haptics from 'expo-haptics';
import type { Database } from '@/src/lib/database.types';

type Product = Database['public']['Tables']['products']['Row'];

const PRODUCT_CARD_W = 130;
const HERO_H = 210;

const fmtIDR = (v: number | null) =>
  v != null ? 'Rp ' + v.toLocaleString('id-ID') : null;

export default function DestinationScreen() {
  const { name, imageUrl } = useLocalSearchParams<{ name: string; imageUrl?: string }>();
  const [tripers, setTripers] = useState<TripWithProducts[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!name) return;
    getTripsByDestinationWithProducts(name)
      .then(setTripers)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [name]);

  return (
    <View style={s.root}>
      {/* Hero */}
      <View style={s.hero}>
        {imageUrl ? (
          <Image
            source={{ uri: decodeURIComponent(imageUrl) }}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
          />
        ) : (
          <LinearGradient
            colors={[Colors.primaryDark, Colors.charcoal]}
            style={StyleSheet.absoluteFill}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
        )}
        <LinearGradient
          colors={['rgba(0,0,0,0.15)', 'rgba(20,14,6,0.72)']}
          style={StyleSheet.absoluteFill}
        />
        <SafeAreaView edges={['top']} style={s.heroInner}>
          <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color={Colors.white} />
          </TouchableOpacity>
          <View style={s.heroText}>
            <Text style={s.heroTitle}>{name}</Text>
            {!loading && (
              <Text style={s.heroSub}>
                {tripers.length > 0
                  ? `${tripers.length} triper aktif menuju ke sini`
                  : 'Belum ada triper ke destinasi ini'}
              </Text>
            )}
          </View>
        </SafeAreaView>
      </View>

      {/* List */}
      {loading ? (
        <ActivityIndicator color={Colors.primary} style={{ marginTop: Spacing['2xl'] }} />
      ) : (
        <FlatList
          data={tripers}
          keyExtractor={(item) => item.id}
          contentContainerStyle={s.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={s.empty}>
              <Ionicons name="airplane-outline" size={52} color={Colors.midGray} />
              <Text style={s.emptyTitle}>Belum ada triper</Text>
              <Text style={s.emptyDesc}>
                Saat ini belum ada jastiper yang pergi ke {name}.{'\n'}
                Cek lagi nanti ya!
              </Text>
            </View>
          }
          renderItem={({ item }) => <TriperCard trip={item} />}
        />
      )}
    </View>
  );
}

function TriperCard({ trip }: { trip: TripWithProducts }) {
  const name = trip.profiles?.full_name ?? 'Traveler';
  const avatar = trip.profiles?.avatar_url ?? null;
  const rating = trip.profiles?.rating ?? 0;
  const totalTrips = trip.profiles?.total_trips ?? 0;
  const currentUser = useAuthStore((s) => s.user);
  const currentUserId = currentUser?.id ?? '';
  const isOwnTrip = currentUserId === trip.triper_id;

  const [favorited, setFavorited] = useState(false);
  const [favLoading, setFavLoading] = useState(false);

  useEffect(() => {
    if (!currentUserId || isOwnTrip || !trip.triper_id) return;
    isFavoriteTriper(currentUserId, trip.triper_id).then(setFavorited).catch(() => {});
  }, [currentUserId, trip.triper_id, isOwnTrip]);

  const handleToggleFavorite = async () => {
    if (!currentUserId || !trip.triper_id) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setFavLoading(true);
    try {
      const now = await toggleFavoriteTriper(currentUserId, trip.triper_id);
      setFavorited(now);
    } finally {
      setFavLoading(false);
    }
  };

  const handleChat = () => {
    if (!trip.triper_id) return;
    router.push({
      pathname: '/chat/[id]',
      params: { id: trip.id, receiverId: trip.triper_id },
    } as any);
  };

  return (
    <View style={s.card}>
      {/* Triper info row */}
      <TouchableOpacity
        style={s.cardHead}
        activeOpacity={0.7}
        onPress={() => trip.triper_id && router.push(`/triper/${trip.triper_id}` as any)}
      >
        <Avatar uri={avatar} name={name} size="md" />
        <View style={s.triperInfo}>
          <Text style={s.triperName}>{name}</Text>
          <View style={s.ratingRow}>
            <Ionicons name="star" size={12} color={Colors.primary} />
            <Text style={s.ratingTxt}>{rating > 0 ? rating.toFixed(1) : '—'}</Text>
            <Text style={s.reviewCnt}>· {totalTrips} trips</Text>
          </View>
          {trip.departure_date ? (
            <View style={s.dateRow}>
              <Ionicons name="calendar-outline" size={11} color={Colors.darkGray} />
              <Text style={s.dateTxt}>{trip.departure_date}</Text>
            </View>
          ) : null}
        </View>
        <View style={s.cardHeadRight}>
          {trip.capacity_kg != null && (
            <View style={s.capBadge}>
              <Text style={s.capTxt}>{trip.capacity_kg} kg</Text>
            </View>
          )}
          {!isOwnTrip && (
            <TouchableOpacity
              style={[s.favBtn, favorited && s.favBtnActive]}
              onPress={handleToggleFavorite}
              disabled={favLoading}
            >
              {favLoading ? (
                <ActivityIndicator size="small" color={favorited ? Colors.error : Colors.midGray} />
              ) : (
                <Ionicons
                  name={favorited ? 'heart' : 'heart-outline'}
                  size={18}
                  color={favorited ? Colors.error : Colors.midGray}
                />
              )}
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>

      {/* Products */}
      {trip.products.length > 0 ? (
        <View style={s.productsBlock}>
          <Text style={s.productsLabel}>
            ITEM ({trip.products.length})
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.productsScroll}
          >
            {trip.products.map((p) => (
              <ProductMiniCard key={p.id} product={p} />
            ))}
          </ScrollView>
        </View>
      ) : (
        <View style={s.noProducts}>
          <Ionicons name="cube-outline" size={16} color={Colors.midGray} />
          <Text style={s.noProductsTxt}>Triper belum menambahkan item</Text>
        </View>
      )}

      {/* Footer buttons */}
      <View style={s.cardFoot}>
        {!isOwnTrip && (
          <TouchableOpacity style={s.chatBtn} onPress={handleChat}>
            <Ionicons name="chatbubble-outline" size={17} color={Colors.primary} />
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={s.outlineBtn}
          onPress={() => router.push(`/trip/${trip.id}`)}
        >
          <Ionicons name="bag-handle-outline" size={14} color={Colors.primary} />
          <Text style={s.outlineBtnTxt}>Request Item</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={s.primaryBtn}
          onPress={() => router.push(`/trip/${trip.id}`)}
        >
          <Text style={s.primaryBtnTxt}>Katalog</Text>
          <Ionicons name="chevron-forward" size={14} color={Colors.white} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

function ProductMiniCard({ product }: { product: Product }) {
  const firstImage =
    Array.isArray(product.image_urls) && product.image_urls.length > 0
      ? (product.image_urls as string[])[0]
      : null;
  const price = fmtIDR(product.price_min ?? null);

  return (
    <TouchableOpacity
      style={s.prodCard}
      activeOpacity={0.82}
      onPress={() => router.push(`/product/${product.id}`)}
    >
      {firstImage ? (
        <Image
          source={{ uri: firstImage }}
          style={s.prodImg}
          contentFit="cover"
          transition={200}
        />
      ) : (
        <View style={[s.prodImg, s.prodImgEmpty]}>
          <Ionicons name="image-outline" size={22} color={Colors.midGray} />
        </View>
      )}
      <View style={s.prodBody}>
        <Text style={s.prodName} numberOfLines={2}>{product.name}</Text>
        {price ? <Text style={s.prodPrice}>{price}</Text> : null}
        <View style={s.orderPill}>
          <Ionicons name="cart-outline" size={10} color={Colors.primary} />
          <Text style={s.orderPillTxt}>Pesan</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.offWhite },

  hero: {
    height: HERO_H,
    backgroundColor: Colors.nearBlack,
    justifyContent: 'flex-end',
  },
  heroInner: {
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.xl,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(0,0,0,0.38)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.base,
  },
  heroText: {},
  heroTitle: {
    fontFamily: Typography.serifBold.fontFamily,
    fontSize: Typography.sizes['3xl'],
    color: Colors.white,
    lineHeight: 38,
  },
  heroSub: {
    fontFamily: Typography.regular.fontFamily,
    fontSize: Typography.sizes.sm,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 5,
  },

  list: { padding: Spacing.base, paddingBottom: 100 },

  card: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.lightGray,
    overflow: 'hidden',
    ...Shadows.sm,
  },

  cardHead: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: Spacing.base,
    paddingBottom: Spacing.md,
  },
  triperInfo: { flex: 1, marginLeft: Spacing.md },
  cardHeadRight: { alignItems: 'flex-end', gap: Spacing.sm },
  triperName: {
    fontFamily: Typography.regular.fontFamily,
    fontSize: Typography.sizes.base,
    color: Colors.nearBlack,
  },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginTop: 3, gap: 3 },
  ratingTxt: {
    fontFamily: Typography.medium.fontFamily,
    fontSize: Typography.sizes.sm,
    color: Colors.nearBlack,
  },
  reviewCnt: {
    fontFamily: Typography.regular.fontFamily,
    fontSize: Typography.sizes.xs,
    color: Colors.darkGray,
  },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 5 },
  dateTxt: {
    fontFamily: Typography.regular.fontFamily,
    fontSize: Typography.sizes.xs,
    color: Colors.darkGray,
  },
  capBadge: {
    backgroundColor: Colors.primaryPale,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.primaryLight,
  },
  capTxt: {
    fontFamily: Typography.regular.fontFamily,
    fontSize: 11,
    color: Colors.primary,
  },

  productsBlock: {
    borderTopWidth: 1,
    borderTopColor: Colors.lightGray,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
  },
  productsLabel: {
    fontFamily: Typography.regular.fontFamily,
    fontSize: 10,
    color: Colors.darkGray,
    letterSpacing: 1,
    paddingHorizontal: Spacing.base,
    marginBottom: Spacing.sm,
  },
  productsScroll: {
    paddingHorizontal: Spacing.base,
    gap: Spacing.sm,
  },

  noProducts: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.lightGray,
  },
  noProductsTxt: {
    fontFamily: Typography.regular.fontFamily,
    fontSize: Typography.sizes.xs,
    color: Colors.midGray,
  },

  cardFoot: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.lightGray,
    gap: Spacing.sm,
  },
  chatBtn: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryPale,
    alignItems: 'center',
    justifyContent: 'center',
  },
  favBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.offWhite,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.lightGray,
  },
  favBtnActive: {
    backgroundColor: Colors.errorLight,
    borderColor: '#F5C6C6',
  },
  outlineBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  outlineBtnTxt: {
    fontFamily: Typography.regular.fontFamily,
    fontSize: Typography.sizes.sm,
    color: Colors.primary,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary,
  },
  primaryBtnTxt: {
    fontFamily: Typography.regular.fontFamily,
    fontSize: Typography.sizes.sm,
    color: Colors.white,
  },

  prodCard: {
    width: PRODUCT_CARD_W,
    backgroundColor: Colors.offWhite,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.lightGray,
  },
  prodImg: { width: '100%', height: 95 },
  prodImgEmpty: {
    backgroundColor: Colors.cream,
    alignItems: 'center',
    justifyContent: 'center',
  },
  prodBody: { padding: Spacing.sm },
  prodName: {
    fontFamily: Typography.medium.fontFamily,
    fontSize: Typography.sizes.xs,
    color: Colors.charcoal,
    lineHeight: 16,
    marginBottom: 3,
  },
  prodPrice: {
    fontFamily: Typography.regular.fontFamily,
    fontSize: Typography.sizes.xs,
    color: Colors.nearBlack,
    marginBottom: 5,
  },
  orderPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    alignSelf: 'flex-start',
    backgroundColor: Colors.primaryPale,
    borderRadius: BorderRadius.full,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: Colors.primaryLight,
  },
  orderPillTxt: {
    fontFamily: Typography.regular.fontFamily,
    fontSize: 9,
    color: Colors.primary,
  },

  empty: {
    alignItems: 'center',
    paddingTop: Spacing['5xl'],
    gap: Spacing.base,
    paddingHorizontal: Spacing['2xl'],
  },
  emptyTitle: {
    fontFamily: Typography.regular.fontFamily,
    fontSize: Typography.sizes.lg,
    color: Colors.charcoal,
  },
  emptyDesc: {
    fontFamily: Typography.regular.fontFamily,
    fontSize: Typography.sizes.sm,
    color: Colors.darkGray,
    textAlign: 'center',
    lineHeight: 20,
  },
});
