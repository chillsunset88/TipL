/**
 * TipL — Home Screen
 * Infinite parallax carousel + Supabase real trips + featured products.
 */
import { Avatar } from "@/src/components/ui/Avatar";
import { BorderRadius, Colors, Shadows, Spacing, Typography } from "@/src/lib/constants";
import { JASTIP_PRODUCTS, TRENDING_DESTINATIONS } from "@/src/lib/mockData";
import { useAuthStore } from "@/src/store/authStore";
import { useCartStore } from "@/src/store/cartStore";
import { useNotificationStore } from "@/src/store/notificationStore";
import { useSettingsStore } from "@/src/store/settingsStore";
import { useTrips, TripWithProfile } from "@/src/lib/hooks/useTrips";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Dimensions, FlatList, Platform, RefreshControl, ScrollView,
  StatusBar, StyleSheet, Text, TouchableOpacity, View, type GestureResponderEvent,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import Carousel from "react-native-reanimated-carousel";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

const { width: SW } = Dimensions.get("window");
const TRENDING_W = SW * 0.72;
const TRENDING_GAP = Spacing.md;

const DESTINATION_BANNERS = [
  { id: "sg", destination: "Singapore", title: "Singapore Deals", subtitle: "Best snacks & fashion from the Lion City", imageUrl: "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800" },
  { id: "jp", destination: "Japan", title: "Tokyo Exclusive", subtitle: "Limited edition goods from Shibuya & Akihabara", imageUrl: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800" },
  { id: "kr", destination: "South Korea", title: "Seoul Beauty", subtitle: "K-Beauty & skincare favorites delivered to you", imageUrl: "https://images.unsplash.com/photo-1538485399081-7191377e8241?w=800" },
  { id: "uk", destination: "London", title: "London Premium", subtitle: "Luxury brands and iconic British tea", imageUrl: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800" },
];

const fmtIDR = (v: number) => "Rp " + v.toLocaleString("id-ID");

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);
  const [carouselIdx, setCarouselIdx] = useState(0);
  const { t } = useSettingsStore();
  const notifCount = useNotificationStore((s) => s.count);
  const cartCount = useCartStore((s) => s.count);
  const { trips, loading: tripsLoading, refetch } = useTrips();

  useEffect(() => { useSettingsStore.getState().loadSettings(); }, []);

  const activeDest = DESTINATION_BANNERS[carouselIdx]?.destination ?? "";
  const products = useMemo(() => JASTIP_PRODUCTS.filter((p) => p.destination === activeDest), [activeDest]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

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

  return (
    <View style={s.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />

      {/* Header */}
      <View style={s.header}>
        <SafeAreaView edges={["top"]} style={s.headerSafe}>
          <View style={s.headerRow}>
            <TouchableOpacity style={s.searchBar} activeOpacity={0.85} onPress={() => router.push("/search")}>
              <Ionicons name="search-outline" size={18} color={Colors.gray} />
              <Text style={s.searchPlaceholder}>{t.searchPlaceholder}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.iconBtn} onPress={() => router.push("/notifications")}>
              <Ionicons name="notifications-outline" size={22} color={Colors.nearBlack} />
              {notifCount > 0 && <Badge count={notifCount} />}
            </TouchableOpacity>
            <TouchableOpacity style={s.iconBtn} onPress={() => router.push("/cart")}>
              <Ionicons name="cart-outline" size={22} color={Colors.nearBlack} />
              {cartCount > 0 && <Badge count={cartCount} />}
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>

      {/* Scrollable */}
      <ScrollView
        style={s.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + Spacing.xl }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={Colors.primary} />
        }
      >
        {/* Infinite Smooth Carousel */}
        <View style={s.carouselWrap}>
          <Carousel
            loop
            width={SW}
            height={SW * 0.82}
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
                    <Ionicons name="location" size={11} color={Colors.primary} />
                    <Text style={s.slideLocTxt}>{item.destination}</Text>
                  </View>
                  <Text style={s.slideTitle}>{item.title}</Text>
                  <Text style={s.slideSub}>{item.subtitle}</Text>
                  <View style={s.slideShopRow}>
                    <Text style={s.slideShopTxt}>Shop Now</Text>
                    <Ionicons name="arrow-forward" size={13} color={Colors.primary} />
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
              <Text style={s.sectionSub}>From {activeDest}</Text>
            </View>
            <TouchableOpacity style={s.viewAllRow} onPress={() => router.push(`/search?destination=${activeDest}`)}>
              <Text style={s.viewAll}>{t.viewAll}</Text>
              <Ionicons name="chevron-forward" size={14} color={Colors.primary} />
            </TouchableOpacity>
          </View>

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
                  <Image source={{ uri: p.imageUrl }} style={s.prodImg} contentFit="cover" transition={200} />
                  <View style={s.prodCatBadge}>
                    <Text style={s.prodCatTxt}>{p.category}</Text>
                  </View>
                </View>
                <View style={s.prodBody}>
                  <Text style={s.prodName} numberOfLines={2}>{p.name}</Text>
                  <Text style={s.prodPrice}>{fmtIDR(p.priceIDR)}</Text>
                  <View style={s.prodTravelerRow}>
                    <Ionicons name="person-circle-outline" size={12} color={Colors.darkGray} />
                    <Text style={s.prodTravelerTxt} numberOfLines={1}>{p.travelerName}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </Animated.View>
        </View>

        {/* Trending Destinations */}
        <View style={s.section}>
          <View style={s.sectionHead}>
            <View>
              <Text style={s.sectionTitle}>{t.trendingDestinations}</Text>
              <Text style={s.sectionSub}>Popular routes this month</Text>
            </View>
          </View>
          <FlatList
            horizontal
            style={{ marginHorizontal: -Spacing.xl }}
            data={TRENDING_DESTINATIONS}
            keyExtractor={(i) => i.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: Spacing.xl }}
            snapToInterval={TRENDING_W + TRENDING_GAP}
            snapToAlignment="start"
            decelerationRate="fast"
            renderItem={({ item }) => (
              <TouchableOpacity
                style={s.destCard}
                activeOpacity={0.85}
                onPress={() => router.push({ pathname: '/destination/[name]', params: { name: item.name, imageUrl: item.imageUrl } } as any)}
              >
                <Image source={{ uri: item.imageUrl }} style={s.destImg} contentFit="cover" transition={300} />
                <LinearGradient colors={["transparent", "rgba(20,10,2,0.9)"]} style={s.destOverlay}>
                  <Text style={s.destName}>{item.name}</Text>
                  <Text style={s.destCountry}>{item.country}</Text>
                  <View style={s.destPill}>
                    <Ionicons name="airplane" size={10} color={Colors.primary} />
                    <Text style={s.destPillTxt}>{item.tripCount} Travelers</Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            )}
          />
        </View>

        {/* Upcoming Journeys — Real Supabase Data */}
        <View style={s.section}>
          <View style={s.sectionHead}>
            <View>
              <Text style={s.sectionTitle}>{t.upcomingJourneys}</Text>
              <Text style={s.sectionSub}>Available travelers now</Text>
            </View>
            <TouchableOpacity style={s.filterPill}>
              <Text style={s.filterTxt}>{t.filter}</Text>
              <Ionicons name="funnel-outline" size={13} color={Colors.darkGray} />
            </TouchableOpacity>
          </View>

          {tripsLoading ? (
            [1, 2].map((i) => <TripSkeleton key={i} />)
          ) : trips.length === 0 ? (
            <View style={s.tripsEmpty}>
              <Ionicons name="airplane-outline" size={40} color={Colors.midGray} />
              <Text style={s.emptyTxt}>No active travelers right now</Text>
              <TouchableOpacity style={s.postTripBtn} onPress={() => router.push("/trip/create")}>
                <Text style={s.postTripTxt}>Post a Trip</Text>
              </TouchableOpacity>
            </View>
          ) : (
            trips.map((trip) => <TravelerCard key={trip.id} trip={trip} />)
          )}
        </View>

      </ScrollView>
    </View>
  );
}

function Badge({ count }: { count: number }) {
  return (
    <View style={s.badge}>
      <Text style={s.badgeText}>{count > 9 ? "9+" : count}</Text>
    </View>
  );
}

function TripSkeleton() {
  return (
    <View style={[s.tripCard, { marginBottom: Spacing.md }]}>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.cream }} />
        <View style={{ flex: 1, marginLeft: Spacing.md, gap: 8 }}>
          <View style={{ width: "55%", height: 13, borderRadius: 4, backgroundColor: Colors.cream }} />
          <View style={{ width: "38%", height: 11, borderRadius: 4, backgroundColor: Colors.lightGray }} />
        </View>
      </View>
      <View style={{ height: 44, backgroundColor: Colors.cream, borderRadius: BorderRadius.md, marginTop: Spacing.md }} />
    </View>
  );
}

function TravelerCard({ trip }: { trip: TripWithProfile }) {
  const { t } = useSettingsStore();
  const currentUserId = useAuthStore((s) => s.user?.id ?? '');
  const name = trip.profiles?.full_name ?? "Traveler";
  const avatar = trip.profiles?.avatar_url ?? null;
  const rating = trip.profiles?.rating ?? 0;
  const totalTrips = trip.profiles?.total_trips ?? 0;
  const isOwnTrip = currentUserId === trip.triper_id;

  const handleChat = () => {
    if (!trip.triper_id) return;
    router.push({ pathname: '/chat/[id]', params: { id: trip.triper_id, receiverId: trip.triper_id } } as any);
  };

  return (
    <TouchableOpacity style={s.tripCard} activeOpacity={0.7} onPress={() => router.push(`/trip/${trip.id}`)}>
      <View style={s.tripRow}>
        <Avatar uri={avatar} name={name} size="md" />
        <View style={s.tripInfo}>
          <Text style={s.tripName}>{name}</Text>
          <View style={s.ratingRow}>
            <Ionicons name="star" size={12} color={Colors.primary} />
            <Text style={s.ratingTxt}>{rating > 0 ? rating.toFixed(1) : "—"}</Text>
            <Text style={s.reviewCnt}>· {totalTrips} trips</Text>
          </View>
        </View>
        {trip.capacity_kg != null && (
          <View style={s.capBadge}>
            <Text style={s.capTxt}>{trip.capacity_kg} kg</Text>
          </View>
        )}
      </View>

      <View style={s.routeRow}>
        <View style={s.routeCity}>
          <Text style={s.routeLbl}>FROM</Text>
          <Text style={s.routeNm} numberOfLines={1}>{trip.origin_country || '—'}</Text>
        </View>
        <View style={s.routeArrow}>
          <View style={s.routeLine} />
          <View style={s.planeWrap}>
            <Ionicons name="airplane" size={14} color={Colors.primary} />
          </View>
          <View style={s.routeLine} />
        </View>
        <View style={[s.routeCity, { alignItems: "flex-end" }]}>
          <Text style={s.routeLbl}>TO</Text>
          <Text style={s.routeNm} numberOfLines={1}>{trip.destination_country || '—'}</Text>
          {trip.destination_city ? (
            <Text style={s.routeSubCity} numberOfLines={1}>{trip.destination_city}</Text>
          ) : null}
        </View>
      </View>

      <View style={s.tripFoot}>
        <View style={s.dateRow}>
          <Ionicons name="calendar-outline" size={13} color={Colors.darkGray} />
          <Text style={s.dateTxt}>{trip.departure_date}</Text>
        </View>
        {isOwnTrip ? (
          <TouchableOpacity style={s.reqBtn} onPress={() => router.push(`/trip/${trip.id}`)}>
            <Text style={s.reqBtnTxt}>Lihat Trip</Text>
          </TouchableOpacity>
        ) : (
          <View style={s.footActions}>
            <TouchableOpacity style={s.chatBtn} onPress={handleChat}>
              <Ionicons name="chatbubble-outline" size={17} color={Colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity style={s.reqBtn} onPress={() => router.push(`/trip/${trip.id}`)}>
              <Text style={s.reqBtnTxt}>{t.requestItem}</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.offWhite },

  header: { backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.lightGray },
  headerSafe: { paddingHorizontal: Spacing.base, paddingBottom: Spacing.base },
  headerRow: { flexDirection: "row", alignItems: "center", gap: Spacing.sm, paddingTop: Platform.OS === "android" ? Spacing.sm : 0 },
  searchBar: { flex: 1, flexDirection: "row", alignItems: "center", backgroundColor: Colors.offWhite, borderRadius: BorderRadius.full, paddingHorizontal: Spacing.md, height: 40, gap: Spacing.sm, borderWidth: 1, borderColor: Colors.lightGray },
  searchPlaceholder: { flex: 1, fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.sm, color: Colors.gray },
  iconBtn: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  badge: { position: "absolute", top: 2, right: 2, backgroundColor: Colors.error, borderRadius: 10, minWidth: 17, height: 17, alignItems: "center", justifyContent: "center", paddingHorizontal: 3, borderWidth: 1.5, borderColor: Colors.white },
  badgeText: { fontFamily: Typography.bold.fontFamily, fontSize: 9, color: Colors.white },

  scroll: { flex: 1, paddingHorizontal: Spacing.xl },

  carouselWrap: { marginTop: Spacing.lg, marginBottom: Spacing.xl, marginHorizontal: -Spacing.xl, alignItems: "center" },
  slide: { flex: 1, borderRadius: BorderRadius.xl, overflow: "hidden" },
  slideImg: { width: "100%", height: "100%" },
  slideOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: "flex-end", padding: Spacing.lg },
  slideLoc: { flexDirection: "row", alignItems: "center", gap: 4, marginBottom: Spacing.sm },
  slideLocTxt: { fontFamily: Typography.semiBold.fontFamily, fontSize: Typography.sizes.xs, color: Colors.primary, letterSpacing: 0.5 },
  slideTitle: { fontFamily: Typography.serifBold.fontFamily, fontSize: Typography.sizes["2xl"], color: Colors.white },
  slideSub: { fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.sm, color: "rgba(255,255,255,0.8)", marginTop: 4 },
  slideShopRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: Spacing.md },
  slideShopTxt: { fontFamily: Typography.semiBold.fontFamily, fontSize: Typography.sizes.sm, color: Colors.primary },
  dots: { flexDirection: "row", justifyContent: "center", marginTop: Spacing.sm, gap: 6 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.midGray },
  dotActive: { backgroundColor: Colors.primary, width: 22, borderRadius: 3 },

  section: { marginBottom: Spacing["2xl"] },
  sectionHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", marginBottom: Spacing.base },
  sectionTitle: { fontFamily: Typography.serifBold.fontFamily, fontSize: Typography.sizes.lg, color: Colors.nearBlack },
  sectionSub: { fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.xs, color: Colors.darkGray, marginTop: 2 },
  viewAllRow: { flexDirection: "row", alignItems: "center", gap: 2 },
  viewAll: { fontFamily: Typography.semiBold.fontFamily, fontSize: Typography.sizes.sm, color: Colors.primary },

  prodGrid: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.md },
  prodCard: { width: (SW - Spacing.xl * 2 - Spacing.md) / 2, backgroundColor: Colors.white, borderRadius: BorderRadius.lg, overflow: "hidden", borderWidth: 1, borderColor: Colors.lightGray, ...Shadows.sm },
  prodImgWrap: { position: "relative" },
  prodImg: { width: "100%", height: 130, backgroundColor: Colors.cream },
  prodCatBadge: { position: "absolute", top: Spacing.sm, left: Spacing.sm, backgroundColor: "rgba(0,0,0,0.55)", paddingHorizontal: Spacing.sm, paddingVertical: 2, borderRadius: BorderRadius.full },
  prodCatTxt: { fontFamily: Typography.medium.fontFamily, fontSize: 9, color: Colors.white, letterSpacing: 0.3 },
  prodBody: { padding: Spacing.sm },
  prodName: { fontFamily: Typography.medium.fontFamily, fontSize: Typography.sizes.sm, color: Colors.charcoal, lineHeight: 18, marginBottom: 5 },
  prodPrice: { fontFamily: Typography.bold.fontFamily, fontSize: Typography.sizes.md, color: Colors.nearBlack, marginBottom: 4 },
  prodTravelerRow: { flexDirection: "row", alignItems: "center", gap: 3 },
  prodTravelerTxt: { fontFamily: Typography.regular.fontFamily, fontSize: 10, color: Colors.darkGray, flex: 1 },

  filterPill: { flexDirection: "row", alignItems: "center", paddingHorizontal: Spacing.md, paddingVertical: 5, borderRadius: BorderRadius.full, borderWidth: 1, borderColor: Colors.midGray, gap: 4 },
  filterTxt: { fontFamily: Typography.medium.fontFamily, fontSize: Typography.sizes.xs, color: Colors.darkGray },
  destCard: { width: TRENDING_W, height: TRENDING_W * 1.3, borderRadius: BorderRadius.xl, overflow: "hidden", marginRight: TRENDING_GAP, ...Shadows.md },
  destImg: { width: "100%", height: "100%" },
  destOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: "flex-end", padding: Spacing.base },
  destName: { fontFamily: Typography.serifBold.fontFamily, fontSize: Typography.sizes["2xl"], color: Colors.white },
  destCountry: { fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.sm, color: "rgba(255,255,255,0.75)", marginTop: 2 },
  destPill: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: Spacing.sm, alignSelf: "flex-start", backgroundColor: "rgba(197,162,103,0.2)", paddingHorizontal: Spacing.sm, paddingVertical: 3, borderRadius: BorderRadius.full, borderWidth: 1, borderColor: Colors.primary },
  destPillTxt: { fontFamily: Typography.semiBold.fontFamily, fontSize: 10, color: Colors.primary },

  tripsEmpty: { alignItems: "center", paddingVertical: Spacing["2xl"], gap: Spacing.md },
  emptyTxt: { fontFamily: Typography.medium.fontFamily, fontSize: Typography.sizes.base, color: Colors.darkGray },
  postTripBtn: { paddingHorizontal: Spacing.xl, paddingVertical: Spacing.sm, backgroundColor: Colors.primaryPale, borderRadius: BorderRadius.full, borderWidth: 1, borderColor: Colors.primary },
  postTripTxt: { fontFamily: Typography.semiBold.fontFamily, fontSize: Typography.sizes.sm, color: Colors.primary },

  tripCard: { backgroundColor: Colors.white, borderRadius: BorderRadius.lg, padding: Spacing.base, marginBottom: Spacing.md, borderWidth: 1, borderColor: Colors.lightGray, ...Shadows.sm },
  tripRow: { flexDirection: "row", alignItems: "center", marginBottom: Spacing.base },
  tripInfo: { marginLeft: Spacing.md, flex: 1 },
  tripName: { fontFamily: Typography.semiBold.fontFamily, fontSize: Typography.sizes.base, color: Colors.nearBlack },
  ratingRow: { flexDirection: "row", alignItems: "center", marginTop: 3, gap: 3 },
  ratingTxt: { fontFamily: Typography.medium.fontFamily, fontSize: Typography.sizes.sm, color: Colors.nearBlack },
  reviewCnt: { fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.xs, color: Colors.darkGray },
  capBadge: { backgroundColor: Colors.primaryPale, paddingHorizontal: Spacing.sm, paddingVertical: 3, borderRadius: BorderRadius.full, borderWidth: 1, borderColor: Colors.primaryLight },
  capTxt: { fontFamily: Typography.semiBold.fontFamily, fontSize: 11, color: Colors.primary },

  routeRow: { flexDirection: "row", alignItems: "center", marginBottom: Spacing.base, paddingHorizontal: Spacing.xs, backgroundColor: Colors.offWhite, borderRadius: BorderRadius.md, paddingVertical: Spacing.md },
  routeCity: { flex: 1, paddingHorizontal: Spacing.sm },
  routeLbl: { fontFamily: Typography.semiBold.fontFamily, fontSize: 10, color: Colors.charcoal, letterSpacing: 1.2, marginBottom: 3 },
  routeNm: { fontFamily: Typography.bold.fontFamily, fontSize: Typography.sizes.md, color: Colors.nearBlack },
  routeSubCity: { fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.xs, color: Colors.darkGray, marginTop: 1 },
  routeArrow: { flexDirection: "row", alignItems: "center", width: 80 },
  routeLine: { flex: 1, height: 1.5, backgroundColor: Colors.midGray },
  planeWrap: { width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.primaryPale, alignItems: "center", justifyContent: "center", marginHorizontal: 2 },

  tripFoot: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderTopWidth: 1, borderTopColor: Colors.lightGray, paddingTop: Spacing.md },
  dateRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  dateTxt: { fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.sm, color: Colors.darkGray },
  footActions: { flexDirection: "row", alignItems: "center", gap: Spacing.sm },
  chatBtn: { width: 36, height: 36, borderRadius: BorderRadius.full, borderWidth: 1, borderColor: Colors.primary, backgroundColor: Colors.primaryPale, alignItems: "center", justifyContent: "center" },
  reqBtn: { backgroundColor: Colors.primary, paddingHorizontal: Spacing.md, paddingVertical: 7, borderRadius: BorderRadius.full },
  reqBtnTxt: { fontFamily: Typography.semiBold.fontFamily, fontSize: Typography.sizes.sm, color: Colors.white },
});
