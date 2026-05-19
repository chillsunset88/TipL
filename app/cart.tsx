/**
 * TipL — Cart Page
 * Prelove-style grouped cart: horizontal photo cards per seller, edit mode with X buttons.
 * Theme-aware: supports Dark Mode & Light Mode.
 */
import React, { useMemo, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Typography, Spacing, BorderRadius, Shadows } from '@/src/lib/constants';
import { useCartStore } from '@/src/store/cartStore';
import { useAuthStore } from '@/src/store/authStore';
import { useCheckoutStore } from '@/src/store/checkoutStore';
import { useSettingsStore } from '@/src/store/settingsStore';
import { useThemeColors } from '@/src/lib/hooks/useThemeColors';

const fmtIDR = (v: number) => 'Rp ' + v.toLocaleString('id-ID');

export default function CartScreen() {
  const C = useThemeColors();
  const { items, removeItem } = useCartStore();
  const user = useAuthStore((s) => s.user);
  const { setPendingItems, setSelectedAddress } = useCheckoutStore();
  const { t } = useSettingsStore();
  const insets = useSafeAreaInsets();
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

  const togglePendingDelete = (id: string) => {
    setPendingDelete(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleDeleteGroup = (groupItems: typeof items, groupPendingIds: string[]) => {
    if (groupPendingIds.length === 0) return;
    Alert.alert(t.deleteConfirmTitle, `${t.delete} ${groupPendingIds.length} ${t.deleteConfirmMsg}`, [
      { text: t.cancel, style: 'cancel' },
      {
        text: t.delete, style: 'destructive', onPress: () => {
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
      Alert.alert(t.loginRequired, t.loginRequiredDesc, [
        { text: t.signIn, onPress: () => router.replace('/(auth)/login' as any) },
        { text: t.cancel, style: 'cancel' },
      ]);
      return;
    }
    if (groupItems.some((i) => i.travelerId === user.id)) {
      Alert.alert(t.cannotOrder, t.cannotOrderOwnProduct);
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setPendingItems(groupItems);
    setSelectedAddress(null);
    router.push('/checkout/address');
  };

  const st = React.useMemo(() => StyleSheet.create({
    safe: { flex: 1, backgroundColor: C.offWhite },

    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: Spacing.md,
      paddingBottom: Spacing.sm,
      backgroundColor: C.white,
      borderBottomWidth: 1,
      borderBottomColor: C.lightGray,
    },
    headerBtn: {
      width: 40, height: 40, borderRadius: 20,
      alignItems: 'center', justifyContent: 'center',
    },
    headerRightBtn: {
      paddingHorizontal: Spacing.sm,
      paddingVertical: Spacing.xs,
      alignItems: 'flex-end',
      justifyContent: 'center',
    },
    headerRightTxt: {
      fontFamily: Typography.medium.fontFamily,
      fontSize: Typography.sizes.sm,
      color: C.primary,
    },
    headerTitle: {
      flex: 1,
      fontFamily: Typography.medium.fontFamily,
      fontSize: Typography.sizes.base,
      color: C.nearBlack,
      textAlign: 'center',
    },

    body: { flex: 1 },

    empty: { alignItems: 'center', justifyContent: 'center', paddingTop: 80, paddingHorizontal: Spacing['2xl'], gap: Spacing.md },
    emptyIcon: { width: 96, height: 96, borderRadius: 48, backgroundColor: C.offWhite, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.sm },
    emptyTitle: { fontFamily: Typography.serifBold.fontFamily, fontSize: Typography.sizes.xl, color: C.nearBlack },
    emptyDesc: { fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.base, color: C.darkGray, textAlign: 'center', lineHeight: 22 },
    shopBtn: { marginTop: Spacing.md, borderRadius: BorderRadius.full, overflow: 'hidden' },
    shopBtnGrad: { paddingHorizontal: Spacing['2xl'], paddingVertical: Spacing.base },
    shopBtnTxt: { fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.base, color: '#FFFFFF' },

    cartList: { paddingTop: Spacing.md, gap: Spacing.md, paddingBottom: Spacing.md },

    groupCard: {
      backgroundColor: C.white,
      marginHorizontal: Spacing.base,
      borderRadius: BorderRadius.xl,
      borderWidth: 1,
      borderColor: C.lightGray,
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
      borderBottomColor: C.lightGray,
    },
    sellerAvatar: {
      width: 38, height: 38, borderRadius: 19,
      backgroundColor: C.primary + '15',
      alignItems: 'center', justifyContent: 'center',
      borderWidth: 1.5, borderColor: C.primary,
    },
    sellerAvatarTxt: { fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.base, color: C.primary },
    sellerInfo: { flex: 1 },
    sellerNameRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
    sellerName: { fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.sm, color: C.nearBlack },
    verifiedBadge: {
      flexDirection: 'row', alignItems: 'center', gap: 2,
      backgroundColor: C.success + '15',
      paddingHorizontal: Spacing.xs, paddingVertical: 2,
      borderRadius: BorderRadius.full,
    },
    verifiedTxt: { fontFamily: Typography.medium.fontFamily, fontSize: 9, color: C.success },
    itemCountTxt: { fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.xs, color: C.darkGray, marginTop: 1 },

    photoScroll: { paddingVertical: Spacing.md },
    photoScrollContent: { paddingHorizontal: Spacing.md, gap: Spacing.sm, alignItems: 'flex-start' },

    photoCard: {
      width: 120, height: 144,
      borderRadius: BorderRadius.lg,
      overflow: 'hidden',
      backgroundColor: C.offWhite,
    },
    photoCardMarked: { opacity: 0.55 },
    photoImg: { width: '100%', height: '100%' },
    photoOverlay: {
      ...StyleSheet.absoluteFillObject,
      justifyContent: 'flex-end',
      padding: Spacing.sm,
    },
    photoName: { fontFamily: Typography.medium.fontFamily, fontSize: 9, color: '#FFFFFF', lineHeight: 12 },
    photoPrice: { fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.xs, color: '#FFFFFF', marginTop: 1 },
    photoQty: { fontFamily: Typography.regular.fontFamily, fontSize: 9, color: 'rgba(255,255,255,0.8)', marginTop: 1 },

    deleteX: {
      position: 'absolute', top: 5, right: 5,
      width: 20, height: 20, borderRadius: 10,
      backgroundColor: 'rgba(0,0,0,0.55)',
      alignItems: 'center', justifyContent: 'center',
    },
    deleteXActive: { backgroundColor: C.error },

    groupFooter: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.md,
      borderTopWidth: 1,
      borderTopColor: C.lightGray,
    },
    subtotalLbl: { fontFamily: Typography.regular.fontFamily, fontSize: 10, color: C.darkGray },
    subtotalVal: { fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.base, color: C.nearBlack, marginTop: 1 },

    beliWrap: { borderRadius: BorderRadius.full, overflow: 'hidden' },
    beliBtn: { paddingHorizontal: Spacing.xl, paddingVertical: Spacing.sm, borderRadius: BorderRadius.full },
    beliBtnTxt: { fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.sm, color: '#FFFFFF' },

    hapusBtn: {
      paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm,
      borderRadius: BorderRadius.full,
      borderWidth: 1.5, borderColor: C.error,
    },
    hapusBtnDisabled: { borderColor: C.midGray },
    hapusBtnTxt: { fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.sm, color: C.error },
    hapusBtnTxtDisabled: { color: C.midGray },
  }), [C]);

  return (
    <View style={st.safe}>
      <View style={[st.header, { paddingTop: insets.top }]}>
        <TouchableOpacity
          style={st.headerBtn}
          onPress={() => router.back()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="arrow-back" size={22} color={C.nearBlack} />
        </TouchableOpacity>
        <Text style={st.headerTitle}>{t.myCart}</Text>
        {items.length > 0 ? (
          <TouchableOpacity
            style={st.headerRightBtn}
            onPress={() => {
              if (editMode) { setEditMode(false); setPendingDelete(new Set()); }
              else { setEditMode(true); }
            }}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={st.headerRightTxt}>{editMode ? t.done : t.editCart}</Text>
          </TouchableOpacity>
        ) : (
          <View style={st.headerBtn} />
        )}
      </View>

      <ScrollView style={st.body} showsVerticalScrollIndicator={false}>
        {items.length === 0 ? (
          <View style={st.empty}>
            <View style={st.emptyIcon}>
              <Ionicons name="cart-outline" size={48} color={C.midGray} />
            </View>
            <Text style={st.emptyTitle}>{t.emptyCart}</Text>
            <Text style={st.emptyDesc}>{t.emptyCartDesc}</Text>
            <TouchableOpacity onPress={() => router.push('/')} style={st.shopBtn}>
              <LinearGradient colors={[C.primary, C.primary]} style={st.shopBtnGrad}>
                <Text style={st.shopBtnTxt}>{t.exploreProducts}</Text>
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
                          <Ionicons name="shield-checkmark" size={10} color={C.success} />
                          <Text style={st.verifiedTxt}>{t.verified}</Text>
                        </View>
                      </View>
                      <Text style={st.itemCountTxt}>{group.items.length} {t.itemsUnit}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color={C.midGray} />
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
                            colors={['transparent', 'rgba(0,0,0,0.85)']}
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
                              <Ionicons name="close" size={12} color="#FFFFFF" />
                            </TouchableOpacity>
                          )}
                        </View>
                      );
                    })}

                  </ScrollView>

                  {/* Group footer */}
                  <View style={st.groupFooter}>
                    <View>
                      <Text style={st.subtotalLbl}>{t.subtotal}</Text>
                      <Text style={st.subtotalVal}>{fmtIDR(subtotal)}</Text>
                    </View>

                    {editMode ? (
                      <TouchableOpacity
                        style={[st.hapusBtn, groupPendingIds.length === 0 && st.hapusBtnDisabled]}
                        onPress={() => handleDeleteGroup(group.items, groupPendingIds)}
                        disabled={groupPendingIds.length === 0}
                      >
                        <Text style={[st.hapusBtnTxt, groupPendingIds.length === 0 && st.hapusBtnTxtDisabled]}>
                          {groupPendingIds.length > 0 ? `${t.delete} ${groupPendingIds.length} item` : t.selectItemsFirst}
                        </Text>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        onPress={() => handleBuyGroup(group.items)}
                        style={st.beliWrap}
                      >
                        <LinearGradient
                          colors={[C.primary, C.primary]}
                          style={st.beliBtn}
                        >
                          <Text style={st.beliBtnTxt}>{t.buyNow}</Text>
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
    </View>
  );
}
