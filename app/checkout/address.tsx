/**
 * TipL — Checkout Address Selection
 * Pick a saved address or add a new one before proceeding to payment.
 * Theme-aware: supports Dark Mode & Light Mode.
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { PageHeader } from '@/src/components/ui/PageHeader';
import { Typography, Spacing, BorderRadius, Shadows } from '@/src/lib/constants';
import { useSettingsStore } from '@/src/store/settingsStore';
import { useAuthStore } from '@/src/store/authStore';
import { useCheckoutStore } from '@/src/store/checkoutStore';
import { useCartStore } from '@/src/store/cartStore';
import { getAddresses, type UserAddress } from '@/src/services/supabase/addresses';
import { createOrder } from '@/src/services/supabase/orders';
import { createXenditInvoice } from '@/src/lib/xendit';
import { useThemeColors } from '@/src/lib/hooks/useThemeColors';

const fmtIDR = (v: number) => 'Rp ' + v.toLocaleString('id-ID');

export default function CheckoutAddressScreen() {
  const C = useThemeColors();
  const user = useAuthStore((s) => s.user);
  const userId = user?.id ?? '';
  const { t } = useSettingsStore();
  const { pendingItems, selectedAddress, setSelectedAddress, clear } = useCheckoutStore();
  const removeItem = useCartStore((s) => s.removeItem);

  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);

  const load = useCallback(async () => {
    if (!userId) { setLoading(false); return; }
    try {
      const data = await getAddresses(userId);
      setAddresses(data);
      if (!selectedAddress) {
        const def = data.find((a) => a.is_default) ?? data[0] ?? null;
        if (def) setSelectedAddress(def);
      }
    } catch {}
    finally { setLoading(false); }
  }, [userId]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const handleConfirm = async () => {
    if (!selectedAddress) {
      Alert.alert(t.selectAddress, 'Silakan pilih alamat pengiriman terlebih dahulu.');
      return;
    }
    if (!user || pendingItems.length === 0) return;

    setPaying(true);
    try {
      const subtotal = pendingItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
      const serviceFee = 15000;
      const total = subtotal + serviceFee;
      const itemDesc = pendingItems.length === 1 ? pendingItems[0].name : `${pendingItems.length} items`;

      const order = await createOrder({
        tiper_id: user.id,
        triper_id: pendingItems[0].travelerId,
        trip_id: pendingItems[0].tripId ?? null,
        item_name: itemDesc,
        agreed_price: subtotal,
        service_fee: serviceFee,
        total_amount: total,
        currency: 'IDR',
        notes: `Alamat: ${selectedAddress.recipient_name}, ${selectedAddress.full_address}, ${selectedAddress.city}, ${selectedAddress.province} ${selectedAddress.postal_code} | HP: ${selectedAddress.phone}`,
      } as any);

      const { invoice_url } = await createXenditInvoice({
        externalId: `tipl-order-${order.id}`,
        amount: total,
        payerEmail: user.email,
        description: `TipL Order - ${itemDesc}`,
      });

      pendingItems.forEach((i) => removeItem(i.id));
      clear();
      router.replace({
        pathname: '/payment/xendit-qr',
        params: {
          invoiceUrl: invoice_url,
          orderId: order.id,
          buyerId: user.id,
          travelerId: pendingItems[0]?.travelerId ?? '',
          amount: String(total),
          currency: 'IDR',
        },
      });
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'Gagal memuat halaman pembayaran. Coba lagi.');
    } finally {
      setPaying(false);
    }
  };

  const st = React.useMemo(() => StyleSheet.create({
    safe: { flex: 1, backgroundColor: C.offWhite },
    centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    list: { padding: Spacing.base, paddingBottom: 16 },

    card: {
      backgroundColor: C.white,
      borderRadius: BorderRadius.xl,
      padding: Spacing.base,
      marginBottom: Spacing.md,
      borderWidth: 1.5,
      borderColor: C.lightGray,
      ...Shadows.sm,
    },
    cardSelected: { borderColor: C.primary },
    cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
    labelRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
    labelPill: {
      backgroundColor: C.offWhite,
      paddingHorizontal: Spacing.sm,
      paddingVertical: 3,
      borderRadius: BorderRadius.full,
      borderWidth: 1,
      borderColor: C.lightGray,
    },
    labelPillSelected: { backgroundColor: C.primary + '18', borderColor: C.primary },
    labelTxt: { fontFamily: Typography.medium.fontFamily, fontSize: Typography.sizes.xs, color: C.charcoal },
    labelTxtSelected: { color: C.primary },
    defaultPill: {
      backgroundColor: C.success + '15',
      paddingHorizontal: Spacing.sm,
      paddingVertical: 3,
      borderRadius: BorderRadius.full,
    },
    defaultTxt: { fontFamily: Typography.medium.fontFamily, fontSize: Typography.sizes.xs, color: C.success },
    name: { fontFamily: Typography.medium.fontFamily, fontSize: Typography.sizes.base, color: C.nearBlack },
    phone: { fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.sm, color: C.darkGray, marginTop: 2 },
    address: { fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.sm, color: C.charcoal, marginTop: 4, lineHeight: 18 },

    addNewBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: Spacing.sm,
      paddingVertical: Spacing.base,
      marginBottom: Spacing.md,
      borderWidth: 1.5,
      borderStyle: 'dashed',
      borderColor: C.primary,
      borderRadius: BorderRadius.xl,
      backgroundColor: C.primary + '12',
    },
    addNewTxt: { fontFamily: Typography.medium.fontFamily, fontSize: Typography.sizes.sm, color: C.primary },

    emptyWrap: { alignItems: 'center', paddingTop: Spacing['5xl'], paddingHorizontal: Spacing['2xl'] },
    emptyTitle: { fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.md, color: C.nearBlack, marginTop: Spacing.base },
    addBtn: { marginTop: Spacing.xl, backgroundColor: C.primary, paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md, borderRadius: BorderRadius.lg },
    addBtnTxt: { fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.base, color: '#FFFFFF' },

    footer: {
      backgroundColor: C.white,
      borderTopWidth: 1,
      borderTopColor: C.lightGray,
      padding: Spacing.xl,
      gap: Spacing.sm,
    },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-between' },
    summaryLbl: { fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.sm, color: C.darkGray },
    summaryVal: { fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.sm, color: C.nearBlack },
    totalRow: { marginTop: Spacing.xs, paddingTop: Spacing.sm, borderTopWidth: 1, borderTopColor: C.lightGray },
    totalLbl: { fontFamily: Typography.medium.fontFamily, fontSize: Typography.sizes.base, color: C.nearBlack },
    totalVal: { fontFamily: Typography.medium.fontFamily, fontSize: Typography.sizes.md, color: C.primary },
    payBtn: {
      marginTop: Spacing.sm,
      backgroundColor: C.primary,
      borderRadius: BorderRadius.lg,
      paddingVertical: Spacing.base,
      alignItems: 'center',
    },
    payBtnDisabled: { backgroundColor: C.midGray },
    payBtnTxt: { fontFamily: Typography.medium.fontFamily, fontSize: Typography.sizes.base, color: '#FFFFFF' },
  }), [C]);

  const renderItem = ({ item }: { item: UserAddress }) => {
    const selected = selectedAddress?.id === item.id;
    return (
      <TouchableOpacity
        style={[st.card, selected && st.cardSelected]}
        activeOpacity={0.7}
        onPress={() => setSelectedAddress(item)}
      >
        <View style={st.cardTop}>
          <View style={st.labelRow}>
            <View style={[st.labelPill, selected && st.labelPillSelected]}>
              <Text style={[st.labelTxt, selected && st.labelTxtSelected]}>{item.label}</Text>
            </View>
            {item.is_default && (
              <View style={st.defaultPill}>
                <Text style={st.defaultTxt}>Utama</Text>
              </View>
            )}
          </View>
          <Ionicons
            name={selected ? 'radio-button-on' : 'radio-button-off'}
            size={22}
            color={selected ? C.primary : C.midGray}
          />
        </View>
        <Text style={st.name}>{item.recipient_name}</Text>
        <Text style={st.phone}>{item.phone}</Text>
        <Text style={st.address}>{item.full_address}, {item.city}, {item.province} {item.postal_code}</Text>
      </TouchableOpacity>
    );
  };

  const subtotal = pendingItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const total = subtotal + 15000;

  return (
    <SafeAreaView style={st.safe} edges={[]}>
      <PageHeader title={t.selectAddress} onBack={() => router.back()} />

      {loading ? (
        <View style={st.centered}>
          <ActivityIndicator size="large" color={C.primary} />
        </View>
      ) : (
        <FlatList
          data={addresses}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={st.list}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={
            addresses.length > 0 ? (
              <TouchableOpacity
                style={st.addNewBtn}
                onPress={() => router.push('/profile/addresses')}
              >
                <Ionicons name="add-circle-outline" size={20} color={C.primary} />
                <Text style={st.addNewTxt}>{t.addNewAddress}</Text>
              </TouchableOpacity>
            ) : null
          }
          ListEmptyComponent={
            <View style={st.emptyWrap}>
              <Ionicons name="location-outline" size={56} color={C.midGray} />
              <Text style={st.emptyTitle}>{t.noAddresses}</Text>
              <TouchableOpacity style={st.addBtn} onPress={() => router.push('/profile/addresses')}>
                <Text style={st.addBtnTxt}>{t.addAddressFirst}</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}

      {/* Summary footer */}
      <View style={st.footer}>
        <View style={st.summaryRow}>
          <Text style={st.summaryLbl}>{t.subtotal}</Text>
          <Text style={st.summaryVal}>{fmtIDR(subtotal)}</Text>
        </View>
        <View style={st.summaryRow}>
          <Text style={st.summaryLbl}>{t.serviceFee}</Text>
          <Text style={st.summaryVal}>{fmtIDR(15000)}</Text>
        </View>
        <View style={[st.summaryRow, st.totalRow]}>
          <Text style={st.totalLbl}>{t.total}</Text>
          <Text style={st.totalVal}>{fmtIDR(total)}</Text>
        </View>
        <TouchableOpacity
          style={[st.payBtn, (!selectedAddress || paying) && st.payBtnDisabled]}
          onPress={handleConfirm}
          disabled={!selectedAddress || paying}
        >
          {paying
            ? <ActivityIndicator color="#FFFFFF" />
            : <Text style={st.payBtnTxt}>{t.proceedPayment}</Text>
          }
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
