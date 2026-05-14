/**
 * TipL — Custom Requests List Screen
 * Buyers browse open requests; Travelers browse & accept requests matching their trip.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
  TextInput,
} from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useAuthStore } from '@/src/store/authStore';
import { getOpenRequests, getMyRequests, acceptRequest, CustomRequestWithProfile } from '@/src/services/supabase/requests';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/src/lib/constants';

interface CustomRequest {
  id: string;
  buyerId: string;
  buyerName: string;
  buyerAvatar: string | null;
  productName: string;
  description: string;
  maxBudget: number;
  currency: string;
  category: string;
  targetCountries: string[];
  referenceUrl: string | null;
  imageUrl: string | null;
  status: 'open' | 'matched' | 'closed';
  createdAt: number;
}

function mapRequest(r: CustomRequestWithProfile): CustomRequest {
  const p = r.profiles as any;
  return {
    id: r.id,
    buyerId: r.tiper_id,
    buyerName: p?.full_name ?? 'User',
    buyerAvatar: p?.avatar_url ?? null,
    productName: r.item_name,
    description: r.description ?? '',
    maxBudget: r.budget_max ?? 0,
    currency: r.currency ?? 'IDR',
    category: r.category ?? 'other',
    targetCountries: r.target_country ? [r.target_country] : [],
    referenceUrl: r.item_url ?? null,
    imageUrl: (r.image_urls as string[] | null)?.[0] ?? null,
    status: (r.status === 'taken' ? 'matched' : r.status) as 'open' | 'matched' | 'closed',
    createdAt: new Date(r.created_at).getTime(),
  };
}

const fmtCurrency = (amount: number, currency: string) =>
  amount.toLocaleString('id-ID', { style: 'currency', currency, maximumFractionDigits: 0 });

const timeAgo = (ms: number): string => {
  const diff = Date.now() - ms;
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};

export default function CustomRequestsScreen() {
  const user = useAuthStore((s) => s.user);
  const [requests, setRequests] = useState<CustomRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);

  // View mode: 'browse' = Triper sees all open requests, 'mine' = Tiper sees own
  const [mode, setMode] = useState<'browse' | 'mine'>('browse');

  const load = useCallback(async () => {
    if (!user && mode === 'mine') { setLoading(false); setRefreshing(false); return; }
    try {
      const raw = mode === 'mine' && user
        ? await getMyRequests(user.id)
        : await getOpenRequests();
      setRequests(raw.map(mapRequest));
    } catch { /* ignore */ } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [mode, user]);

  useEffect(() => { load(); }, [load]);

  const handleAccept = useCallback(
    async (request: CustomRequest) => {
      if (!user) return;
      Alert.alert(
        'Accept Request',
        `Accept "${request.productName}" for up to ${fmtCurrency(request.maxBudget, request.currency)}?\n\nThis will open a chat with the buyer.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Accept',
            onPress: async () => {
              setAcceptingId(request.id);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              try {
                await acceptRequest(request.id, user.id);
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                load();
                Alert.alert(
                  'Request Accepted!',
                  'A chat has been opened with the buyer.',
                  [{ text: 'OK' }],
                );
              } catch {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                Alert.alert('Error', 'Failed to accept. Please try again.');
              } finally {
                setAcceptingId(null);
              }
            },
          },
        ],
      );
    },
    [user, load],
  );

  const filtered = requests.filter((r) => {
    const matchesSearch =
      !search ||
      r.productName.toLowerCase().includes(search.toLowerCase()) ||
      r.description.toLowerCase().includes(search.toLowerCase());
    const matchesCountry =
      !selectedCountry || r.targetCountries.includes(selectedCountry);
    return matchesSearch && matchesCountry;
  });

  const allCountries = Array.from(
    new Set(requests.flatMap((r) => r.targetCountries)),
  ).sort();

  const renderItem = useCallback(
    ({ item }: { item: CustomRequest }) => {
      const isOwn = item.buyerId === user?.id;
      const isAccepting = acceptingId === item.id;

      return (
        <View style={styles.card}>
          {/* Header Row */}
          <View style={styles.cardHeader}>
            {item.imageUrl ? (
              <Image
                source={{ uri: item.imageUrl }}
                style={styles.productThumb}
                contentFit="cover"
                transition={200}
              />
            ) : (
              <View style={[styles.productThumb, styles.thumbPlaceholder]}>
                <Ionicons name="cube-outline" size={22} color={Colors.gray} />
              </View>
            )}

            <View style={styles.cardHeaderInfo}>
              <Text style={styles.productName} numberOfLines={1}>
                {item.productName}
              </Text>
              <View style={styles.metaRow}>
                <View style={styles.categoryChip}>
                  <Text style={styles.categoryText}>{item.category}</Text>
                </View>
                <Text style={styles.timeText}>{timeAgo(item.createdAt)}</Text>
              </View>
            </View>

            {/* Status badge */}
            <View style={[styles.statusBadge, item.status === 'matched' && styles.statusMatched]}>
              <Text style={styles.statusText}>
                {item.status === 'open' ? 'Open' : item.status === 'matched' ? 'Matched' : 'Closed'}
              </Text>
            </View>
          </View>

          {/* Description */}
          <Text style={styles.description} numberOfLines={2}>
            {item.description}
          </Text>

          {/* Countries */}
          <View style={styles.countriesRow}>
            <Ionicons name="location-outline" size={13} color={Colors.gray} />
            <Text style={styles.countriesText} numberOfLines={1}>
              {item.targetCountries.join(' · ')}
            </Text>
          </View>

          {/* Footer */}
          <View style={styles.cardFooter}>
            {/* Buyer */}
            <View style={styles.buyerRow}>
              <Ionicons name="person-circle-outline" size={16} color={Colors.gray} />
              <Text style={styles.buyerName}>{item.buyerName}</Text>
            </View>

            {/* Budget */}
            <Text style={styles.budget}>
              Max {fmtCurrency(item.maxBudget, item.currency)}
            </Text>

            {/* Action */}
            {!isOwn && item.status === 'open' && (
              <TouchableOpacity
                style={styles.acceptBtn}
                onPress={() => handleAccept(item)}
                disabled={isAccepting}
                activeOpacity={0.8}
              >
                {isAccepting ? (
                  <ActivityIndicator size="small" color={Colors.white} />
                ) : (
                  <>
                    <Ionicons name="checkmark-circle" size={15} color={Colors.white} />
                    <Text style={styles.acceptText}>Accept</Text>
                  </>
                )}
              </TouchableOpacity>
            )}
            {isOwn && (
              <View style={styles.ownBadge}>
                <Ionicons name="person" size={12} color={Colors.primary} />
                <Text style={styles.ownText}>Your request</Text>
              </View>
            )}
          </View>

          {item.referenceUrl && (
            <View style={styles.refUrlRow}>
              <Ionicons name="link-outline" size={12} color={Colors.primary} />
              <Text style={styles.refUrlText} numberOfLines={1}>
                {item.referenceUrl}
              </Text>
            </View>
          )}
        </View>
      );
    },
    [user, acceptingId, handleAccept],
  );

  const ListEmpty = () => (
    <View style={styles.empty}>
      <Ionicons name="bag-outline" size={64} color={Colors.midGray} />
      <Text style={styles.emptyTitle}>No requests yet</Text>
      <Text style={styles.emptySubtitle}>
        {mode === 'mine'
          ? 'Post your first request and let travelers bring it for you.'
          : 'No open requests match your filter.'}
      </Text>
      {mode === 'mine' && (
        <TouchableOpacity
          style={styles.emptyBtn}
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push('/request/create'); }}
        >
          <Text style={styles.emptyBtnText}>Post a Request</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={Colors.nearBlack} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Permintaan</Text>
        <TouchableOpacity
          style={styles.newBtn}
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push('/request/create'); }}
        >
          <Ionicons name="add" size={22} color={Colors.nearBlack} />
        </TouchableOpacity>
      </View>

      {/* Mode toggle */}
      <View style={styles.modeToggle}>
        <TouchableOpacity
          style={[styles.modeBtn, mode === 'browse' && styles.modeBtnActive]}
          onPress={() => { setMode('browse'); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
        >
          <Ionicons name="search-outline" size={14} color={mode === 'browse' ? Colors.white : Colors.gray} />
          <Text style={[styles.modeBtnText, mode === 'browse' && styles.modeBtnTextActive]}>Browse</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.modeBtn, mode === 'mine' && styles.modeBtnActive]}
          onPress={() => { setMode('mine'); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
        >
          <Ionicons name="person-outline" size={14} color={mode === 'mine' ? Colors.white : Colors.gray} />
          <Text style={[styles.modeBtnText, mode === 'mine' && styles.modeBtnTextActive]}>My Requests</Text>
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={16} color={Colors.gray} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search requests..."
          placeholderTextColor={Colors.gray}
          value={search}
          onChangeText={setSearch}
          returnKeyType="search"
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={16} color={Colors.gray} />
          </TouchableOpacity>
        )}
      </View>

      {/* Country filter chips */}
      {allCountries.length > 0 && (
        <FlatList
          data={['All', ...allCountries]}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item}
          style={styles.filterList}
          contentContainerStyle={styles.filterContent}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.filterChip,
                (item === 'All' ? selectedCountry === null : selectedCountry === item) && styles.filterChipActive,
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setSelectedCountry(item === 'All' ? null : item);
              }}
            >
              <Text
                style={[
                  styles.filterChipText,
                  (item === 'All' ? selectedCountry === null : selectedCountry === item) && styles.filterChipTextActive,
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          )}
        />
      )}

      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={<ListEmpty />}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); load(); }}
              tintColor={Colors.primary}
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.offWhite },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.offWhite,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: Typography.serifBold.fontFamily,
    fontSize: Typography.sizes.md,
    color: Colors.nearBlack,
  },
  newBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.offWhite,
    alignItems: 'center',
    justifyContent: 'center',
  },

  modeToggle: {
    flexDirection: 'row',
    backgroundColor: Colors.lightGray,
    margin: Spacing.base,
    borderRadius: BorderRadius.lg,
    padding: 3,
  },
  modeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  modeBtnActive: { backgroundColor: Colors.primary },
  modeBtnText: {
    fontFamily: Typography.medium.fontFamily,
    fontSize: Typography.sizes.sm,
    color: Colors.gray,
  },
  modeBtnTextActive: { color: Colors.white },

  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    marginHorizontal: Spacing.base,
    marginBottom: Spacing.sm,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.midGray,
    ...Shadows.sm,
  },
  searchInput: {
    flex: 1,
    fontFamily: Typography.regular.fontFamily,
    fontSize: Typography.sizes.sm,
    color: Colors.nearBlack,
    paddingVertical: Spacing.md,
  },

  filterList: { maxHeight: 44 },
  filterContent: {
    paddingHorizontal: Spacing.base,
    gap: Spacing.sm,
    paddingBottom: Spacing.sm,
  },
  filterChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.midGray,
  },
  filterChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  filterChipText: {
    fontFamily: Typography.medium.fontFamily,
    fontSize: Typography.sizes.xs,
    color: Colors.darkGray,
  },
  filterChipTextActive: { color: Colors.white },

  listContent: { padding: Spacing.base, paddingTop: Spacing.sm, paddingBottom: 40 },

  card: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    marginBottom: Spacing.md,
    ...Shadows.md,
    borderWidth: 1,
    borderColor: Colors.lightGray,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
    marginBottom: Spacing.sm,
  },
  productThumb: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.md,
    flexShrink: 0,
  },
  thumbPlaceholder: {
    backgroundColor: Colors.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardHeaderInfo: { flex: 1 },
  productName: {
    fontFamily: Typography.semiBold.fontFamily,
    fontSize: Typography.sizes.base,
    color: Colors.nearBlack,
    marginBottom: 4,
  },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  categoryChip: {
    backgroundColor: Colors.primary + '18',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  categoryText: {
    fontFamily: Typography.medium.fontFamily,
    fontSize: 10,
    color: Colors.primaryDark,
    textTransform: 'capitalize',
  },
  timeText: {
    fontFamily: Typography.regular.fontFamily,
    fontSize: 10,
    color: Colors.gray,
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.successLight,
  },
  statusMatched: { backgroundColor: Colors.infoLight },
  statusText: {
    fontFamily: Typography.semiBold.fontFamily,
    fontSize: 10,
    color: Colors.success,
  },

  description: {
    fontFamily: Typography.regular.fontFamily,
    fontSize: Typography.sizes.sm,
    color: Colors.darkGray,
    lineHeight: 20,
    marginBottom: Spacing.sm,
  },
  countriesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: Spacing.md,
  },
  countriesText: {
    fontFamily: Typography.regular.fontFamily,
    fontSize: Typography.sizes.xs,
    color: Colors.gray,
    flex: 1,
  },

  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.lightGray,
  },
  buyerRow: { flexDirection: 'row', alignItems: 'center', gap: 4, flex: 1 },
  buyerName: {
    fontFamily: Typography.medium.fontFamily,
    fontSize: Typography.sizes.xs,
    color: Colors.darkGray,
  },
  budget: {
    fontFamily: Typography.bold.fontFamily,
    fontSize: Typography.sizes.sm,
    color: Colors.primary,
  },
  acceptBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
    minWidth: 80,
    justifyContent: 'center',
    ...Shadows.sm,
  },
  acceptText: {
    fontFamily: Typography.semiBold.fontFamily,
    fontSize: Typography.sizes.sm,
    color: Colors.white,
  },
  ownBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary + '15',
  },
  ownText: {
    fontFamily: Typography.medium.fontFamily,
    fontSize: 10,
    color: Colors.primary,
  },

  refUrlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: Spacing.sm,
  },
  refUrlText: {
    fontFamily: Typography.regular.fontFamily,
    fontSize: 10,
    color: Colors.primary,
    flex: 1,
  },

  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  empty: { alignItems: 'center', paddingVertical: 60, paddingHorizontal: Spacing.xl },
  emptyTitle: {
    fontFamily: Typography.semiBold.fontFamily,
    fontSize: Typography.sizes.lg,
    color: Colors.charcoal,
    marginTop: Spacing.base,
    marginBottom: Spacing.sm,
  },
  emptySubtitle: {
    fontFamily: Typography.regular.fontFamily,
    fontSize: Typography.sizes.sm,
    color: Colors.gray,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: Spacing.xl,
  },
  emptyBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  emptyBtnText: {
    fontFamily: Typography.semiBold.fontFamily,
    fontSize: Typography.sizes.base,
    color: Colors.white,
  },
});
