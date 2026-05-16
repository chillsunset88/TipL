import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, ScrollView,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/src/lib/constants';
import { useOrderStore } from '@/src/store/orderStore';
import { OrderStatus } from '@/src/lib/constants';
import { Order } from '@/src/lib/types';
import { Image } from 'expo-image';

const fmtIDR = (v: number) => 'Rp ' + v.toLocaleString('id-ID');

type FilterKey = 'all' | 'unpaid' | 'processing' | 'shipped' | 'done' | 'cancelled';

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all',        label: 'Semua' },
  { key: 'unpaid',     label: 'Belum Bayar' },
  { key: 'processing', label: 'Diproses' },
  { key: 'shipped',    label: 'Dikirim' },
  { key: 'done',       label: 'Selesai' },
  { key: 'cancelled',  label: 'Dibatalkan' },
];

const STATUS_GROUPS: Record<FilterKey, OrderStatus[]> = {
  all:        [],
  unpaid:     [OrderStatus.PENDING],
  processing: [OrderStatus.ACCEPTED, OrderStatus.IN_ESCROW, OrderStatus.PURCHASED],
  shipped:    [OrderStatus.SHIPPED],
  done:       [OrderStatus.DELIVERED, OrderStatus.COMPLETED],
  cancelled:  [OrderStatus.CANCELLED, OrderStatus.DISPUTED],
};

const STATUS_COLOR: Partial<Record<OrderStatus, string>> = {
  [OrderStatus.PENDING]:   Colors.warning,
  [OrderStatus.ACCEPTED]:  Colors.info,
  [OrderStatus.IN_ESCROW]: Colors.info,
  [OrderStatus.PURCHASED]: Colors.info,
  [OrderStatus.SHIPPED]:   Colors.primary,
  [OrderStatus.DELIVERED]: Colors.success,
  [OrderStatus.COMPLETED]: Colors.success,
  [OrderStatus.CANCELLED]: Colors.error,
  [OrderStatus.DISPUTED]:  Colors.error,
};

const STATUS_LABEL: Partial<Record<OrderStatus, string>> = {
  [OrderStatus.PENDING]:   'Belum Bayar',
  [OrderStatus.ACCEPTED]:  'Diterima',
  [OrderStatus.IN_ESCROW]: 'Dibayar',
  [OrderStatus.PURCHASED]: 'Dibeli',
  [OrderStatus.SHIPPED]:   'Dikirim',
  [OrderStatus.DELIVERED]: 'Terkirim',
  [OrderStatus.COMPLETED]: 'Selesai',
  [OrderStatus.CANCELLED]: 'Dibatalkan',
  [OrderStatus.DISPUTED]:  'Sengketa',
};

export default function OrdersScreen() {
  const { orders } = useOrderStore();
  const [filter, setFilter] = useState<FilterKey>('all');

  const filtered = filter === 'all'
    ? orders
    : orders.filter((o) => (STATUS_GROUPS[filter] as string[]).includes(o.status));

  return (
    <SafeAreaView style={st.safe} edges={['top']}>
      <TouchableOpacity onPress={() => router.back()} style={st.floatingBack}>
        <Ionicons name="arrow-back" size={20} color={Colors.nearBlack} />
      </TouchableOpacity>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={st.filterScroll}
        contentContainerStyle={st.filterContent}
      >
        {FILTERS.map((f) => {
          const active = filter === f.key;
          return (
            <TouchableOpacity
              key={f.key}
              style={[st.chip, active && st.chipActive]}
              onPress={() => setFilter(f.key)}
            >
              <Text style={[st.chipTxt, active && st.chipTxtActive]}>{f.label}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={st.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={st.empty}>
            <Ionicons name="receipt-outline" size={56} color={Colors.midGray} />
            <Text style={st.emptyTxt}>Tidak ada pesanan</Text>
          </View>
        }
        renderItem={({ item }) => <OrderCard order={item} />}
      />
    </SafeAreaView>
  );
}

function OrderCard({ order }: { order: Order }) {
  const color = STATUS_COLOR[order.status as OrderStatus] ?? Colors.darkGray;
  const label = STATUS_LABEL[order.status as OrderStatus] ?? order.status;

  return (
    <TouchableOpacity
      style={st.card}
      activeOpacity={0.7}
      onPress={() => router.push(`/order/${order.id}`)}
    >
      <View style={st.cardHeader}>
        <Text style={st.orderNum}>{order.orderNumber}</Text>
        <View style={[st.statusPill, { backgroundColor: `${color}18` }]}>
          <Text style={[st.statusTxt, { color }]}>{label}</Text>
        </View>
      </View>
      <View style={st.divider} />
      <View style={st.cardBody}>
        {order.itemImageUrl ? (
          <Image source={{ uri: order.itemImageUrl }} style={st.itemImg} contentFit="cover" />
        ) : (
          <View style={[st.itemImg, st.itemImgEmpty]}>
            <Ionicons name="cube-outline" size={24} color={Colors.darkGray} />
          </View>
        )}
        <View style={st.itemInfo}>
          <Text style={st.itemName} numberOfLines={1}>{order.itemName}</Text>
          <Text style={st.itemDesc} numberOfLines={1}>{order.itemDescription}</Text>
          <Text style={st.itemPrice}>{fmtIDR(order.paymentSummary.totalAmount)}</Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color={Colors.gray} />
      </View>
    </TouchableOpacity>
  );
}

const st = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.offWhite },
  floatingBack: {
    position: 'absolute', top: 12, left: 20, zIndex: 10,
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: 'rgba(0,0,0,0.06)',
    alignItems: 'center', justifyContent: 'center',
  },

  filterScroll: { backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.lightGray, maxHeight: 52, marginTop: 56 },
  filterContent: { paddingHorizontal: Spacing.xl, paddingVertical: Spacing.sm, gap: Spacing.sm },
  chip: {
    paddingHorizontal: Spacing.md, paddingVertical: 6,
    borderRadius: BorderRadius.full, borderWidth: 1,
    borderColor: Colors.midGray, backgroundColor: Colors.offWhite,
  },
  chipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipTxt: { fontFamily: Typography.medium.fontFamily, fontSize: Typography.sizes.xs, color: Colors.darkGray },
  chipTxtActive: { color: Colors.white },

  list: { padding: Spacing.xl, paddingBottom: 100 },
  empty: { alignItems: 'center', paddingTop: 80, gap: Spacing.md },
  emptyTxt: { fontFamily: Typography.medium.fontFamily, fontSize: Typography.sizes.base, color: Colors.darkGray },

  card: {
    backgroundColor: Colors.white, borderRadius: BorderRadius.lg,
    padding: Spacing.base, marginBottom: Spacing.md,
    borderWidth: 1, borderColor: Colors.lightGray, ...Shadows.sm,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  orderNum: { fontFamily: Typography.semiBold.fontFamily, fontSize: Typography.sizes.sm, color: Colors.darkGray },
  statusPill: { paddingHorizontal: Spacing.sm, paddingVertical: 4, borderRadius: BorderRadius.full },
  statusTxt: { fontFamily: Typography.semiBold.fontFamily, fontSize: 10, textTransform: 'uppercase' },
  divider: { height: 1, backgroundColor: Colors.lightGray, marginBottom: Spacing.sm },
  cardBody: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  itemImg: { width: 60, height: 60, borderRadius: BorderRadius.md },
  itemImgEmpty: { backgroundColor: Colors.cream, alignItems: 'center', justifyContent: 'center' },
  itemInfo: { flex: 1 },
  itemName: { fontFamily: Typography.semiBold.fontFamily, fontSize: Typography.sizes.base, color: Colors.nearBlack, marginBottom: 2 },
  itemDesc: { fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.sm, color: Colors.darkGray, marginBottom: 4 },
  itemPrice: { fontFamily: Typography.bold.fontFamily, fontSize: Typography.sizes.sm, color: Colors.nearBlack },
});
