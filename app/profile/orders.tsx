/**
 * TipL — My Orders Page
 * Displays the list of real-time orders managed by useOrderStore.
 */
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/src/lib/constants';
import { useOrderStore } from '@/src/store/orderStore';
import { OrderStatus } from '@/src/lib/constants';
import { Order } from '@/src/lib/types';
import { Image } from 'expo-image';

const fmtIDR = (v: number) => 'Rp ' + v.toLocaleString('id-ID');

export default function OrdersScreen() {
  const { orders } = useOrderStore();

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING: return Colors.primary;
      case OrderStatus.DELIVERED:
      case OrderStatus.COMPLETED: return Colors.success;
      case OrderStatus.CANCELLED: return Colors.error;
      default: return Colors.info;
    }
  };

  const getStatusText = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING: return 'Pending';
      case OrderStatus.OFFER_ACCEPTED: return 'Accepted';
      case OrderStatus.PAYMENT_CONFIRMED: return 'Paid';
      case OrderStatus.ITEM_PURCHASED: return 'Purchased';
      case OrderStatus.IN_TRANSIT: return 'In Transit';
      case OrderStatus.DELIVERED: return 'Delivered';
      case OrderStatus.COMPLETED: return 'Completed';
      case OrderStatus.CANCELLED: return 'Cancelled';
      default: return status;
    }
  };

  return (
    <SafeAreaView style={st.safe} edges={['top']}>
      <View style={st.header}>
        <TouchableOpacity onPress={() => router.back()} style={st.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.nearBlack} />
        </TouchableOpacity>
        <Text style={st.headerTitle}>My Orders</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView style={st.body} showsVerticalScrollIndicator={false}>
        {orders.length === 0 ? (
          <View style={st.empty}>
            <Ionicons name="receipt-outline" size={64} color={Colors.midGray} />
            <Text style={st.emptyTxt}>You have no orders yet</Text>
          </View>
        ) : (
          <View style={st.list}>
            {orders.map((order) => (
              <TouchableOpacity
                key={order.id}
                style={st.card}
                activeOpacity={0.7}
                onPress={() => router.push(`/order/${order.id}`)}
              >
                <View style={st.cardHeader}>
                  <Text style={st.orderNum}>{order.orderNumber}</Text>
                  <View style={[st.statusPill, { backgroundColor: getStatusColor(order.status) + '15' }]}>
                    <Text style={[st.statusTxt, { color: getStatusColor(order.status) }]}>
                      {getStatusText(order.status)}
                    </Text>
                  </View>
                </View>
                <View style={st.divider} />
                <View style={st.cardBody}>
                  {order.itemImageUrl ? (
                    <Image source={{ uri: order.itemImageUrl }} style={st.itemImg} contentFit="cover" />
                  ) : (
                    <View style={[st.itemImg, { backgroundColor: Colors.cream, alignItems: 'center', justifyContent: 'center' }]}>
                      <Ionicons name="cube-outline" size={24} color={Colors.darkGray} />
                    </View>
                  )}
                  <View style={st.itemInfo}>
                    <Text style={st.itemName} numberOfLines={1}>{order.itemName}</Text>
                    <Text style={st.itemDesc} numberOfLines={1}>{order.itemDescription}</Text>
                    <Text style={st.itemPrice}>{fmtIDR(order.paymentSummary.totalAmount)}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.offWhite },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md, backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.lightGray },
  backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.offWhite, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontFamily: Typography.serifBold.fontFamily, fontSize: Typography.sizes.md, color: Colors.nearBlack },
  body: { flex: 1 },
  empty: { padding: Spacing.xl, alignItems: 'center', justifyContent: 'center', marginTop: 100, gap: Spacing.md },
  emptyTxt: { fontFamily: Typography.medium.fontFamily, fontSize: Typography.sizes.lg, color: Colors.darkGray },
  list: { padding: Spacing.xl },
  card: { backgroundColor: Colors.white, borderRadius: BorderRadius.lg, padding: Spacing.base, marginBottom: Spacing.md, ...Shadows.sm },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  orderNum: { fontFamily: Typography.semiBold.fontFamily, fontSize: Typography.sizes.sm, color: Colors.darkGray },
  statusPill: { paddingHorizontal: Spacing.sm, paddingVertical: 4, borderRadius: BorderRadius.full },
  statusTxt: { fontFamily: Typography.semiBold.fontFamily, fontSize: 10, textTransform: 'uppercase' },
  divider: { height: 1, backgroundColor: Colors.lightGray, marginBottom: Spacing.sm },
  cardBody: { flexDirection: 'row', alignItems: 'center' },
  itemImg: { width: 60, height: 60, borderRadius: BorderRadius.md },
  itemInfo: { flex: 1, marginLeft: Spacing.md },
  itemName: { fontFamily: Typography.semiBold.fontFamily, fontSize: Typography.sizes.base, color: Colors.nearBlack, marginBottom: 2 },
  itemDesc: { fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.sm, color: Colors.darkGray, marginBottom: 4 },
  itemPrice: { fontFamily: Typography.bold.fontFamily, fontSize: Typography.sizes.sm, color: Colors.nearBlack },
});
