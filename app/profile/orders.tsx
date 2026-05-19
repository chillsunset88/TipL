/**
 * TipL — My Orders
 * Riwayat order dari Supabase, difilter per status, realtime.
 * Theme-aware: supports Dark Mode & Light Mode.
 */

import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, ScrollView,
  TouchableOpacity, ActivityIndicator, RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { PageHeader } from '@/src/components/ui/PageHeader';
import { Typography, Spacing, BorderRadius, Shadows } from '@/src/lib/constants';
import { useAuthStore } from '@/src/store/authStore';
import { useMyOrders } from '@/src/lib/hooks/useOrders';
import type { OrderWithProfiles } from '@/src/services/supabase/orders';
import { useThemeColors } from '@/src/lib/hooks/useThemeColors';

// ─── Status config ─────────────────────────────────────────────────────────────
const STATUS_LABEL: Record<string, string> = {
  pending:    'Belum Bayar',
  accepted:   'Diterima Traveler',
  in_escrow:  'Dibayar',
  purchased:  'Sedang Dibeli',
  shipped:    'Dikirim',
  delivered:  'Terkirim',
  completed:  'Selesai',
  cancelled:  'Dibatalkan',
  disputed:   'Sengketa',
};

const STATUS_COLOR: Record<string, string> = {
  pending:    '#F59E0B',
  accepted:   '#2196F3',
  in_escrow:  '#C4A265',
  purchased:  '#66BB6A',
  shipped:    '#42A5F5',
  delivered:  '#26A69A',
  completed:  '#43A047',
  cancelled:  '#EF5350',
  disputed:   '#FF7043',
};

const STATUS_ICON: Record<string, string> = {
  pending:    'time-outline',
  accepted:   'checkmark-outline',
  in_escrow:  'lock-closed-outline',
  purchased:  'bag-outline',
  shipped:    'airplane-outline',
  delivered:  'home-outline',
  completed:  'checkmark-circle-outline',
  cancelled:  'close-circle-outline',
  disputed:   'alert-circle-outline',
};

// ─── Filter tabs ───────────────────────────────────────────────────────────────
type FilterKey = 'all' | 'unpaid' | 'processing' | 'shipped' | 'done' | 'problem';

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all',        label: 'Semua' },
  { key: 'unpaid',     label: 'Belum Bayar' },
  { key: 'processing', label: 'Diproses' },
  { key: 'shipped',    label: 'Dikirim' },
  { key: 'done',       label: 'Selesai' },
  { key: 'problem',    label: 'Bermasalah' },
];

const FILTER_STATUSES: Record<FilterKey, string[]> = {
  all:        [],
  unpaid:     ['pending', 'accepted'],
  processing: ['in_escrow', 'purchased'],
  shipped:    ['shipped', 'delivered'],
  done:       ['completed'],
  problem:    ['cancelled', 'disputed'],
};

function matchFilter(status: string, filter: FilterKey): boolean {
  if (filter === 'all') return true;
  return FILTER_STATUSES[filter].includes(status);
}

// ─── Helpers ───────────────────────────────────────────────────────────────────
function fmtAmount(n: number | null, currency = 'IDR'): string {
  if (!n) return '-';
  return n.toLocaleString('id-ID', { style: 'currency', currency, maximumFractionDigits: 0 });
}

function fmtDate(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

// ─── Screen ────────────────────────────────────────────────────────────────────
export default function OrdersScreen() {
  const C = useThemeColors();
  const user = useAuthStore((s) => s.user);
  const { orders, loading, refetch } = useMyOrders(user?.id);
  const [filter, setFilter] = useState<FilterKey>('all');
  const [refreshing, setRefreshing] = useState(false);

  // Hanya tampilkan order di mana user adalah PEMBELI (tiper)
  const myPurchases = orders.filter((o) => o.tiper_id === user?.id);
  const filtered = myPurchases.filter((o) => matchFilter(o.status ?? 'pending', filter));

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  // Hitung badge per filter
  const countFor = (key: FilterKey) =>
    key === 'all' ? 0 : myPurchases.filter((o) => matchFilter(o.status ?? 'pending', key)).length;

  const s = React.useMemo(() => StyleSheet.create({
    safe: { flex: 1, backgroundColor: C.offWhite },

    filterScroll: {
      backgroundColor: C.white,
      borderBottomWidth: 1,
      borderBottomColor: C.lightGray,
      maxHeight: 56,
    },
    filterContent: {
      paddingHorizontal: Spacing.xl,
      paddingVertical: Spacing.sm,
      gap: Spacing.sm,
      alignItems: 'center',
    },
    chip: {
      flexDirection: 'row', alignItems: 'center', gap: 5,
      paddingHorizontal: Spacing.md, paddingVertical: 7,
      borderRadius: BorderRadius.full, borderWidth: 1,
      borderColor: C.lightGray, backgroundColor: C.white,
    },
    chipActive: { backgroundColor: C.primary, borderColor: C.primary },
    chipTxt: {
      fontFamily: Typography.regular.fontFamily,
      fontSize: Typography.sizes.xs, color: C.charcoal,
    },
    chipTxtActive: { color: '#FFFFFF' },
    chipBadge: {
      minWidth: 18, height: 18, borderRadius: 9,
      backgroundColor: C.primaryPale,
      alignItems: 'center', justifyContent: 'center',
      paddingHorizontal: 4,
      borderWidth: 1, borderColor: C.primaryLight,
    },
    chipBadgeActive: { backgroundColor: 'rgba(255,255,255,0.25)', borderColor: 'rgba(255,255,255,0.4)' },
    chipBadgeTxt: {
      fontFamily: Typography.medium.fontFamily,
      fontSize: 9, color: C.primary,
    },
    chipBadgeTxtActive: { color: '#FFFFFF' },

    centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    list: { padding: Spacing.xl, paddingBottom: 100 },

    empty: { alignItems: 'center', paddingTop: 80, gap: Spacing.sm, paddingHorizontal: Spacing['2xl'] },
    emptyTitle: {
      fontFamily: Typography.regular.fontFamily,
      fontSize: Typography.sizes.md, color: C.nearBlack,
    },
    emptySub: {
      fontFamily: Typography.regular.fontFamily,
      fontSize: Typography.sizes.sm, color: C.darkGray,
      textAlign: 'center',
    },

    card: {
      backgroundColor: C.white,
      borderRadius: BorderRadius.lg,
      marginBottom: Spacing.md,
      borderWidth: 1, borderColor: C.lightGray,
      ...Shadows.sm,
    },
    cardHeader: {
      flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
      paddingHorizontal: Spacing.base, paddingTop: Spacing.base, paddingBottom: Spacing.sm,
    },
    orderMeta: { gap: 2 },
    orderNum: {
      fontFamily: Typography.medium.fontFamily,
      fontSize: Typography.sizes.sm, color: C.nearBlack,
    },
    orderDate: {
      fontFamily: Typography.regular.fontFamily,
      fontSize: Typography.sizes.xs, color: C.gray,
    },
    statusPill: {
      flexDirection: 'row', alignItems: 'center', gap: 4,
      paddingHorizontal: Spacing.sm, paddingVertical: 4,
      borderRadius: BorderRadius.full, borderWidth: 1,
    },
    statusTxt: {
      fontFamily: Typography.medium.fontFamily,
      fontSize: Typography.sizes.xs,
    },

    divider: { height: 1, backgroundColor: C.lightGray, marginHorizontal: Spacing.base },

    cardBody: {
      flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
      padding: Spacing.base,
    },
    itemIconWrap: {
      width: 52, height: 52, borderRadius: BorderRadius.md,
      backgroundColor: C.offWhite, borderWidth: 1, borderColor: C.lightGray,
      alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    },
    itemInfo: { flex: 1 },
    itemName: {
      fontFamily: Typography.regular.fontFamily,
      fontSize: Typography.sizes.base, color: C.nearBlack,
    },
    itemNotes: {
      fontFamily: Typography.regular.fontFamily,
      fontSize: Typography.sizes.xs, color: C.darkGray, marginTop: 2,
    },
    roleTag: {
      fontFamily: Typography.regular.fontFamily,
      fontSize: Typography.sizes.xs, color: C.gray, marginTop: 4,
    },
    priceWrap: { alignItems: 'flex-end', gap: 2 },
    price: {
      fontFamily: Typography.medium.fontFamily,
      fontSize: Typography.sizes.sm, color: C.nearBlack,
    },
  }), [C]);

  return (
    <SafeAreaView style={s.safe} edges={[]}>
      <PageHeader title="Pesanan Saya" onBack={() => router.back()} />

      {/* Filter tabs horizontal */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={s.filterScroll}
        contentContainerStyle={s.filterContent}
      >
        {FILTERS.map((f) => {
          const active = filter === f.key;
          const count = countFor(f.key);
          return (
            <TouchableOpacity
              key={f.key}
              style={[s.chip, active && s.chipActive]}
              onPress={() => setFilter(f.key)}
              activeOpacity={0.7}
            >
              <Text style={[s.chipTxt, active && s.chipTxtActive]}>{f.label}</Text>
              {count > 0 && (
                <View style={[s.chipBadge, active && s.chipBadgeActive]}>
                  <Text style={[s.chipBadgeTxt, active && s.chipBadgeTxtActive]}>{count}</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {loading ? (
        <View style={s.centered}>
          <ActivityIndicator size="large" color={C.primary} />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={filtered.length === 0 ? s.centered : s.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.primary} />
          }
          ListEmptyComponent={
            <View style={s.empty}>
              <Ionicons name="receipt-outline" size={56} color={C.midGray} />
              <Text style={s.emptyTitle}>Tidak ada pesanan</Text>
              <Text style={s.emptySub}>
                {filter === 'all'
                  ? 'Kamu belum pernah memesan produk apapun.'
                  : `Tidak ada pesanan dengan status "${FILTERS.find(f => f.key === filter)?.label}"`}
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <OrderCard order={item} myId={user?.id ?? ''} s={s} C={C} />
          )}
        />
      )}
    </SafeAreaView>
  );
}

// ─── Order Card ────────────────────────────────────────────────────────────────
function OrderCard({ order, myId, s, C }: {
  order: OrderWithProfiles;
  myId: string;
  s: any;
  C: ReturnType<typeof useThemeColors>;
}) {
  const status = order.status ?? 'pending';
  const color = STATUS_COLOR[status] ?? C.gray;
  const label = STATUS_LABEL[status] ?? status;
  const icon = STATUS_ICON[status] ?? 'receipt-outline';
  const isBuyer = order.tiper_id === myId;

  return (
    <TouchableOpacity
      style={s.card}
      activeOpacity={0.7}
      onPress={() => router.push(`/order/${order.id}` as any)}
    >
      {/* Header: order ID + status */}
      <View style={s.cardHeader}>
        <View style={s.orderMeta}>
          <Text style={s.orderNum}>#{order.id.slice(0, 8).toUpperCase()}</Text>
          <Text style={s.orderDate}>{fmtDate(order.created_at)}</Text>
        </View>
        <View style={[s.statusPill, { backgroundColor: `${color}18`, borderColor: `${color}40` }]}>
          <Ionicons name={icon as any} size={11} color={color} />
          <Text style={[s.statusTxt, { color }]}>{label}</Text>
        </View>
      </View>

      <View style={s.divider} />

      {/* Body: item info */}
      <View style={s.cardBody}>
        <View style={s.itemIconWrap}>
          <Ionicons name="cube-outline" size={26} color={C.charcoal} />
        </View>
        <View style={s.itemInfo}>
          <Text style={s.itemName} numberOfLines={1}>{order.item_name}</Text>
          {order.notes ? (
            <Text style={s.itemNotes} numberOfLines={1}>{order.notes}</Text>
          ) : null}
          <Text style={s.roleTag}>
            {isBuyer ? 'Saya: Pembeli' : 'Saya: Traveler'}
            {' · '}
            {isBuyer
              ? (order.triper?.full_name ?? 'Traveler')
              : (order.tiper?.full_name ?? 'Pembeli')}
          </Text>
        </View>
        <View style={s.priceWrap}>
          <Text style={s.price}>{fmtAmount(order.total_amount, order.currency ?? 'IDR')}</Text>
          <Ionicons name="chevron-forward" size={14} color={C.gray} style={{ marginTop: 2 }} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

