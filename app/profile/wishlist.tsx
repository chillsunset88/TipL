import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { router, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { FloatingBackButton } from '@/src/components/ui/FloatingBackButton';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/src/lib/constants';
import { useAuthStore } from '@/src/store/authStore';
import { getWishlist, toggleWishlist } from '@/src/services/supabase/wishlist';

const fmtIDR = (v: number | null) => v != null ? 'Rp ' + v.toLocaleString('id-ID') : null;

export default function WishlistScreen() {
  const user = useAuthStore((s) => s.user);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await getWishlist(user.id);
      setItems(data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [user]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const handleRemove = async (productId: string) => {
    if (!user) return;
    setRemoving(productId);
    try {
      await toggleWishlist(user.id, productId);
      setItems((prev) => prev.filter((i) => i.product_id !== productId));
    } finally {
      setRemoving(null);
    }
  };

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <FloatingBackButton onPress={() => router.back()} />

      {loading ? (
        <ActivityIndicator color={Colors.primary} style={{ marginTop: 60 }} />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(i) => i.product_id}
          contentContainerStyle={{ padding: Spacing.xl, paddingTop: 56, paddingBottom: 40 }}
          numColumns={2}
          columnWrapperStyle={{ gap: Spacing.md }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const p = item.products;
            if (!p) return null;
            const image = Array.isArray(p.image_urls) && p.image_urls.length > 0 ? p.image_urls[0] : null;
            const dest = p.trips?.destination_city || p.trips?.destination_country || null;
            const price = fmtIDR(p.price_min);
            return (
              <TouchableOpacity
                style={s.card}
                activeOpacity={0.8}
                onPress={() => router.push(`/product/${p.id}`)}
              >
                {image ? (
                  <Image source={{ uri: image }} style={s.image} contentFit="cover" transition={200} />
                ) : (
                  <View style={[s.image, s.imageFallback]}>
                    <Ionicons name="cube-outline" size={28} color={Colors.midGray} />
                  </View>
                )}
                <View style={s.info}>
                  <Text style={s.name} numberOfLines={2}>{p.name}</Text>
                  {dest && <Text style={s.from}>{dest}</Text>}
                  {price && <Text style={s.price}>{price}</Text>}
                </View>
                <TouchableOpacity
                  style={s.heartBtn}
                  onPress={() => handleRemove(p.id)}
                  disabled={removing === p.id}
                >
                  {removing === p.id ? (
                    <ActivityIndicator size="small" color={Colors.error} />
                  ) : (
                    <Ionicons name="heart" size={18} color={Colors.error} />
                  )}
                </TouchableOpacity>
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={
            <View style={s.empty}>
              <Ionicons name="heart-outline" size={56} color={Colors.midGray} />
              <Text style={s.emptyTitle}>Wishlist kosong</Text>
              <Text style={s.emptyDesc}>Tekan ikon hati di halaman produk untuk menyimpan item favoritmu</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.offWhite },
  floatingBack: {
    position: 'absolute', top: 12, left: 20, zIndex: 10,
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: 'rgba(0,0,0,0.06)',
    alignItems: 'center', justifyContent: 'center',
  },
  card: {
    flex: 1, backgroundColor: Colors.white, borderRadius: BorderRadius.lg,
    borderWidth: 1, borderColor: Colors.lightGray, overflow: 'hidden',
    marginBottom: Spacing.md, ...Shadows.sm,
  },
  image: { width: '100%', height: 120 },
  imageFallback: { backgroundColor: Colors.cream, alignItems: 'center', justifyContent: 'center' },
  info: { padding: Spacing.sm },
  name: { fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.sm, color: Colors.nearBlack },
  from: { fontFamily: Typography.regular.fontFamily, fontSize: 11, color: Colors.darkGray, marginTop: 2 },
  price: { fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.sm, color: Colors.primary, marginTop: 4 },
  heartBtn: {
    position: 'absolute', top: 8, right: 8,
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.92)', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Colors.lightGray,
  },
  empty: { alignItems: 'center', paddingTop: 80, gap: Spacing.md, paddingHorizontal: Spacing['2xl'] },
  emptyTitle: { fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.lg, color: Colors.charcoal },
  emptyDesc: { fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.sm, color: Colors.darkGray, textAlign: 'center', lineHeight: 20 },
});
