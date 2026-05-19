//app/product/[id].tsx
/**
 * TipL — Product Detail Page
 * Gold luxury theme. Supports both mock (p1, p2…) and Supabase UUID products.
 * Theme-aware: supports Dark Mode & Light Mode.
 */
import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Typography, Spacing, BorderRadius, Shadows } from '@/src/lib/constants';
import { JASTIP_PRODUCTS, MOCK_TRIPS } from '@/src/lib/mockData';
import { getProductWithTripInfo } from '@/src/services/supabase/trips';
import { useSettingsStore } from '@/src/store/settingsStore';
import { useCartStore } from '@/src/store/cartStore';
import { useAuthStore } from '@/src/store/authStore';
import { isWishlisted, toggleWishlist } from '@/src/services/supabase/wishlist';
import * as Haptics from 'expo-haptics';
import { useThemeColors } from '@/src/lib/hooks/useThemeColors';

const fmtIDR = (v: number) => 'Rp ' + v.toLocaleString('id-ID');
const isMockId = (id: string) => /^p\d+$/.test(id);

type ProductDisplay = {
  id: string;
  name: string;
  category: string;
  description: string;
  destination: string;
  imageUrl: string;
  priceMin: number;
  priceMax: number | null;
  stock: number | null;
  weight: number | null;
  travelerName: string;
  travelerAvatar: string | null;
  travelerRating: number;
  travelerVerified: boolean;
  travelerId: string;
  tripId?: string;
};

export default function ProductDetailScreen() {
  const C = useThemeColors();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useSettingsStore();
  const addItem = useCartStore((s) => s.addItem);
  const currentUserId = useAuthStore((s) => s.user?.id ?? '');
  const [product, setProduct] = useState<ProductDisplay | null>(null);
  const [loading, setLoading] = useState(true);
  const [wishlisted, setWishlisted] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  // Load wishlist state once product is known and user is logged in
  useEffect(() => {
    if (!currentUserId || !id || isMockId(id)) return;
    isWishlisted(currentUserId, id).then(setWishlisted).catch(() => {});
  }, [currentUserId, id]);

  const handleToggleWishlist = async () => {
    if (!currentUserId || !id || isMockId(id)) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setWishlistLoading(true);
    try {
      const nowWishlisted = await toggleWishlist(currentUserId, id);
      setWishlisted(nowWishlisted);
    } catch {
      Alert.alert('Gagal', 'Tidak bisa update wishlist. Coba lagi.');
    } finally {
      setWishlistLoading(false);
    }
  };

  useEffect(() => {
    if (!id) { setLoading(false); return; }

    if (isMockId(id)) {
      const mock = JASTIP_PRODUCTS.find((p) => p.id === id);
      if (mock) {
        setProduct({
          id: mock.id,
          name: mock.name,
          category: mock.category,
          description: mock.description,
          destination: mock.destination,
          imageUrl: mock.imageUrl,
          priceMin: mock.priceIDR,
          priceMax: null,
          stock: mock.stock ?? null,
          weight: mock.weight ?? null,
          travelerName: mock.travelerName,
          travelerAvatar: mock.travelerAvatar ?? null,
          travelerRating: mock.travelerRating,
          travelerVerified: mock.travelerVerified,
          travelerId: mock.travelerId,
          tripId: MOCK_TRIPS.find((t) => t.travelerId === mock.travelerId)?.id,
        });
      }
      setLoading(false);
    } else {
      getProductWithTripInfo(id)
        .then((data) => {
          if (data) {
            setProduct({
              id: data.id,
              name: data.name,
              category: data.category ?? 'Item',
              description: data.description ?? '',
              destination: data.trips?.destination_country ?? data.trips?.destination_city ?? 'Unknown',
              imageUrl: data.image_urls?.[0] ?? 'https://images.unsplash.com/photo-1560343090-f0409e92791a?w=400',
              priceMin: data.price_min ?? 0,
              priceMax: data.price_max ?? null,
              stock: null,
              weight: null,
              travelerName: data.profiles?.full_name ?? 'Traveler',
              travelerAvatar: data.profiles?.avatar_url ?? null,
              travelerRating: data.profiles?.rating ?? 0,
              travelerVerified: !!data.profiles,
              travelerId: data.triper_id,
              tripId: (data as any).trip_id ?? undefined,
            });
          }
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [id]);

  const st = React.useMemo(() => StyleSheet.create({
    safe: { flex: 1, backgroundColor: C.white },
    loadingScreen: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: C.white },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md },
    emptyTxt: { fontFamily: Typography.medium.fontFamily, fontSize: Typography.sizes.base, color: C.darkGray },
    backLink: { paddingHorizontal: Spacing.xl, paddingVertical: Spacing.sm, backgroundColor: C.primary + '18', borderRadius: BorderRadius.full, borderWidth: 1, borderColor: C.primary },
    backLinkTxt: { fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.sm, color: C.primary },

    // Hero
    heroWrap: { width: '100%', height: 340, position: 'relative' },
    heroImg: { width: '100%', height: '100%' },
    heroTop: { position: 'absolute', top: 0, left: 0, right: 0, height: 120 },
    heroBottom: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 100, justifyContent: 'flex-end', paddingHorizontal: Spacing.xl, paddingBottom: Spacing.base },
    heroNav: { position: 'absolute', top: 0, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: Spacing.base },
    navBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.35)', alignItems: 'center', justifyContent: 'center' },
    navBtnActive: { backgroundColor: 'rgba(248,113,113,0.25)' },
    destBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start', backgroundColor: 'rgba(197,162,103,0.25)', paddingHorizontal: Spacing.md, paddingVertical: 5, borderRadius: BorderRadius.full, borderWidth: 1, borderColor: C.primary },
    destBadgeTxt: { fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.xs, color: C.primary },

    // Body
    body: { flex: 1, backgroundColor: C.white },
    nameSection: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.xl, paddingBottom: Spacing.base },
    cat: { fontFamily: Typography.regular.fontFamily, fontSize: 11, color: C.primary, letterSpacing: 1.5, marginBottom: Spacing.xs },
    name: { fontFamily: Typography.serifBold.fontFamily, fontSize: Typography.sizes['2xl'], color: C.nearBlack, marginBottom: Spacing.md, lineHeight: 34 },
    price: { fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.xl, color: C.nearBlack, marginBottom: Spacing.md },
    metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
    metaPill: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: C.primary + '15', paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, borderRadius: BorderRadius.full, borderWidth: 1, borderColor: C.primary },
    metaTxt: { fontFamily: Typography.medium.fontFamily, fontSize: Typography.sizes.xs, color: C.primary },

    hr: { height: 1, backgroundColor: C.lightGray, marginVertical: Spacing.xs },

    sectionBlock: { paddingHorizontal: Spacing.xl, paddingVertical: Spacing.xl },
    sectionTitle: { fontFamily: Typography.serifBold.fontFamily, fontSize: Typography.sizes.lg, color: C.nearBlack, marginBottom: Spacing.md },
    desc: { fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.base, color: C.charcoal, lineHeight: 24 },

    // Traveler
    travelerCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.offWhite, borderRadius: BorderRadius.lg, padding: Spacing.base, borderWidth: 1, borderColor: C.lightGray, gap: Spacing.md },
    travelerAvatar: { width: 52, height: 52, borderRadius: 26 },
    travelerAvatarFallback: { backgroundColor: C.offWhite, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: C.primary },
    avatarInitials: { fontFamily: Typography.regular.fontFamily, fontSize: 20, color: C.primary },
    travelerInfo: { flex: 1 },
    travelerNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    travelerName: { fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.base, color: C.nearBlack },
    verifiedBadge: { width: 16, height: 16, borderRadius: 8, backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center' },
    ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 4 },
    ratingRowStar: { color: C.primary },
    ratingTxt: { fontFamily: Typography.medium.fontFamily, fontSize: Typography.sizes.sm, color: C.nearBlack },
    verifiedTxt: { fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.xs, color: C.darkGray },

    // How it works
    howItWorksCard: { marginHorizontal: Spacing.xl, marginBottom: Spacing.xl, backgroundColor: C.primary + '15', borderRadius: BorderRadius.lg, padding: Spacing.base, borderWidth: 1, borderColor: C.primary },
    howTitle: { fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.sm, color: C.nearBlack, marginBottom: Spacing.md },
    howStep: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.md },
    howIconWrap: { width: 32, height: 32, borderRadius: 16, backgroundColor: C.white, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: C.primary },
    howTxt: { flex: 1, fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.xs, color: C.charcoal, lineHeight: 17 },

    // Bottom bar
    bottomBar: {
      position: 'absolute', bottom: 0, left: 0, right: 0,
      flexDirection: 'row', alignItems: 'center',
      backgroundColor: C.white, paddingHorizontal: Spacing.base,
      paddingTop: Spacing.md, paddingBottom: 34,
      gap: Spacing.sm, borderTopWidth: 1, borderTopColor: C.lightGray, ...Shadows.md,
    },
    iconCta: { width: 48, height: 48, borderRadius: BorderRadius.md, borderWidth: 1.5, borderColor: C.primary, alignItems: 'center', justifyContent: 'center', backgroundColor: C.primary + '18' },
    buyBtn: { flex: 1, height: 48, borderRadius: BorderRadius.md, overflow: 'hidden' },
    buyGrad: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm },
    buyTxt: { fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.base, color: '#FFFFFF' },
    buyPrice: { fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.sm, color: 'rgba(255,255,255,0.85)' },
    ownProductBanner: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, backgroundColor: C.offWhite, borderRadius: BorderRadius.md, paddingVertical: Spacing.md, borderWidth: 1, borderColor: C.lightGray },
    ownProductTxt: { fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.sm, color: C.darkGray },
  }), [C]);

  if (loading) {
    return (
      <View style={st.loadingScreen}>
        <ActivityIndicator size="large" color={C.primary} />
      </View>
    );
  }

  if (!product) {
    return (
      <SafeAreaView style={st.safe} edges={['top']}>
        <View style={st.center}>
          <Ionicons name="cube-outline" size={48} color={C.midGray} />
          <Text style={st.emptyTxt}>{t.productNotFound}</Text>
          <TouchableOpacity style={st.backLink} onPress={() => router.back()}>
            <Text style={st.backLinkTxt}>Go back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const isOwnProduct = !!currentUserId && currentUserId === product.travelerId;

  const handleChat = () => {
  if (!product?.travelerId) {
    Alert.alert('Chat', 'Info triper tidak tersedia.');
    return;
  }
  if (isOwnProduct) {
    Alert.alert('Chat', 'Ini adalah item milikmu sendiri.');
    return;
  }
  router.push({
    pathname: '/chat/[id]',
    params: {
      id: product.travelerId,
      receiverId: product.travelerId,
      productId: product.id,
      productName: product.name,
      productPrice: String(product.priceMin),
      productImage: product.imageUrl,
    },
  } as any);
};

  const handleAddToCart = () => {
    if (isOwnProduct) {
      Alert.alert('Produk Sendiri', 'Kamu tidak bisa memesan produkmu sendiri.');
      return;
    }
    addItem({
      id: product.id,
      name: product.name,
      price: product.priceMin,
      quantity: 1,
      imageUrl: product.imageUrl,
      travelerId: product.travelerId,
      travelerName: product.travelerName,
      tripId: product.tripId,
    });
    Alert.alert(t.addedToCart, `${product.name} ${t.addedToCartMsg}`);
  };

  const priceLabel = product.priceMax && product.priceMax !== product.priceMin
    ? `${fmtIDR(product.priceMin)} – ${fmtIDR(product.priceMax)}`
    : fmtIDR(product.priceMin);

  return (
    <View style={st.safe}>
      {/* Image Hero */}
      <View style={st.heroWrap}>
        <Image source={{ uri: product.imageUrl }} style={st.heroImg} contentFit="cover" transition={300} />
        <LinearGradient colors={['rgba(20,10,2,0.5)', 'transparent']} style={st.heroTop} />
        <SafeAreaView edges={['top']} style={st.heroNav}>
          <TouchableOpacity style={st.navBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[st.navBtn, wishlisted && st.navBtnActive]}
            onPress={handleToggleWishlist}
            disabled={wishlistLoading || isMockId(id ?? '')}
          >
            {wishlistLoading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Ionicons
                name={wishlisted ? 'heart' : 'heart-outline'}
                size={22}
                color={wishlisted ? '#F87171' : '#FFFFFF'}
              />
            )}
          </TouchableOpacity>
        </SafeAreaView>
        <LinearGradient colors={['transparent', 'rgba(20,10,2,0.75)']} style={st.heroBottom}>
          <View style={st.destBadge}>
            <Ionicons name="location" size={13} color={C.primary} />
            <Text style={st.destBadgeTxt}>{product.destination}</Text>
          </View>
        </LinearGradient>
      </View>

      <ScrollView style={st.body} showsVerticalScrollIndicator={false}>
        {/* Category + Name */}
        <View style={st.nameSection}>
          <Text style={st.cat}>{product.category.toUpperCase()}</Text>
          <Text style={st.name}>{product.name}</Text>

          {/* Price */}
          <Text style={st.price}>{priceLabel}</Text>

          {/* Meta Badges */}
          <View style={st.metaRow}>
            {product.stock != null && (
              <View style={st.metaPill}>
                <Ionicons name="cube-outline" size={14} color={C.primary} />
                <Text style={st.metaTxt}>Stock: {product.stock}</Text>
              </View>
            )}
            {product.weight != null && (
              <View style={st.metaPill}>
                <Ionicons name="scale-outline" size={14} color={C.primary} />
                <Text style={st.metaTxt}>{product.weight} kg</Text>
              </View>
            )}
            <View style={st.metaPill}>
              <Ionicons name="shield-checkmark-outline" size={14} color={C.success} />
              <Text style={[st.metaTxt, { color: C.success }]}>{t.escrowProtected}</Text>
            </View>
          </View>
        </View>

        <View style={st.hr} />

        {/* Description */}
        {!!product.description && (
          <>
            <View style={st.sectionBlock}>
              <Text style={st.sectionTitle}>{t.descriptionLabel}</Text>
              <Text style={st.desc}>{product.description}</Text>
            </View>
            <View style={st.hr} />
          </>
        )}

        {/* Traveler Info */}
        <View style={st.sectionBlock}>
          <Text style={st.sectionTitle}>{t.travelerJastiper}</Text>
          <TouchableOpacity
            style={st.travelerCard}
            activeOpacity={0.75}
            onPress={() => router.push(`/triper/${product.travelerId}` as any)}
          >
            {product.travelerAvatar ? (
              <Image source={{ uri: product.travelerAvatar }} style={st.travelerAvatar} contentFit="cover" />
            ) : (
              <View style={[st.travelerAvatar, st.travelerAvatarFallback]}>
                <Text style={st.avatarInitials}>{product.travelerName[0]}</Text>
              </View>
            )}
            <View style={st.travelerInfo}>
              <View style={st.travelerNameRow}>
                <Text style={st.travelerName}>{product.travelerName}</Text>
                {product.travelerVerified && (
                  <View style={st.verifiedBadge}>
                    <Ionicons name="checkmark" size={10} color="#FFFFFF" />
                  </View>
                )}
              </View>
              <View style={st.ratingRow}>
                <Ionicons name="star" size={13} color={C.primary} style={st.ratingRowStar} />
                <Text style={st.ratingTxt}>
                  {product.travelerRating > 0 ? product.travelerRating.toFixed(1) : '—'}
                </Text>
                <Text style={st.verifiedTxt}>
                  {product.travelerVerified ? ` · ${t.verifiedTraveler}` : ''}
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={C.midGray} />
          </TouchableOpacity>
        </View>

        {/* How It Works */}
        <View style={st.howItWorksCard}>
          <Text style={st.howTitle}>{t.howItWorks}</Text>
          {[
            { icon: 'cart-outline', text: t.howStep1 },
            { icon: 'airplane-outline', text: t.howStep2 },
            { icon: 'checkmark-circle-outline', text: t.howStep3 },
          ].map((step, i) => (
            <View key={i} style={st.howStep}>
              <View style={st.howIconWrap}>
                <Ionicons name={step.icon as any} size={16} color={C.primary} />
              </View>
              <Text style={st.howTxt}>{step.text}</Text>
            </View>
          ))}
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Bottom CTA */}
      <View style={st.bottomBar}>
        {isOwnProduct ? (
          <View style={st.ownProductBanner}>
            <Ionicons name="person-circle-outline" size={20} color={C.darkGray} />
            <Text style={st.ownProductTxt}>Ini produk milikmu sendiri</Text>
          </View>
        ) : (
          <>
            <TouchableOpacity style={st.iconCta} onPress={handleChat}>
              <Ionicons name="chatbubble-outline" size={22} color={C.primary} />
            </TouchableOpacity>
            <TouchableOpacity style={st.iconCta} onPress={handleAddToCart}>
              <Ionicons name="cart-outline" size={22} color={C.primary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={st.buyBtn}
              activeOpacity={0.85}
              onPress={() => { handleAddToCart(); router.push('/cart'); }}
            >
              <LinearGradient
                colors={[C.primary, C.primary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={st.buyGrad}
              >
                <Text style={st.buyTxt}>{t.orderNow}</Text>
                <Text style={st.buyPrice}>{fmtIDR(product.priceMin)}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
}
