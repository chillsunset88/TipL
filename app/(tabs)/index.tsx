/**
 * TipL — Home Screen (Infinite Carousel + Re-designed Products)
 * Features reanimated-carousel for smooth infinite loop and updated product cards (white theme).
 */
import { Avatar } from "@/src/components/ui/Avatar";
import { Button } from "@/src/components/ui/Button";
import { BorderRadius, Colors, Shadows, Spacing, Typography } from "@/src/lib/constants";
import { JASTIP_PRODUCTS, MOCK_TRIPS, TRENDING_DESTINATIONS } from "@/src/lib/mockData";
import { Trip } from "@/src/lib/types";
import { useCartStore } from "@/src/store/cartStore";
import { useNotificationStore } from "@/src/store/notificationStore";
import { useSettingsStore } from "@/src/store/settingsStore";
import { useWalletStore } from "@/src/store/walletStore";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Dimensions, FlatList, Platform, RefreshControl, ScrollView, StatusBar, StyleSheet,
  Text, TouchableOpacity, View, Alert, type GestureResponderEvent
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Carousel from "react-native-reanimated-carousel";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";


const { width: SW } = Dimensions.get("window");
const TRENDING_W = SW * 0.75;
const TRENDING_GAP = Spacing.md;

const DESTINATION_BANNERS = [
  { id: "sg", destination: "Singapore", title: "Singapore Deals", subtitle: "Best snacks & fashion from the Lion City", imageUrl: "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800" },
  { id: "jp", destination: "Japan", title: "Tokyo Exclusive", subtitle: "Limited edition goods from Shibuya & Akihabara", imageUrl: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800" },
  { id: "kr", destination: "South Korea", title: "Seoul Beauty", subtitle: "K-Beauty & skincare favorites delivered to you", imageUrl: "https://images.unsplash.com/photo-1538485399081-7191377e8241?w=800" },
  { id: "uk", destination: "London", title: "London Premium", subtitle: "Luxury brands and iconic British tea", imageUrl: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800" }
];

const PALETTE = { primary: "#F9F7F2", secondary: "#2C2C2C", tertiary: "#C5A267", neutral: "#8E8E8E" } as const;
const fmtIDR = (v: number) => "Rp " + v.toLocaleString("id-ID");

export default function HomeScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [carouselIdx, setCarouselIdx] = useState(0);
  const { t } = useSettingsStore();
  const notifCount = useNotificationStore((s) => s.count);
  const cartCount = useCartStore((s) => s.count);
  const { points, balance } = useWalletStore();

  useEffect(() => { useSettingsStore.getState().loadSettings(); }, []);

  const activeDest = DESTINATION_BANNERS[carouselIdx]?.destination ?? "";
  const products = useMemo(() => JASTIP_PRODUCTS.filter((p) => p.destination === activeDest), [activeDest]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await new Promise((r) => setTimeout(r, 1000));
    setRefreshing(false);
  };

  // ── Custom tap detection: distinguishes tap vs swipe ──
  const touchStart = useRef<{ x: number; y: number; time: number }>({ x: 0, y: 0, time: 0 });
  const TAP_THRESHOLD = 10; // px — if finger moves more than this, it's a swipe

  const onSlideTouchStart = useCallback((e: GestureResponderEvent) => {
    const { pageX, pageY } = e.nativeEvent;
    touchStart.current = { x: pageX, y: pageY, time: Date.now() };
  }, []);

  const onSlideTouchEnd = useCallback((destination: string) => (e: GestureResponderEvent) => {
    const { pageX, pageY } = e.nativeEvent;
    const dx = Math.abs(pageX - touchStart.current.x);
    const dy = Math.abs(pageY - touchStart.current.y);
    if (dx < TAP_THRESHOLD && dy < TAP_THRESHOLD) {
      router.push(`/search?destination=${destination}`);
    }
  }, []);

  return (
    <View style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor={PALETTE.secondary} />

      {/* ── Header ─────────────────────────────────────── */}
      <View style={s.headerGrad}>
        <SafeAreaView edges={["top"]} style={s.headerSafe}>
          <View style={s.headerRow}>
            <TouchableOpacity style={s.searchBar} activeOpacity={0.8} onPress={() => router.push("/search")}>
              <Ionicons name="search-outline" size={20} color={Colors.gray} />
              <Text style={s.searchPlaceholder}>{t.searchPlaceholder}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.iconBtn} onPress={() => Alert.alert('Coming Soon', 'Notifications are not yet available.')}>
              <Ionicons name="notifications-outline" size={24} color={Colors.white} />
              {notifCount > 0 && <Badge count={notifCount} />}
            </TouchableOpacity>
            <TouchableOpacity style={s.iconBtn} onPress={() => router.push("/cart")}>
              <Ionicons name="cart-outline" size={24} color={Colors.white} />
              {cartCount > 0 && <Badge count={cartCount} />}
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>

      {/* ── Balance / Points ─────────────────────────────────── */}
      <View style={s.balWrap}>
        <View style={s.balCard}>
          <TouchableOpacity style={s.balSec}>
            <View style={s.balIconBox}><Ionicons name="wallet-outline" size={22} color={PALETTE.secondary} /></View>
            <View style={s.balTxtWrap}><Text style={s.balVal}>{fmtIDR(balance)}</Text><Text style={s.balLbl}>{t.balance}</Text></View>
          </TouchableOpacity>
          <View style={s.divider} />
          <TouchableOpacity style={s.balSec}>
            <View style={[s.balIconBox, { backgroundColor: "#FFF8E7" }]}><Ionicons name="star" size={22} color={Colors.primary} /></View>
            <View style={s.balTxtWrap}><Text style={s.balVal}>{points.toLocaleString()}</Text><Text style={s.balLbl}>{t.points}</Text></View>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Scrollable ───────────────────────────────────────── */}
      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={Colors.primary} />}>

        {/* Infinite Smooth Carousel Banner */}
        <View style={s.carouselWrap}>
          <Carousel
            loop
            width={SW}
            height={SW * 0.85} // Square-ish
            autoPlay={true}
            autoPlayInterval={4000}
            data={DESTINATION_BANNERS}
            scrollAnimationDuration={800} // Very smooth transition
            onSnapToItem={(index) => setCarouselIdx(index)}
            mode="parallax"
            modeConfig={{
              parallaxScrollingScale: 0.9,
              parallaxScrollingOffset: 45, // Peeks side items
            }}
            renderItem={({ item }) => (
              <View
                style={s.slide}
                onTouchStart={onSlideTouchStart}
                onTouchEnd={onSlideTouchEnd(item.destination)}
              >
                <Image source={{ uri: item.imageUrl }} style={s.slideImg} contentFit="cover" transition={300} />
                <LinearGradient colors={["transparent", "rgba(0,0,0,0.7)"]} style={s.slideOverlay}>
                  <Text style={s.slideTitle}>{item.title}</Text>
                  <Text style={s.slideSub}>{item.subtitle}</Text>
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

        {/* Jastip Products Grid (Light Theme & Red Badges) */}
        <View style={s.section}>
          <View style={s.sectionHead}>
            <Text style={s.sectionTitle}>{t.jastipProducts} — {activeDest}</Text>
            <TouchableOpacity onPress={() => router.push(`/search?destination=${activeDest}`)}><Text style={s.viewAll}>{t.viewAll}</Text></TouchableOpacity>
          </View>
          
          <Animated.View 
            key={activeDest} 
            entering={FadeIn.duration(400).delay(100)} 
            exiting={FadeOut.duration(300)} 
            style={s.prodGrid}
          >
            {products.map((p) => (
              <TouchableOpacity key={p.id} style={s.prodCardLight} activeOpacity={0.8}
                onPress={() => router.push(`/product/${p.id}`)}>
                <Image source={{ uri: p.imageUrl }} style={s.prodImgLight} contentFit="cover" transition={200} />
                <View style={s.prodInfoLight}>
                  <Text style={s.prodNameLight} numberOfLines={2}>{p.name}</Text>
                  <Text style={s.prodPriceLight}>{fmtIDR(p.priceIDR)}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </Animated.View>
        </View>

        {/* Trending Destinations */}
        <View style={s.section}>
          <View style={s.sectionHead}>
            <Text style={s.sectionTitle}>{t.trendingDestinations}</Text>
            <TouchableOpacity style={s.filterRow} onPress={() => Alert.alert('Coming Soon')}><Ionicons name="options-outline" size={18} color={Colors.darkGray} /></TouchableOpacity>
          </View>
          <FlatList horizontal style={{ marginHorizontal: -Spacing.xl }} data={TRENDING_DESTINATIONS} keyExtractor={(i) => i.id}
            showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: Spacing.xl }}
            snapToInterval={TRENDING_W + TRENDING_GAP} snapToAlignment="start" decelerationRate="fast"
            renderItem={({ item }) => (
              <TouchableOpacity style={s.destCard} activeOpacity={0.85}>
                <Image source={{ uri: item.imageUrl }} style={s.destImg} contentFit="cover" transition={300} />
                <LinearGradient colors={["transparent", "rgba(0,0,0,0.8)"]} style={s.destOverlay}>
                  <Text style={s.destName}>{item.name}</Text><Text style={s.destCountry}>{item.country}</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
          />
        </View>

        {/* Upcoming Journeys */}
        <View style={s.section}>
          <View style={s.sectionHead}>
            <Text style={s.sectionTitle}>{t.upcomingJourneys}</Text>
            <TouchableOpacity style={s.filterPill} onPress={() => Alert.alert('Coming Soon')}><Text style={s.filterText}>{t.filter}</Text><Ionicons name="funnel-outline" size={14} color={Colors.darkGray} /></TouchableOpacity>
          </View>
          {MOCK_TRIPS.map((trip) => <TravelerCard key={trip.id} trip={trip} />)}
        </View>
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

function Badge({ count }: { count: number }) {
  return <View style={s.badge}><Text style={s.badgeText}>{count > 9 ? "9+" : count}</Text></View>;
}

function TravelerCard({ trip }: { trip: Trip }) {
  const { t } = useSettingsStore();
  return (
    <TouchableOpacity style={s.tripCard} activeOpacity={0.7} onPress={() => router.push(`/trip/${trip.id}`)}>
      <View style={s.tripRow}>
        <Avatar uri={trip.travelerAvatar} name={trip.travelerName} size="md" verified={trip.travelerVerified} />
        <View style={s.tripInfo}><Text style={s.tripName}>{trip.travelerName}</Text>
          <View style={s.ratingRow}><Ionicons name="star" size={13} color={Colors.primary} /><Text style={s.ratingTxt}>{trip.travelerRating}</Text>
            <Text style={s.reviewCnt}>({trip.travelerVerified ? "Verified" : ""})</Text></View>
        </View>
      </View>
      <View style={s.routeRow}>
        <View style={s.routeCity}><Text style={s.routeLbl}>{t.origin}</Text><Text style={s.routeNm}>{trip.origin}</Text></View>
        <View style={s.routeArrow}><View style={s.routeLine} /><Ionicons name="airplane" size={16} color={Colors.primary} /><View style={s.routeLine} /></View>
        <View style={[s.routeCity, { alignItems: "flex-end" }]}><Text style={s.routeLbl}>{t.destination}</Text><Text style={s.routeNm}>{trip.destination}</Text></View>
      </View>
      <View style={s.tripFoot}>
        <Text style={s.dateTxt}><Ionicons name="calendar-outline" size={13} color={Colors.darkGray} /> {trip.departDate}</Text>
        <Button title={t.requestItem} onPress={() => router.push(`/trip/${trip.id}`)} size="sm" variant="secondary" />
      </View>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: PALETTE.primary },
  headerGrad: { paddingBottom: Spacing.base, backgroundColor: PALETTE.secondary, borderBottomWidth: 2, borderBottomColor: PALETTE.tertiary },
  headerSafe: { paddingHorizontal: Spacing.base },
  headerRow: { flexDirection: "row", alignItems: "center", gap: Spacing.sm, paddingTop: Platform.OS === "android" ? Spacing.sm : 0 },
  searchBar: { flex: 1, flexDirection: "row", alignItems: "center", backgroundColor: Colors.white, borderRadius: BorderRadius.full, paddingHorizontal: Spacing.md, height: 42 },
  searchPlaceholder: { flex: 1, fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.sm, color: Colors.gray, marginLeft: Spacing.sm },
  iconBtn: { width: 42, height: 42, borderRadius: 21, alignItems: "center", justifyContent: "center" },
  badge: { position: "absolute", top: 2, right: 2, backgroundColor: "#FF3B30", borderRadius: 10, minWidth: 18, height: 18, alignItems: "center", justifyContent: "center", paddingHorizontal: 4, borderWidth: 1.5, borderColor: PALETTE.secondary },
  badgeText: { fontFamily: Typography.bold.fontFamily, fontSize: 10, color: Colors.white },
  // Balance
  balWrap: { paddingHorizontal: Spacing.base, marginTop: -2, backgroundColor: PALETTE.secondary, paddingBottom: Spacing.base },
  balCard: { flexDirection: "row", backgroundColor: Colors.white, borderRadius: BorderRadius.lg, paddingVertical: Spacing.md, paddingHorizontal: Spacing.base, ...Shadows.md },
  balSec: { flex: 1, flexDirection: "row", alignItems: "center", gap: Spacing.sm },
  balIconBox: { width: 42, height: 42, borderRadius: BorderRadius.md, backgroundColor: "#EBF2FF", alignItems: "center", justifyContent: "center" },
  balTxtWrap: { flex: 1 },
  balVal: { fontFamily: Typography.bold.fontFamily, fontSize: Typography.sizes.base, color: Colors.nearBlack },
  balLbl: { fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.xs, color: Colors.darkGray, marginTop: 1 },
  divider: { width: 1, height: 36, backgroundColor: Colors.midGray, marginHorizontal: Spacing.sm },
  scroll: { flex: 1, paddingHorizontal: Spacing.xl },
  // Carousel (Infinite Smooth)
  carouselWrap: { marginTop: Spacing.lg, marginBottom: Spacing.lg, marginHorizontal: -Spacing.xl, alignItems: "center" },
  slide: { flex: 1, borderRadius: BorderRadius.xl, overflow: "hidden" },
  slideImg: { width: "100%", height: "100%" },
  slideOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: "flex-end", padding: Spacing.lg },
  slideTitle: { fontFamily: Typography.serifBold.fontFamily, fontSize: Typography.sizes["2xl"], color: Colors.white },
  slideSub: { fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.base, color: "rgba(255,255,255,0.85)", marginTop: 4 },
  dots: { flexDirection: "row", justifyContent: "center", marginTop: Spacing.xs, gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.midGray },
  dotActive: { backgroundColor: PALETTE.tertiary, width: 24 },
  // Products (White Theme Match)
  section: { marginBottom: Spacing["2xl"] },
  sectionHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: Spacing.base },
  sectionTitle: { fontFamily: Typography.serifBold.fontFamily, fontSize: Typography.sizes.lg, color: Colors.nearBlack, flex: 1 },
  viewAll: { fontFamily: Typography.semiBold.fontFamily, fontSize: Typography.sizes.sm, color: PALETTE.tertiary },
  prodGrid: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.md },
  prodCardLight: { width: (SW - Spacing.xl * 2 - Spacing.md) / 2, backgroundColor: Colors.white, borderRadius: BorderRadius.lg, overflow: "hidden", borderWidth: 1, borderColor: Colors.lightGray, ...Shadows.sm },
  prodImgLight: { width: "100%", height: 130, backgroundColor: Colors.offWhite },
  prodInfoLight: { padding: Spacing.sm },
  prodNameLight: { fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.sm, color: Colors.charcoal, marginBottom: 6, lineHeight: 18 },
  prodPriceLight: { fontFamily: Typography.bold.fontFamily, fontSize: Typography.sizes.md, color: Colors.nearBlack, marginBottom: 4 },

  // Trending
  filterRow: { padding: Spacing.xs },
  filterPill: { flexDirection: "row", alignItems: "center", paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, borderRadius: BorderRadius.full, borderWidth: 1, borderColor: Colors.midGray, gap: 4 },
  filterText: { fontFamily: Typography.medium.fontFamily, fontSize: Typography.sizes.xs, color: Colors.darkGray },
  destCard: { width: TRENDING_W, height: TRENDING_W * 1.25, borderRadius: BorderRadius.xl, overflow: "hidden", marginRight: TRENDING_GAP, ...Shadows.md },
  destImg: { width: "100%", height: "100%" },
  destOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: "flex-end", padding: Spacing.base },
  destName: { fontFamily: Typography.serifBold.fontFamily, fontSize: Typography.sizes["2xl"], color: Colors.white, marginBottom: 4 },
  destCountry: { fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.sm, color: "rgba(255,255,255,0.8)" },
  // Trip
  tripCard: { backgroundColor: Colors.white, borderRadius: BorderRadius.lg, padding: Spacing.base, marginBottom: Spacing.md, borderWidth: 1, borderColor: Colors.lightGray, ...Shadows.sm },
  tripRow: { flexDirection: "row", alignItems: "center", marginBottom: Spacing.base },
  tripInfo: { marginLeft: Spacing.md, flex: 1 },
  tripName: { fontFamily: Typography.semiBold.fontFamily, fontSize: Typography.sizes.base, color: Colors.nearBlack },
  ratingRow: { flexDirection: "row", alignItems: "center", marginTop: 2, gap: 3 },
  ratingTxt: { fontFamily: Typography.medium.fontFamily, fontSize: Typography.sizes.sm, color: Colors.nearBlack },
  reviewCnt: { fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.xs, color: Colors.darkGray },
  routeRow: { flexDirection: "row", alignItems: "center", marginBottom: Spacing.base, paddingHorizontal: Spacing.sm },
  routeCity: { flex: 1 },
  routeLbl: { fontFamily: Typography.medium.fontFamily, fontSize: 10, color: Colors.darkGray, letterSpacing: 1, marginBottom: 2 },
  routeNm: { fontFamily: Typography.bold.fontFamily, fontSize: Typography.sizes.md, color: Colors.nearBlack },
  routeArrow: { flexDirection: "row", alignItems: "center", marginHorizontal: Spacing.sm },
  routeLine: { width: 16, height: 1.5, backgroundColor: Colors.midGray },
  tripFoot: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderTopWidth: 1, borderTopColor: Colors.lightGray, paddingTop: Spacing.md },
  dateTxt: { fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.sm, color: Colors.darkGray },
});
