/**
 * TipL — Wallet Top-Up Screen
 * Preset amounts, custom input, payment method selection.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { FloatingBackButton } from '@/src/components/ui/FloatingBackButton';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/src/lib/constants';
import { useWalletStore } from '@/src/store/walletStore';

const PRESET_AMOUNTS = [50_000, 100_000, 200_000, 500_000, 1_000_000, 2_000_000];

const PAYMENT_METHODS = [
  { id: 'bca', label: 'BCA Virtual Account', icon: 'card-outline', fee: 0 },
  { id: 'mandiri', label: 'Mandiri Bill Payment', icon: 'business-outline', fee: 0 },
  { id: 'gopay', label: 'GoPay', icon: 'phone-portrait-outline', fee: 0 },
  { id: 'ovo', label: 'OVO', icon: 'wallet-outline', fee: 0 },
  { id: 'qris', label: 'QRIS', icon: 'qr-code-outline', fee: 0 },
  { id: 'credit', label: 'Credit / Debit Card', icon: 'card', fee: 2500 },
];

const fmtIDR = (v: number) => 'Rp ' + v.toLocaleString('id-ID');

export default function TopUpScreen() {
  const { balance, setBalance } = useWalletStore();
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const amount = selectedAmount ?? (customAmount ? parseInt(customAmount.replace(/\D/g, ''), 10) || 0 : 0);
  const selectedMethodData = PAYMENT_METHODS.find((m) => m.id === selectedMethod);
  const fee = selectedMethodData?.fee ?? 0;
  const totalCharged = amount + fee;

  const handleAmountSelect = (val: number) => {
    Haptics.selectionAsync();
    setSelectedAmount(val);
    setCustomAmount('');
  };

  const handleCustomInput = (text: string) => {
    const numeric = text.replace(/\D/g, '');
    setCustomAmount(numeric);
    setSelectedAmount(null);
  };

  const handleTopUp = async () => {
    if (amount < 10_000) {
      Alert.alert('Minimum Top Up', 'Minimum top up is Rp 10.000');
      return;
    }
    if (!selectedMethod) {
      Alert.alert('Select Payment', 'Please select a payment method');
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoading(true);

    // Simulate payment processing delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Update wallet balance
    setBalance(balance + amount);
    setLoading(false);

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert(
      'Top Up Successful!',
      `${fmtIDR(amount)} has been added to your wallet.`,
      [{ text: 'Great!', onPress: () => router.back() }],
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <FloatingBackButton onPress={() => router.back()} />

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {/* Current Balance */}
        <LinearGradient
          colors={[Colors.nearBlack, '#3D3330']}
          style={styles.balanceCard}
        >
          <Text style={styles.balanceLbl}>Current Balance</Text>
          <Text style={styles.balanceVal}>{fmtIDR(balance)}</Text>
          <View style={styles.balanceDivider} />
          {amount > 0 && (
            <View style={styles.balanceAfterRow}>
              <Text style={styles.balanceAfterLbl}>After top up</Text>
              <Text style={styles.balanceAfterVal}>{fmtIDR(balance + amount)}</Text>
            </View>
          )}
        </LinearGradient>

        {/* Preset amounts */}
        <Text style={styles.sectionTitle}>Select Amount</Text>
        <View style={styles.presetGrid}>
          {PRESET_AMOUNTS.map((val) => (
            <TouchableOpacity
              key={val}
              style={[styles.presetBtn, selectedAmount === val && styles.presetBtnActive]}
              activeOpacity={0.75}
              onPress={() => handleAmountSelect(val)}
            >
              <Text style={[styles.presetTxt, selectedAmount === val && styles.presetTxtActive]}>
                {fmtIDR(val)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Custom amount */}
        <Text style={styles.sectionTitle}>Or enter custom amount</Text>
        <View style={styles.customInputWrap}>
          <Text style={styles.currencyPfx}>Rp</Text>
          <TextInput
            style={styles.customInput}
            value={customAmount ? parseInt(customAmount, 10).toLocaleString('id-ID') : ''}
            onChangeText={handleCustomInput}
            placeholder="0"
            placeholderTextColor={Colors.midGray}
            keyboardType="numeric"
          />
        </View>
        <Text style={styles.minNote}>Minimum top up: Rp 10.000</Text>

        {/* Payment methods */}
        <Text style={styles.sectionTitle}>Payment Method</Text>
        <View style={styles.methodList}>
          {PAYMENT_METHODS.map((m) => (
            <TouchableOpacity
              key={m.id}
              style={[styles.methodRow, selectedMethod === m.id && styles.methodRowActive]}
              activeOpacity={0.7}
              onPress={() => { Haptics.selectionAsync(); setSelectedMethod(m.id); }}
            >
              <View style={[styles.methodIcon, selectedMethod === m.id && styles.methodIconActive]}>
                <Ionicons name={m.icon as any} size={20} color={selectedMethod === m.id ? Colors.primary : Colors.charcoal} />
              </View>
              <View style={styles.methodInfo}>
                <Text style={styles.methodLabel}>{m.label}</Text>
                {m.fee > 0 && <Text style={styles.methodFee}>+ {fmtIDR(m.fee)} fee</Text>}
                {m.fee === 0 && <Text style={styles.methodFeeNone}>No admin fee</Text>}
              </View>
              <View style={[styles.radioOuter, selectedMethod === m.id && styles.radioOuterActive]}>
                {selectedMethod === m.id && <View style={styles.radioInner} />}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Summary */}
        {amount > 0 && selectedMethod && (
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLbl}>Top Up Amount</Text>
              <Text style={styles.summaryVal}>{fmtIDR(amount)}</Text>
            </View>
            {fee > 0 && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLbl}>Admin Fee</Text>
                <Text style={styles.summaryVal}>{fmtIDR(fee)}</Text>
              </View>
            )}
            <View style={styles.summaryDivider} />
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLbl, styles.summaryTotal]}>Total Charged</Text>
              <Text style={[styles.summaryVal, styles.summaryTotal]}>{fmtIDR(totalCharged)}</Text>
            </View>
          </View>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Bottom CTA */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.topUpBtn}
          activeOpacity={0.85}
          onPress={handleTopUp}
          disabled={loading || amount < 10_000 || !selectedMethod}
        >
          <LinearGradient
            colors={loading || amount < 10_000 || !selectedMethod
              ? [Colors.midGray, Colors.midGray]
              : [Colors.primaryLight, Colors.primaryDark]}
            style={styles.topUpGrad}
          >
            {loading
              ? <ActivityIndicator color={Colors.white} />
              : (
                <>
                  <Ionicons name="wallet-outline" size={20} color={Colors.white} />
                  <Text style={styles.topUpTxt}>
                    {amount > 0 ? `Top Up ${fmtIDR(amount)}` : 'Top Up'}
                  </Text>
                </>
              )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.offWhite },

  floatingBack: {
    position: 'absolute', top: 12, left: 20, zIndex: 10,
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: 'rgba(0,0,0,0.06)',
    alignItems: 'center', justifyContent: 'center',
  },

  scroll: { flex: 1, paddingHorizontal: Spacing.xl, paddingTop: 56 },

  balanceCard: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    marginTop: Spacing.xl,
    marginBottom: Spacing.xl,
    ...Shadows.lg,
  },
  balanceLbl: {
    fontFamily: Typography.medium.fontFamily,
    fontSize: Typography.sizes.xs,
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: 1,
    marginBottom: Spacing.xs,
  },
  balanceVal: {
    fontFamily: Typography.serifBold.fontFamily,
    fontSize: Typography.sizes['2xl'],
    color: Colors.white,
  },
  balanceDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.15)', marginVertical: Spacing.md },
  balanceAfterRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  balanceAfterLbl: {
    fontFamily: Typography.regular.fontFamily,
    fontSize: Typography.sizes.sm,
    color: 'rgba(255,255,255,0.6)',
  },
  balanceAfterVal: {
    fontFamily: Typography.regular.fontFamily,
    fontSize: Typography.sizes.base,
    color: Colors.primary,
  },

  sectionTitle: {
    fontFamily: Typography.regular.fontFamily,
    fontSize: Typography.sizes.sm,
    color: Colors.charcoal,
    letterSpacing: 0.5,
    marginBottom: Spacing.md,
    marginTop: Spacing.xs,
  },

  presetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  presetBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderColor: Colors.lightGray,
    backgroundColor: Colors.white,
    minWidth: '30%',
    alignItems: 'center',
    ...Shadows.sm,
  },
  presetBtnActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryPale,
  },
  presetTxt: {
    fontFamily: Typography.medium.fontFamily,
    fontSize: Typography.sizes.sm,
    color: Colors.charcoal,
  },
  presetTxtActive: {
    fontFamily: Typography.regular.fontFamily,
    color: Colors.primary,
  },

  customInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderColor: Colors.lightGray,
    paddingHorizontal: Spacing.base,
    height: 52,
    marginBottom: Spacing.xs,
    gap: Spacing.sm,
    ...Shadows.sm,
  },
  currencyPfx: {
    fontFamily: Typography.regular.fontFamily,
    fontSize: Typography.sizes.base,
    color: Colors.darkGray,
  },
  customInput: {
    flex: 1,
    fontFamily: Typography.regular.fontFamily,
    fontSize: Typography.sizes.lg,
    color: Colors.nearBlack,
    paddingVertical: 0,
  },
  minNote: {
    fontFamily: Typography.regular.fontFamily,
    fontSize: Typography.sizes.xs,
    color: Colors.gray,
    marginBottom: Spacing.xl,
  },

  methodList: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.lightGray,
    overflow: 'hidden',
    marginBottom: Spacing.xl,
    ...Shadows.sm,
  },
  methodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.base,
    paddingHorizontal: Spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
    gap: Spacing.md,
  },
  methodRowActive: {
    backgroundColor: Colors.primaryPale,
  },
  methodIcon: {
    width: 40, height: 40, borderRadius: BorderRadius.md,
    backgroundColor: Colors.cream,
    alignItems: 'center', justifyContent: 'center',
  },
  methodIconActive: { backgroundColor: Colors.primaryPale },
  methodInfo: { flex: 1 },
  methodLabel: {
    fontFamily: Typography.medium.fontFamily,
    fontSize: Typography.sizes.base,
    color: Colors.nearBlack,
  },
  methodFee: {
    fontFamily: Typography.regular.fontFamily,
    fontSize: Typography.sizes.xs,
    color: Colors.error,
    marginTop: 2,
  },
  methodFeeNone: {
    fontFamily: Typography.regular.fontFamily,
    fontSize: Typography.sizes.xs,
    color: Colors.success,
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

  summaryCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.lightGray,
    marginBottom: Spacing.xl,
    ...Shadows.sm,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
  },
  summaryLbl: {
    fontFamily: Typography.regular.fontFamily,
    fontSize: Typography.sizes.sm,
    color: Colors.darkGray,
  },
  summaryVal: {
    fontFamily: Typography.medium.fontFamily,
    fontSize: Typography.sizes.sm,
    color: Colors.nearBlack,
  },
  summaryDivider: { height: 1, backgroundColor: Colors.lightGray, marginVertical: Spacing.xs },
  summaryTotal: {
    fontFamily: Typography.regular.fontFamily,
    fontSize: Typography.sizes.base,
    color: Colors.nearBlack,
  },

  bottomBar: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.base,
    paddingBottom: Spacing.xl,
    borderTopWidth: 1,
    borderTopColor: Colors.lightGray,
    ...Shadows.lg,
  },
  topUpBtn: { borderRadius: BorderRadius.full, overflow: 'hidden' },
  topUpGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.base,
    gap: Spacing.sm,
  },
  topUpTxt: {
    fontFamily: Typography.regular.fontFamily,
    fontSize: Typography.sizes.base,
    color: Colors.white,
  },
});
