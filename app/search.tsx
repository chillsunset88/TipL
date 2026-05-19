/**
 * TipL — Search / See All Products Screen
 * Supabase product search with mock fallback. Gold luxury theme.
 */
import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList,
  Keyboard, Platform, ActivityIndicator,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/src/lib/constants';
import { useSearchStore } from '@/src/store/searchStore';
import { useSettingsStore } from '@/src/store/settingsStore';
import { searchProducts, ProductWithTripInfo } from '@/src/services/supabase/trips';
import { JASTIP_PRODUCTS } from '@/src/lib/mockData';
import { JastipProduct } from '@/src/lib/types';

const fmtIDR = (v: number) => 'Rp ' + v.toLocaleString('id-ID');

type DisplayProduct = {
  id: string;
  name: string;
  category: string;
  destination: string;
  imageUrl: string;
  priceMin: number;
  priceMax: number | null;
  travelerName: string;
  isSupabase: boolean;
};

function fromMock(p: JastipProduct): DisplayProduct {
  return {
    id: p.id,
    name: p.name,
    category: p.category,
    destination: p.destination,
    imageUrl: p.imageUrl,
    priceMin: p.priceIDR,
    priceMax: null,
    travelerName: p.travelerName,
    isSupabase: false,
  };
}

function fromSupabase(p: ProductWithTripInfo): DisplayProduct {
  const destName = p.trips?.destination_country ?? p.trips?.destination_city ?? 'Unknown';
  return {
    id: p.id,
    name: p.name,
    category: p.category ?? 'Item',
    destination: destName,
    imageUrl: p.image_urls?.[0] ?? 'https://images.unsplash.com/photo-1560343090-f0409e92791a?w=400',
    priceMin: p.price_min ?? 0,
    priceMax: p.price_max ?? null,
    travelerName: 'Traveler',
    isSupabase: true,
  };
}

export default function SearchScreen() {
  const { destination: destParam } = useLocalSearchParams<{ destination?: string }>();
  const [query, setQuery] = useState('');
  const selectedDest = destParam ?? '';
  const [results, setResults] = useState<DisplayProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const { history, loadHistory, addSearch, removeSearch, clearAll } = useSearchStore();
  const { t } = useSettingsStore();

  useEffect(() => {
    loadHistory();
    if (!destParam) setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  const doSearch = useCallback(async (q: string, dest: string) => {
    setLoading(true);
    try {
      const supabaseResults = await searchProducts(q, dest || undefined, 30);
      if (supabaseResults.length > 0) {
        setResults(supabaseResults.map(fromSupabase));
      } else {
        const mock = JASTIP_PRODUCTS.filter((p) => {
          const matchQuery = !q || p.name.toLowerCase().includes(q.toLowerCase()) || p.category.toLowerCase().includes(q.toLowerCase());
          const matchDest = !dest || p.destination.toLowerCase().includes(dest.toLowerCase());
          return matchQuery && matchDest;
        });
        setResults(mock.map(fromMock));
      }
    } catch {
      const mock = JASTIP_PRODUCTS.filter((p) => {
        const matchQuery = !q || p.name.toLowerCase().includes(q.toLowerCase());
        const matchDest = !dest || p.destination.toLowerCase().includes(dest.toLowerCase());
        return matchQuery && matchDest;
      });
      setResults(mock.map(fromMock));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (query.trim() || selectedDest) {
      doSearch(query.trim(), selectedDest);
    } else {
      setResults([]);
    }
  }, [query, selectedDest, doSearch]);

  const handleSubmit = () => {
    if (query.trim()) { addSearch(query.trim()); Keyboard.dismiss(); }
  };

  const handleHistoryTap = (item: string) => { setQuery(item); };

  const handleProductTap = (p: DisplayProduct) => {
    addSearch(query.trim() || p.name);
    router.push(`/product/${p.id}`);
  };

  const showResults = query.trim().length > 0 || !!selectedDest;

  const priceDisplay = (p: DisplayProduct) => {
    if (p.priceMax && p.priceMax !== p.priceMin) {
      return `${fmtIDR(p.priceMin)} – ${fmtIDR(p.priceMax)}`;
    }
    return fmtIDR(p.priceMin);
  };

  return (
    <SafeAreaView style={st.safe} edges={['top']}>
      {/* Header */}
      <View style={st.header}>
        <TouchableOpacity onPress={() => router.back()} style={st.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.nearBlack} />
        </TouchableOpacity>
        <View style={st.searchWrap}>
          <Ionicons name="search-outline" size={18} color={Colors.gray} />
          <TextInput
            ref={inputRef}
            style={st.input}
            placeholder={t.searchPlaceholder}
            placeholderTextColor={Colors.gray}
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={handleSubmit}
            returnKeyType="search"
            autoCapitalize="none"
            autoCorrect={false}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Ionicons name="close-circle" size={18} color={Colors.midGray} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={st.divider} />

      {showResults ? (
        loading ? (
          <View style={st.loadingWrap}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={st.loadingTxt}>{t.searchingProducts}</Text>
          </View>
        ) : (
          <FlatList
            data={results}
            keyExtractor={(i) => i.id}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={st.resultsList}
            ListHeaderComponent={
              results.length > 0 ? (
                <View style={st.resultsHeader}>
                  <Text style={st.resultsCount}>{results.length} {t.productsFound}</Text>
                  {selectedDest ? (
                    <View style={st.activeDestBadge}>
                      <Ionicons name="location" size={11} color={Colors.primary} />
                      <Text style={st.activeDestTxt}>{selectedDest}</Text>
                    </View>
                  ) : null}
                </View>
              ) : null
            }
            ListEmptyComponent={
              <View style={st.empty}>
                <View style={st.emptyIcon}>
                  <Ionicons name="search-outline" size={40} color={Colors.midGray} />
                </View>
                <Text style={st.emptyTitle}>{t.noProductsFound}</Text>
                <Text style={st.emptyDesc}>{t.tryDifferentKeyword}</Text>
              </View>
            }
            renderItem={({ item }) => (
              <TouchableOpacity style={st.resultCard} onPress={() => handleProductTap(item)} activeOpacity={0.8}>
                <Image source={{ uri: item.imageUrl }} style={st.resultImg} contentFit="cover" transition={200} />
                <View style={st.resultInfo}>
                  <View style={st.resultMeta}>
                    <Text style={st.resultCat}>{item.category}</Text>
                    <View style={st.resultDestBadge}>
                      <Ionicons name="location-outline" size={10} color={Colors.primary} />
                      <Text style={st.resultDestTxt}>{item.destination}</Text>
                    </View>
                  </View>
                  <Text style={st.resultName} numberOfLines={2}>{item.name}</Text>
                  <Text style={st.resultPrice}>{priceDisplay(item)}</Text>
                  <View style={st.resultTravelerRow}>
                    <Ionicons name="person-circle-outline" size={13} color={Colors.darkGray} />
                    <Text style={st.resultTravelerTxt}>{item.travelerName}</Text>
                  </View>
                </View>
                <View style={st.resultChevron}>
                  <Ionicons name="chevron-forward" size={16} color={Colors.midGray} />
                </View>
              </TouchableOpacity>
            )}
          />
        )
      ) : (
        /* Search History */
        history.length > 0 ? (
          <>
            <View style={st.histHead}>
              <Text style={st.histTitle}>{t.recentSearches}</Text>
              <TouchableOpacity onPress={clearAll} style={st.clearAllBtn}>
                <Text style={st.clearTxt}>{t.clearAll}</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={history}
              keyExtractor={(i, idx) => `${i}-${idx}`}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={st.histList}
              renderItem={({ item }) => (
                <TouchableOpacity style={st.histItem} onPress={() => handleHistoryTap(item)} activeOpacity={0.6}>
                  <View style={st.histIcon}>
                    <Ionicons name="time-outline" size={18} color={Colors.darkGray} />
                  </View>
                  <Text style={st.histTxt} numberOfLines={1}>{item}</Text>
                  <TouchableOpacity onPress={() => removeSearch(item)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    <Ionicons name="close" size={16} color={Colors.midGray} />
                  </TouchableOpacity>
                </TouchableOpacity>
              )}
            />
          </>
        ) : (
          <View style={st.empty}>
            <View style={st.emptyIcon}>
              <Ionicons name="search-outline" size={40} color={Colors.midGray} />
            </View>
            <Text style={st.emptyTitle}>{t.searchForProducts}</Text>
            <Text style={st.emptyDesc}>{t.findUniqueItems}</Text>
          </View>
        )
      )}
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.white },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: Spacing.base, paddingVertical: Spacing.sm, gap: Spacing.sm,
  },
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  searchWrap: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.offWhite, borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md, height: 44, borderWidth: 1, borderColor: Colors.lightGray, gap: Spacing.sm,
  },
  input: {
    flex: 1, fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.base,
    color: Colors.nearBlack, paddingVertical: Platform.OS === 'ios' ? 0 : 2,
  },

  // Chips
  chipsRow: { paddingBottom: Spacing.sm },
  chipsContent: { paddingHorizontal: Spacing.base, gap: Spacing.sm },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: Spacing.md, paddingVertical: 6, borderRadius: BorderRadius.full,
    borderWidth: 1, borderColor: Colors.midGray, backgroundColor: Colors.offWhite,
  },
  chipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipTxt: { fontFamily: Typography.medium.fontFamily, fontSize: Typography.sizes.xs, color: Colors.darkGray },
  chipTxtActive: { color: Colors.white },

  divider: { height: 1, backgroundColor: Colors.lightGray },

  // Loading
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md },
  loadingTxt: { fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.sm, color: Colors.darkGray },

  // Results header
  resultsList: { paddingHorizontal: Spacing.base, paddingTop: Spacing.md, paddingBottom: Spacing['2xl'] },
  resultsHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.base },
  resultsCount: { fontFamily: Typography.medium.fontFamily, fontSize: Typography.sizes.sm, color: Colors.darkGray },
  activeDestBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: Colors.primaryPale, paddingHorizontal: Spacing.sm, paddingVertical: 3, borderRadius: BorderRadius.full, borderWidth: 1, borderColor: Colors.primaryLight },
  activeDestTxt: { fontFamily: Typography.regular.fontFamily, fontSize: 11, color: Colors.primary },

  // Result Cards
  resultCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.white, borderRadius: BorderRadius.lg, marginBottom: Spacing.md,
    borderWidth: 1, borderColor: Colors.lightGray, overflow: 'hidden', ...Shadows.sm,
  },
  resultImg: { width: 100, height: 100, backgroundColor: Colors.cream },
  resultInfo: { flex: 1, padding: Spacing.md, justifyContent: 'center' },
  resultMeta: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: 4 },
  resultCat: { fontFamily: Typography.medium.fontFamily, fontSize: 10, color: Colors.primary, letterSpacing: 0.3 },
  resultDestBadge: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  resultDestTxt: { fontFamily: Typography.regular.fontFamily, fontSize: 10, color: Colors.darkGray },
  resultName: { fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.sm, color: Colors.nearBlack, marginBottom: 4, lineHeight: 18 },
  resultPrice: { fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.base, color: Colors.nearBlack, marginBottom: 3 },
  resultTravelerRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  resultTravelerTxt: { fontFamily: Typography.regular.fontFamily, fontSize: 11, color: Colors.darkGray },
  resultChevron: { paddingRight: Spacing.sm },

  // History
  histHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.xl, paddingTop: Spacing.xl, paddingBottom: Spacing.md },
  histTitle: { fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.md, color: Colors.nearBlack },
  clearAllBtn: { padding: Spacing.xs },
  clearTxt: { fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.sm, color: Colors.error },
  histList: { paddingHorizontal: Spacing.xl },
  histItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.base, borderBottomWidth: 1, borderBottomColor: Colors.lightGray, gap: Spacing.md },
  histIcon: { width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.offWhite, alignItems: 'center', justifyContent: 'center' },
  histTxt: { flex: 1, fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.base, color: Colors.nearBlack },

  // Empty
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80, gap: Spacing.md },
  emptyIcon: { width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.offWhite, alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { fontFamily: Typography.serifBold.fontFamily, fontSize: Typography.sizes.lg, color: Colors.nearBlack },
  emptyDesc: { fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.base, color: Colors.darkGray, textAlign: 'center' },
});
