/**
 * TipL — Midtrans Snap Payment WebView
 * Handles escrow payment flow via Midtrans Snap.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing } from '@/lib/constants';
import { MIDTRANS_SNAP_URL } from '@/lib/midtrans';

export default function MidtransPaymentScreen() {
  const { token, orderId } = useLocalSearchParams<{ token: string; orderId: string }>();
  const [loading, setLoading] = useState(true);

  const snapUrl = `${MIDTRANS_SNAP_URL}${token}`;

  const handleNavigationChange = (navState: any) => {
    const { url } = navState;

    // Detect Midtrans callback URLs
    if (url.includes('transaction_status=settlement') || url.includes('status_code=200')) {
      Alert.alert('Payment Successful', 'Your funds are now held in escrow.', [
        { text: 'View Order', onPress: () => router.replace(`/order/${orderId}`) },
      ]);
    } else if (url.includes('transaction_status=pending')) {
      Alert.alert('Payment Pending', 'Please complete your payment.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } else if (url.includes('transaction_status=deny') || url.includes('transaction_status=cancel')) {
      Alert.alert('Payment Failed', 'Your payment was not successful.', [
        { text: 'Try Again', onPress: () => router.back() },
      ]);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="close" size={24} color={Colors.nearBlack} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Secure Payment</Text>
        <View style={styles.secureIcon}>
          <Ionicons name="lock-closed" size={16} color={Colors.success} />
        </View>
      </View>

      {/* WebView */}
      <WebView
        source={{ uri: snapUrl }}
        style={styles.webview}
        onLoadEnd={() => setLoading(false)}
        onNavigationStateChange={handleNavigationChange}
        javaScriptEnabled
        domStorageEnabled
        startInLoadingState
        renderLoading={() => (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>Loading payment gateway...</Text>
          </View>
        )}
      />

      {/* Escrow Notice */}
      <View style={styles.escrowNotice}>
        <Ionicons name="shield-checkmark" size={18} color={Colors.primary} />
        <Text style={styles.escrowText}>
          Funds held in escrow until you confirm delivery
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.white,
  },
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
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.offWhite,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: Typography.semiBold.fontFamily,
    fontSize: Typography.sizes.md,
    color: Colors.nearBlack,
  },
  secureIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.successLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  webview: {
    flex: 1,
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
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
    backgroundColor: '#FFF8E7',
    borderTopWidth: 1,
    borderTopColor: Colors.primaryLight,
    gap: Spacing.sm,
  },
  escrowText: {
    fontFamily: Typography.medium.fontFamily,
    fontSize: Typography.sizes.xs,
    color: Colors.charcoal,
  },
});
