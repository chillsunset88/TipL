/**
 * TipL — My Orders
 * Riwayat order dari Supabase, difilter per status, realtime.
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
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/src/lib/constants';
import { useAuthStore } from '@/src/store/authStore';
import { useMyOrders } from '@/src/lib/hooks/useOrders';
import type { OrderWithProfiles } from '@/src/services/supabase/orders';

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

  return (
    <SafeAreaView style={st.safe} edges={[]}>
      <PageHeader title="Pesanan Saya" onBack={() => router.back()} />

      {/* Filter tabs horizontal */}
      <View style={st.filterBar}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={st.filterContent}
        >
          {FILTERS.map((f) => {
            const active = filter === f.key;
            const count = countFor(f.key);
            return (
              <TouchableOpacity
                key={f.key}
                style={[st.chip, active && st.chipActive]}
                onPress={() => setFilter(f.key)}
                activeOpacity={0.7}
              >
                <Text style={[st.chipTxt, active && st.chipTxtActive]}>{f.label}</Text>
                {count > 0 && (
                  <View style={[st.chipBadge, active && st.chipBadgeActive]}>
                    <Text style={[st.chipBadgeTxt, active && st.chipBadgeTxtActive]}>{count}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {loading ? (
        <View style={st.centered}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={filtered.length === 0 ? st.centered : st.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
          }
          ListEmptyComponent={
            <View style={st.empty}>
              <Ionicons name="receipt-outline" size={56} color={Colors.midGray} />
              <Text style={st.emptyTitle}>Tidak ada pesanan</Text>
              <Text style={st.emptySub}>
                {filter === 'all'
                  ? 'Kamu belum pernah memesan produk apapun.'
                  : `Tidak ada pesanan dengan status "${FILTERS.find(f => f.key === filter)?.label}"`}
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <OrderCard order={item} myId={user?.id ?? ''} />
          )}
        />
      )}
    </SafeAreaView>
  );
}

// ─── Order Card ────────────────────────────────────────────────────────────────
function OrderCard({ order, myId }: { order: OrderWithProfiles; myId: string }) {
  const status = order.status ?? 'pending';
  const color = STATUS_COLOR[status] ?? Colors.gray;
  const label = STATUS_LABEL[status] ?? status;
  const icon = STATUS_ICON[status] ?? 'receipt-outline';
  const isBuyer = order.tiper_id === myId;

  return (
    <TouchableOpacity
      style={st.card}
      activeOpacity={0.7}
      onPress={() => router.push(`/order/${order.id}` as any)}
    >
      {/* Header: order ID + status */}
      <View style={st.cardHeader}>
        <View style={st.orderMeta}>
          <Text style={st.orderNum}>#{order.id.slice(0, 8).toUpperCase()}</Text>
          <Text style={st.orderDate}>{fmtDate(order.created_at)}</Text>
        </View>
        <View style={[st.statusPill, { backgroundColor: `${color}18`, borderColor: `${color}40` }]}>
          <Ionicons name={icon as any} size={11} color={color} />
          <Text style={[st.statusTxt, { color }]}>{label}</Text>
        </View>
      </View>

      <View style={st.divider} />

      {/* Body: item info */}
      <View style={st.cardBody}>
        <View style={st.itemIconWrap}>
          <Ionicons name="cube-outline" size={26} color={Colors.charcoal} />
        </View>
        <View style={st.itemInfo}>
          <Text style={st.itemName} numberOfLines={1}>{order.item_name}</Text>
          {order.notes ? (
            <Text style={st.itemNotes} numberOfLines={1}>{order.notes}</Text>
          ) : null}
          <Text style={st.roleTag}>
            {isBuyer ? 'Saya: Pembeli' : 'Saya: Traveler'}
            {' · '}
            {isBuyer
              ? (order.triper?.full_name ?? 'Traveler')
              : (order.tiper?.full_name ?? 'Pembeli')}
          </Text>
        </View>
        <View style={st.priceWrap}>
          <Text style={st.price}>{fmtAmount(order.total_amount, order.currency ?? 'IDR')}</Text>
          <Ionicons name="chevron-forward" size={14} color={Colors.gray} style={{ marginTop: 2 }} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────
const st = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.offWhite },

  filterBar: {
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  filterContent: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: Spacing.md, paddingVertical: 7,
    borderRadius: BorderRadius.full, borderWidth: 1,
    borderColor: Colors.lightGray, backgroundColor: Colors.white,
  },
  chipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipTxt: {
    fontFamily: Typography.regular.fontFamily,
    fontSize: Typography.sizes.xs, color: Colors.charcoal,
  },
  chipTxtActive: { color: Colors.white },
  chipBadge: {
    minWidth: 18, height: 18, borderRadius: 9,
    backgroundColor: Colors.primaryPale,
    alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 1, borderColor: Colors.primaryLight,
  },
  chipBadgeActive: { backgroundColor: 'rgba(255,255,255,0.25)', borderColor: 'rgba(255,255,255,0.4)' },
  chipBadgeTxt: {
    fontFamily: Typography.medium.fontFamily,
    fontSize: 9, color: Colors.primary,
  },
  chipBadgeTxtActive: { color: Colors.white },

  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { padding: Spacing.xl, paddingBottom: 100 },

  empty: { alignItems: 'center', paddingTop: 80, gap: Spacing.sm, paddingHorizontal: Spacing['2xl'] },
  emptyTitle: {
    fontFamily: Typography.regular.fontFamily,
    fontSize: Typography.sizes.md, color: Colors.nearBlack,
  },
  emptySub: {
    fontFamily: Typography.regular.fontFamily,
    fontSize: Typography.sizes.sm, color: Colors.darkGray,
    textAlign: 'center',
  },

  card: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
    borderWidth: 1, borderColor: Colors.lightGray,
    ...Shadows.sm,
  },
  cardHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.base, paddingTop: Spacing.base, paddingBottom: Spacing.sm,
  },
  orderMeta: { gap: 2 },
  orderNum: {
    fontFamily: Typography.medium.fontFamily,
    fontSize: Typography.sizes.sm, color: Colors.nearBlack,
  },
  orderDate: {
    fontFamily: Typography.regular.fontFamily,
    fontSize: Typography.sizes.xs, color: Colors.gray,
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

  divider: { height: 1, backgroundColor: Colors.lightGray, marginHorizontal: Spacing.base },

  cardBody: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    padding: Spacing.base,
  },
  itemIconWrap: {
    width: 52, height: 52, borderRadius: BorderRadius.md,
    backgroundColor: Colors.offWhite, borderWidth: 1, borderColor: Colors.lightGray,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  itemInfo: { flex: 1 },
  itemName: {
    fontFamily: Typography.regular.fontFamily,
    fontSize: Typography.sizes.base, color: Colors.nearBlack,
  },
  itemNotes: {
    fontFamily: Typography.regular.fontFamily,
    fontSize: Typography.sizes.xs, color: Colors.darkGray, marginTop: 2,
  },
  roleTag: {
    fontFamily: Typography.regular.fontFamily,
    fontSize: Typography.sizes.xs, color: Colors.gray, marginTop: 4,
  },
  priceWrap: { alignItems: 'flex-end', gap: 2 },
  price: {
    fontFamily: Typography.medium.fontFamily,
    fontSize: Typography.sizes.sm, color: Colors.nearBlack,
  },
});
