import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, Alert, RefreshControl, TextInput,
  Modal, ScrollView,
} from 'react-native';
import { Image } from 'expo-image';
import { router, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useAuthStore } from '@/src/store/authStore';
import {
  getRequestsForTriper,
  CustomRequestWithProfile,
} from '@/src/services/supabase/requests';
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
    category: (r as any).category ?? 'other',
    targetCountries: r.target_country ? [r.target_country] : [],
    referenceUrl: r.item_url ?? null,
    imageUrl: (r.image_urls as string[] | null)?.[0] ?? null,
    status: (r.status === 'taken' ? 'matched' : r.status) as 'open' | 'matched' | 'closed',
    createdAt: new Date(r.created_at ?? Date.now()).getTime(),
  };
}

const fmtCurrency = (amount: number, currency: string) =>
  amount.toLocaleString('id-ID', { style: 'currency', currency, maximumFractionDigits: 0 });

const timeAgo = (ms: number): string => {
  const diff = Date.now() - ms;
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m}m lalu`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}j lalu`;
  return `${Math.floor(h / 24)}h lalu`;
};

// ─── Detail Modal ─────────────────────────────────────────────────────────────

function DetailModal({ item, onClose }: {
  item: CustomRequest | null;
  onClose: () => void;
}) {
  const user = useAuthStore((s) => s.user);
  if (!item) return null;

  const isOwn = item.buyerId === user?.id;

  const statusColor = item.status === 'open' ? Colors.success : item.status === 'matched' ? Colors.primary : Colors.gray;
  const statusLabel = item.status === 'open' ? 'Terbuka' : item.status === 'matched' ? 'Diambil' : 'Ditutup';

  return (
    <Modal visible={!!item} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={d.safe} edges={['top']}>
        {/* Header */}
        <View style={d.header}>
          <TouchableOpacity onPress={onClose} style={d.closeBtn}>
            <Ionicons name="close" size={22} color={Colors.nearBlack} />
          </TouchableOpacity>
          <Text style={d.headerTitle}>Detail Permintaan</Text>
          <View style={d.statusPill}>
            <View style={[d.statusDot, { backgroundColor: statusColor }]} />
            <Text style={[d.statusLabel, { color: statusColor }]}>{statusLabel}</Text>
          </View>
        </View>

        <ScrollView style={d.scroll} contentContainerStyle={d.content} showsVerticalScrollIndicator={false}>
          {/* Product Image */}
          {item.imageUrl ? (
            <Image source={{ uri: item.imageUrl }} style={d.heroImage} contentFit="cover" transition={300} />
          ) : (
            <View style={d.heroPlaceholder}>
              <Ionicons name="cube-outline" size={56} color={Colors.midGray} />
              <Text style={d.noImageText}>Tidak ada foto referensi</Text>
            </View>
          )}

          {/* Product Name */}
          <Text style={d.productName}>{item.productName}</Text>

          {/* Buyer Info */}
          <View style={d.buyerCard}>
            <View style={d.buyerAvatar}>
              <Text style={d.buyerInitial}>{(item.buyerName[0] ?? 'U').toUpperCase()}</Text>
            </View>
            <View style={d.buyerInfo}>
              <Text style={d.buyerLabel}>Diminta oleh</Text>
              <Text style={d.buyerName}>{item.buyerName}</Text>
            </View>
            <Text style={d.timeAgo}>{timeAgo(item.createdAt)}</Text>
          </View>

          {/* Description */}
          {item.description ? (
            <View style={d.section}>
              <Text style={d.sectionTitle}>Deskripsi</Text>
              <Text style={d.descText}>{item.description}</Text>
            </View>
          ) : null}

          {/* Details Grid */}
          <View style={d.detailGrid}>
            <View style={d.detailItem}>
              <Ionicons name="wallet-outline" size={18} color={Colors.primary} />
              <Text style={d.detailLabel}>Budget Maks</Text>
              <Text style={d.detailValue}>{fmtCurrency(item.maxBudget, item.currency)}</Text>
            </View>

            <View style={d.detailItem}>
              <Ionicons name="grid-outline" size={18} color={Colors.primary} />
              <Text style={d.detailLabel}>Kategori</Text>
              <Text style={d.detailValue} numberOfLines={1}>{item.category}</Text>
            </View>

            {item.targetCountries.length > 0 && (
              <View style={d.detailItem}>
                <Ionicons name="location-outline" size={18} color={Colors.primary} />
                <Text style={d.detailLabel}>Negara Tujuan</Text>
                <Text style={d.detailValue}>{item.targetCountries.join(', ')}</Text>
              </View>
            )}

            {item.referenceUrl && (
              <View style={d.detailItem}>
                <Ionicons name="link-outline" size={18} color={Colors.primary} />
                <Text style={d.detailLabel}>Link Referensi</Text>
                <Text style={d.detailValue} numberOfLines={2}>{item.referenceUrl}</Text>
              </View>
            )}
          </View>

          {/* Badge milik sendiri */}
          {isOwn && (
            <View style={d.ownBanner}>
              <Ionicons name="person-circle-outline" size={18} color={Colors.primary} />
              <Text style={d.ownBannerText}>Ini adalah permintaanmu sendiri</Text>
            </View>
          )}

        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const d = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.white },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.base, paddingVertical: Spacing.md,
    borderBottomWidth: 1, borderBottomColor: Colors.lightGray,
  },
  closeBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.offWhite, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontFamily: Typography.semiBold.fontFamily, fontSize: Typography.sizes.md, color: Colors.nearBlack },
  statusPill: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: Colors.offWhite, paddingHorizontal: Spacing.sm, paddingVertical: 4, borderRadius: BorderRadius.full },
  statusDot: { width: 7, height: 7, borderRadius: 4 },
  statusLabel: { fontFamily: Typography.semiBold.fontFamily, fontSize: Typography.sizes.xs },
  scroll: { flex: 1 },
  content: { paddingBottom: 48 },
  heroImage: { width: '100%', height: 260 },
  heroPlaceholder: { width: '100%', height: 180, backgroundColor: Colors.lightGray, alignItems: 'center', justifyContent: 'center', gap: Spacing.sm },
  noImageText: { fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.sm, color: Colors.gray },
  productName: { fontFamily: Typography.serifBold.fontFamily, fontSize: 22, color: Colors.nearBlack, paddingHorizontal: Spacing.base, paddingTop: Spacing.base, marginBottom: Spacing.sm },
  buyerCard: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    marginHorizontal: Spacing.base, padding: Spacing.md,
    backgroundColor: Colors.offWhite, borderRadius: BorderRadius.lg,
    marginBottom: Spacing.base,
  },
  buyerAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.primary + '25', alignItems: 'center', justifyContent: 'center' },
  buyerInitial: { fontFamily: Typography.bold.fontFamily, fontSize: Typography.sizes.base, color: Colors.primary },
  buyerInfo: { flex: 1 },
  buyerLabel: { fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.xs, color: Colors.gray },
  buyerName: { fontFamily: Typography.semiBold.fontFamily, fontSize: Typography.sizes.sm, color: Colors.nearBlack },
  timeAgo: { fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.xs, color: Colors.gray },
  section: { paddingHorizontal: Spacing.base, marginBottom: Spacing.base },
  sectionTitle: { fontFamily: Typography.semiBold.fontFamily, fontSize: Typography.sizes.sm, color: Colors.charcoal, marginBottom: Spacing.sm },
  descText: { fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.base, color: Colors.darkGray, lineHeight: 22 },
  detailGrid: { marginHorizontal: Spacing.base, gap: Spacing.sm, marginBottom: Spacing.base },
  detailItem: {
    flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.md,
    backgroundColor: Colors.offWhite, borderRadius: BorderRadius.md,
    padding: Spacing.md, borderWidth: 1, borderColor: Colors.lightGray,
  },
  detailLabel: { fontFamily: Typography.medium.fontFamily, fontSize: Typography.sizes.xs, color: Colors.gray, width: 90 },
  detailValue: { flex: 1, fontFamily: Typography.semiBold.fontFamily, fontSize: Typography.sizes.sm, color: Colors.nearBlack },
  ownBanner: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    marginHorizontal: Spacing.base, padding: Spacing.md,
    backgroundColor: Colors.primary + '12', borderRadius: BorderRadius.md,
    borderWidth: 1, borderColor: Colors.primary + '30', marginBottom: Spacing.base,
  },
  ownBannerText: { fontFamily: Typography.medium.fontFamily, fontSize: Typography.sizes.sm, color: Colors.primary },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function CustomRequestsScreen() {
  const user = useAuthStore((s) => s.user);
  const [requests, setRequests]               = useState<CustomRequest[]>([]);
  const [loading, setLoading]                 = useState(true);
  const [refreshing, setRefreshing]           = useState(false);
  const [search, setSearch]                   = useState('');
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [selected, setSelected]               = useState<CustomRequest | null>(null);

  const load = useCallback(async () => {
    try {
      if (!user) { setRequests([]); setLoading(false); setRefreshing(false); return; }
      const raw = await getRequestsForTriper(user.id);
      setRequests(raw.map(mapRequest));
    } catch (e: any) {
      Alert.alert('Gagal memuat', e?.message ?? 'Terjadi kesalahan. Coba lagi.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const filtered = requests.filter((r) => {
    const matchesSearch =
      !search ||
      r.productName.toLowerCase().includes(search.toLowerCase()) ||
      r.description.toLowerCase().includes(search.toLowerCase());
    const matchesCountry = !selectedCountry || r.targetCountries.includes(selectedCountry);
    return matchesSearch && matchesCountry;
  });

  const allCountries = Array.from(new Set(requests.flatMap((r) => r.targetCountries))).sort();

  const renderItem = useCallback(
    ({ item }: { item: CustomRequest }) => {
      const isOwn = item.buyerId === user?.id;

      return (
        <TouchableOpacity
          style={styles.card}
          activeOpacity={0.75}
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setSelected(item); }}
        >
          <View style={styles.cardHeader}>
            {item.imageUrl ? (
              <Image source={{ uri: item.imageUrl }} style={styles.productThumb} contentFit="cover" transition={200} />
            ) : (
              <View style={[styles.productThumb, styles.thumbPlaceholder]}>
                <Ionicons name="cube-outline" size={22} color={Colors.gray} />
              </View>
            )}

            <View style={styles.cardHeaderInfo}>
              <Text style={styles.productName} numberOfLines={1}>{item.productName}</Text>
              <View style={styles.metaRow}>
                <View style={styles.categoryChip}>
                  <Text style={styles.categoryText}>{item.category}</Text>
                </View>
                <Text style={styles.timeText}>{timeAgo(item.createdAt)}</Text>
              </View>
            </View>

            <View style={[styles.statusBadge, item.status === 'matched' && styles.statusMatched]}>
              <Text style={[styles.statusText, item.status === 'matched' && styles.statusTextMatched]}>
                {item.status === 'open' ? 'Terbuka' : item.status === 'matched' ? 'Diambil' : 'Ditutup'}
              </Text>
            </View>
          </View>

          <Text style={styles.description} numberOfLines={2}>{item.description}</Text>

          {item.targetCountries.length > 0 && (
            <View style={styles.countriesRow}>
              <Ionicons name="location-outline" size={13} color={Colors.gray} />
              <Text style={styles.countriesText} numberOfLines={1}>{item.targetCountries.join(' · ')}</Text>
            </View>
          )}

          <View style={styles.cardFooter}>
            <View style={styles.buyerRow}>
              <Ionicons name="person-circle-outline" size={16} color={Colors.gray} />
              <Text style={styles.buyerName}>{item.buyerName}</Text>
            </View>

            <Text style={styles.budget}>{fmtCurrency(item.maxBudget, item.currency)}</Text>

            {isOwn && (
              <View style={styles.ownBadge}>
                <Ionicons name="person" size={12} color={Colors.primary} />
                <Text style={styles.ownText}>Milikmu</Text>
              </View>
            )}

            <View style={styles.forMeBadge}>
              <Ionicons name="airplane" size={12} color={Colors.primary} />
              <Text style={styles.forMeText}>Untuk saya</Text>
            </View>

            <Ionicons name="chevron-forward" size={16} color={Colors.midGray} />
          </View>
        </TouchableOpacity>
      );
    },
    [user],
  );

  const ListEmpty = () => (
    <View style={styles.empty}>
      <Ionicons name="bag-outline" size={64} color={Colors.midGray} />
      <Text style={styles.emptyTitle}>Belum ada permintaan untukmu</Text>
      <Text style={styles.emptySubtitle}>
        Permintaan yang dikirim khusus ke kamu akan muncul di sini.
      </Text>
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
        <View style={{ width: 40 }} />
      </View>

      {/* Info banner */}
      <View style={styles.tabDesc}>
        <Ionicons name="airplane-outline" size={13} color={Colors.darkGray} />
        <Text style={styles.tabDescText}>
          Permintaan yang secara khusus ditujukan ke kamu sebagai jastiper
        </Text>
      </View>

      {/* Search */}
      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={16} color={Colors.gray} />
        <TextInput
          style={styles.searchInput}
          placeholder="Cari permintaan..."
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
          data={['Semua', ...allCountries]}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item}
          style={styles.filterList}
          contentContainerStyle={styles.filterContent}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.filterChip,
                (item === 'Semua' ? selectedCountry === null : selectedCountry === item) && styles.filterChipActive,
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setSelectedCountry(item === 'Semua' ? null : item);
              }}
            >
              <Text
                style={[
                  styles.filterChipText,
                  (item === 'Semua' ? selectedCountry === null : selectedCountry === item) && styles.filterChipTextActive,
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

      {/* Detail Modal */}
      <DetailModal
        item={selected}
        onClose={() => setSelected(null)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.offWhite },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.base, paddingVertical: Spacing.md,
    backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.lightGray,
  },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.offWhite, alignItems: 'center', justifyContent: 'center' },
  headerTitle: {
    fontFamily: Typography.semiBold.fontFamily,
    fontSize: Typography.sizes.md,
    color: Colors.nearBlack,
  },

  tabDesc: {
    flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.xs,
    marginHorizontal: Spacing.base, marginBottom: Spacing.sm,
  },
  tabDescText: {
    flex: 1, fontFamily: Typography.regular.fontFamily,
    fontSize: Typography.sizes.xs, color: Colors.darkGray, lineHeight: 16,
  },

  searchBar: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white,
    marginHorizontal: Spacing.base, marginBottom: Spacing.sm,
    borderRadius: BorderRadius.lg, paddingHorizontal: Spacing.md,
    gap: Spacing.sm, borderWidth: 1, borderColor: Colors.midGray, ...Shadows.sm,
  },
  searchInput: {
    flex: 1, fontFamily: Typography.regular.fontFamily,
    fontSize: Typography.sizes.sm, color: Colors.nearBlack, paddingVertical: Spacing.md,
  },

  filterList: { maxHeight: 44 },
  filterContent: { paddingHorizontal: Spacing.base, gap: Spacing.sm, paddingBottom: Spacing.sm },
  filterChip: {
    paddingHorizontal: Spacing.md, paddingVertical: 6, borderRadius: BorderRadius.full,
    backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.midGray,
  },
  filterChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  filterChipText: { fontFamily: Typography.medium.fontFamily, fontSize: Typography.sizes.xs, color: Colors.darkGray },
  filterChipTextActive: { color: Colors.white },

  listContent: { padding: Spacing.base, paddingTop: Spacing.sm, paddingBottom: 40 },

  card: {
    backgroundColor: Colors.white, borderRadius: BorderRadius.lg,
    padding: Spacing.base, marginBottom: Spacing.md,
    ...Shadows.md, borderWidth: 1, borderColor: Colors.lightGray,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.md, marginBottom: Spacing.sm },
  productThumb: { width: 56, height: 56, borderRadius: BorderRadius.md, flexShrink: 0 },
  thumbPlaceholder: { backgroundColor: Colors.lightGray, alignItems: 'center', justifyContent: 'center' },
  cardHeaderInfo: { flex: 1 },
  productName: { fontFamily: Typography.semiBold.fontFamily, fontSize: Typography.sizes.base, color: Colors.nearBlack, marginBottom: 4 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  categoryChip: { backgroundColor: Colors.primary + '18', paddingHorizontal: 8, paddingVertical: 2, borderRadius: BorderRadius.full },
  categoryText: { fontFamily: Typography.medium.fontFamily, fontSize: 10, color: Colors.primaryDark, textTransform: 'capitalize' },
  timeText: { fontFamily: Typography.regular.fontFamily, fontSize: 10, color: Colors.gray },
  statusBadge: { paddingHorizontal: Spacing.sm, paddingVertical: 3, borderRadius: BorderRadius.full, backgroundColor: Colors.successLight },
  statusMatched: { backgroundColor: Colors.primaryPale },
  statusText: { fontFamily: Typography.semiBold.fontFamily, fontSize: 10, color: Colors.success },
  statusTextMatched: { color: Colors.primary },

  description: { fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.sm, color: Colors.darkGray, lineHeight: 20, marginBottom: Spacing.sm },
  countriesRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: Spacing.sm },
  countriesText: { fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.xs, color: Colors.gray, flex: 1 },

  cardFooter: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingTop: Spacing.sm, borderTopWidth: 1, borderTopColor: Colors.lightGray },
  buyerRow: { flexDirection: 'row', alignItems: 'center', gap: 4, flex: 1 },
  buyerName: { fontFamily: Typography.medium.fontFamily, fontSize: Typography.sizes.xs, color: Colors.darkGray },
  budget: { fontFamily: Typography.bold.fontFamily, fontSize: Typography.sizes.sm, color: Colors.primary },

  forMeBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: Spacing.sm, paddingVertical: 4,
    borderRadius: BorderRadius.full, backgroundColor: Colors.primaryPale,
    borderWidth: 1, borderColor: Colors.primaryLight,
  },
  forMeText: { fontFamily: Typography.medium.fontFamily, fontSize: 10, color: Colors.primary },

  ownBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: Spacing.sm, paddingVertical: 4,
    borderRadius: BorderRadius.full, backgroundColor: Colors.primary + '15',
  },
  ownText: { fontFamily: Typography.medium.fontFamily, fontSize: 10, color: Colors.primary },

  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  empty: { alignItems: 'center', paddingVertical: 60, paddingHorizontal: Spacing.xl },
  emptyTitle: { fontFamily: Typography.semiBold.fontFamily, fontSize: Typography.sizes.lg, color: Colors.charcoal, marginTop: Spacing.base, marginBottom: Spacing.sm },
  emptySubtitle: { fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.sm, color: Colors.gray, textAlign: 'center', lineHeight: 20 },
});
