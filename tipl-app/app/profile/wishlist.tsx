/**
 * TipL — Wishlist Screen
 */
import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/lib/constants';

const WISHLIST = [
  { id: 'w1', name: 'Dyson Airwrap', price: 'Rp 8,500,000', image: 'https://images.unsplash.com/photo-1522338242992-e1a54571aefc?w=400', from: 'London' },
  { id: 'w2', name: 'Pokémon Center Exclusive', price: 'Rp 950,000', image: 'https://images.unsplash.com/photo-1613771404784-3a5686aa2be3?w=400', from: 'Tokyo' },
  { id: 'w3', name: 'Innisfree Green Tea Set', price: 'Rp 650,000', image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400', from: 'Seoul' },
];

export default function WishlistScreen() {
  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.back}>
          <Ionicons name="arrow-back" size={24} color={Colors.nearBlack} />
        </TouchableOpacity>
        <Text style={s.title}>Wishlist</Text>
        <View style={{ width: 44 }} />
      </View>
      <FlatList
        data={WISHLIST}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{ padding: Spacing.xl }}
        numColumns={2}
        columnWrapperStyle={{ gap: Spacing.md }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity style={s.card} activeOpacity={0.7}>
            <Image source={{ uri: item.image }} style={s.image} contentFit="cover" transition={200} />
            <View style={s.info}>
              <Text style={s.name} numberOfLines={2}>{item.name}</Text>
              <Text style={s.from}>From {item.from}</Text>
              <Text style={s.price}>{item.price}</Text>
            </View>
            <TouchableOpacity style={s.heart}>
              <Ionicons name="heart" size={18} color={Colors.error} />
            </TouchableOpacity>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={s.empty}>
            <Ionicons name="heart-outline" size={48} color={Colors.gray} />
            <Text style={s.emptyText}>Your wishlist is empty</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.white },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.lightGray },
  back: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.offWhite, alignItems: 'center', justifyContent: 'center' },
  title: { fontFamily: Typography.serifBold.fontFamily, fontSize: Typography.sizes.md, color: Colors.nearBlack },
  card: { flex: 1, backgroundColor: Colors.white, borderRadius: BorderRadius.lg, borderWidth: 1, borderColor: Colors.lightGray, overflow: 'hidden', marginBottom: Spacing.md, ...Shadows.sm },
  image: { width: '100%', height: 120 },
  info: { padding: Spacing.sm },
  name: { fontFamily: Typography.semiBold.fontFamily, fontSize: Typography.sizes.sm, color: Colors.nearBlack },
  from: { fontFamily: Typography.regular.fontFamily, fontSize: 11, color: Colors.darkGray, marginTop: 2 },
  price: { fontFamily: Typography.bold.fontFamily, fontSize: Typography.sizes.sm, color: Colors.primary, marginTop: 4 },
  heart: { position: 'absolute', top: 8, right: 8, width: 30, height: 30, borderRadius: 15, backgroundColor: 'rgba(255,255,255,0.9)', alignItems: 'center', justifyContent: 'center' },
  empty: { alignItems: 'center', paddingTop: Spacing['5xl'] },
  emptyText: { fontFamily: Typography.medium.fontFamily, fontSize: Typography.sizes.md, color: Colors.darkGray, marginTop: Spacing.md },
});
