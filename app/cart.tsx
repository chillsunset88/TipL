/**
 * TipL — Cart Page
 * Prelove-style grouped cart: horizontal photo cards per seller, edit mode with X buttons.
 */
import React, { useMemo, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { FloatingBackButton } from '@/src/components/ui/FloatingBackButton';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/src/lib/constants';
import { useCartStore } from '@/src/store/cartStore';
import { useAuthStore } from '@/src/store/authStore';
import { useCheckoutStore } from '@/src/store/checkoutStore';

const fmtIDR = (v: number) => 'Rp ' + v.toLocaleString('id-ID');

export default function CartScreen() {
  const insets = useSafeAreaInsets();
  const { items, removeItem } = useCartStore();
  const user = useAuthStore((s) => s.user);
  const { setPendingItems, setSelectedAddress } = useCheckoutStore();
  const [editMode, setEditMode] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Set<string>>(new Set());

  const groupedArray = useMemo(() => {
    const map: Record<string, { travelerId: string; travelerName: string; items: typeof items }> = {};
    for (const item of items) {
      if (!map[item.travelerId]) {
        map[item.travelerId] = { travelerId: item.travelerId, travelerName: item.travelerName, items: [] };
      }
      map[item.travelerId].items.push(item);
    }
    return Object.values(map);
  }, [items]);

  const totalPending = pendingDelete.size;

  const togglePendingDelete = (id: string) => {
    setPendingDelete(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleDeleteGroup = (groupItems: typeof items, groupPendingIds: string[]) => {
    if (groupPendingIds.length === 0) return;
    Alert.alert('Hapus Item', `Hapus ${groupPendingIds.length} item dari keranjang?`, [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Hapus', style: 'destructive', onPress: () => {
          groupPendingIds.forEach(id => removeItem(id));
          setPendingDelete(prev => {
            const next = new Set(prev);
            groupPendingIds.forEach(id => next.delete(id));
            return next;
          });
        },
      },
    ]);
  };

  const handleBuyGroup = (groupItems: typeof items) => {
    if (!user) {
      Alert.alert('Login Diperlukan', 'Silakan masuk untuk melanjutkan checkout.', [
        { text: 'Masuk', onPress: () => router.replace('/(auth)/login' as any) },
        { text: 'Batal', style: 'cancel' },
      ]);
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // Store pending items and reset selected address, then go to address selection
    setPendingItems(groupItems);
    setSelectedAddress(null);
    router.push('/checkout/address');
  };

  return (
    <SafeAreaView style={st.safe} edges={['top']}>
      <FloatingBackButton onPress={() => router.back()} />
      {items.length > 0 && (
        <TouchableOpacity
          style={[st.floatingEdit, { top: insets.top + 18 }]}
          onPress={() => {
            if (editMode) {
              setEditMode(false);
              setPendingDelete(new Set());
            } else {
              setEditMode(true);
            }
          }}
        >
          <Text style={st.editTxt}>{editMode ? 'Selesai' : 'Ubah'}</Text>
        </TouchableOpacity>
      )}

      <ScrollView style={st.body} showsVerticalScrollIndicator={false}>
        {items.length === 0 ? (
          <View style={st.empty}>
            <View style={st.emptyIcon}>
              <Ionicons name="cart-outline" size={48} color={Colors.midGray} />
            </View>
            <Text style={st.emptyTitle}>Keranjang kosong</Text>
            <Text style={st.emptyDesc}>Temukan produk unik dari para traveler</Text>
            <TouchableOpacity onPress={() => router.push('/')} style={st.shopBtn}>
              <LinearGradient colors={[Colors.primaryLight, Colors.primaryDark]} style={st.shopBtnGrad}>
                <Text style={st.shopBtnTxt}>Jelajahi Produk</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={st.cartList}>
            {groupedArray.map((group) => {
              const groupPendingIds = group.items.filter(i => pendingDelete.has(i.id)).map(i => i.id);
              const subtotal = group.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
              const initials = group.travelerName.charAt(0).toUpperCase();

              return (
                <View key={group.travelerId} style={st.groupCard}>
                  {/* Seller header — tappable to their trip page */}
                  <TouchableOpacity
                    style={st.sellerRow}
                    activeOpacity={0.7}
                    onPress={() => {
                      const tripId = group.items[0]?.tripId;
                      if (tripId) router.push(`/trip/${tripId}` as any);
                    }}
                  >
                    <View style={st.sellerAvatar}>
                      <Text style={st.sellerAvatarTxt}>{initials}</Text>
                    </View>
                    <View style={st.sellerInfo}>
                      <View style={st.sellerNameRow}>
                        <Text style={st.sellerName}>{group.travelerName}</Text>
                        <View style={st.verifiedBadge}>
                          <Ionicons name="shield-checkmark" size={10} color={Colors.success} />
                          <Text style={st.verifiedTxt}>Terverifikasi</Text>
                        </View>
                      </View>
                      <Text style={st.itemCountTxt}>{group.items.length} produk</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color={Colors.midGray} />
                  </TouchableOpacity>

                  {/* Horizontal product photos */}
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={st.photoScroll}
                    contentContainerStyle={st.photoScrollContent}
                  >
                    {group.items.map(item => {
                      const marked = pendingDelete.has(item.id);
                      return (
                        <View key={item.id} style={[st.photoCard, marked && st.photoCardMarked]}>
                          <Image source={{ uri: item.imageUrl }} style={st.photoImg} contentFit="cover" />
                          <LinearGradient
                            colors={['transparent', 'rgba(0,0,0,0.72)']}
                            style={st.photoOverlay}
                          >
                            <Text style={st.photoName} numberOfLines={1}>{item.name}</Text>
                            <Text style={st.photoPrice}>{fmtIDR(item.price)}</Text>
                            {item.quantity > 1 && (
                              <Text style={st.photoQty}>x{item.quantity}</Text>
                            )}
                          </LinearGradient>
                          {editMode && (
                            <TouchableOpacity
                              style={[st.deleteX, marked && st.deleteXActive]}
                              onPress={() => togglePendingDelete(item.id)}
                              hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
                            >
                              <Ionicons name="close" size={12} color={Colors.white} />
                            </TouchableOpacity>
                          )}
                        </View>
                      );
                    })}

                  </ScrollView>

                  {/* Group footer */}
                  <View style={st.groupFooter}>
                    <View>
                      <Text style={st.subtotalLbl}>Subtotal</Text>
                      <Text style={st.subtotalVal}>{fmtIDR(subtotal)}</Text>
                    </View>

                    {editMode ? (
                      <TouchableOpacity
                        style={[st.hapusBtn, groupPendingIds.length === 0 && st.hapusBtnDisabled]}
                        onPress={() => handleDeleteGroup(group.items, groupPendingIds)}
                        disabled={groupPendingIds.length === 0}
                      >
                        <Text style={[st.hapusBtnTxt, groupPendingIds.length === 0 && st.hapusBtnTxtDisabled]}>
                          {groupPendingIds.length > 0 ? `Hapus ${groupPendingIds.length} item` : 'Pilih item'}
                        </Text>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        onPress={() => handleBuyGroup(group.items)}
                        style={st.beliWrap}
                      >
                        <LinearGradient
                          colors={[Colors.primaryLight, Colors.primaryDark]}
                          style={st.beliBtn}
                        >
                          <Text style={st.beliBtnTxt}>Beli sekarang</Text>
                        </LinearGradient>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              );
            })}

          </View>
        )}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const PHOTO_SIZE = 120;

const st = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.offWhite },

  floatingBack: {
    position: 'absolute', top: 12, left: 20, zIndex: 10,
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: 'rgba(0,0,0,0.06)',
    alignItems: 'center', justifyContent: 'center',
  },
  floatingEdit: {
    position: 'absolute', top: 18, right: 20, zIndex: 10,
  },
  editTxt: { fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.sm, color: Colors.primary, paddingHorizontal: 4 },

  body: { flex: 1 },

  empty: { alignItems: 'center', justifyContent: 'center', paddingTop: 80, paddingHorizontal: Spacing['2xl'], gap: Spacing.md },
  emptyIcon: { width: 96, height: 96, borderRadius: 48, backgroundColor: Colors.cream, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.sm },
  emptyTitle: { fontFamily: Typography.serifBold.fontFamily, fontSize: Typography.sizes.xl, color: Colors.nearBlack },
  emptyDesc: { fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.base, color: Colors.darkGray, textAlign: 'center', lineHeight: 22 },
  shopBtn: { marginTop: Spacing.md, borderRadius: BorderRadius.full, overflow: 'hidden' },
  shopBtnGrad: { paddingHorizontal: Spacing['2xl'], paddingVertical: Spacing.base },
  shopBtnTxt: { fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.base, color: Colors.white },

  cartList: { paddingTop: Spacing.md, gap: Spacing.md, paddingBottom: Spacing.md },

  groupCard: {
    backgroundColor: Colors.white,
    marginHorizontal: Spacing.base,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.lightGray,
    overflow: 'hidden',
    ...Shadows.sm,
  },

  sellerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  sellerAvatar: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: Colors.primaryPale,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: Colors.primaryLight,
  },
  sellerAvatarTxt: { fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.base, color: Colors.primary },
  sellerInfo: { flex: 1 },
  sellerNameRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  sellerName: { fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.sm, color: Colors.nearBlack },
  verifiedBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 2,
    backgroundColor: Colors.successLight,
    paddingHorizontal: Spacing.xs, paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  verifiedTxt: { fontFamily: Typography.medium.fontFamily, fontSize: 9, color: Colors.success },
  itemCountTxt: { fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.xs, color: Colors.darkGray, marginTop: 1 },

  photoScroll: { paddingVertical: Spacing.md },
  photoScrollContent: { paddingHorizontal: Spacing.md, gap: Spacing.sm, alignItems: 'flex-start' },

  photoCard: {
    width: PHOTO_SIZE, height: PHOTO_SIZE + 24,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    backgroundColor: Colors.cream,
  },
  photoCardMarked: { opacity: 0.55 },
  photoImg: { width: '100%', height: '100%' },
  photoOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    padding: Spacing.sm,
  },
  photoName: { fontFamily: Typography.medium.fontFamily, fontSize: 9, color: Colors.white, lineHeight: 12 },
  photoPrice: { fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.xs, color: Colors.white, marginTop: 1 },
  photoQty: { fontFamily: Typography.regular.fontFamily, fontSize: 9, color: 'rgba(255,255,255,0.8)', marginTop: 1 },

  deleteX: {
    position: 'absolute', top: 5, right: 5,
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center', justifyContent: 'center',
  },
  deleteXActive: { backgroundColor: Colors.error },

  groupFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.lightGray,
  },
  subtotalLbl: { fontFamily: Typography.regular.fontFamily, fontSize: 10, color: Colors.darkGray },
  subtotalVal: { fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.base, color: Colors.nearBlack, marginTop: 1 },

  beliWrap: { borderRadius: BorderRadius.full, overflow: 'hidden' },
  beliBtn: { paddingHorizontal: Spacing.xl, paddingVertical: Spacing.sm, borderRadius: BorderRadius.full },
  beliBtnTxt: { fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.sm, color: Colors.white },

  hapusBtn: {
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1.5, borderColor: Colors.error,
  },
  hapusBtnDisabled: { borderColor: Colors.midGray },
  hapusBtnTxt: { fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.sm, color: Colors.error },
  hapusBtnTxtDisabled: { color: Colors.midGray },

});
