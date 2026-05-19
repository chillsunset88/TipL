/**
 * TipL — Admin: Kelola Status Paket
 * Daftar semua order dengan filter status. Admin bisa ubah status untuk demo.
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, RefreshControl,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { PageHeader } from '@/src/components/ui/PageHeader';
import { Colors, Typography, Spacing, BorderRadius } from '@/src/lib/constants';
import { useAuthStore } from '@/src/store/authStore';
import { getAllOrders, type OrderWithProfiles } from '@/src/services/supabase/orders';

// ─── Status config ─────────────────────────────────────────────────────────────
const STATUS_LABEL: Record<string, string> = {
  pending: 'Pending',
  accepted: 'Diterima',
  in_escrow: 'Escrow',
  purchased: 'Dibeli',
  shipped: 'Dikirim',
  delivered: 'Tiba',
  completed: 'Selesai',
  cancelled: 'Dibatal',
  disputed: 'Dispute',
};

const STATUS_COLOR: Record<string, string> = {
  pending: '#9E9E9E',
  accepted: '#2196F3',
  in_escrow: '#F59E0B',
  purchased: '#66BB6A',
  shipped: '#42A5F5',
  delivered: '#26A69A',
  completed: '#43A047',
  cancelled: '#EF5350',
  disputed: '#FF7043',
};

// ─── Filter groups ─────────────────────────────────────────────────────────────
const FILTERS = [
  { key: 'all', label: 'Semua' },
  { key: 'active', label: 'Aktif' },
  { key: 'completed', label: 'Selesai' },
  { key: 'cancelled', label: 'Bermasalah' },
];

const ACTIVE_STATUSES = ['pending', 'accepted', 'in_escrow', 'purchased', 'shipped', 'delivered'];
const PROBLEM_STATUSES = ['cancelled', 'disputed'];

function matchFilter(status: string, filter: string): boolean {
  if (filter === 'all') return true;
  if (filter === 'active') return ACTIVE_STATUSES.includes(status);
  if (filter === 'completed') return status === 'completed';
  if (filter === 'cancelled') return PROBLEM_STATUSES.includes(status);
  return true;
}

function fmtDate(iso: string | null): string {
  if (!iso) return '-';
  const d = new Date(iso);
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

function fmtAmount(n: number | null, currency = 'IDR'): string {
  if (!n) return '-';
  return n.toLocaleString('id-ID', { style: 'currency', currency, maximumFractionDigits: 0 });
}

export default function AdminOrdersScreen() {
  const user = useAuthStore((s) => s.user);
  const [orders, setOrders] = useState<OrderWithProfiles[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all');

  if (user?.role !== 'admin') {
    return (
      <SafeAreaView style={st.safe} edges={[]}>
        <View style={st.denied}>
          <Ionicons name="lock-closed-outline" size={48} color={Colors.midGray} />
          <Text style={st.deniedTxt}>Akses ditolak</Text>
        </View>
      </SafeAreaView>
    );
  }

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const data = await getAllOrders();
      setOrders(data);
    } catch {}
    finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Initial load saat screen fokus
  useFocusEffect(useCallback(() => { load(); }, [load]));

  // Polling setiap 30 detik — silent (tanpa spinner)
  useEffect(() => {
    const poll = async () => {
      try { setOrders(await getAllOrders()); } catch {}
    };
    const interval = setInterval(poll, 30_000);
    return () => clearInterval(interval);
  }, []);

  const filtered = orders.filter((o) => matchFilter(o.status ?? 'pending', filter));

  const renderItem = ({ item }: { item: OrderWithProfiles }) => {
    const status = item.status ?? 'pending';
    const color = STATUS_COLOR[status] ?? Colors.gray;
    const label = STATUS_LABEL[status] ?? status;

    return (
      <TouchableOpacity
        style={st.row}
        activeOpacity={0.7}
        onPress={() => router.push(`/order/${item.id}` as any)}
      >
        <View style={st.rowLeft}>
          <View style={[st.statusDot, { backgroundColor: color }]} />
          <View style={st.rowInfo}>
            <Text style={st.itemName} numberOfLines={1}>{item.item_name}</Text>
            <Text style={st.meta} numberOfLines={1}>
              {item.tiper?.full_name ?? '-'} → {item.triper?.full_name ?? '-'}
            </Text>
            <Text style={st.date}>{fmtDate(item.created_at)}</Text>
          </View>
        </View>
        <View style={st.rowRight}>
          <View style={[st.statusChip, { backgroundColor: `${color}20`, borderColor: `${color}60` }]}>
            <Text style={[st.statusChipTxt, { color }]}>{label}</Text>
          </View>
          <Text style={st.amount}>{fmtAmount(item.total_amount, item.currency ?? 'IDR')}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={st.safe} edges={[]}>
      <PageHeader title="Admin Pesanan" onBack={() => router.back()} />

      {/* Judul */}
      <View style={st.titleWrap}>
        <Text style={st.title}>Kelola Paket</Text>
        <Text style={st.subtitle}>{orders.length} total order</Text>
      </View>

      {/* Filter chips */}
      <View style={st.filterRow}>
        {FILTERS.map((f) => {
          const active = filter === f.key;
          return (
            <TouchableOpacity
              key={f.key}
              style={[st.chip, active && st.chipActive]}
              onPress={() => setFilter(f.key)}
              activeOpacity={0.7}
            >
              <Text style={[st.chipTxt, active && st.chipTxtActive]}>{f.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {loading ? (
        <View style={st.centered}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={filtered.length === 0 ? st.centered : { paddingBottom: 40 }}
          ItemSeparatorComponent={() => <View style={st.separator} />}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={Colors.primary} />
          }
          ListEmptyComponent={
            <View style={st.emptyWrap}>
              <Ionicons name="cube-outline" size={48} color={Colors.midGray} />
              <Text style={st.emptyTxt}>Belum ada order</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.offWhite },

  denied: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md },
  deniedTxt: { fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.base, color: Colors.darkGray },

  titleWrap: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.md, paddingBottom: Spacing.sm },
  title: { fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.xl, color: Colors.nearBlack },
  subtitle: { fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.sm, color: Colors.darkGray, marginTop: 2 },

  filterRow: {
    flexDirection: 'row', gap: Spacing.sm,
    paddingHorizontal: Spacing.xl, paddingBottom: Spacing.base,
  },
  chip: {
    paddingHorizontal: Spacing.md, paddingVertical: 6,
    borderRadius: BorderRadius.full, borderWidth: 1,
    borderColor: Colors.midGray, backgroundColor: Colors.white,
  },
  chipActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryPale },
  chipTxt: { fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.sm, color: Colors.darkGray },
  chipTxtActive: { color: Colors.primary },

  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  row: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl, paddingVertical: Spacing.base,
    backgroundColor: Colors.white,
  },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, flex: 1 },
  statusDot: { width: 10, height: 10, borderRadius: 5, flexShrink: 0 },
  rowInfo: { flex: 1 },
  itemName: { fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.base, color: Colors.nearBlack },
  meta: { fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.xs, color: Colors.darkGray, marginTop: 2 },
  date: { fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.xs, color: Colors.gray, marginTop: 2 },

  rowRight: { alignItems: 'flex-end', gap: 4, marginLeft: Spacing.sm },
  statusChip: {
    paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: BorderRadius.full, borderWidth: 1,
  },
  statusChipTxt: { fontFamily: Typography.medium.fontFamily, fontSize: Typography.sizes.xs },
  amount: { fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.xs, color: Colors.darkGray },

  separator: { height: 1, backgroundColor: Colors.lightGray },

  emptyWrap: { alignItems: 'center', gap: Spacing.md, paddingTop: 80 },
  emptyTxt: { fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.base, color: Colors.darkGray },
});
