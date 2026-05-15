/**
 * TipL — Cart Page
 * Gold luxury theme. Grouped by traveler, escrow-protected checkout.
 */
import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/src/lib/constants';
import { useCartStore } from '@/src/store/cartStore';
import { useAuthStore } from '@/src/store/authStore';
import { createXenditInvoice } from '@/src/lib/xendit';

const fmtIDR = (v: number) => 'Rp ' + v.toLocaleString('id-ID');

export default function CartScreen() {
  const { items, selectedItems, removeItem, toggleSelection, toggleTravelerSelection, toggleAllSelection } = useCartStore();
  const user = useAuthStore((s) => s.user);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

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

  const handleCheckout = async () => {
    if (selectedItems.length === 0) {
      Alert.alert('No Items Selected', 'Please select at least one item to checkout.');
      return;
    }
    if (!user) {
      Alert.alert('Sign In Required', 'Please sign in to checkout.', [
        { text: 'Sign In', onPress: () => router.replace('/(auth)/login' as any) },
        { text: 'Cancel', style: 'cancel' },
      ]);
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setCheckoutLoading(true);
    try {
      const externalId = `tipl-cart-${Date.now()}`;
      const itemDesc = selectedItemsData.length === 1
        ? selectedItemsData[0].name
        : `${selectedItemsData.length} items`;
      const { invoice_url } = await createXenditInvoice({
        externalId,
        amount: total,
        payerEmail: user.email,
        description: `TipL Order - ${itemDesc}`,
      });
      selectedItems.forEach((id) => removeItem(id));
      router.push({
        pathname: '/payment/xendit-qr',
        params: {
          invoiceUrl: invoice_url,
          orderId: externalId,
          buyerId: user.id,
          travelerId: selectedItemsData[0]?.travelerId ?? '',
          amount: String(total),
          currency: 'IDR',
        },
      });
    } catch {
      Alert.alert('Error', 'Gagal memuat halaman pembayaran. Coba lagi.');
    } finally {
      setCheckoutLoading(false);
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
            disabled={selectedItems.length === 0 || checkoutLoading}
          >
            <LinearGradient
              colors={selectedItems.length === 0 || checkoutLoading
                ? [Colors.midGray, Colors.midGray]
                : [Colors.primaryLight, Colors.primaryDark]}
              style={st.buyBtn}
            >
              {checkoutLoading
                ? <ActivityIndicator color={Colors.white} size="small" />
                : <Text style={st.buyTxt}>Order ({selectedItems.length})</Text>
              }
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}

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

});
