import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { router, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { PageHeader } from '@/src/components/ui/PageHeader';
import { Typography, Spacing, BorderRadius, Shadows } from '@/src/lib/constants';
import { useAuthStore } from '@/src/store/authStore';
import { getWishlist, toggleWishlist } from '@/src/services/supabase/wishlist';
import { useThemeColors } from '@/src/lib/hooks/useThemeColors';

const fmtIDR = (v: number | null) => v != null ? 'Rp ' + v.toLocaleString('id-ID') : null;

export default function WishlistScreen() {
  const C = useThemeColors();
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

  const s = React.useMemo(() => StyleSheet.create({
    safe: { flex: 1, backgroundColor: C.offWhite },
    floatingBack: {
      position: 'absolute', top: 12, left: 20, zIndex: 10,
      width: 38, height: 38, borderRadius: 19,
      backgroundColor: 'rgba(0,0,0,0.06)',
      alignItems: 'center', justifyContent: 'center',
    },
    card: {
      flex: 1, backgroundColor: C.white, borderRadius: BorderRadius.lg,
      borderWidth: 1, borderColor: C.lightGray, overflow: 'hidden',
      marginBottom: Spacing.md, ...Shadows.sm,
    },
    image: { width: '100%', height: 120 },
    imageFallback: { backgroundColor: C.cream, alignItems: 'center', justifyContent: 'center' },
    info: { padding: Spacing.sm },
    name: { fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.sm, color: C.nearBlack },
    from: { fontFamily: Typography.regular.fontFamily, fontSize: 11, color: C.darkGray, marginTop: 2 },
    price: { fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.sm, color: C.primary, marginTop: 4 },
    heartBtn: {
      position: 'absolute', top: 8, right: 8,
      width: 30, height: 30, borderRadius: 15,
      backgroundColor: C.white, alignItems: 'center', justifyContent: 'center',
      borderWidth: 1, borderColor: C.lightGray,
    },
    empty: { alignItems: 'center', paddingTop: 80, gap: Spacing.md, paddingHorizontal: Spacing['2xl'] },
    emptyTitle: { fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.lg, color: C.charcoal },
    emptyDesc: { fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.sm, color: C.darkGray, textAlign: 'center', lineHeight: 20 },
  }), [C]);

  return (
    <SafeAreaView style={s.safe} edges={[]}>
      <PageHeader title="Wishlist" onBack={() => router.back()} />

      {loading ? (
        <ActivityIndicator color={C.primary} style={{ marginTop: Spacing.xl }} />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(i) => i.product_id}
          contentContainerStyle={{ padding: Spacing.xl, paddingBottom: 40 }}
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
                    <Ionicons name="cube-outline" size={28} color={C.midGray} />
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
                    <ActivityIndicator size="small" color={C.error} />
                  ) : (
                    <Ionicons name="heart" size={18} color={C.error} />
                  )}
                </TouchableOpacity>
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={
            <View style={s.empty}>
              <Ionicons name="heart-outline" size={56} color={C.midGray} />
              <Text style={s.emptyTitle}>Wishlist kosong</Text>
              <Text style={s.emptyDesc}>Tekan ikon hati di halaman produk untuk menyimpan item favoritmu</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
