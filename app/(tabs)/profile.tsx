// app/(tabs)/profile.tsx — MERGED
/**
 * TipL — Profile / Account Tab
 * Tokopedia-inspired layout: left-aligned profile strip, wallet card,
 * transaction status shortcuts, jastip menu grid, account menu.
 */

import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Avatar } from '@/src/components/ui/Avatar';
import { BorderRadius, Colors, Shadows, Spacing, Typography } from '@/src/lib/constants';
import { useAuthStore } from '@/src/store/authStore';
import { useWalletStore } from '@/src/store/walletStore';
import { signOut } from '@/src/services/supabase/auth';

const fmtIDR = (v: number) => 'Rp ' + v.toLocaleString('id-ID');

export default function ProfileScreen() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const { balance, points } = useWalletStore();

  const handleSignOut = () => {
    Alert.alert('Keluar Akun', 'Apakah kamu yakin ingin keluar?', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Keluar',
        style: 'destructive',
        onPress: async () => {
          try { await signOut(); } catch {}
          logout();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  if (!user) {
    return (
      <SafeAreaView style={s.safe} edges={['top']}>
        <View style={s.authRequired}>
          <Ionicons name="person-circle-outline" size={64} color={Colors.midGray} />
          <Text style={s.authTitle}>Belum Masuk</Text>
          <Text style={s.authSub}>Masuk untuk melihat profil dan pesanan kamu</Text>
          <TouchableOpacity style={s.signInBtn} onPress={() => router.push('/(auth)/login' as any)}>
            <Text style={s.signInTxt}>Masuk / Daftar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>

        {/* ── Profile strip ── */}
        <View style={s.profileStrip}>
          <TouchableOpacity activeOpacity={0.85} onPress={() => router.push('/profile/edit')}>
            <Avatar uri={user.avatarUrl} name={user.displayName} size="lg" verified={user.verified} />
          </TouchableOpacity>
          <View style={s.profileInfo}>
            <Text style={s.profileName} numberOfLines={1}>{user.displayName}</Text>
            <Text style={s.profileEmail} numberOfLines={1}>{user.email}</Text>
            <TouchableOpacity
              style={s.editBadge}
              activeOpacity={0.75}
              onPress={() => router.push('/profile/edit')}
            >
              <Ionicons name="pencil-outline" size={11} color={Colors.primary} />
              <Text style={s.editBadgeTxt}>Ubah Profil</Text>
            </TouchableOpacity>
          </View>
          <View style={s.topActions}>
            <TouchableOpacity style={s.topIconBtn} onPress={() => router.push('/cart')}>
              <Ionicons name="cart-outline" size={22} color={Colors.nearBlack} />
            </TouchableOpacity>
            <TouchableOpacity style={s.topIconBtn} onPress={() => router.push('/profile/settings')}> {/*Belum ada route notification, sementara ganti jadi settings*/}
              <Ionicons name="notifications-outline" size={22} color={Colors.nearBlack} />
            </TouchableOpacity>
            <TouchableOpacity style={s.topIconBtn} onPress={() => router.push('/profile/settings')}>
              <Ionicons name="settings-outline" size={22} color={Colors.nearBlack} />
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Wallet card ── */}
        <View style={s.walletCard}>
          <View style={s.walletSec}>
            <View style={s.walletIconBox}>
              <Ionicons name="wallet-outline" size={18} color={Colors.primary} />
            </View>
            <View>
              <Text style={s.walletVal} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.6}>
                {fmtIDR(balance)}
              </Text>
              <Text style={s.walletLbl}>Saldo TipL</Text>
            </View>
          </View>
          <View style={s.walletDivider} />
          <View style={s.walletSec}>
            <View style={[s.walletIconBox, s.walletIconGold]}>
              <Ionicons name="star" size={18} color={Colors.primary} />
            </View>
            <View>
              <Text style={s.walletVal}>{points.toLocaleString()}</Text>
              <Text style={s.walletLbl}>Poin</Text>
            </View>
          </View>
          <TouchableOpacity style={s.topUpPill} onPress={() => router.push('/wallet/topup' as any)}>
            <Ionicons name="add" size={12} color={Colors.primary} />
            <Text style={s.topUpTxt}>Top Up</Text>
          </TouchableOpacity>
        </View>

        {/* ── Pesanan Saya ── */}
        <View style={s.card}>
          <View style={s.cardHeaderRow}>
            <Text style={s.cardTitle}>Pesanan Saya</Text>
            <TouchableOpacity style={s.seeAllBtn} onPress={() => router.push('/profile/orders')}>
              <Text style={s.seeAllTxt}>Lihat Semua</Text>
              <Ionicons name="chevron-forward" size={13} color={Colors.primary} />
            </TouchableOpacity>
          </View>
          <View style={s.orderRow}>
            <OrderShortcut icon="time-outline"             label="Belum Bayar"  color={Colors.warning}  onPress={() => router.push('/profile/orders')} />
            <OrderShortcut icon="refresh-circle-outline"   label="Diproses"     color={Colors.info}     onPress={() => router.push('/profile/orders')} />
            <OrderShortcut icon="airplane-outline"         label="Dikirim"      color={Colors.primary}  onPress={() => router.push('/profile/orders')} />
            <OrderShortcut icon="checkmark-circle-outline" label="Selesai"      color={Colors.success}  onPress={() => router.push('/profile/orders')} />
            <OrderShortcut icon="star-outline"             label="Ulasan"       color={Colors.charcoal} onPress={() => router.push('/profile/orders')} />
          </View>
        </View>

        {/* ── Jastip menu grid ── */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Jastip</Text>
          <View style={s.gridRow}>
            <GridItem icon="airplane-outline"   label="Trip Saya"  color={Colors.info}    onPress={() => router.push('/profile/trips')} />
            <GridItem icon="add-circle-outline" label="Buat Trip"  color={Colors.primary} onPress={() => router.push('/trip/create')} />
            <GridItem icon="heart-outline"      label="Wishlist"   color={Colors.error}   onPress={() => router.push('/profile/wishlist')} />
            <GridItem icon="bag-handle-outline" label="Permintaan" color={Colors.warning} onPress={() => router.push('/request' as any)} />
          </View>
        </View>

        {/* ── Account (dari main) ── */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Account</Text>
          <MenuItem icon="person-outline"           label="Edit Profile"      onPress={() => router.push('/profile/edit')} />
          <MenuItem icon="card-outline"             label="Payment Methods"   onPress={() => router.push('/profile/payments')} />
          <MenuItem icon="shield-checkmark-outline" label="Verification"      badge="Verified" onPress={() => {}} />
          <MenuItem icon="notifications-outline"    label="Notifications"     onPress={() => router.push('/profile/settings')} />
          <MenuItem icon="help-circle-outline"      label="Help & Support"    onPress={() => {}} />
          <MenuItem icon="document-text-outline"    label="Terms & Privacy"   onPress={() => {}} last />
        </View>

        {/* ── Sign out ── */}
        <View style={s.signOutWrap}>
          <TouchableOpacity style={s.signOutRow} activeOpacity={0.7} onPress={handleSignOut}>
            <Ionicons name="log-out-outline" size={20} color={Colors.error} />
            <Text style={s.signOutTxt}>Keluar Akun</Text>
          </TouchableOpacity>
          <Text style={s.versionTxt}>TipL v1.0.0</Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function OrderShortcut({ icon, label, color, onPress }: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  color: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={s.orderShortcut} activeOpacity={0.7} onPress={onPress}>
      <View style={[s.orderIconCircle, { backgroundColor: `${color}18` }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <Text style={s.orderIconLabel} numberOfLines={2}>{label}</Text>
    </TouchableOpacity>
  );
}

function GridItem({ icon, label, color, onPress }: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  color: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={s.gridItem} activeOpacity={0.7} onPress={onPress}>
      <View style={[s.gridIcon, { backgroundColor: `${color}14` }]}>
        <Ionicons name={icon} size={26} color={color} />
      </View>
      <Text style={s.gridLabel} numberOfLines={1}>{label}</Text>
    </TouchableOpacity>
  );
}

function MenuItem({ icon, label, badge, onPress, last = false }: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  badge?: string;
  onPress: () => void;
  last?: boolean;
}) {
  return (
    <TouchableOpacity
      style={[s.menuItem, !last && s.menuItemBorder]}
      activeOpacity={0.7}
      onPress={onPress}
    >
      <Ionicons name={icon} size={22} color={Colors.charcoal} />
      <Text style={s.menuLabel}>{label}</Text>
      {badge && (
        <View style={s.menuBadge}>
          <Text style={s.menuBadgeText}>{badge}</Text>
        </View>
      )}
      <Ionicons name="chevron-forward" size={18} color={Colors.gray} />
    </TouchableOpacity>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.offWhite },
  scroll: { flex: 1 },

  authRequired: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing['2xl'] },
  authTitle: { fontFamily: Typography.serifBold.fontFamily, fontSize: Typography.sizes.xl, color: Colors.nearBlack, marginTop: Spacing.md },
  authSub: { fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.sm, color: Colors.darkGray, textAlign: 'center', marginTop: Spacing.sm, lineHeight: 20 },
  signInBtn: { marginTop: Spacing.xl, backgroundColor: Colors.primary, paddingHorizontal: Spacing['2xl'], paddingVertical: Spacing.md, borderRadius: BorderRadius.full },
  signInTxt: { fontFamily: Typography.semiBold.fontFamily, fontSize: Typography.sizes.base, color: Colors.white },

  profileStrip: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: Spacing.xl, paddingVertical: Spacing.xl,
    backgroundColor: Colors.white, gap: Spacing.base,
    borderBottomWidth: 1, borderBottomColor: Colors.lightGray,
  },
  profileInfo: { flex: 1 },
  profileName: { fontFamily: Typography.semiBold.fontFamily, fontSize: Typography.sizes.md, color: Colors.nearBlack },
  profileEmail: { fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.sm, color: Colors.darkGray, marginTop: 2 },
  editBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start',
    marginTop: Spacing.xs, backgroundColor: Colors.primaryPale,
    paddingHorizontal: Spacing.sm, paddingVertical: 3,
    borderRadius: BorderRadius.full, borderWidth: 1, borderColor: Colors.primaryLight,
  },
  editBadgeTxt: { fontFamily: Typography.medium.fontFamily, fontSize: 11, color: Colors.primary },
  topActions: { flexDirection: 'row', gap: Spacing.xs },
  topIconBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.offWhite, alignItems: 'center', justifyContent: 'center',
  },

  walletCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.white,
    marginHorizontal: Spacing.xl, marginTop: Spacing.md,
    borderRadius: BorderRadius.lg, padding: Spacing.base,
    borderWidth: 1, borderColor: Colors.lightGray,
    gap: Spacing.md, ...Shadows.sm,
  },
  walletSec: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  walletIconBox: { width: 36, height: 36, borderRadius: BorderRadius.sm, backgroundColor: Colors.cream, alignItems: 'center', justifyContent: 'center' },
  walletIconGold: { backgroundColor: Colors.primaryPale },
  walletVal: { fontFamily: Typography.bold.fontFamily, fontSize: Typography.sizes.sm, color: Colors.nearBlack },
  walletLbl: { fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.xs, color: Colors.darkGray, marginTop: 1 },
  walletDivider: { width: 1, height: 32, backgroundColor: Colors.lightGray },
  topUpPill: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: Colors.primaryPale,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full, borderWidth: 1, borderColor: Colors.primary,
  },
  topUpTxt: { fontFamily: Typography.semiBold.fontFamily, fontSize: 11, color: Colors.primary },

  card: {
    backgroundColor: Colors.white, marginHorizontal: Spacing.xl, marginTop: Spacing.md,
    borderRadius: BorderRadius.lg, padding: Spacing.base,
    borderWidth: 1, borderColor: Colors.lightGray, ...Shadows.sm,
  },
  cardTitle: { fontFamily: Typography.semiBold.fontFamily, fontSize: Typography.sizes.base, color: Colors.nearBlack, marginBottom: Spacing.md },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  seeAllBtn: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  seeAllTxt: { fontFamily: Typography.medium.fontFamily, fontSize: Typography.sizes.sm, color: Colors.primary },

  orderRow: { flexDirection: 'row', justifyContent: 'space-between' },
  orderShortcut: { flex: 1, alignItems: 'center', paddingHorizontal: 2 },
  orderIconCircle: { width: 50, height: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.xs },
  orderIconLabel: { fontFamily: Typography.regular.fontFamily, fontSize: 10, color: Colors.charcoal, textAlign: 'center', lineHeight: 13 },

  gridRow: { flexDirection: 'row', justifyContent: 'space-around' },
  gridItem: { alignItems: 'center', flex: 1, paddingVertical: Spacing.xs },
  gridIcon: { width: 54, height: 54, borderRadius: BorderRadius.lg, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.xs },
  gridLabel: { fontFamily: Typography.medium.fontFamily, fontSize: Typography.sizes.xs, color: Colors.charcoal, textAlign: 'center' },

  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.base, gap: Spacing.md },
  menuItemBorder: { borderBottomWidth: 1, borderBottomColor: Colors.lightGray },
  menuLabel: { flex: 1, fontFamily: Typography.medium.fontFamily, fontSize: Typography.sizes.base, color: Colors.nearBlack },
  menuBadge: { backgroundColor: '#FFF8E7', paddingHorizontal: 8, paddingVertical: 2, borderRadius: BorderRadius.full, borderWidth: 1, borderColor: Colors.primaryLight },
  menuBadgeText: { fontFamily: Typography.medium.fontFamily, fontSize: 10, color: Colors.primary },

  signOutWrap: { alignItems: 'center', marginHorizontal: Spacing.xl, marginTop: Spacing.md, gap: Spacing.md },
  signOutRow: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    paddingVertical: Spacing.md, paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.md, borderWidth: 1,
    borderColor: Colors.errorLight, backgroundColor: Colors.errorLight,
    alignSelf: 'stretch', justifyContent: 'center',
  },
  signOutTxt: { fontFamily: Typography.semiBold.fontFamily, fontSize: Typography.sizes.base, color: Colors.error },
  versionTxt: { fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.xs, color: Colors.gray },
});