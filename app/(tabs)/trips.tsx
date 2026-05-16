import React, { useState, useMemo, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  RefreshControl, ActivityIndicator,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/src/lib/constants';
import { Avatar } from '@/src/components/ui/Avatar';
import { useTrips, TripWithProfile } from '@/src/lib/hooks/useTrips';
import { useAuthStore } from '@/src/store/authStore';

type SortKey = 'date_asc' | 'date_desc' | 'newest';

type ListItem =
  | { _type: 'trip'; data: TripWithProfile; isOwn: boolean }
  | { _type: 'divider'; otherCount: number };

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'date_asc', label: 'Terdekat' },
  { key: 'date_desc', label: 'Terjauh' },
  { key: 'newest', label: 'Terbaru' },
];

export default function TripsScreen() {
  const { trips, loading, refetch } = useTrips();
  const currentUserId = useAuthStore((s) => s.user?.id ?? '');
  const [refreshing, setRefreshing] = useState(false);
  const [sort, setSort] = useState<SortKey>('date_asc');

  useFocusEffect(
    useCallback(() => { refetch(); }, [refetch])
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const { myTrips, otherTrips } = useMemo(() => {
    const compare = (a: TripWithProfile, b: TripWithProfile) => {
      const da = a.departure_date ?? '';
      const db = b.departure_date ?? '';
      if (sort === 'date_asc') return da.localeCompare(db);
      if (sort === 'date_desc') return db.localeCompare(da);
      return 0;
    };
    const all = [...trips].sort(compare);
    return {
      myTrips: all.filter((t) => t.triper_id === currentUserId),
      otherTrips: all.filter((t) => t.triper_id !== currentUserId),
    };
  }, [trips, sort, currentUserId]);

  const listData = useMemo((): ListItem[] => {
    const items: ListItem[] = myTrips.map((t) => ({
      _type: 'trip',
      data: t,
      isOwn: true,
    }));
    if (myTrips.length > 0 && otherTrips.length > 0) {
      items.push({ _type: 'divider', otherCount: otherTrips.length });
    }
    otherTrips.forEach((t) => items.push({ _type: 'trip', data: t, isOwn: false }));
    return items;
  }, [myTrips, otherTrips]);

  const totalOther = otherTrips.length;

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={s.header}>
        <Text style={s.headerTitle}>Trips</Text>
        <Text style={s.headerSub}>Jastiper yang sedang aktif</Text>
      </View>

      <View style={s.sortBar}>
        {SORT_OPTIONS.map((opt) => (
          <TouchableOpacity
            key={opt.key}
            style={[s.sortChip, sort === opt.key && s.sortChipActive]}
            onPress={() => setSort(opt.key)}
          >
            <Text style={[s.sortLabel, sort === opt.key && s.sortLabelActive]}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
        <View style={{ flex: 1 }} />
        <Text style={s.countTxt}>{totalOther} trips</Text>
      </View>

      {loading ? (
        <ActivityIndicator color={Colors.primary} style={{ marginTop: Spacing['2xl'] }} />
      ) : (
        <FlatList
          data={listData}
          keyExtractor={(item, idx) =>
            item._type === 'trip' ? item.data.id : `divider-${idx}`
          }
          contentContainerStyle={s.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={Colors.primary}
            />
          }
          ListEmptyComponent={
            <View style={s.empty}>
              <Ionicons name="airplane-outline" size={48} color={Colors.midGray} />
              <Text style={s.emptyTxt}>Belum ada trip aktif</Text>
              <TouchableOpacity style={s.postBtn} onPress={() => router.push('/trip/create')}>
                <Text style={s.postBtnTxt}>Buat Trip</Text>
              </TouchableOpacity>
            </View>
          }
          renderItem={({ item }) => {
            if (item._type === 'divider') {
              return <SectionDivider count={item.otherCount} />;
            }
            return <TripCard trip={item.data} isOwn={item.isOwn} />;
          }}
        />
      )}
    </SafeAreaView>
  );
}

// ─── Section divider ─────────────────────────────────────────────────────────
function SectionDivider({ count }: { count: number }) {
  return (
    <View style={s.divider}>
      <View style={s.dividerLine} />
      <Text style={s.dividerLabel}>Jastiper Lainnya ({count})</Text>
      <View style={s.dividerLine} />
    </View>
  );
}

// ─── Trip card ────────────────────────────────────────────────────────────────
function TripCard({ trip, isOwn }: { trip: TripWithProfile; isOwn: boolean }) {
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
      {/* Own trip badge */}
      {isOwn && (
        <View style={s.ownBanner}>
          <Ionicons name="person-circle" size={13} color={Colors.primary} />
          <Text style={s.ownBannerTxt}>Trip Saya</Text>
          <View style={{ flex: 1 }} />
          <TouchableOpacity
            style={s.manageBtn}
            onPress={() => router.push(`/trip/${trip.id}`)}
          >
            <Text style={s.manageBtnTxt}>Kelola</Text>
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
            <Text style={s.reviewCnt}>· {totalTrips} trips</Text>
          </View>
        </View>
        {trip.capacity_kg != null && (
          <View style={[s.capBadge, isOwn && s.capBadgeOwn]}>
            <Text style={s.capTxt}>{trip.capacity_kg} kg</Text>
          </View>
        )}
      </View>

      <View style={[s.routeRow, isOwn && s.routeRowOwn]}>
        <View style={s.routeCity}>
          <Text style={s.routeLbl}>FROM</Text>
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
          <Text style={s.routeLbl}>TO</Text>
          <Text style={s.routeNm} numberOfLines={1}>{trip.destination_country || '—'}</Text>
          {trip.destination_city ? (
            <Text style={s.routeSubCity} numberOfLines={1}>{trip.destination_city}</Text>
          ) : null}
        </View>
      </View>

      <View style={s.cardFoot}>
        <View style={s.dateRow}>
          <Ionicons name="calendar-outline" size={13} color={Colors.darkGray} />
          <Text style={s.dateTxt}>{trip.departure_date || 'TBD'}</Text>
        </View>

        {isOwn ? (
          <TouchableOpacity
            style={s.reqBtn}
            onPress={() => router.push(`/trip/${trip.id}`)}
          >
            <Text style={s.reqBtnTxt}>Lihat Trip</Text>
          </TouchableOpacity>
        ) : (
          <View style={s.footActions}>
            <TouchableOpacity style={s.chatBtn} onPress={handleChat}>
              <Ionicons name="chatbubble-outline" size={17} color={Colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={s.reqBtn}
              onPress={() => router.push(`/trip/${trip.id}`)}
            >
              <Text style={s.reqBtnTxt}>Request Item</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.offWhite },
  header: {
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  headerTitle: {
    fontFamily: Typography.serifBold.fontFamily,
    fontSize: Typography.sizes.xl,
    color: Colors.nearBlack,
  },
  headerSub: {
    fontFamily: Typography.regular.fontFamily,
    fontSize: Typography.sizes.xs,
    color: Colors.darkGray,
    marginTop: 2,
  },
  sortBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
    gap: Spacing.sm,
  },
  sortChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.midGray,
  },
  sortChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  sortLabel: {
    fontFamily: Typography.medium.fontFamily,
    fontSize: Typography.sizes.xs,
    color: Colors.darkGray,
  },
  sortLabelActive: { color: Colors.white },
  countTxt: {
    fontFamily: Typography.regular.fontFamily,
    fontSize: Typography.sizes.xs,
    color: Colors.darkGray,
  },

  list: { padding: Spacing.xl, paddingBottom: 100 },

  // ── Divider between own trips & others ──
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.lg,
    gap: Spacing.sm,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: Colors.midGray },
  dividerLabel: {
    fontFamily: Typography.medium.fontFamily,
    fontSize: Typography.sizes.xs,
    color: Colors.darkGray,
    letterSpacing: 0.3,
  },

  // ── Cards ──
  card: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.lightGray,
    ...Shadows.sm,
  },
  cardOwn: {
    borderColor: Colors.primary,
    borderWidth: 2,
    backgroundColor: '#FFFDF7',
  },

  // Own trip top banner
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
    fontFamily: Typography.semiBold.fontFamily,
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
    fontFamily: Typography.semiBold.fontFamily,
    fontSize: 11,
    color: Colors.primary,
  },

  cardTop: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.base },
  tripInfo: { marginLeft: Spacing.md, flex: 1 },
  tripName: {
    fontFamily: Typography.semiBold.fontFamily,
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
  capBadgeOwn: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  capTxt: {
    fontFamily: Typography.semiBold.fontFamily,
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
    fontFamily: Typography.semiBold.fontFamily,
    fontSize: 10,
    color: Colors.charcoal,
    letterSpacing: 1.2,
    marginBottom: 3,
  },
  routeNm: {
    fontFamily: Typography.bold.fontFamily,
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
  footActions: {
    flexDirection: 'row',
    alignItems: 'center',
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
    fontFamily: Typography.semiBold.fontFamily,
    fontSize: Typography.sizes.sm,
    color: Colors.white,
  },

  empty: { alignItems: 'center', paddingTop: Spacing['5xl'], gap: Spacing.base },
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
    fontFamily: Typography.semiBold.fontFamily,
    fontSize: Typography.sizes.sm,
    color: Colors.primary,
  },
});
