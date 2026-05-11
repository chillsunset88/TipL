/**
 * TipL — Cart Page
 * Displays grouped items by traveler, checkbox selection, and green checkout button.
 */
import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/src/lib/constants';
import { useCartStore } from '@/src/store/cartStore';
import { useOrderStore } from '@/src/store/orderStore';
import { OrderStatus } from '@/src/lib/constants';
import { Order } from '@/src/lib/types';

const GREEN = '#00AA5B'; // Tokopedia-like green
const fmtIDR = (v: number) => 'Rp ' + v.toLocaleString('id-ID');

export default function CartScreen() {
  const {
    items,
    selectedItems,
    removeItem,
    clearCart,
    toggleSelection,
    toggleTravelerSelection,
    toggleAllSelection,
  } = useCartStore();
  const { setOrders, orders } = useOrderStore();

  // Group items by traveler
  const groupedItems = useMemo(() => {
    return items.reduce((acc, item) => {
      if (!acc[item.travelerId]) {
        acc[item.travelerId] = {
          travelerId: item.travelerId,
          travelerName: item.travelerName,
          items: [],
        };
      }
      acc[item.travelerId].items.push(item);
      return acc;
    }, {} as Record<string, { travelerId: string; travelerName: string; items: typeof items }>);
  }, [items]);

  const groupedArray = Object.values(groupedItems);

  // Subtotal only includes selected items
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

    // Create a mock order from the selected items
    const newOrder: Order = {
      id: `ord_${Date.now()}`,
      orderNumber: `TPL-${Math.floor(Math.random() * 10000)}`,
      requestId: `req_${Date.now()}`,
      tripId: 't1',
      travelerId: selectedItemsData[0].travelerId,
      travelerName: selectedItemsData[0].travelerName,
      buyerId: 'u2',
      buyerName: 'Adriana V.',
      itemName: selectedItemsData.length === 1 ? selectedItemsData[0].name : `${selectedItemsData.length} Items`,
      itemDescription: selectedItemsData.map((i) => `${i.quantity}x ${i.name}`).join(', '),
      itemImageUrl: selectedItemsData[0]?.imageUrl || null,
      quantity: selectedItemsData.reduce((sum, i) => sum + i.quantity, 0),
      status: OrderStatus.PAYMENT_CONFIRMED,
      timeline: [
        { status: OrderStatus.PENDING, label: 'Order Placed', timestamp: Date.now() - 60000 },
        { status: OrderStatus.PAYMENT_CONFIRMED, label: 'Payment Confirmed', timestamp: Date.now() },
        { status: OrderStatus.ITEM_PURCHASED, label: 'Item Purchased', timestamp: null },
      ],
      paymentSummary: {
        itemPrice: subtotal,
        travelerFee: 0,
        platformFee: platformFee,
        totalAmount: total,
        currency: 'IDR',
      },
      proofOfPurchaseUrls: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    setOrders([newOrder, ...orders]);
    // Remove selected items from cart
    selectedItems.forEach((id) => removeItem(id));

    Alert.alert('Success', 'Order placed successfully!', [
      { text: 'View Orders', onPress: () => router.replace('/profile/orders') },
    ]);
  };

  return (
    <SafeAreaView style={st.safe} edges={['top']}>
      {/* Header */}
      <View style={st.header}>
        <TouchableOpacity onPress={() => router.back()} style={st.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.nearBlack} />
        </TouchableOpacity>
        <Text style={st.headerTitle}>Keranjang</Text>
        <View style={{ flexDirection: 'row', gap: Spacing.md }}>
          <TouchableOpacity onPress={() => Alert.alert('Coming Soon')}>
            <Ionicons name="chatbubble-ellipses-outline" size={24} color={Colors.nearBlack} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => Alert.alert('Coming Soon')}>
            <Ionicons name="heart-outline" size={24} color={Colors.nearBlack} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => Alert.alert('Coming Soon')}>
            <Ionicons name="menu-outline" size={24} color={Colors.nearBlack} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={st.body} showsVerticalScrollIndicator={false}>
        {items.length === 0 ? (
          <View style={st.empty}>
            <Ionicons name="cart-outline" size={64} color={Colors.midGray} />
            <Text style={st.emptyTxt}>Keranjang Anda Kosong</Text>
            <TouchableOpacity onPress={() => router.push('/')} style={st.shopBtn}>
              <Text style={st.shopBtnTxt}>Belanja Sekarang</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={st.cartList}>
            {groupedArray.map((group) => {
              const travelerItems = group.items;
              const allTravelerItemsSelected = travelerItems.every((i) => selectedItems.includes(i.id));

              return (
                <View key={group.travelerId} style={st.storeCard}>
                  {/* Store Header */}
                  <View style={st.storeHeader}>
                    <TouchableOpacity
                      style={st.checkbox}
                      onPress={() => toggleTravelerSelection(group.travelerId, !allTravelerItemsSelected)}
                    >
                      <Ionicons
                        name={allTravelerItemsSelected ? 'checkbox' : 'square-outline'}
                        size={22}
                        color={allTravelerItemsSelected ? GREEN : Colors.midGray}
                      />
                    </TouchableOpacity>
                    <Ionicons name="shield-checkmark" size={16} color={GREEN} />
                    <Text style={st.storeName}>{group.travelerName}</Text>
                  </View>

                  {/* Items */}
                  {travelerItems.map((item) => {
                    const isSelected = selectedItems.includes(item.id);
                    return (
                      <View key={item.id} style={st.itemRow}>
                        <TouchableOpacity style={st.checkbox} onPress={() => toggleSelection(item.id)}>
                          <Ionicons
                            name={isSelected ? 'checkbox' : 'square-outline'}
                            size={22}
                            color={isSelected ? GREEN : Colors.midGray}
                          />
                        </TouchableOpacity>
                        <Image source={{ uri: item.imageUrl }} style={st.itemImg} contentFit="cover" />
                        <View style={st.itemInfo}>
                          <Text style={st.itemName} numberOfLines={2}>{item.name}</Text>
                          <Text style={st.itemPrice}>{fmtIDR(item.price)}</Text>

                          <View style={st.qtyRow}>
                            <TouchableOpacity onPress={() => removeItem(item.id)} style={st.removeBtn}>
                              <Ionicons name="trash-outline" size={18} color={Colors.darkGray} />
                            </TouchableOpacity>
                            <View style={st.qtyCtrl}>
                              <Text style={st.qtyTxt}>{item.quantity}</Text>
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
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Bar */}
      {items.length > 0 && (
        <View style={st.bottomBar}>
          <TouchableOpacity style={st.selectAllRow} onPress={() => toggleAllSelection(!allSelected)}>
            <Ionicons
              name={allSelected ? 'checkbox' : 'square-outline'}
              size={22}
              color={allSelected ? GREEN : Colors.midGray}
            />
            <Text style={st.selectAllTxt}>Semua</Text>
          </TouchableOpacity>

          <View style={st.totalCol}>
            <Text style={st.totalLbl}>Total</Text>
            <Text style={st.totalVal}>{fmtIDR(total)}</Text>
          </View>

          <TouchableOpacity
            style={[st.buyBtn, selectedItems.length === 0 && st.buyBtnDisabled]}
            activeOpacity={0.8}
            onPress={handleCheckout}
            disabled={selectedItems.length === 0}
          >
            <Text style={st.buyTxt}>Beli ({selectedItems.length})</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5F5F5' },
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
  backBtn: { width: 32, height: 32, justifyContent: 'center' },
  headerTitle: { fontFamily: Typography.serifBold.fontFamily, fontSize: Typography.sizes.lg, color: Colors.nearBlack, flex: 1, marginLeft: Spacing.sm },
  body: { flex: 1 },
  empty: { padding: Spacing.xl, alignItems: 'center', justifyContent: 'center', marginTop: 100, gap: Spacing.md },
  emptyTxt: { fontFamily: Typography.medium.fontFamily, fontSize: Typography.sizes.lg, color: Colors.darkGray },
  shopBtn: { marginTop: Spacing.xl, paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md, backgroundColor: GREEN, borderRadius: BorderRadius.md },
  shopBtnTxt: { fontFamily: Typography.semiBold.fontFamily, color: Colors.white, fontSize: Typography.sizes.md },

  // List
  cartList: { paddingBottom: Spacing.xl },
  storeCard: { backgroundColor: Colors.white, marginBottom: Spacing.sm, paddingVertical: Spacing.md },
  storeHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.md, marginBottom: Spacing.md, gap: Spacing.xs },
  checkbox: { paddingRight: Spacing.sm },
  storeName: { fontFamily: Typography.bold.fontFamily, fontSize: Typography.sizes.sm, color: Colors.nearBlack, marginLeft: 2 },

  // Items
  itemRow: { flexDirection: 'row', paddingHorizontal: Spacing.md, marginBottom: Spacing.md },
  itemImg: { width: 72, height: 72, borderRadius: BorderRadius.md, backgroundColor: Colors.offWhite },
  itemInfo: { flex: 1, marginLeft: Spacing.md },
  itemName: { fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.sm, color: Colors.nearBlack, marginBottom: 4, lineHeight: 18 },
  itemPrice: { fontFamily: Typography.bold.fontFamily, fontSize: Typography.sizes.sm, color: Colors.nearBlack, marginBottom: Spacing.sm },
  qtyRow: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: Spacing.lg },
  removeBtn: { padding: 4 },
  qtyCtrl: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: Colors.lightGray, borderRadius: BorderRadius.sm, paddingHorizontal: Spacing.md, paddingVertical: 4 },
  qtyTxt: { fontFamily: Typography.medium.fontFamily, fontSize: Typography.sizes.sm, color: Colors.nearBlack },

  // Bottom Bar
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.lightGray,
    ...Shadows.md,
  },
  selectAllRow: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: 8 },
  selectAllTxt: { fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.sm, color: Colors.nearBlack },
  totalCol: { alignItems: 'flex-end', marginRight: Spacing.md },
  totalLbl: { fontFamily: Typography.regular.fontFamily, fontSize: 10, color: Colors.darkGray },
  totalVal: { fontFamily: Typography.bold.fontFamily, fontSize: Typography.sizes.md, color: Colors.nearBlack },
  buyBtn: { backgroundColor: GREEN, paddingHorizontal: Spacing.xl, paddingVertical: 10, borderRadius: BorderRadius.full },
  buyBtnDisabled: { backgroundColor: Colors.midGray },
  buyTxt: { fontFamily: Typography.bold.fontFamily, fontSize: Typography.sizes.sm, color: Colors.white },
});
