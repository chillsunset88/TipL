/**
 * TipL — Profile / Account Tab
 * Tokopedia-inspired layout: left-aligned profile strip, wallet card,
 * transaction status shortcuts, jastip menu grid, account settings list.
 */

import { Avatar } from '@/src/components/ui/Avatar';
import { BorderRadius, Colors, Shadows, Spacing, Typography } from '@/src/lib/constants';
import { signOut } from '@/src/services/supabase/auth';
import { useAuthStore } from '@/src/store/authStore';
import { useWalletStore } from '@/src/store/walletStore';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
<<<<<<< Updated upstream
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/src/lib/constants';
import { Avatar } from '@/src/components/ui/Avatar';
import { Button } from '@/src/components/ui/Button';
import { MOCK_USERS, MOCK_ORDER } from '@/src/lib/mockData';

const currentUser = MOCK_USERS[1]; // Adriana V.

export default function ProfileScreen() {
  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
=======

const fmtIDR = (v: number) => 'Rp ' + v.toLocaleString('id-ID');

export default function ProfileScreen() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const { balance, points } = useWalletStore();

  const handleSignOut = () => {
    Alert.alert('Keluar Akun', 'Apakah kamu yakin ingin keluar?', [
      { text: 'Batal', style: 'cancel' },
>>>>>>> Stashed changes
      {
        text: 'Keluar',
        style: 'destructive',
<<<<<<< Updated upstream
        onPress: () => router.replace('/(auth)/login'),
=======
        onPress: async () => {
          try { await signOut(); } catch { }
          logout();
          router.replace('/(auth)/login');
        },
>>>>>>> Stashed changes
      },
    ]);
  };

<<<<<<< Updated upstream
=======
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

>>>>>>> Stashed changes
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
            <TouchableOpacity style={s.topIconBtn} onPress={() => router.push('/notifications')}>
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
              <Text style={s.walletVal} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.6}>{fmtIDR(balance)}</Text>
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
            <TouchableOpacity
              style={s.seeAllBtn}
              onPress={() => router.push('/profile/orders')}
            >
              <Text style={s.seeAllTxt}>Lihat Semua</Text>
              <Ionicons name="chevron-forward" size={13} color={Colors.primary} />
            </TouchableOpacity>
          </View>
          <View style={s.orderRow}>
            <OrderShortcut icon="time-outline" label="Belum Bayar" color={Colors.warning} onPress={() => router.push('/profile/orders')} />
            <OrderShortcut icon="refresh-circle-outline" label="Diproses" color={Colors.info} onPress={() => router.push('/profile/orders')} />
            <OrderShortcut icon="airplane-outline" label="Dikirim" color={Colors.primary} onPress={() => router.push('/profile/orders')} />
            <OrderShortcut icon="checkmark-circle-outline" label="Selesai" color={Colors.success} onPress={() => router.push('/profile/orders')} />
            <OrderShortcut icon="star-outline" label="Ulasan" color={Colors.charcoal} onPress={() => router.push('/profile/orders')} />
          </View>
        </View>

        {/* ── Jastip menu grid ── */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Jastip</Text>
          <View style={s.gridRow}>
            <GridItem icon="airplane-outline" label="Trip Saya" color={Colors.info} onPress={() => router.push('/profile/trips')} />
            <GridItem icon="add-circle-outline" label="Buat Trip" color={Colors.primary} onPress={() => router.push('/trip/create')} />
            <GridItem icon="heart-outline" label="Wishlist" color={Colors.error} onPress={() => router.push('/profile/wishlist')} />
            <GridItem icon="bag-handle-outline" label="Permintaan" color={Colors.warning} onPress={() => router.push('/request' as any)} />
          </View>
        </View>

        {/* ── Help & Support ── */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Bantuan</Text>
          <SettingRow icon="help-circle-outline" label="Pusat Bantuan" sub="FAQ & panduan penggunaan" onPress={() => { }} />
          <SettingRow icon="chatbubble-ellipses-outline" label="Hubungi Kami" sub="Chat dengan tim TipL" onPress={() => { }} />
          <SettingRow icon="document-text-outline" label="Syarat & Ketentuan" sub="Kebijakan privasi" onPress={() => { }} />
          <SettingRow icon="information-circle-outline" label="Tentang TipL" sub="Versi 1.0.0" onPress={() => { }} last />
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

function SettingRow({ icon, label, sub, onPress, last = false }: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  sub: string;
  onPress: () => void;
  last?: boolean;
}) {
  return (
    <TouchableOpacity
      style={[s.settingRow, !last && s.settingRowBorder]}
      activeOpacity={0.7}
      onPress={onPress}
    >
      <View style={s.settingIconBox}>
        <Ionicons name={icon} size={20} color={Colors.charcoal} />
      </View>
      <View style={s.settingInfo}>
        <Text style={s.settingLabel}>{label}</Text>
        <Text style={s.settingSub}>{sub}</Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color={Colors.gray} />
    </TouchableOpacity>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.offWhite },
  scroll: { flex: 1 },

  // Auth required
  authRequired: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing['2xl'] },
  authTitle: { fontFamily: Typography.serifBold.fontFamily, fontSize: Typography.sizes.xl, color: Colors.nearBlack, marginTop: Spacing.md },
  authSub: { fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.sm, color: Colors.darkGray, textAlign: 'center', marginTop: Spacing.sm, lineHeight: 20 },
  signInBtn: { marginTop: Spacing.xl, backgroundColor: Colors.primary, paddingHorizontal: Spacing['2xl'], paddingVertical: Spacing.md, borderRadius: BorderRadius.full },
  signInTxt: { fontFamily: Typography.semiBold.fontFamily, fontSize: Typography.sizes.base, color: Colors.white },

  // Top bar
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  topTitle: { fontFamily: Typography.serifBold.fontFamily, fontSize: Typography.sizes.xl, color: Colors.nearBlack },
  topActions: { flexDirection: 'row', gap: Spacing.xs },
  topIconBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: Colors.offWhite,
    alignItems: 'center', justifyContent: 'center',
  },

  // Profile strip (white bg, left-aligned like Tokopedia)
  profileStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.xl,
    backgroundColor: Colors.white,
    gap: Spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  profileInfo: { flex: 1 },
  profileName: {
    fontFamily: Typography.semiBold.fontFamily,
    fontSize: Typography.sizes.md,
    color: Colors.nearBlack,
  },
  profileEmail: {
    fontFamily: Typography.regular.fontFamily,
    fontSize: Typography.sizes.sm,
    color: Colors.darkGray,
    marginTop: 2,
  },
  editBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    marginTop: Spacing.xs,
    backgroundColor: Colors.primaryPale,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.primaryLight,
  },
  editBadgeTxt: { fontFamily: Typography.medium.fontFamily, fontSize: 11, color: Colors.primary },

  // Wallet card
  walletCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    marginHorizontal: Spacing.xl,
    marginTop: Spacing.md,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.lightGray,
    gap: Spacing.md,
    ...Shadows.sm,
  },
  walletSec: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  walletIconBox: {
    width: 36, height: 36, borderRadius: BorderRadius.sm,
    backgroundColor: Colors.cream,
    alignItems: 'center', justifyContent: 'center',
  },
  walletIconGold: { backgroundColor: Colors.primaryPale },
  walletVal: {
    fontFamily: Typography.bold.fontFamily,
    fontSize: Typography.sizes.sm,
    color: Colors.nearBlack,
  },
  walletLbl: {
    fontFamily: Typography.regular.fontFamily,
    fontSize: Typography.sizes.xs,
    color: Colors.darkGray,
    marginTop: 1,
  },
  walletDivider: { width: 1, height: 32, backgroundColor: Colors.lightGray },
  topUpPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: Colors.primaryPale,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  topUpTxt: { fontFamily: Typography.semiBold.fontFamily, fontSize: 11, color: Colors.primary },

  // Card container
  card: {
    backgroundColor: Colors.white,
    marginHorizontal: Spacing.xl,
    marginTop: Spacing.md,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.lightGray,
    ...Shadows.sm,
  },
  cardTitle: {
    fontFamily: Typography.semiBold.fontFamily,
    fontSize: Typography.sizes.base,
    color: Colors.nearBlack,
    marginBottom: Spacing.md,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  seeAllBtn: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  seeAllTxt: { fontFamily: Typography.medium.fontFamily, fontSize: Typography.sizes.sm, color: Colors.primary },

  // Order shortcuts row (Tokopedia-style)
  orderRow: { flexDirection: 'row', justifyContent: 'space-between' },
  orderShortcut: { flex: 1, alignItems: 'center', paddingHorizontal: 2 },
  orderIconCircle: {
    width: 50, height: 50, borderRadius: 25,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  orderIconLabel: {
    fontFamily: Typography.regular.fontFamily,
    fontSize: 10,
    color: Colors.charcoal,
    textAlign: 'center',
    lineHeight: 13,
  },

  // Jastip grid
  gridRow: { flexDirection: 'row', justifyContent: 'space-around' },
  gridItem: { alignItems: 'center', flex: 1, paddingVertical: Spacing.xs },
  gridIcon: {
    width: 54, height: 54,
    borderRadius: BorderRadius.lg,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  gridLabel: {
    fontFamily: Typography.medium.fontFamily,
    fontSize: Typography.sizes.xs,
    color: Colors.charcoal,
    textAlign: 'center',
  },

  // Settings rows (Tokopedia-style: icon + label + subtitle)
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    gap: Spacing.md,
  },
  settingRowBorder: { borderBottomWidth: 1, borderBottomColor: Colors.lightGray },
  settingIconBox: {
    width: 38, height: 38,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.offWhite,
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  settingInfo: { flex: 1 },
  settingLabel: {
    fontFamily: Typography.medium.fontFamily,
    fontSize: Typography.sizes.base,
    color: Colors.nearBlack,
  },
  settingSub: {
    fontFamily: Typography.regular.fontFamily,
    fontSize: Typography.sizes.xs,
    color: Colors.darkGray,
    marginTop: 2,
  },

  // Sign out
  signOutWrap: {
    alignItems: 'center',
    marginHorizontal: Spacing.xl,
    marginTop: Spacing.md,
    gap: Spacing.md,
  },
  signOutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
<<<<<<< Updated upstream
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: {
    fontFamily: Typography.medium.fontFamily,
    fontSize: Typography.sizes.sm,
    color: Colors.nearBlack,
  },

  // Menu
  menuCard: {
    backgroundColor: Colors.offWhite,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.lightGray,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.base,
    paddingHorizontal: Spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
    gap: Spacing.md,
  },
  menuLabel: {
    flex: 1,
    fontFamily: Typography.medium.fontFamily,
    fontSize: Typography.sizes.base,
    color: Colors.nearBlack,
  },
  menuBadge: {
    backgroundColor: '#FFF8E7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.primaryLight,
  },
  menuBadgeText: {
    fontFamily: Typography.medium.fontFamily,
    fontSize: 10,
    color: Colors.primary,
=======
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.errorLight,
    backgroundColor: Colors.errorLight,
    alignSelf: 'stretch',
    justifyContent: 'center',
  },
  signOutTxt: {
    fontFamily: Typography.semiBold.fontFamily,
    fontSize: Typography.sizes.base,
    color: Colors.error,
  },
  versionTxt: {
    fontFamily: Typography.regular.fontFamily,
    fontSize: Typography.sizes.xs,
    color: Colors.gray,
>>>>>>> Stashed changes
  },
});
