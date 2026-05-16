/**
 * TipL — Xendit Hosted Checkout
 * Opens Xendit's invoice page (checkout-staging.xendit.co) in a WebView.
 * All payment methods (bank transfer, e-wallet, QRIS, credit card) are available there.
 */

import React, { useRef } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors, Typography, Spacing } from '@/src/lib/constants';
import { createEscrowPayment } from '@/src/services/supabase/escrow';
import { updateOrderStatus } from '@/src/lib/hooks/useOrders';

export default function XenditPaymentScreen() {
  const { invoiceUrl, orderId, buyerId, travelerId, amount, currency } = useLocalSearchParams<{
    invoiceUrl: string;
    orderId: string;
    buyerId: string;
    travelerId: string;
    amount: string;
    currency: string;
  }>();

  const settlementHandled = useRef(false);

  const handlePaymentSuccess = async () => {
    if (settlementHandled.current) return;
    settlementHandled.current = true;
    try {
      await createEscrowPayment({
        order_id: orderId,
        buyer_id: buyerId,
        traveler_id: travelerId,
        amount: parseFloat(amount ?? '0'),
        currency: currency ?? 'IDR',
      });
      await updateOrderStatus(orderId, 'in_escrow');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace(`/order/${orderId}` as any);
    } catch {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(
        'Pembayaran Berhasil',
        'Pembayaran diterima namun gagal update status. Hubungi support.',
        [{ text: 'Lihat Order', onPress: () => router.replace(`/order/${orderId}` as any) }],
      );
    }
  };

  const handleNavigationChange = (navState: { url: string }) => {
    const { url } = navState;
    if (!url) return;
    if (url.includes('tipl.app/payment/success')) {
      handlePaymentSuccess();
    } else if (url.includes('tipl.app/payment/failure')) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Pembayaran Gagal', 'Pembayaran tidak berhasil. Silakan coba lagi.', [
        { text: 'Kembali', onPress: () => router.back() },
      ]);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="close" size={24} color={Colors.nearBlack} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pembayaran</Text>
        <View style={styles.secureIcon}>
          <Ionicons name="lock-closed" size={16} color={Colors.success} />
        </View>
      </View>

      <WebView
        source={{ uri: invoiceUrl }}
        style={styles.webview}
        onLoadEnd={() => {}}
        onNavigationStateChange={handleNavigationChange}
        javaScriptEnabled
        domStorageEnabled
        startInLoadingState
        renderLoading={() => (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>Memuat halaman pembayaran...</Text>
          </View>
        )}
      />

      <View style={styles.escrowNotice}>
        <Ionicons name="shield-checkmark" size={18} color={Colors.primary} />
        <Text style={styles.escrowText}>Dana ditahan dalam escrow hingga pengiriman dikonfirmasi</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.white },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  backButton: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.offWhite,
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: Typography.regular.fontFamily,
    fontSize: Typography.sizes.md,
    color: Colors.nearBlack,
  },
  secureIcon: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: Colors.successLight,
    alignItems: 'center', justifyContent: 'center',
  },
  webview: { flex: 1 },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.white,
    alignItems: 'center', justifyContent: 'center',
  },
  loadingText: {
    fontFamily: Typography.regular.fontFamily,
    fontSize: Typography.sizes.sm,
    color: Colors.darkGray,
    marginTop: Spacing.md,
  },
  escrowNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    backgroundColor: Colors.primaryPale,
    borderTopWidth: 1,
    borderTopColor: Colors.primaryLight,
    gap: Spacing.sm,
  },
  escrowText: {
    fontFamily: Typography.medium.fontFamily,
    fontSize: Typography.sizes.xs,
    color: Colors.charcoal,
    flex: 1,
  },
});
