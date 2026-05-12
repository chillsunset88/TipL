/**
 * TipL — Search Screen
 * Shows search history + live product search results.
 * Tapping a product navigates to /product/[id].
 */
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, Keyboard, Platform } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Colors, Typography, Spacing, BorderRadius } from '@/src/lib/constants';
import { useSearchStore } from '@/src/store/searchStore';
import { useSettingsStore } from '@/src/store/settingsStore';
import { JASTIP_PRODUCTS } from '@/src/lib/mockData';
import { JastipProduct } from '@/src/lib/types';

const fmtIDR = (v: number) => 'Rp ' + v.toLocaleString('id-ID');

export default function SearchScreen() {
  const { destination } = useLocalSearchParams<{ destination?: string }>();
  const [query, setQuery] = useState(destination || '');
  const inputRef = useRef<TextInput>(null);
  const { history, loadHistory, addSearch, removeSearch, clearAll } = useSearchStore();
  const { t } = useSettingsStore();

  useEffect(() => { loadHistory(); setTimeout(() => inputRef.current?.focus(), 100); }, []);

  const results: JastipProduct[] = query.trim().length > 0
    ? JASTIP_PRODUCTS.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()) || p.category.toLowerCase().includes(query.toLowerCase()) || p.destination.toLowerCase().includes(query.toLowerCase()))
    : [];

  const handleSubmit = () => { if (query.trim()) { addSearch(query.trim()); Keyboard.dismiss(); } };

  const handleHistoryTap = (item: string) => { setQuery(item); addSearch(item); };

  const handleProductTap = (p: JastipProduct) => { addSearch(query.trim() || p.name); router.push(`/product/${p.id}`); };

  const showResults = query.trim().length > 0;

  return (
    <SafeAreaView style={st.safe} edges={['top']}>
      {/* Header */}
      <View style={st.header}>
        <TouchableOpacity onPress={() => router.back()} style={st.backBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="arrow-back" size={24} color={Colors.nearBlack} />
        </TouchableOpacity>
        <View style={st.searchWrap}>
          <Ionicons name="search-outline" size={18} color={Colors.gray} />
          <TextInput ref={inputRef} style={st.input} placeholder={t.searchPlaceholder} placeholderTextColor={Colors.gray}
            value={query} onChangeText={setQuery} onSubmitEditing={handleSubmit} returnKeyType="search" autoCapitalize="none" autoCorrect={false} />
          {query.length > 0 && <TouchableOpacity onPress={() => setQuery('')}><Ionicons name="close-circle" size={18} color={Colors.gray} /></TouchableOpacity>}
        </View>
      </View>
      <View style={st.divider} />

      {showResults ? (
        /* Search Results */
        <FlatList data={results} keyExtractor={(i) => i.id} keyboardShouldPersistTaps="handled" contentContainerStyle={st.resultsList}
          ListEmptyComponent={<View style={st.empty}><Ionicons name="search" size={48} color={Colors.midGray} /><Text style={st.emptyTxt}>No products found</Text></View>}
          renderItem={({ item }) => (
            <TouchableOpacity style={st.resultItem} onPress={() => handleProductTap(item)} activeOpacity={0.7}>
              <Image source={{ uri: item.imageUrl }} style={st.resultImg} contentFit="cover" transition={200} />
              <View style={st.resultInfo}>
                <Text style={st.resultCat}>{item.category} • {item.destination}</Text>
                <Text style={st.resultName} numberOfLines={2}>{item.name}</Text>
                <Text style={st.resultPrice}>{fmtIDR(item.priceIDR)}</Text>
                <View style={st.resultTraveler}>
                  <Ionicons name="person-circle-outline" size={14} color={Colors.darkGray} />
                  <Text style={st.resultTravelerTxt}>{item.travelerName}</Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      ) : (
        /* History */
        history.length > 0 ? (
          <>
            <View style={st.histHead}>
              <Text style={st.histTitle}>{t.recentSearches}</Text>
              <TouchableOpacity onPress={clearAll}><Text style={st.clearTxt}>{t.clearAll}</Text></TouchableOpacity>
            </View>
            <FlatList data={history} keyExtractor={(i, idx) => `${i}-${idx}`} keyboardShouldPersistTaps="handled" contentContainerStyle={st.histList}
              renderItem={({ item }) => (
                <TouchableOpacity style={st.histItem} onPress={() => handleHistoryTap(item)} activeOpacity={0.6}>
                  <Ionicons name="time-outline" size={20} color={Colors.gray} style={{ marginRight: Spacing.md }} />
                  <Text style={st.histTxt} numberOfLines={1}>{item}</Text>
                  <TouchableOpacity onPress={() => removeSearch(item)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} style={{ padding: Spacing.xs }}>
                    <Ionicons name="close" size={18} color={Colors.gray} />
                  </TouchableOpacity>
                </TouchableOpacity>
              )}
            />
          </>
        ) : (
          <View style={st.empty}><Ionicons name="search" size={48} color={Colors.midGray} /><Text style={st.emptyTxt}>{t.noSearchHistory}</Text></View>
        )
      )}
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.white },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.base, paddingVertical: Spacing.sm, gap: Spacing.sm },
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  searchWrap: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.cream, borderRadius: BorderRadius.full, paddingHorizontal: Spacing.md, height: 42, borderWidth: 1, borderColor: Colors.midGray },
  input: { flex: 1, fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.base, color: Colors.nearBlack, marginLeft: Spacing.sm, paddingVertical: Platform.OS === 'ios' ? 0 : 2 },
  divider: { height: 1, backgroundColor: Colors.lightGray },
  // History
  histHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.xl, paddingTop: Spacing.xl, paddingBottom: Spacing.md },
  histTitle: { fontFamily: Typography.bold.fontFamily, fontSize: Typography.sizes.md, color: Colors.nearBlack },
  clearTxt: { fontFamily: Typography.semiBold.fontFamily, fontSize: Typography.sizes.sm, color: '#E53935' },
  histList: { paddingHorizontal: Spacing.xl },
  histItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: Colors.lightGray },
  histTxt: { flex: 1, fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.base, color: Colors.nearBlack },
  // Results
  resultsList: { paddingHorizontal: Spacing.base, paddingTop: Spacing.md },
  resultItem: { flexDirection: 'row', backgroundColor: Colors.white, borderRadius: BorderRadius.lg, marginBottom: Spacing.md, borderWidth: 1, borderColor: Colors.lightGray, overflow: 'hidden' },
  resultImg: { width: 100, height: 100 },
  resultInfo: { flex: 1, padding: Spacing.md, justifyContent: 'center' },
  resultCat: { fontFamily: Typography.medium.fontFamily, fontSize: 10, color: Colors.primary, letterSpacing: 0.5, marginBottom: 2 },
  resultName: { fontFamily: Typography.semiBold.fontFamily, fontSize: Typography.sizes.sm, color: Colors.nearBlack, marginBottom: 4 },
  resultPrice: { fontFamily: Typography.bold.fontFamily, fontSize: Typography.sizes.base, color: '#003F7F' },
  resultTraveler: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  resultTravelerTxt: { fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.xs, color: Colors.darkGray },
  // Empty
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 100, gap: Spacing.md },
  emptyTxt: { fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.base, color: Colors.gray },
});
