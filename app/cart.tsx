/**
 * TipL — Cart Page
 * Gold luxury theme. Grouped by traveler, escrow-protected checkout.
 */
import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Modal } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Colors, Typography, Spacing, BorderRadius, Shadows, OrderStatus } from '@/src/lib/constants';
import { useCartStore } from '@/src/store/cartStore';
import { useOrderStore } from '@/src/store/orderStore';
import { useWalletStore } from '@/src/store/walletStore';
import { Order } from '@/src/lib/types';

const fmtIDR = (v: number) => 'Rp ' + v.toLocaleString('id-ID');

export default function CartScreen() {
  const { items, selectedItems, removeItem, toggleSelection, toggleTravelerSelection, toggleAllSelection } = useCartStore();
  const { setOrders, orders } = useOrderStore();

  const { balance, deductBalance } = useWalletStore();
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [selectedPayMethod, setSelectedPayMethod] = useState<string | null>(null);

  const groupedArray = useMemo(() => {
    const map: Record<string, { travelerId: string; travelerName: string; items: typeof items }> = {};
    for (const item of items) {
      if (!map[item.travelerId]) {
        map[item.travelerId] = { travelerId: item.travelerId, travelerName: item.travelerName, items: [] };
      }
      map[item.travelerId].items.push(item);
    }
    return Object.values(map);
  }, [items]);

  const selectedItemsData = items.filter((i) => selectedItems.includes(i.id));
  const subtotal = selectedItemsData.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const platformFee = selectedItems.length > 0 ? 15000 : 0;
  const total = subtotal + platformFee;
  const allSelected = items.length > 0 && selectedItems.length === items.length;

  const handleCheckout = () => {
    if (selectedItems.length === 0) {
      Alert.alert('No Items Selected', 'Please select at least one item to checkout.');
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedPayMethod(null);
    setPaymentModalVisible(true);
  };

  const buildOrder = (): Order => ({
    id: `ord_${Date.now()}`,
    orderNumber: `TPL-${Math.floor(Math.random() * 10000)}`,
    requestId: `req_${Date.now()}`,
    tripId: 't1',
    travelerId: selectedItemsData[0].travelerId,
    travelerName: selectedItemsData[0].travelerName,
    buyerId: 'u2',
    buyerName: 'You',
    itemName: selectedItemsData.length === 1 ? selectedItemsData[0].name : `${selectedItemsData.length} Items`,
    itemDescription: selectedItemsData.map((i) => `${i.quantity}x ${i.name}`).join(', '),
    itemImageUrl: selectedItemsData[0]?.imageUrl || null,
    quantity: selectedItemsData.reduce((sum, i) => sum + i.quantity, 0),
    status: OrderStatus.PENDING,
    timeline: [
      { status: OrderStatus.PENDING, label: 'Order Placed', timestamp: Date.now() },
      { status: OrderStatus.PAYMENT_CONFIRMED, label: 'Payment Confirmed', timestamp: null },
      { status: OrderStatus.ITEM_PURCHASED, label: 'Item Purchased', timestamp: null },
    ],
    paymentSummary: { itemPrice: subtotal, travelerFee: 0, platformFee, totalAmount: total, currency: 'IDR' },
    proofOfPurchaseUrls: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });

  const handleConfirmPayment = (method: string) => {
    setPaymentModalVisible(false);

    if (method === 'balance') {
      if (balance < total) {
        Alert.alert('Insufficient Balance', `You need ${fmtIDR(total - balance)} more. Top up your wallet?`, [
          { text: 'Top Up', onPress: () => router.push('/wallet/topup' as any) },
          { text: 'Cancel', style: 'cancel' },
        ]);
        return;
      }
      deductBalance(total);
      const newOrder = buildOrder();
      setOrders([{ ...newOrder, status: OrderStatus.PAYMENT_CONFIRMED }, ...orders]);
      selectedItems.forEach((id) => removeItem(id));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Payment Successful!', 'Your order has been placed and payment confirmed.', [
        { text: 'View Order', onPress: () => router.replace('/profile/orders') },
      ]);
    } else {
      // Midtrans / bank transfer — create pending order then let user pay via Pay Now
      const newOrder = buildOrder();
      setOrders([newOrder, ...orders]);
      selectedItems.forEach((id) => removeItem(id));
      Alert.alert(
        'Order Created',
        'Please complete payment to confirm your order.',
        [{ text: 'View Order', onPress: () => router.replace('/profile/orders') }],
      );
    }
  };

  return (
    <SafeAreaView style={st.safe} edges={['top']}>
      {/* Header */}
      <View style={st.header}>
        <TouchableOpacity onPress={() => router.back()} style={st.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.nearBlack} />
        </TouchableOpacity>
        <View style={{ flex: 1 }} />
        {items.length > 0 && (
          <TouchableOpacity onPress={() => Alert.alert('Clear Cart', 'Remove all items?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Clear', style: 'destructive', onPress: () => selectedItems.forEach((id) => removeItem(id)) },
          ])}>
            <Text style={st.clearTxt}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={st.body} showsVerticalScrollIndicator={false}>
        {items.length === 0 ? (
          <View style={st.empty}>
            <View style={st.emptyIcon}>
              <Ionicons name="cart-outline" size={48} color={Colors.midGray} />
            </View>
            <Text style={st.emptyTitle}>Your cart is empty</Text>
            <Text style={st.emptyDesc}>Find unique items from travelers around the world</Text>
            <TouchableOpacity onPress={() => router.push('/')} style={st.shopBtn}>
              <LinearGradient colors={[Colors.primaryLight, Colors.primaryDark]} style={st.shopBtnGrad}>
                <Text style={st.shopBtnTxt}>Explore Products</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={st.cartList}>
            {/* Escrow Notice */}
            <View style={st.escrowBanner}>
              <Ionicons name="shield-checkmark" size={18} color={Colors.primary} />
              <Text style={st.escrowTxt}>All payments are held in escrow until delivery confirmed</Text>
            </View>

            {groupedArray.map((group) => {
              const allGroupSelected = group.items.every((i) => selectedItems.includes(i.id));
              return (
                <View key={group.travelerId} style={st.storeCard}>
                  <View style={st.storeHeader}>
                    <TouchableOpacity
                      style={st.checkbox}
                      onPress={() => toggleTravelerSelection(group.travelerId, !allGroupSelected)}
                    >
                      <Ionicons
                        name={allGroupSelected ? 'checkbox' : 'square-outline'}
                        size={22}
                        color={allGroupSelected ? Colors.primary : Colors.midGray}
                      />
                    </TouchableOpacity>
                    <View style={st.travelerBadge}>
                      <Ionicons name="person-circle-outline" size={16} color={Colors.primary} />
                      <Text style={st.storeName}>{group.travelerName}</Text>
                    </View>
                    <View style={st.verifiedBadge}>
                      <Ionicons name="shield-checkmark" size={12} color={Colors.success} />
                      <Text style={st.verifiedTxt}>Verified</Text>
                    </View>
                  </View>

                  {group.items.map((item) => {
                    const isSelected = selectedItems.includes(item.id);
                    return (
                      <View key={item.id} style={[st.itemRow, isSelected && st.itemRowSelected]}>
                        <TouchableOpacity style={st.checkbox} onPress={() => toggleSelection(item.id)}>
                          <Ionicons
                            name={isSelected ? 'checkbox' : 'square-outline'}
                            size={22}
                            color={isSelected ? Colors.primary : Colors.midGray}
                          />
                        </TouchableOpacity>
                        <Image source={{ uri: item.imageUrl }} style={st.itemImg} contentFit="cover" />
                        <View style={st.itemInfo}>
                          <Text style={st.itemName} numberOfLines={2}>{item.name}</Text>
                          <Text style={st.itemPrice}>{fmtIDR(item.price)}</Text>
                          <View style={st.qtyRow}>
                            <TouchableOpacity onPress={() => removeItem(item.id)} style={st.removeBtn}>
                              <Ionicons name="trash-outline" size={16} color={Colors.error} />
                            </TouchableOpacity>
                            <View style={st.qtyCtrl}>
                              <Text style={st.qtyTxt}>Qty: {item.quantity}</Text>
                            </View>
                          </View>
                        </View>
                      </View>
                    );
                  })}
                </View>
              );
            })}
          </View>
        )}
        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Bottom Bar */}
      {items.length > 0 && (
        <View style={st.bottomBar}>
          <TouchableOpacity style={st.selectAllRow} onPress={() => toggleAllSelection(!allSelected)}>
            <Ionicons
              name={allSelected ? 'checkbox' : 'square-outline'}
              size={22}
              color={allSelected ? Colors.primary : Colors.midGray}
            />
            <Text style={st.selectAllTxt}>All ({items.length})</Text>
          </TouchableOpacity>

          <View style={st.totalCol}>
            <Text style={st.totalLbl}>Total Payment</Text>
            <Text style={st.totalVal}>{fmtIDR(total)}</Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleCheckout}
            disabled={selectedItems.length === 0}
          >
            <LinearGradient
              colors={selectedItems.length === 0
                ? [Colors.midGray, Colors.midGray]
                : [Colors.primaryLight, Colors.primaryDark]}
              style={st.buyBtn}
            >
              <Text style={st.buyTxt}>Order ({selectedItems.length})</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}

      {/* ── Payment Method Modal ── */}
      <Modal
        visible={paymentModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setPaymentModalVisible(false)}
      >
        <TouchableOpacity
          style={st.modalOverlay}
          activeOpacity={1}
          onPress={() => setPaymentModalVisible(false)}
        />
        <View style={st.modalSheet}>
          {/* Handle bar */}
          <View style={st.modalHandle} />

          <Text style={st.modalTitle}>Select Payment Method</Text>

          {/* Order summary row */}
          <View style={st.modalSummary}>
            <Text style={st.modalSummaryLbl}>Total</Text>
            <Text style={st.modalSummaryVal}>{fmtIDR(total)}</Text>
          </View>

          {/* Wallet balance option */}
          <TouchableOpacity
            style={[st.payMethodRow, selectedPayMethod === 'balance' && st.payMethodRowActive]}
            activeOpacity={0.75}
            onPress={() => { Haptics.selectionAsync(); setSelectedPayMethod('balance'); }}
          >
            <View style={[st.payMethodIcon, { backgroundColor: Colors.primaryPale }]}>
              <Ionicons name="wallet-outline" size={22} color={Colors.primary} />
            </View>
            <View style={st.payMethodInfo}>
              <Text style={st.payMethodLabel}>TipL Wallet</Text>
              <Text style={st.payMethodSub}>Balance: {fmtIDR(balance)}</Text>
            </View>
            <View style={[st.radioOuter, selectedPayMethod === 'balance' && st.radioOuterActive]}>
              {selectedPayMethod === 'balance' && <View style={st.radioInner} />}
            </View>
          </TouchableOpacity>

          {/* Midtrans option */}
          <TouchableOpacity
            style={[st.payMethodRow, selectedPayMethod === 'midtrans' && st.payMethodRowActive]}
            activeOpacity={0.75}
            onPress={() => { Haptics.selectionAsync(); setSelectedPayMethod('midtrans'); }}
          >
            <View style={[st.payMethodIcon, { backgroundColor: Colors.infoLight }]}>
              <Ionicons name="card-outline" size={22} color={Colors.info} />
            </View>
            <View style={st.payMethodInfo}>
              <Text style={st.payMethodLabel}>Credit Card / Bank Transfer</Text>
              <Text style={st.payMethodSub}>Via Midtrans — secure payment</Text>
            </View>
            <View style={[st.radioOuter, selectedPayMethod === 'midtrans' && st.radioOuterActive]}>
              {selectedPayMethod === 'midtrans' && <View style={st.radioInner} />}
            </View>
          </TouchableOpacity>

          {/* GoPay / QRIS option */}
          <TouchableOpacity
            style={[st.payMethodRow, selectedPayMethod === 'gopay' && st.payMethodRowActive]}
            activeOpacity={0.75}
            onPress={() => { Haptics.selectionAsync(); setSelectedPayMethod('gopay'); }}
          >
            <View style={[st.payMethodIcon, { backgroundColor: Colors.successLight }]}>
              <Ionicons name="phone-portrait-outline" size={22} color={Colors.success} />
            </View>
            <View style={st.payMethodInfo}>
              <Text style={st.payMethodLabel}>GoPay / OVO / QRIS</Text>
              <Text style={st.payMethodSub}>E-Wallet — instant confirmation</Text>
            </View>
            <View style={[st.radioOuter, selectedPayMethod === 'gopay' && st.radioOuterActive]}>
              {selectedPayMethod === 'gopay' && <View style={st.radioInner} />}
            </View>
          </TouchableOpacity>

          {/* Confirm button */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => selectedPayMethod && handleConfirmPayment(selectedPayMethod)}
            disabled={!selectedPayMethod}
            style={{ marginTop: Spacing.md }}
          >
            <LinearGradient
              colors={!selectedPayMethod ? [Colors.midGray, Colors.midGray] : [Colors.primaryLight, Colors.primaryDark]}
              style={st.confirmBtn}
            >
              <Text style={st.confirmBtnTxt}>Confirm Payment</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setPaymentModalVisible(false)} style={{ alignItems: 'center', marginTop: Spacing.md }}>
            <Text style={{ fontFamily: Typography.medium.fontFamily, fontSize: Typography.sizes.sm, color: Colors.gray }}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.offWhite },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  backBtn: { width: 36, height: 36, justifyContent: 'center' },
  headerTitle: { fontFamily: Typography.serifBold.fontFamily, fontSize: Typography.sizes.lg, color: Colors.nearBlack },
  clearTxt: { fontFamily: Typography.medium.fontFamily, fontSize: Typography.sizes.sm, color: Colors.error },
  body: { flex: 1 },

  // Empty state
  empty: { alignItems: 'center', justifyContent: 'center', paddingTop: 80, paddingHorizontal: Spacing['2xl'], gap: Spacing.md },
  emptyIcon: { width: 96, height: 96, borderRadius: 48, backgroundColor: Colors.cream, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.sm },
  emptyTitle: { fontFamily: Typography.serifBold.fontFamily, fontSize: Typography.sizes.xl, color: Colors.nearBlack },
  emptyDesc: { fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.base, color: Colors.darkGray, textAlign: 'center', lineHeight: 22 },
  shopBtn: { marginTop: Spacing.md, borderRadius: BorderRadius.full, overflow: 'hidden' },
  shopBtnGrad: { paddingHorizontal: Spacing['2xl'], paddingVertical: Spacing.base },
  shopBtnTxt: { fontFamily: Typography.semiBold.fontFamily, fontSize: Typography.sizes.base, color: Colors.white },

  // Cart List
  cartList: { paddingTop: Spacing.md },
  escrowBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.primaryPale, marginHorizontal: Spacing.base, marginBottom: Spacing.md, borderRadius: BorderRadius.md, padding: Spacing.md, gap: Spacing.sm, borderWidth: 1, borderColor: Colors.primaryLight },
  escrowTxt: { flex: 1, fontFamily: Typography.medium.fontFamily, fontSize: Typography.sizes.xs, color: Colors.charcoal, lineHeight: 16 },

  storeCard: { backgroundColor: Colors.white, marginHorizontal: Spacing.sm, marginBottom: Spacing.sm, borderRadius: BorderRadius.lg, borderWidth: 1, borderColor: Colors.lightGray, overflow: 'hidden', ...Shadows.sm },
  storeHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: Spacing.base, gap: Spacing.sm, borderBottomWidth: 1, borderBottomColor: Colors.lightGray, backgroundColor: Colors.offWhite },
  checkbox: { paddingRight: Spacing.xs },
  travelerBadge: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 5 },
  storeName: { fontFamily: Typography.semiBold.fontFamily, fontSize: Typography.sizes.sm, color: Colors.nearBlack },
  verifiedBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: Colors.successLight, paddingHorizontal: Spacing.sm, paddingVertical: 3, borderRadius: BorderRadius.full },
  verifiedTxt: { fontFamily: Typography.medium.fontFamily, fontSize: 10, color: Colors.success },

  itemRow: { flexDirection: 'row', padding: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.lightGray },
  itemRowSelected: { backgroundColor: Colors.primaryPale + '50' },
  itemImg: { width: 76, height: 76, borderRadius: BorderRadius.md, backgroundColor: Colors.cream },
  itemInfo: { flex: 1, marginLeft: Spacing.md },
  itemName: { fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.sm, color: Colors.nearBlack, lineHeight: 18, marginBottom: 4 },
  itemPrice: { fontFamily: Typography.bold.fontFamily, fontSize: Typography.sizes.base, color: Colors.nearBlack, marginBottom: Spacing.sm },
  qtyRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  removeBtn: { padding: 4 },
  qtyCtrl: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.offWhite, borderWidth: 1, borderColor: Colors.lightGray, borderRadius: BorderRadius.sm, paddingHorizontal: Spacing.sm, paddingVertical: 4 },
  qtyTxt: { fontFamily: Typography.medium.fontFamily, fontSize: Typography.sizes.xs, color: Colors.nearBlack },

  // Bottom Bar
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.base,
    paddingBottom: Spacing.xl,
    borderTopWidth: 1,
    borderTopColor: Colors.lightGray,
    ...Shadows.md,
  },
  selectAllRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  selectAllTxt: { fontFamily: Typography.medium.fontFamily, fontSize: Typography.sizes.sm, color: Colors.nearBlack },
  totalCol: { flex: 1, alignItems: 'flex-end', marginRight: Spacing.md },
  totalLbl: { fontFamily: Typography.regular.fontFamily, fontSize: 10, color: Colors.darkGray },
  totalVal: { fontFamily: Typography.bold.fontFamily, fontSize: Typography.sizes.md, color: Colors.nearBlack },
  buyBtn: { paddingHorizontal: Spacing.xl, paddingVertical: Spacing.sm, borderRadius: BorderRadius.full },
  buyTxt: { fontFamily: Typography.bold.fontFamily, fontSize: Typography.sizes.sm, color: Colors.white },

  // Payment modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  modalSheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: BorderRadius['2xl'],
    borderTopRightRadius: BorderRadius['2xl'],
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
    paddingBottom: Spacing['2xl'],
    ...Shadows.lg,
  },
  modalHandle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: Colors.midGray,
    alignSelf: 'center',
    marginBottom: Spacing.lg,
  },
  modalTitle: {
    fontFamily: Typography.serifBold.fontFamily,
    fontSize: Typography.sizes.lg,
    color: Colors.nearBlack,
    marginBottom: Spacing.md,
  },
  modalSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.primaryPale,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.primaryLight,
  },
  modalSummaryLbl: {
    fontFamily: Typography.medium.fontFamily,
    fontSize: Typography.sizes.sm,
    color: Colors.charcoal,
  },
  modalSummaryVal: {
    fontFamily: Typography.bold.fontFamily,
    fontSize: Typography.sizes.base,
    color: Colors.nearBlack,
  },
  payMethodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.base,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    borderColor: Colors.lightGray,
    marginBottom: Spacing.sm,
    gap: Spacing.md,
    backgroundColor: Colors.white,
  },
  payMethodRowActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryPale,
  },
  payMethodIcon: {
    width: 44, height: 44, borderRadius: BorderRadius.md,
    alignItems: 'center', justifyContent: 'center',
  },
  payMethodInfo: { flex: 1 },
  payMethodLabel: {
    fontFamily: Typography.semiBold.fontFamily,
    fontSize: Typography.sizes.base,
    color: Colors.nearBlack,
  },
  payMethodSub: {
    fontFamily: Typography.regular.fontFamily,
    fontSize: Typography.sizes.xs,
    color: Colors.darkGray,
    marginTop: 2,
  },
  radioOuter: {
    width: 20, height: 20, borderRadius: 10,
    borderWidth: 2, borderColor: Colors.midGray,
    alignItems: 'center', justifyContent: 'center',
  },
  radioOuterActive: { borderColor: Colors.primary },
  radioInner: {
    width: 10, height: 10, borderRadius: 5,
    backgroundColor: Colors.primary,
  },
  confirmBtn: {
    borderRadius: BorderRadius.full,
    paddingVertical: Spacing.base,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmBtnTxt: {
    fontFamily: Typography.bold.fontFamily,
    fontSize: Typography.sizes.base,
    color: Colors.white,
  },
});
