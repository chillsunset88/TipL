/**
 * TipL — Product Detail Page
 * Shows full product info, traveler, price, and action buttons.
 */
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/src/lib/constants';
import { JASTIP_PRODUCTS } from '@/src/lib/mockData';
import { useSettingsStore } from '@/src/store/settingsStore';
import { useCartStore } from '@/src/store/cartStore';

const NAVY = { dark: '#002855', mid: '#003F7F' } as const;

const fmtIDR = (v: number) => 'Rp ' + v.toLocaleString('id-ID');

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useSettingsStore();
  const addItem = useCartStore((s) => s.addItem);
  const product = JASTIP_PRODUCTS.find((p) => p.id === id);

  if (!product) {
    return (
      <SafeAreaView style={st.safe} edges={['top']}>
        <View style={st.center}>
          <Text style={st.emptyTxt}>Product not found</Text>
          <TouchableOpacity onPress={() => router.back()}><Text style={st.linkTxt}>Go back</Text></TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const handleAddToCart = () => {
    addItem({ 
      id: product.id, 
      name: product.name, 
      price: product.priceIDR, 
      quantity: 1, 
      imageUrl: product.imageUrl,
      travelerId: product.travelerId,
      travelerName: product.travelerName
    });
    Alert.alert('Added to Cart', `${product.name} has been added to your cart.`);
  };

  return (
    <View style={st.safe}>
      {/* Image Hero */}
      <View style={st.heroWrap}>
        <Image source={{ uri: product.imageUrl }} style={st.heroImg} contentFit="cover" transition={300} />
        <LinearGradient colors={['rgba(0,0,0,0.4)', 'transparent']} style={st.heroTop} />
        <SafeAreaView edges={['top']} style={st.heroNav}>
          <TouchableOpacity style={st.navBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color={Colors.white} />
          </TouchableOpacity>
          <TouchableOpacity style={st.navBtn} onPress={() => Alert.alert('Coming Soon')}>
            <Ionicons name="share-outline" size={22} color={Colors.white} />
          </TouchableOpacity>
        </SafeAreaView>
        <View style={st.destBadge}>
          <Ionicons name="location-outline" size={14} color={Colors.white} />
          <Text style={st.destBadgeTxt}>{product.destination}</Text>
        </View>
      </View>

      <ScrollView style={st.body} showsVerticalScrollIndicator={false}>
        {/* Category + Name */}
        <Text style={st.cat}>{product.category}</Text>
        <Text style={st.name}>{product.name}</Text>

        {/* Price */}
        <Text style={st.price}>{fmtIDR(product.priceIDR)}</Text>

        {/* Stock + Weight */}
        <View style={st.metaRow}>
          <View style={st.metaPill}><Ionicons name="cube-outline" size={14} color={NAVY.mid} /><Text style={st.metaTxt}>Stock: {product.stock}</Text></View>
          {product.weight && <View style={st.metaPill}><Ionicons name="scale-outline" size={14} color={NAVY.mid} /><Text style={st.metaTxt}>{product.weight} kg</Text></View>}
        </View>

        {/* Divider */}
        <View style={st.hr} />

        {/* Description */}
        <Text style={st.sectionTitle}>Description</Text>
        <Text style={st.desc}>{product.description}</Text>

        {/* Divider */}
        <View style={st.hr} />

        {/* Traveler Info */}
        <Text style={st.sectionTitle}>Traveler / Jastiper</Text>
        <TouchableOpacity style={st.travelerCard} activeOpacity={0.7}>
          <Image source={{ uri: product.travelerAvatar ?? undefined }} style={st.travelerAvatar} contentFit="cover" />
          <View style={st.travelerInfo}>
            <View style={st.travelerNameRow}>
              <Text style={st.travelerName}>{product.travelerName}</Text>
              {product.travelerVerified && <Ionicons name="checkmark-circle" size={16} color={Colors.success} />}
            </View>
            <View style={st.ratingRow}>
              <Ionicons name="star" size={13} color={Colors.primary} />
              <Text style={st.ratingTxt}>{product.travelerRating}</Text>
              <Text style={st.verifiedTxt}>{product.travelerVerified ? '• Verified' : ''}</Text>
            </View>
          </View>
        </TouchableOpacity>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Bottom CTA */}
      <View style={st.bottomBar}>
        <TouchableOpacity style={st.chatBtn} onPress={() => Alert.alert('Coming Soon')}>
          <Ionicons name="chatbubble-outline" size={22} color={NAVY.mid} />
        </TouchableOpacity>
        <TouchableOpacity style={st.cartBtn} onPress={handleAddToCart}>
          <Ionicons name="cart-outline" size={22} color={NAVY.mid} />
        </TouchableOpacity>
        <TouchableOpacity style={st.buyBtn} activeOpacity={0.85} onPress={() => { handleAddToCart(); router.push('/cart'); }}>
          <LinearGradient colors={[NAVY.dark, NAVY.mid]} style={st.buyGrad}>
            <Text style={st.buyTxt}>Order Now — {fmtIDR(product.priceIDR)}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const st = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.white },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyTxt: { fontFamily: Typography.medium.fontFamily, fontSize: Typography.sizes.base, color: Colors.darkGray },
  linkTxt: { fontFamily: Typography.semiBold.fontFamily, fontSize: Typography.sizes.base, color: NAVY.mid, marginTop: Spacing.md },
  // Hero
  heroWrap: { width: '100%', height: 320, position: 'relative' },
  heroImg: { width: '100%', height: '100%' },
  heroTop: { position: 'absolute', top: 0, left: 0, right: 0, height: 100 },
  heroNav: { position: 'absolute', top: 0, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: Spacing.base },
  navBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.3)', alignItems: 'center', justifyContent: 'center' },
  destBadge: { position: 'absolute', bottom: Spacing.md, left: Spacing.base, flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, borderRadius: BorderRadius.full, gap: 4 },
  destBadgeTxt: { fontFamily: Typography.semiBold.fontFamily, fontSize: Typography.sizes.xs, color: Colors.white },
  // Body
  body: { flex: 1, paddingHorizontal: Spacing.xl },
  cat: { fontFamily: Typography.semiBold.fontFamily, fontSize: Typography.sizes.xs, color: Colors.primary, letterSpacing: 1, marginTop: Spacing.xl, textTransform: 'uppercase' },
  name: { fontFamily: Typography.serifBold.fontFamily, fontSize: Typography.sizes['2xl'], color: Colors.nearBlack, marginTop: Spacing.xs },
  price: { fontFamily: Typography.bold.fontFamily, fontSize: Typography.sizes.xl, color: NAVY.mid, marginTop: Spacing.md },
  metaRow: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.md },
  metaPill: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#EBF2FF', paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, borderRadius: BorderRadius.full },
  metaTxt: { fontFamily: Typography.medium.fontFamily, fontSize: Typography.sizes.xs, color: NAVY.mid },
  hr: { height: 1, backgroundColor: Colors.lightGray, marginVertical: Spacing.xl },
  sectionTitle: { fontFamily: Typography.serifBold.fontFamily, fontSize: Typography.sizes.lg, color: Colors.nearBlack, marginBottom: Spacing.md },
  desc: { fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.base, color: Colors.charcoal, lineHeight: 22 },
  // Traveler
  travelerCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.offWhite, borderRadius: BorderRadius.lg, padding: Spacing.base, borderWidth: 1, borderColor: Colors.lightGray, gap: Spacing.md },
  travelerAvatar: { width: 48, height: 48, borderRadius: 24 },
  travelerInfo: { flex: 1 },
  travelerNameRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  travelerName: { fontFamily: Typography.semiBold.fontFamily, fontSize: Typography.sizes.base, color: Colors.nearBlack },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 2 },
  ratingTxt: { fontFamily: Typography.medium.fontFamily, fontSize: Typography.sizes.sm, color: Colors.nearBlack },
  verifiedTxt: { fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.xs, color: Colors.darkGray },
  // Bottom bar
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white, paddingHorizontal: Spacing.base, paddingTop: Spacing.md, paddingBottom: 34, gap: Spacing.sm, borderTopWidth: 1, borderTopColor: Colors.lightGray, ...Shadows.md },
  chatBtn: { width: 48, height: 48, borderRadius: BorderRadius.md, borderWidth: 1.5, borderColor: NAVY.mid, alignItems: 'center', justifyContent: 'center' },
  cartBtn: { width: 48, height: 48, borderRadius: BorderRadius.md, borderWidth: 1.5, borderColor: NAVY.mid, alignItems: 'center', justifyContent: 'center' },
  buyBtn: { flex: 1, height: 48, borderRadius: BorderRadius.md, overflow: 'hidden' },
  buyGrad: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  buyTxt: { fontFamily: Typography.bold.fontFamily, fontSize: Typography.sizes.base, color: Colors.white },
});
