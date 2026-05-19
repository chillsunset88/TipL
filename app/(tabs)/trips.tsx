//app/(tabs)/trips.tsx
import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  RefreshControl, ActivityIndicator, ScrollView, Dimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { router, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/src/lib/constants';
import { Avatar } from '@/src/components/ui/Avatar';
import { useTrips, TripWithProfile } from '@/src/lib/hooks/useTrips';
import { useAuthStore } from '@/src/store/authStore';
import { useSettingsStore } from '@/src/store/settingsStore';
import { COUNTRIES_DATA } from '@/src/lib/countryData';

const { width: SW } = Dimensions.get('window');
const COUNTRY_CARD_W = SW * 0.40;
const COUNTRY_CARD_H = COUNTRY_CARD_W * 1.35;

export default function TripsScreen() {
  const { trips, loading: tripsLoading, refetch } = useTrips();
  const currentUserId = useAuthStore((s) => s.user?.id ?? '');
  const { t } = useSettingsStore();
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(useCallback(() => { refetch(); }, [refetch]));

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const today = new Date().toISOString().split('T')[0];

  const myTrips = trips.filter((t) => t.triper_id === currentUserId);
  const upcomingTrips = trips
    .filter((t) => t.triper_id !== currentUserId)
    // only show trips that haven't departed yet (or have no departure date set)
    .filter((t) => !t.departure_date || t.departure_date >= today)
    .sort((a, b) => (a.departure_date ?? '').localeCompare(b.departure_date ?? ''))
    .slice(0, 8);

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={Colors.primary} />
        }
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* ── Negara Tujuan ── */}
        <View style={s.section}>
          <View style={s.sectionHead}>
            <Text style={s.sectionTitle}>{t.destinationCountries}</Text>
            <Text style={s.sectionSub}>{COUNTRIES_DATA.length} {t.cities}</Text>
          </View>
        </View>
        <FlatList
          horizontal
          data={COUNTRIES_DATA}
          keyExtractor={(item) => item.name}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.countryList}
          style={s.countryListWrap}
          renderItem={({ item }) => (
            <CountryCard
              country={item}
              onPress={() =>
                router.push({
                  pathname: '/cities/[country]',
                  params: { country: item.name },
                } as any)
              }
            />
          )}
        />

        {/* ── Trip Saya ── */}
        {myTrips.length > 0 && (
          <View style={s.section}>
            <View style={s.sectionHead}>
              <Text style={s.sectionTitle}>{t.myTrips}</Text>
              <Text style={s.sectionSub}>{myTrips.length} {t.activeTrips}</Text>
            </View>
            {myTrips.map((trip) => (
              <TripCard key={trip.id} trip={trip} isOwn />
            ))}
          </View>
        )}

        {/* ── Upcoming Journeys ── */}
        <View style={s.section}>
          <View style={s.sectionHead}>
            <Text style={s.sectionTitle}>{t.upcomingJourneys}</Text>
            <Text style={s.sectionSub}>{t.departingOn}</Text>
          </View>

          {tripsLoading ? (
            <ActivityIndicator color={Colors.primary} style={{ marginVertical: Spacing.base }} />
          ) : upcomingTrips.length === 0 ? (
            <View style={s.empty}>
              <Ionicons name="airplane-outline" size={40} color={Colors.midGray} />
              <Text style={s.emptyTxt}>{t.noActiveJastipers}</Text>
              <TouchableOpacity style={s.postBtn} onPress={() => router.push('/trip/create')}>
                <Text style={s.postBtnTxt}>{t.becomeFirstJastiper}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            upcomingTrips.map((trip) => <TripCard key={trip.id} trip={trip} isOwn={false} />)
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Country Card ─────────────────────────────────────────────────────────────
function CountryCard({ country, onPress }: {
  country: typeof COUNTRIES_DATA[0];
  onPress: () => void;
}) {
  const { t } = useSettingsStore();
  return (
    <TouchableOpacity style={s.countryCard} activeOpacity={0.85} onPress={onPress}>
      <Image source={{ uri: country.imageUrl }} style={s.countryImg} contentFit="cover" transition={300} />
      <LinearGradient colors={['transparent', 'rgba(20,10,2,0.88)']} style={StyleSheet.absoluteFill}>
        <View style={s.countryInfo}>
          <Text style={s.countryFlag}>{country.flag}</Text>
          <Text style={s.countryName}>{country.name}</Text>
          <View style={s.countryPill}>
            <Ionicons name="location-outline" size={9} color={Colors.primary} />
            <Text style={s.countryPillTxt}>{country.cities.length} {t.cities}</Text>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

// ─── Trip Card ─────────────────────────────────────────────────────────────────
function TripCard({ trip, isOwn }: { trip: TripWithProfile; isOwn: boolean }) {
  const { t } = useSettingsStore();
  const name = trip.profiles?.full_name ?? 'Traveler';
  const avatar = trip.profiles?.avatar_url ?? null;
  const rating = trip.profiles?.rating ?? 0;
  const totalTrips = trip.profiles?.total_trips ?? 0;

  const handleChat = () => {
    if (!trip.triper_id) return;
    router.push({
      pathname: '/chat/[id]',
      params: { id: trip.id, receiverId: trip.triper_id },
    } as any);
  };

  return (
    <TouchableOpacity
      style={[s.card, isOwn && s.cardOwn]}
      activeOpacity={0.7}
      onPress={() => router.push(`/trip/${trip.id}`)}
    >
      {isOwn && (
        <View style={s.ownBanner}>
          <Ionicons name="person-circle" size={13} color={Colors.primary} />
          <Text style={s.ownBannerTxt}>{t.myTrips}</Text>
          <View style={{ flex: 1 }} />
          <TouchableOpacity style={s.manageBtn} onPress={() => router.push(`/trip/${trip.id}`)}>
            <Text style={s.manageBtnTxt}>{t.manage}</Text>
            <Ionicons name="settings-outline" size={12} color={Colors.primary} />
          </TouchableOpacity>
        </View>
      )}

      <View style={s.cardTop}>
        <Avatar uri={avatar} name={name} size="md" />
        <View style={s.tripInfo}>
          <Text style={s.tripName}>{name}</Text>
          <View style={s.ratingRow}>
            <Ionicons name="star" size={12} color={Colors.primary} />
            <Text style={s.ratingTxt}>{rating > 0 ? rating.toFixed(1) : '—'}</Text>
            <Text style={s.reviewCnt}>· {totalTrips} {t.activeTrips}</Text>
          </View>
        </View>
        {trip.capacity_kg != null && (
          <View style={[s.capBadge, isOwn && s.capBadgeOwn]}>
            <Text style={[s.capTxt, isOwn && { color: Colors.white }]}>{trip.capacity_kg} kg</Text>
          </View>
        )}
      </View>

      <View style={[s.routeRow, isOwn && s.routeRowOwn]}>
        <View style={s.routeCity}>
          <Text style={s.routeLbl}>{t.origin}</Text>
          <Text style={s.routeNm} numberOfLines={1}>{trip.origin_country || '—'}</Text>
        </View>
        <View style={s.routeArrow}>
          <View style={[s.routeLine, isOwn && s.routeLineOwn]} />
          <View style={[s.planeWrap, isOwn && s.planeWrapOwn]}>
            <Ionicons name="airplane" size={14} color={isOwn ? Colors.white : Colors.primary} />
          </View>
          <View style={[s.routeLine, isOwn && s.routeLineOwn]} />
        </View>
        <View style={[s.routeCity, { alignItems: 'flex-end' }]}>
          <Text style={s.routeLbl}>{t.destination}</Text>
          <Text style={s.routeNm} numberOfLines={1}>{trip.destination_country || '—'}</Text>
          {trip.destination_city ? (
            <Text style={s.routeSubCity} numberOfLines={1}>{trip.destination_city}</Text>
          ) : null}
        </View>
      </View>

      <View style={s.cardFoot}>
        <View style={s.dateRow}>
          <Ionicons name="calendar-outline" size={13} color={Colors.darkGray} />
          <Text style={s.dateTxt}>{trip.departure_date || t.departingOn}</Text>
        </View>

        {isOwn ? (
          <TouchableOpacity style={s.reqBtn} onPress={() => router.push(`/trip/${trip.id}`)}>
            <Text style={s.reqBtnTxt}>{t.viewTrip}</Text>
          </TouchableOpacity>
        ) : (
          <View style={s.footActions}>
            <TouchableOpacity style={s.chatBtn} onPress={handleChat}>
              <Ionicons name="chatbubble-outline" size={17} color={Colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity style={s.reqBtn} onPress={() => router.push(`/trip/${trip.id}`)}>
              <Text style={s.reqBtnTxt}>{t.viewCatalog}</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.offWhite },

  section: { marginBottom: Spacing.xl, paddingHorizontal: Spacing.xl },
  sectionHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: Spacing.xl,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontFamily: Typography.serifBold.fontFamily,
    fontSize: Typography.sizes.lg,
    color: Colors.nearBlack,
  },
  sectionSub: {
    fontFamily: Typography.regular.fontFamily,
    fontSize: Typography.sizes.xs,
    color: Colors.darkGray,
  },

  // Country cards
  countryListWrap: { marginBottom: Spacing.xl },
  countryList: { gap: Spacing.sm, paddingHorizontal: Spacing.xl },
  countryCard: {
    width: COUNTRY_CARD_W,
    height: COUNTRY_CARD_H,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    ...Shadows.md,
  },
  countryImg: { width: '100%', height: '100%' },
  countryInfo: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: Spacing.md,
    gap: 4,
  },
  countryFlag: { fontSize: 22 },
  countryName: {
    fontFamily: Typography.serifBold.fontFamily,
    fontSize: Typography.sizes.base,
    color: Colors.white,
  },
  countryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(197,162,103,0.22)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  countryPillTxt: {
    fontFamily: Typography.regular.fontFamily,
    fontSize: 9,
    color: Colors.primary,
  },

  // Trip cards
  card: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.lightGray,
    ...Shadows.sm,
  },
  cardOwn: { borderColor: Colors.primary, borderWidth: 2, backgroundColor: '#FFFDF7' },

  ownBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: Spacing.md,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.primaryLight,
  },
  ownBannerTxt: {
    fontFamily: Typography.regular.fontFamily,
    fontSize: Typography.sizes.xs,
    color: Colors.primary,
  },
  manageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.primaryLight,
    backgroundColor: Colors.primaryPale,
  },
  manageBtnTxt: {
    fontFamily: Typography.regular.fontFamily,
    fontSize: 11,
    color: Colors.primary,
  },

  cardTop: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.base },
  tripInfo: { marginLeft: Spacing.md, flex: 1 },
  tripName: {
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
  capBadge: {
    backgroundColor: Colors.primaryPale,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.primaryLight,
  },
  capBadgeOwn: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  capTxt: {
    fontFamily: Typography.regular.fontFamily,
    fontSize: 11,
    color: Colors.primary,
  },

  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.base,
    paddingHorizontal: Spacing.xs,
    backgroundColor: Colors.offWhite,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
  },
  routeRowOwn: { backgroundColor: '#FFF8EC' },
  routeCity: { flex: 1, paddingHorizontal: Spacing.sm },
  routeLbl: {
    fontFamily: Typography.regular.fontFamily,
    fontSize: 10,
    color: Colors.charcoal,
    letterSpacing: 1.2,
    marginBottom: 3,
  },
  routeNm: {
    fontFamily: Typography.regular.fontFamily,
    fontSize: Typography.sizes.md,
    color: Colors.nearBlack,
  },
  routeSubCity: {
    fontFamily: Typography.regular.fontFamily,
    fontSize: Typography.sizes.xs,
    color: Colors.darkGray,
    marginTop: 1,
  },
  routeArrow: { flexDirection: 'row', alignItems: 'center', width: 80 },
  routeLine: { flex: 1, height: 1.5, backgroundColor: Colors.midGray },
  routeLineOwn: { backgroundColor: Colors.primaryLight },
  planeWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primaryPale,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 2,
  },
  planeWrapOwn: { backgroundColor: Colors.primary },

  cardFoot: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.lightGray,
    paddingTop: Spacing.md,
  },
  footActions: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
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
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  dateTxt: {
    fontFamily: Typography.regular.fontFamily,
    fontSize: Typography.sizes.sm,
    color: Colors.darkGray,
  },
  reqBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: 7,
    borderRadius: BorderRadius.full,
  },
  reqBtnTxt: {
    fontFamily: Typography.regular.fontFamily,
    fontSize: Typography.sizes.sm,
    color: Colors.white,
  },

  empty: { alignItems: 'center', paddingVertical: Spacing['2xl'], gap: Spacing.md },
  emptyTxt: {
    fontFamily: Typography.medium.fontFamily,
    fontSize: Typography.sizes.base,
    color: Colors.darkGray,
  },
  postBtn: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.primaryPale,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  postBtnTxt: {
    fontFamily: Typography.regular.fontFamily,
    fontSize: Typography.sizes.sm,
    color: Colors.primary,
  },
});
