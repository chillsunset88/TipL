import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ScrollView, RefreshControl, ActivityIndicator, Dimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { router, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { CATEGORY_MAP, Typography, Spacing, BorderRadius, Shadows, ITEM_CATEGORIES } from '@/src/lib/constants';
import { useSettingsStore } from '@/src/store/settingsStore';
import { searchProducts, subscribeToProducts, ProductWithTripInfo } from '@/src/services/supabase/trips';
import { useThemeColors } from '@/src/lib/hooks/useThemeColors';

const { width: SW } = Dimensions.get('window');
const CARD_W = (SW - Spacing.xl * 2 - Spacing.md) / 2;

const fmtIDR = (v: number | null) =>
  v != null ? 'Rp ' + v.toLocaleString('id-ID') : null;

const ITEM_CATEGORY_LIST = ITEM_CATEGORIES.map((c) => ({ id: c.id as string | null, label: c.label, icon: c.icon as string }));

export default function OrderScreen() {
  const C = useThemeColors();
  const insets = useSafeAreaInsets();
  const { t } = useSettingsStore();
  const ALL_CATEGORIES = [
    { id: null as string | null, label: t.allCategories, icon: 'apps-outline' as const },
    ...ITEM_CATEGORY_LIST,
  ];
  const [products, setProducts] = useState<ProductWithTripInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const initialized = useRef(false);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else if (!initialized.current) setLoading(true);
    try {
      const data = await searchProducts('', undefined, 40);
      setProducts(data);
      initialized.current = true;
    } catch {
      // silently fail — empty state handles it
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Refresh setiap kali tab difokuskan — silent setelah load pertama
  useFocusEffect(useCallback(() => { load(); }, [load]));

  // Realtime: produk baru langsung muncul tanpa spinner
  useEffect(() => {
    const unsub = subscribeToProducts(() => load());
    return () => { unsub(); };
  }, [load]);

  const filtered = (selectedCategory
    ? products.filter((p) => p.category === selectedCategory)
    : products
  ).filter((p) => p.name?.trim()); // hide products with empty names

  const s = React.useMemo(() => StyleSheet.create({
    safe: { flex: 1, backgroundColor: C.offWhite },
    headerSub: {
      fontFamily: Typography.regular.fontFamily,
      fontSize: Typography.sizes.xs,
      color: C.darkGray,
      marginTop: 2,
    },
    catBar: {
      backgroundColor: C.white,
      borderBottomWidth: 1,
      borderBottomColor: C.lightGray,
    },
    catContent: {
      paddingHorizontal: Spacing.xl,
      paddingVertical: Spacing.md,
      gap: Spacing.sm,
      alignItems: 'center',
    },
    catChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      paddingHorizontal: Spacing.md,
      paddingVertical: 6,
      borderRadius: BorderRadius.full,
      borderWidth: 1,
      borderColor: C.midGray,
      backgroundColor: C.offWhite,
    },
    catChipActive: { backgroundColor: C.primary, borderColor: C.primary },
    catLabel: {
      fontFamily: Typography.medium.fontFamily,
      fontSize: Typography.sizes.xs,
      color: C.darkGray,
    },
    catLabelActive: { color: '#FFFFFF' },
    list: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.md, paddingBottom: 100 },
    row: { justifyContent: 'space-between', marginBottom: Spacing.md },
    card: {
      width: CARD_W,
      backgroundColor: C.white,
      borderRadius: BorderRadius.lg,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: C.lightGray,
      ...Shadows.sm,
    },
    cardImg: { width: '100%', height: 130 },
    cardImgEmpty: {
      backgroundColor: C.cream,
      alignItems: 'center',
      justifyContent: 'center',
    },
    catBadge: {
      position: 'absolute',
      top: Spacing.sm,
      left: Spacing.sm,
      backgroundColor: 'rgba(0,0,0,0.55)',
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: BorderRadius.full,
    },
    catBadgeTxt: {
      fontFamily: Typography.medium.fontFamily,
      fontSize: 9,
      color: '#FFFFFF',
      letterSpacing: 0.3,
    },
    cardBody: { padding: Spacing.sm },
    cardName: {
      fontFamily: Typography.medium.fontFamily,
      fontSize: Typography.sizes.sm,
      color: C.charcoal,
      lineHeight: 18,
      marginBottom: 4,
    },
    cardPrice: {
      fontFamily: Typography.regular.fontFamily,
      fontSize: Typography.sizes.sm,
      color: C.nearBlack,
      marginBottom: 3,
    },
    cardPriceMuted: {
      fontFamily: Typography.regular.fontFamily,
      fontSize: Typography.sizes.xs,
      color: C.gray,
      marginBottom: 3,
      fontStyle: 'italic',
    },
    destRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
    destTxt: {
      fontFamily: Typography.regular.fontFamily,
      fontSize: 10,
      color: C.primary,
      flex: 1,
    },
    empty: { alignItems: 'center', paddingTop: Spacing['5xl'], gap: Spacing.base },
    emptyTxt: {
      fontFamily: Typography.medium.fontFamily,
      fontSize: Typography.sizes.base,
      color: C.darkGray,
    },
  }), [C]);

  return (
    <View style={s.safe}>
      <View style={[s.catBar, { paddingTop: insets.top }]}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.catContent}
        >
        {ALL_CATEGORIES.map((cat) => {
          const active = selectedCategory === cat.id;
          return (
            <TouchableOpacity
              key={cat.id ?? 'all'}
              style={[s.catChip, active && s.catChipActive]}
              onPress={() => setSelectedCategory(cat.id)}
            >
              <Ionicons
                name={cat.icon as any}
                size={16}
                color={active ? '#FFFFFF' : C.darkGray}
              />
              <Text style={[s.catLabel, active && s.catLabelActive]}>{cat.label}</Text>
            </TouchableOpacity>
          );
        })}
        </ScrollView>
      </View>

      {loading ? (
        <ActivityIndicator color={C.primary} style={{ marginTop: Spacing['2xl'] }} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={s.row}
          contentContainerStyle={[s.list, { paddingBottom: insets.bottom + 80 }]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => load(true)}
              tintColor={C.primary}
            />
          }
          ListEmptyComponent={
            <View style={s.empty}>
              <Ionicons name="cube-outline" size={48} color={C.midGray} />
              <Text style={s.emptyTxt}>{t.noItemsAvailable}</Text>
            </View>
          }
          renderItem={({ item }) => <ProductCard item={item} s={s} C={C} />}
        />
      )}
    </View>
  );
}

function ProductCard({ item, s, C }: { item: ProductWithTripInfo; s: any; C: ReturnType<typeof useThemeColors> }) {
  const priceMin = fmtIDR(item.price_min ?? null);
  const priceMax = fmtIDR(item.price_max ?? null);
  const priceStr = priceMin
    ? priceMax && item.price_max !== item.price_min
      ? `${priceMin} – ${priceMax}`
      : priceMin
    : null;
  const dest = item.trips?.destination_city || item.trips?.destination_country || null;
  const catInfo = item.category ? CATEGORY_MAP[item.category] ?? null : null;
  const firstImage = Array.isArray(item.image_urls) && item.image_urls.length > 0
    ? item.image_urls[0]
    : null;

  return (
    <TouchableOpacity
      style={s.card}
      activeOpacity={0.85}
      onPress={() => router.push(`/product/${item.id}`)}
    >
      {firstImage ? (
        <Image source={{ uri: firstImage }} style={s.cardImg} contentFit="cover" transition={200} />
      ) : (
        <View style={[s.cardImg, s.cardImgEmpty, catInfo ? { backgroundColor: catInfo.color + '22' } : undefined]}>
          <Ionicons
            name={(catInfo?.icon ?? 'cube-outline') as any}
            size={36}
            color={catInfo?.color ?? C.midGray}
          />
        </View>
      )}
      {catInfo ? (
        <View style={[s.catBadge, { backgroundColor: catInfo.color + 'DD' }]}>
          <Text style={s.catBadgeTxt}>{catInfo.label}</Text>
        </View>
      ) : null}
      <View style={s.cardBody}>
        <Text style={s.cardName} numberOfLines={2}>{item.name}</Text>
        {priceStr ? (
          <Text style={s.cardPrice}>{priceStr}</Text>
        ) : (
          <Text style={s.cardPriceMuted}>Harga belum diset</Text>
        )}
        {dest ? (
          <View style={s.destRow}>
            <Ionicons name="location-outline" size={11} color={C.primary} />
            <Text style={s.destTxt} numberOfLines={1}>{dest}</Text>
          </View>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}
