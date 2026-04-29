/**
 * TipL — Payments Screen
 */
import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius } from '@/lib/constants';

const HISTORY = [
  { id: 'p1', item: 'Sony WH-1000XM5', amount: 'Rp 5,200,000', date: '2026-05-10', status: 'Escrow' },
  { id: 'p2', item: 'Artisan Leather Boots', amount: 'Rp 6,450,000', date: '2026-05-03', status: 'Completed' },
  { id: 'p3', item: 'K-Beauty Set', amount: 'Rp 1,800,000', date: '2026-04-28', status: 'Completed' },
];

export default function PaymentsScreen() {
  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.back}>
          <Ionicons name="arrow-back" size={24} color={Colors.nearBlack} />
        </TouchableOpacity>
        <Text style={s.title}>Payments</Text>
        <View style={{ width: 44 }} />
      </View>
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
              <Ionicons name={item.status === 'Escrow' ? 'lock-closed' : 'checkmark-circle'} size={20} color={item.status === 'Escrow' ? Colors.warning : Colors.success} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.itemName}>{item.item}</Text>
              <Text style={s.date}>{item.date}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={s.amount}>{item.amount}</Text>
              <Text style={[s.status, item.status === 'Escrow' && { color: Colors.warning }]}>{item.status}</Text>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.white },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.lightGray },
  back: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.offWhite, alignItems: 'center', justifyContent: 'center' },
  title: { fontFamily: Typography.serifBold.fontFamily, fontSize: Typography.sizes.md, color: Colors.nearBlack },
  card: { margin: Spacing.xl, padding: Spacing.xl, backgroundColor: '#FFF8E7', borderRadius: BorderRadius.lg, borderWidth: 1, borderColor: Colors.primaryLight, alignItems: 'center' },
  cardLabel: { fontFamily: Typography.medium.fontFamily, fontSize: Typography.sizes.sm, color: Colors.darkGray },
  cardAmount: { fontFamily: Typography.bold.fontFamily, fontSize: 28, color: Colors.nearBlack, marginTop: 4 },
  cardNote: { fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.xs, color: Colors.darkGray, marginTop: 4 },
  section: { fontFamily: Typography.serifBold.fontFamily, fontSize: Typography.sizes.lg, color: Colors.nearBlack, paddingHorizontal: Spacing.xl, marginBottom: Spacing.md },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.base, borderBottomWidth: 1, borderBottomColor: Colors.lightGray, gap: Spacing.md },
  icon: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.offWhite, alignItems: 'center', justifyContent: 'center' },
  itemName: { fontFamily: Typography.medium.fontFamily, fontSize: Typography.sizes.base, color: Colors.nearBlack },
  date: { fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.xs, color: Colors.darkGray, marginTop: 2 },
  amount: { fontFamily: Typography.semiBold.fontFamily, fontSize: Typography.sizes.sm, color: Colors.nearBlack },
  status: { fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.xs, color: Colors.success, marginTop: 2 },
});
