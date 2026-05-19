import React, { useCallback, useEffect, useState } from 'react';
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
import { getRequestsForTriper, type CustomRequestWithProfile } from '@/src/services/supabase/requests';

// ─── Order status maps ────────────────────────────────────────────────────────

const STATUS_LABEL: Record<string, string> = {
  pending:   'Menunggu Konfirmasi',
  accepted:  'Diterima',
  in_escrow: 'Pembayaran Masuk',
  purchased: 'Sedang Dibeli',
  shipped:   'Dikirim',
  delivered: 'Terkirim',
  completed: 'Selesai',
  cancelled: 'Dibatalkan',
  disputed:  'Sengketa',
};

const STATUS_COLOR: Record<string, string> = {
  pending:   '#F59E0B',
  accepted:  '#2196F3',
  in_escrow: '#C4A265',
  purchased: '#66BB6A',
  shipped:   '#42A5F5',
  delivered: '#26A69A',
  completed: '#43A047',
  cancelled: '#EF5350',
  disputed:  '#FF7043',
};

const STATUS_ICON: Record<string, string> = {
  pending:   'time-outline',
  accepted:  'checkmark-outline',
  in_escrow: 'lock-closed-outline',
  purchased: 'bag-outline',
  shipped:   'airplane-outline',
  delivered: 'home-outline',
  completed: 'checkmark-circle-outline',
  cancelled: 'close-circle-outline',
  disputed:  'alert-circle-outline',
};

// ─── Request status maps ──────────────────────────────────────────────────────

const REQ_STATUS_LABEL: Record<string, string> = {
  open:      'Terbuka',
  taken:     'Diambil',
  completed: 'Selesai',
  cancelled: 'Dibatalkan',
};

const REQ_STATUS_COLOR: Record<string, string> = {
  open:      '#2196F3',
  taken:     '#F59E0B',
  completed: '#43A047',
  cancelled: '#EF5350',
};

const REQ_STATUS_ICON: Record<string, string> = {
  open:      'search-outline',
  taken:     'bag-handle-outline',
  completed: 'checkmark-circle-outline',
  cancelled: 'close-circle-outline',
};

// ─── Order filter tabs ────────────────────────────────────────────────────────

type FilterKey = 'all' | 'new' | 'active' | 'shipped' | 'done' | 'problem';

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all',     label: 'Semua' },
  { key: 'new',     label: 'Baru Masuk' },
  { key: 'active',  label: 'Diproses' },
  { key: 'shipped', label: 'Dikirim' },
  { key: 'done',    label: 'Selesai' },
  { key: 'problem', label: 'Bermasalah' },
];

const FILTER_STATUSES: Record<FilterKey, string[]> = {
  all:     [],
  new:     ['pending'],
  active:  ['accepted', 'in_escrow', 'purchased'],
  shipped: ['shipped', 'delivered'],
  done:    ['completed'],
  problem: ['cancelled', 'disputed'],
};

function matchFilter(status: string, filter: FilterKey): boolean {
  if (filter === 'all') return true;
  return FILTER_STATUSES[filter].includes(status);
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtAmount(n: number | null, currency = 'IDR'): string {
  if (!n) return '-';
  return n.toLocaleString('id-ID', { style: 'currency', currency, maximumFractionDigits: 0 });
}

function fmtDate(iso: string | null): string {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

// ─── Main screen ──────────────────────────────────────────────────────────────

type TabKey = 'orders' | 'requests';

export default function IncomingOrdersScreen() {
  const user = useAuthStore((s) => s.user);
  const { orders, loading: ordersLoading, refetch: refetchOrders } = useMyOrders(user?.id);
  const [filter, setFilter] = useState<FilterKey>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [tab, setTab] = useState<TabKey>('orders');

  // custom requests tab state
  const [requests, setRequests] = useState<CustomRequestWithProfile[]>([]);
  const [reqLoading, setReqLoading] = useState(false);

  const loadRequests = useCallback(async () => {
    if (!user?.id) return;
    setReqLoading(true);
    try {
      const data = await getRequestsForTriper(user.id);
      setRequests(data);
    } catch {
      // silent — list stays empty
    } finally {
      setReqLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (tab === 'requests') loadRequests();
  }, [tab, loadRequests]);

  // Hanya order di mana user adalah triper
  const incomingOrders = orders.filter((o) => o.triper_id === user?.id);
  const filteredOrders = incomingOrders.filter((o) => matchFilter(o.status ?? 'pending', filter));

  const pendingCount = incomingOrders.filter((o) => o.status === 'pending').length;
  const openRequestCount = requests.filter((r) => r.status === 'open').length;

  const onRefresh = async () => {
    setRefreshing(true);
    if (tab === 'orders') await refetchOrders();
    else await loadRequests();
    setRefreshing(false);
  };

  const countFor = (key: FilterKey) =>
    key === 'all' ? 0 : incomingOrders.filter((o) => matchFilter(o.status ?? 'pending', key)).length;

  const loading = tab === 'orders' ? ordersLoading : reqLoading;

  return (
    <SafeAreaView style={st.safe} edges={[]}>
      <PageHeader title="Pesanan Masuk" onBack={() => router.back()} />

      {/* ── Segment switch ── */}
      <View style={st.segmentWrap}>
        <View style={st.segment}>
          <TouchableOpacity
            style={[st.segBtn, tab === 'orders' && st.segBtnActive]}
            onPress={() => setTab('orders')}
            activeOpacity={0.7}
          >
            <Ionicons name="cube-outline" size={15} color={tab === 'orders' ? Colors.white : Colors.charcoal} />
            <Text style={[st.segTxt, tab === 'orders' && st.segTxtActive]}>Produk Trip</Text>
            {pendingCount > 0 && tab !== 'orders' && (
              <View style={st.segBadge}><Text style={st.segBadgeTxt}>{pendingCount}</Text></View>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={[st.segBtn, tab === 'requests' && st.segBtnActive]}
            onPress={() => setTab('requests')}
            activeOpacity={0.7}
          >
            <Ionicons name="chatbubble-ellipses-outline" size={15} color={tab === 'requests' ? Colors.white : Colors.charcoal} />
            <Text style={[st.segTxt, tab === 'requests' && st.segTxtActive]}>Request Custom</Text>
            {openRequestCount > 0 && tab !== 'requests' && (
              <View style={st.segBadge}><Text style={st.segBadgeTxt}>{openRequestCount}</Text></View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Orders tab ── */}
      {tab === 'orders' && (
        <>
          {pendingCount > 0 && (
            <TouchableOpacity
              style={st.alertBanner}
              activeOpacity={0.8}
              onPress={() => setFilter('new')}
            >
              <View style={st.alertDot} />
              <Text style={st.alertTxt}>
                {pendingCount} pesanan baru menunggu konfirmasimu
              </Text>
              <Ionicons name="chevron-forward" size={14} color={Colors.warning} />
            </TouchableOpacity>
          )}

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
              data={filteredOrders}
              keyExtractor={(item) => item.id}
              contentContainerStyle={filteredOrders.length === 0 ? st.centered : st.list}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
              }
              ListEmptyComponent={
                <View style={st.empty}>
                  <Ionicons name="cube-outline" size={56} color={Colors.midGray} />
                  <Text style={st.emptyTitle}>
                    {filter === 'all' ? 'Belum ada pesanan masuk' : 'Tidak ada pesanan di kategori ini'}
                  </Text>
                  <Text style={st.emptySub}>
                    {filter === 'all'
                      ? 'Pesanan dari pembeli akan muncul di sini setelah mereka checkout.'
                      : `Tidak ada order dengan status "${FILTERS.find((f2) => f2.key === filter)?.label}"`}
                  </Text>
                </View>
              }
              renderItem={({ item }) => <IncomingOrderCard order={item} />}
            />
          )}
        </>
      )}

      {/* ── Requests tab ── */}
      {tab === 'requests' && (
        loading ? (
          <View style={st.centered}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : (
          <FlatList
            data={requests}
            keyExtractor={(item) => item.id}
            contentContainerStyle={requests.length === 0 ? st.centered : st.list}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
            }
            ListEmptyComponent={
              <View style={st.empty}>
                <Ionicons name="chatbubble-ellipses-outline" size={56} color={Colors.midGray} />
                <Text style={st.emptyTitle}>Belum ada request custom</Text>
                <Text style={st.emptySub}>
                  Request produk khusus yang kamu ambil dari pembeli akan muncul di sini.
                </Text>
              </View>
            }
            renderItem={({ item }) => <RequestCard request={item} />}
          />
        )
      )}
    </SafeAreaView>
  );
}

// ─── Order card ───────────────────────────────────────────────────────────────

function IncomingOrderCard({ order }: { order: OrderWithProfiles }) {
  const status = order.status ?? 'pending';
  const color = STATUS_COLOR[status] ?? Colors.gray;
  const label = STATUS_LABEL[status] ?? status;
  const icon = STATUS_ICON[status] ?? 'receipt-outline';
  const isNew = status === 'pending';

  return (
    <TouchableOpacity
      style={[st.card, isNew && st.cardNew]}
      activeOpacity={0.7}
      onPress={() => router.push(`/order/${order.id}` as any)}
    >
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

      <View style={st.cardBody}>
        <View style={st.itemIconWrap}>
          <Ionicons name="cube-outline" size={26} color={Colors.charcoal} />
        </View>
        <View style={st.itemInfo}>
          <Text style={st.itemName} numberOfLines={1}>{order.item_name}</Text>
          {order.notes ? (
            <Text style={st.itemNotes} numberOfLines={1}>{order.notes}</Text>
          ) : null}
          <View style={st.buyerRow}>
            <Ionicons name="person-outline" size={12} color={Colors.gray} />
            <Text style={st.buyerName}>{order.tiper?.full_name ?? 'Pembeli'}</Text>
          </View>
        </View>
        <View style={st.priceWrap}>
          <Text style={st.price}>{fmtAmount(order.total_amount, order.currency ?? 'IDR')}</Text>
          <Ionicons name="chevron-forward" size={14} color={Colors.gray} style={{ marginTop: 2 }} />
        </View>
      </View>

      {isNew && (
        <View style={st.ctaHint}>
          <Ionicons name="hand-right-outline" size={14} color={Colors.warning} />
          <Text style={st.ctaHintTxt}>Ketuk untuk konfirmasi pesanan ini</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

// ─── Request card ─────────────────────────────────────────────────────────────

function RequestCard({ request }: { request: CustomRequestWithProfile }) {
  const status = request.status ?? 'open';
  const color = REQ_STATUS_COLOR[status] ?? Colors.gray;
  const label = REQ_STATUS_LABEL[status] ?? status;
  const icon = REQ_STATUS_ICON[status] ?? 'search-outline';
  const isOpen = status === 'open';

  return (
    <TouchableOpacity
      style={[st.card, isOpen && st.cardNew]}
      activeOpacity={0.7}
      onPress={() => router.push(`/request/${request.id}` as any)}
    >
      <View style={st.cardHeader}>
        <View style={st.orderMeta}>
          <Text style={st.orderNum}>#{request.id.slice(0, 8).toUpperCase()}</Text>
          <Text style={st.orderDate}>{fmtDate(request.created_at)}</Text>
        </View>
        <View style={[st.statusPill, { backgroundColor: `${color}18`, borderColor: `${color}40` }]}>
          <Ionicons name={icon as any} size={11} color={color} />
          <Text style={[st.statusTxt, { color }]}>{label}</Text>
        </View>
      </View>

      <View style={st.divider} />

      <View style={st.cardBody}>
        <View style={st.itemIconWrap}>
          <Ionicons name="chatbubble-ellipses-outline" size={22} color={Colors.primary} />
        </View>
        <View style={st.itemInfo}>
          <Text style={st.itemName} numberOfLines={1}>{request.item_name}</Text>
          {request.description ? (
            <Text style={st.itemNotes} numberOfLines={1}>{request.description}</Text>
          ) : null}
          <View style={st.buyerRow}>
            <Ionicons name="person-outline" size={12} color={Colors.gray} />
            <Text style={st.buyerName}>{request.profiles?.full_name ?? 'Pembeli'}</Text>
          </View>
        </View>
        <View style={st.priceWrap}>
          {request.budget ? (
            <Text style={st.price}>{fmtAmount(request.budget)}</Text>
          ) : (
            <Text style={[st.price, { color: Colors.gray }]}>Nego</Text>
          )}
          <Ionicons name="chevron-forward" size={14} color={Colors.gray} style={{ marginTop: 2 }} />
        </View>
      </View>

      {isOpen && (
        <View style={st.ctaHint}>
          <Ionicons name="hand-right-outline" size={14} color={Colors.warning} />
          <Text style={st.ctaHintTxt}>Ketuk untuk lihat detail request ini</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const st = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.offWhite },

  segmentWrap: {
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  segment: {
    flexDirection: 'row',
    backgroundColor: Colors.offWhite,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.lightGray,
    overflow: 'hidden',
  },
  segBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: 10,
  },
  segBtnActive: { backgroundColor: Colors.primary },
  segTxt: {
    fontFamily: Typography.regular.fontFamily,
    fontSize: Typography.sizes.sm,
    color: Colors.charcoal,
  },
  segTxtActive: { color: Colors.white, fontFamily: Typography.medium.fontFamily },
  segBadge: {
    minWidth: 18, height: 18, borderRadius: 9,
    backgroundColor: Colors.error,
    alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 4,
  },
  segBadgeTxt: {
    fontFamily: Typography.medium.fontFamily, fontSize: 9, color: Colors.white,
  },

  alertBanner: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    backgroundColor: `${Colors.warning}14`,
    borderBottomWidth: 1, borderBottomColor: `${Colors.warning}30`,
    paddingHorizontal: Spacing.xl, paddingVertical: Spacing.sm,
  },
  alertDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.warning },
  alertTxt: { flex: 1, fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.xs, color: Colors.warning },

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
  chipTxt: { fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.xs, color: Colors.charcoal },
  chipTxtActive: { color: Colors.white },
  chipBadge: {
    minWidth: 18, height: 18, borderRadius: 9,
    backgroundColor: Colors.primaryPale, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 4, borderWidth: 1, borderColor: Colors.primaryLight,
  },
  chipBadgeActive: { backgroundColor: 'rgba(255,255,255,0.25)', borderColor: 'rgba(255,255,255,0.4)' },
  chipBadgeTxt: { fontFamily: Typography.medium.fontFamily, fontSize: 9, color: Colors.primary },
  chipBadgeTxtActive: { color: Colors.white },

  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { padding: Spacing.xl, paddingBottom: 100 },

  empty: { alignItems: 'center', paddingTop: 80, gap: Spacing.sm, paddingHorizontal: Spacing['2xl'] },
  emptyTitle: { fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.md, color: Colors.nearBlack },
  emptySub: { fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.sm, color: Colors.darkGray, textAlign: 'center', lineHeight: 20 },

  card: {
    backgroundColor: Colors.white, borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md, borderWidth: 1, borderColor: Colors.lightGray, ...Shadows.sm,
  },
  cardNew: { borderColor: `${Colors.warning}60`, borderWidth: 1.5 },

  cardHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.base, paddingTop: Spacing.base, paddingBottom: Spacing.sm,
  },
  orderMeta: { gap: 2 },
  orderNum: { fontFamily: Typography.medium.fontFamily, fontSize: Typography.sizes.xs, color: Colors.nearBlack, letterSpacing: 0.5 },
  orderDate: { fontFamily: Typography.regular.fontFamily, fontSize: 10, color: Colors.gray },
  statusPill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: Spacing.sm, paddingVertical: 4,
    borderRadius: BorderRadius.full, borderWidth: 1,
  },
  statusTxt: { fontFamily: Typography.medium.fontFamily, fontSize: 10 },

  divider: { height: 1, backgroundColor: Colors.lightGray, marginHorizontal: Spacing.base },

  cardBody: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    paddingHorizontal: Spacing.base, paddingVertical: Spacing.base,
  },
  itemIconWrap: {
    width: 48, height: 48, borderRadius: BorderRadius.md,
    backgroundColor: Colors.offWhite, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Colors.lightGray,
  },
  itemInfo: { flex: 1, gap: 3 },
  itemName: { fontFamily: Typography.medium.fontFamily, fontSize: Typography.sizes.sm, color: Colors.nearBlack },
  itemNotes: { fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.xs, color: Colors.darkGray },
  buyerRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  buyerName: { fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.xs, color: Colors.gray },
  priceWrap: { alignItems: 'flex-end', gap: 2 },
  price: { fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.sm, color: Colors.nearBlack },

  ctaHint: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    borderTopWidth: 1, borderTopColor: `${Colors.warning}30`,
    paddingHorizontal: Spacing.base, paddingVertical: Spacing.sm,
    backgroundColor: `${Colors.warning}08`,
  },
  ctaHintTxt: { fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.xs, color: Colors.warning },
});
