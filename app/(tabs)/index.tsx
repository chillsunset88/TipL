/**
 * TipL — Home Screen
 * Infinite parallax carousel + real products from Supabase filtered by destination.
 * Theme-aware: supports Dark Mode & Light Mode.
 */
import { BorderRadius, CATEGORY_MAP, Shadows, Spacing, Typography } from "@/src/lib/constants";
import { useNotificationStore } from "@/src/store/notificationStore";
import { useSettingsStore } from "@/src/store/settingsStore";
import { useCartStore } from "@/src/store/cartStore";
import { SkeletonProductGrid } from "@/src/components/ui/Skeleton";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Dimensions, Platform, ScrollView,
  StatusBar, StyleSheet, Text, TouchableOpacity, View, type GestureResponderEvent,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import Carousel from "react-native-reanimated-carousel";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { getProductsByDestination, ProductWithTripInfo } from "@/src/services/supabase/trips";
import { useThemeColors, useIsDark } from "@/src/lib/hooks/useThemeColors";

const { width: SW } = Dimensions.get("window");

const DESTINATION_BANNERS = [
  { id: "sg", destination: "Singapore", title: "Singapore Deals", subtitle: "Best snacks & fashion from the Lion City", imageUrl: "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800" },
  { id: "jp", destination: "Japan", title: "Tokyo Exclusive", subtitle: "Limited edition goods from Shibuya & Akihabara", imageUrl: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800" },
  { id: "kr", destination: "South Korea", title: "Seoul Beauty", subtitle: "K-Beauty & skincare favorites delivered to you", imageUrl: "https://images.unsplash.com/photo-1538485399081-7191377e8241?w=800" },
  { id: "uk", destination: "London", title: "London Premium", subtitle: "Luxury brands and iconic British tea", imageUrl: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800" },
];

const fmtPrice = (min: number | null, max: number | null, negotiableLabel: string) => {
  if (min == null && max == null) return negotiableLabel;
  if (min != null && max != null && min !== max)
    return `Rp ${min.toLocaleString("id-ID")} – Rp ${max.toLocaleString("id-ID")}`;
  const val = min ?? max!;
  return "Rp " + val.toLocaleString("id-ID");
};

export default function HomeScreen() {
  const C = useThemeColors();
  const isDark = useIsDark();
  const insets = useSafeAreaInsets();
  const [carouselIdx, setCarouselIdx] = useState(0);
  const { t } = useSettingsStore();
  const notifCount = useNotificationStore((s) => s.count);
  const cartCount = useCartStore((s) => s.count);

  const [products, setProducts] = useState<ProductWithTripInfo[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const lastDest = useRef("");

  const activeDest = DESTINATION_BANNERS[carouselIdx]?.destination ?? "";

  useEffect(() => {
    if (!activeDest || activeDest === lastDest.current) return;
    lastDest.current = activeDest;
    setProductsLoading(true);
    setProducts([]);
    getProductsByDestination(activeDest, 8)
      .then(setProducts)
      .catch(() => setProducts([]))
      .finally(() => setProductsLoading(false));
  }, [activeDest]);

  const touchStart = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const TAP_THRESHOLD = 10;

  const onSlideTouchStart = useCallback((e: GestureResponderEvent) => {
    const { pageX, pageY } = e.nativeEvent;
    touchStart.current = { x: pageX, y: pageY };
  }, []);

  const onSlideTouchEnd = useCallback((destination: string) => (e: GestureResponderEvent) => {
    const { pageX, pageY } = e.nativeEvent;
    const dx = Math.abs(pageX - touchStart.current.x);
    const dy = Math.abs(pageY - touchStart.current.y);
    if (dx < TAP_THRESHOLD && dy < TAP_THRESHOLD) {
      router.push(`/search?destination=${destination}`);
    }
  }, []);

  const s = React.useMemo(() => StyleSheet.create({
    safe: { flex: 1, backgroundColor: C.offWhite },

    header: { backgroundColor: C.white, borderBottomWidth: 1, borderBottomColor: C.lightGray },
    headerSafe: { paddingHorizontal: Spacing.base, paddingBottom: Spacing.base },
    headerRow: { flexDirection: "row", alignItems: "center", gap: Spacing.sm, paddingTop: Platform.OS === "android" ? Spacing.sm : 0 },
    searchBar: { flex: 1, flexDirection: "row", alignItems: "center", backgroundColor: C.offWhite, borderRadius: BorderRadius.full, paddingHorizontal: Spacing.md, height: 40, gap: Spacing.sm, borderWidth: 1, borderColor: C.lightGray },
    searchPlaceholder: { flex: 1, fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.sm, color: C.gray },
    iconBtn: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
    badge: { position: "absolute", top: 2, right: 2, backgroundColor: C.error, borderRadius: 10, minWidth: 17, height: 17, alignItems: "center", justifyContent: "center", paddingHorizontal: 3, borderWidth: 1.5, borderColor: C.white },
    badgeText: { fontFamily: Typography.bold.fontFamily, fontSize: 9, color: '#FFFFFF' },

    scroll: { flex: 1, paddingHorizontal: Spacing.xl },

    carouselWrap: { marginTop: Spacing.lg, marginBottom: Spacing.xl, marginHorizontal: -Spacing.xl, alignItems: "center" },
    slide: { flex: 1, borderRadius: BorderRadius.xl, overflow: "hidden" },
    slideImg: { width: "100%", height: "100%" },
    slideOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: "flex-end", padding: Spacing.lg },
    slideLoc: { flexDirection: "row", alignItems: "center", gap: 4, marginBottom: Spacing.sm },
    slideLocTxt: { fontFamily: Typography.semiBold.fontFamily, fontSize: Typography.sizes.xs, color: C.primary, letterSpacing: 0.5 },
    slideTitle: { fontFamily: Typography.serifBold.fontFamily, fontSize: Typography.sizes["2xl"], color: '#FFFFFF' },
    slideSub: { fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.sm, color: "rgba(255,255,255,0.8)", marginTop: 4 },
    slideShopRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: Spacing.md },
    slideShopTxt: { fontFamily: Typography.semiBold.fontFamily, fontSize: Typography.sizes.sm, color: C.primary },
    dots: { flexDirection: "row", justifyContent: "center", marginTop: Spacing.sm, gap: 6 },
    dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: C.midGray },
    dotActive: { backgroundColor: C.primary, width: 22, borderRadius: 3 },

    section: { marginBottom: Spacing["2xl"] },
    sectionHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", marginBottom: Spacing.base },
    sectionTitle: { fontFamily: Typography.serifBold.fontFamily, fontSize: Typography.sizes.lg, color: C.nearBlack },
    sectionSub: { fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.xs, color: C.darkGray, marginTop: 2 },
    viewAllRow: { flexDirection: "row", alignItems: "center", gap: 2 },
    viewAll: { fontFamily: Typography.semiBold.fontFamily, fontSize: Typography.sizes.sm, color: C.primary },

    emptyWrap: { alignItems: "center", paddingVertical: Spacing["2xl"], gap: Spacing.md },
    emptyTxt: { fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.sm, color: C.darkGray },

    prodGrid: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.md },
    prodCard: { width: (SW - Spacing.xl * 2 - Spacing.md) / 2, backgroundColor: C.white, borderRadius: BorderRadius.lg, overflow: "hidden", borderWidth: 1, borderColor: C.lightGray, ...Shadows.sm },
    prodImgWrap: { position: "relative" },
    prodImg: { width: "100%", height: 130 },
    prodImgEmpty: { backgroundColor: C.cream, alignItems: "center", justifyContent: "center" },
    prodCatBadge: { position: "absolute", top: Spacing.sm, left: Spacing.sm, paddingHorizontal: 6, paddingVertical: 2, borderRadius: BorderRadius.full },
    prodCatTxt: { fontFamily: Typography.medium.fontFamily, fontSize: 9, color: '#FFFFFF', letterSpacing: 0.3 },
    prodBody: { padding: Spacing.sm },
    prodName: { fontFamily: Typography.medium.fontFamily, fontSize: Typography.sizes.sm, color: C.charcoal, lineHeight: 18, marginBottom: 4 },
    prodPrice: { fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.sm, color: C.nearBlack, marginBottom: 3 },
    prodTravelerRow: { flexDirection: "row", alignItems: "center", gap: 3 },
    prodTravelerTxt: { fontFamily: Typography.regular.fontFamily, fontSize: 10, color: C.primary, flex: 1 },
  }), [C]);

  return (
    <View style={s.safe}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={C.white} />

      {/* Header */}
      <View style={s.header}>
        <SafeAreaView edges={["top"]} style={s.headerSafe}>
          <View style={s.headerRow}>
            <TouchableOpacity style={s.searchBar} activeOpacity={0.85} onPress={() => router.push("/search")}>
              <Ionicons name="search-outline" size={18} color={C.gray} />
              <Text style={s.searchPlaceholder}>{t.searchPlaceholder}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.iconBtn} onPress={() => router.push("/notifications")}>
              <Ionicons name="notifications-outline" size={22} color={C.nearBlack} />
              {notifCount > 0 && <Badge count={notifCount} s={s} />}
            </TouchableOpacity>
            <TouchableOpacity style={s.iconBtn} onPress={() => router.push("/cart")}>
              <Ionicons name="cart-outline" size={22} color={C.nearBlack} />
              {cartCount > 0 && <Badge count={cartCount} s={s} />}
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>

      {/* Scrollable */}
      <ScrollView
        style={s.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + Spacing.xl }}
      >
        {/* Infinite Smooth Carousel */}
        <View style={s.carouselWrap}>
          <Carousel
            loop
            width={SW}
            height={SW * 0.65}
            autoPlay
            autoPlayInterval={4000}
            data={DESTINATION_BANNERS}
            scrollAnimationDuration={800}
            onSnapToItem={setCarouselIdx}
            mode="parallax"
            modeConfig={{ parallaxScrollingScale: 0.9, parallaxScrollingOffset: 45 }}
            renderItem={({ item }) => (
              <View
                style={s.slide}
                onTouchStart={onSlideTouchStart}
                onTouchEnd={onSlideTouchEnd(item.destination)}
              >
                <Image source={{ uri: item.imageUrl }} style={s.slideImg} contentFit="cover" transition={300} />
                <LinearGradient colors={["transparent", "rgba(20,10,2,0.88)"]} style={s.slideOverlay}>
                  <View style={s.slideLoc}>
                    <Ionicons name="location" size={11} color={C.primary} />
                    <Text style={s.slideLocTxt}>{item.destination}</Text>
                  </View>
                  <Text style={s.slideTitle}>{item.title}</Text>
                  <Text style={s.slideSub}>{item.subtitle}</Text>
                  <View style={s.slideShopRow}>
                    <Text style={s.slideShopTxt}>{t.shopNow}</Text>
                    <Ionicons name="arrow-forward" size={13} color={C.primary} />
                  </View>
                </LinearGradient>
              </View>
            )}
          />
          <View style={s.dots}>
            {DESTINATION_BANNERS.map((_, i) => (
              <View key={i} style={[s.dot, i === carouselIdx && s.dotActive]} />
            ))}
          </View>
        </View>

        {/* Products Grid */}
        <View style={s.section}>
          <View style={s.sectionHead}>
            <View>
              <Text style={s.sectionTitle}>{t.jastipProducts}</Text>
              <Text style={s.sectionSub}>{t.fromLabel} {activeDest}</Text>
            </View>
            <TouchableOpacity style={s.viewAllRow} onPress={() => router.push(`/search?destination=${activeDest}`)}>
              <Text style={s.viewAll}>{t.viewAll}</Text>
              <Ionicons name="chevron-forward" size={14} color={C.primary} />
            </TouchableOpacity>
          </View>

          {productsLoading ? (
            <SkeletonProductGrid count={4} />
          ) : products.length === 0 ? (
            <View style={s.emptyWrap}>
              <Ionicons name="bag-outline" size={36} color={C.midGray} />
              <Text style={s.emptyTxt}>{t.noProductsFrom} {activeDest}</Text>
            </View>
          ) : (
            <Animated.View
              key={activeDest}
              entering={FadeIn.duration(350).delay(80)}
              exiting={FadeOut.duration(250)}
              style={s.prodGrid}
            >
              {products.map((p) => (
                <TouchableOpacity
                   key={p.id}
                  style={s.prodCard}
                  activeOpacity={0.85}
                  onPress={() => router.push(`/product/${p.id}`)}
                >
                  <View style={s.prodImgWrap}>
                    {p.image_urls?.[0] ? (
                      <Image
                        source={{ uri: p.image_urls[0] }}
                        style={s.prodImg}
                        contentFit="cover"
                        transition={200}
                      />
                    ) : (
                      <View style={[s.prodImg, s.prodImgEmpty, p.category ? { backgroundColor: (CATEGORY_MAP[p.category]?.color ?? C.midGray) + '22' } : undefined]}>
                        <Ionicons
                          name={(CATEGORY_MAP[p.category ?? '']?.icon ?? 'cube-outline') as any}
                          size={32}
                          color={CATEGORY_MAP[p.category ?? '']?.color ?? C.midGray}
                        />
                      </View>
                    )}
                    {p.category && CATEGORY_MAP[p.category] && (
                      <View style={[s.prodCatBadge, { backgroundColor: CATEGORY_MAP[p.category].color + 'DD' }]}>
                        <Text style={s.prodCatTxt}>{CATEGORY_MAP[p.category].label}</Text>
                      </View>
                    )}
                  </View>
                  <View style={s.prodBody}>
                    <Text style={s.prodName} numberOfLines={2}>{p.name}</Text>
                    <Text style={s.prodPrice}>{fmtPrice(p.price_min, p.price_max, t.priceNegotiable)}</Text>
                    <View style={s.prodTravelerRow}>
                      <Ionicons name="location-outline" size={11} color={C.primary} />
                      <Text style={s.prodTravelerTxt} numberOfLines={1}>
                        {p.trips?.destination_city ?? p.trips?.destination_country ?? activeDest}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </Animated.View>
          )}
        </View>

      </ScrollView>
    </View>
  );
}

function Badge({ count, s }: { count: number; s: any }) {
  return (
    <View style={s.badge}>
      <Text style={s.badgeText}>{count > 9 ? "9+" : count}</Text>
    </View>
  );
}
