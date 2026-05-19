/**
 * TipL — Payments Screen
 * Theme-aware: supports Dark Mode & Light Mode.
 */
import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { PageHeader } from '@/src/components/ui/PageHeader';
import { Typography, Spacing, BorderRadius } from '@/src/lib/constants';
import { useThemeColors } from '@/src/lib/hooks/useThemeColors';

const HISTORY = [
  { id: 'p1', item: 'Sony WH-1000XM5', amount: 'Rp 5,200,000', date: '2026-05-10', status: 'Escrow' },
  { id: 'p2', item: 'Artisan Leather Boots', amount: 'Rp 6,450,000', date: '2026-05-03', status: 'Completed' },
  { id: 'p3', item: 'K-Beauty Set', amount: 'Rp 1,800,000', date: '2026-04-28', status: 'Completed' },
];

export default function PaymentsScreen() {
  const C = useThemeColors();

  const s = React.useMemo(() => StyleSheet.create({
    safe: { flex: 1, backgroundColor: C.white },
    card: { margin: Spacing.xl, marginTop: 16, padding: Spacing.xl, backgroundColor: C.primary + '15', borderRadius: BorderRadius.lg, borderWidth: 1, borderColor: C.primary, alignItems: 'center' },
    cardLabel: { fontFamily: Typography.medium.fontFamily, fontSize: Typography.sizes.sm, color: C.darkGray },
    cardAmount: { fontFamily: Typography.regular.fontFamily, fontSize: 28, color: C.nearBlack, marginTop: 4 },
    cardNote: { fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.xs, color: C.darkGray, marginTop: 4 },
    section: { fontFamily: Typography.serifBold.fontFamily, fontSize: Typography.sizes.lg, color: C.nearBlack, paddingHorizontal: Spacing.xl, marginBottom: Spacing.md },
    row: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.base, borderBottomWidth: 1, borderBottomColor: C.lightGray, gap: Spacing.md },
    icon: { width: 40, height: 40, borderRadius: 20, backgroundColor: C.offWhite, alignItems: 'center', justifyContent: 'center' },
    itemName: { fontFamily: Typography.medium.fontFamily, fontSize: Typography.sizes.base, color: C.nearBlack },
    date: { fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.xs, color: C.darkGray, marginTop: 2 },
    amount: { fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.sm, color: C.nearBlack },
    status: { fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.xs, color: C.success, marginTop: 2 },
  }), [C]);

  return (
    <SafeAreaView style={s.safe} edges={[]}>
      <PageHeader title="Metode Pembayaran" onBack={() => router.back()} />
      <View style={s.card}>
        <Text style={s.cardLabel}>Escrow Balance</Text>
        <Text style={s.cardAmount}>Rp 5,200,000</Text>
        <Text style={s.cardNote}>1 active escrow</Text>
      </View>
      <Text style={s.section}>Transaction History</Text>
      <FlatList
        data={HISTORY}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{ paddingHorizontal: Spacing.xl }}
        renderItem={({ item }) => (
          <View style={s.row}>
            <View style={s.icon}>
              <Ionicons name={item.status === 'Escrow' ? 'lock-closed' : 'checkmark-circle'} size={20} color={item.status === 'Escrow' ? C.warning : C.success} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.itemName}>{item.item}</Text>
              <Text style={s.date}>{item.date}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={s.amount}>{item.amount}</Text>
              <Text style={[s.status, item.status === 'Escrow' && { color: C.warning }]}>{item.status}</Text>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}
