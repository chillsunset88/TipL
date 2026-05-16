/**
 * TipL — Profile / Account Tab
 * Tokopedia-inspired layout: left-aligned profile strip, wallet card,
 * transaction status shortcuts, jastip menu grid.
 */

import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Avatar } from '@/src/components/ui/Avatar';
import { BorderRadius, Colors, Shadows, Spacing, Typography } from '@/src/lib/constants';
import { useAuthStore } from '@/src/store/authStore';
import { signOut } from '@/src/services/supabase/auth';

export default function ProfileScreen() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

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
            <TouchableOpacity style={s.topIconBtn} onPress={() => router.push('/notifications')}>
              <Ionicons name="notifications-outline" size={22} color={Colors.nearBlack} />
            </TouchableOpacity>
            <TouchableOpacity style={s.topIconBtn} onPress={() => router.push('/profile/settings')}>
              <Ionicons name="settings-outline" size={22} color={Colors.nearBlack} />
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Pesanan & Wishlist ── */}
        <View style={s.card}>
          <ActionRow
            icon="receipt-outline"
            label="Pesanan Saya"
            color={Colors.primary}
            onPress={() => router.push('/profile/orders')}
          />
          <View style={s.actionDivider} />
          <ActionRow
            icon="heart-outline"
            label="Wishlist"
            color={Colors.error}
            onPress={() => router.push('/profile/wishlist')}
          />
        </View>

        {/* ── Jastip card (hanya jika sudah terverifikasi) ── */}
        {(user.verificationStatus === 'approved' || user.role === 'admin') ? (
          <View style={s.card}>
            <Text style={s.cardTitle}>Jastip</Text>
            <View style={s.gridRow}>
              <GridItem icon="airplane-outline"   label="Trip Saya"  color={Colors.info}    onPress={() => router.push('/profile/trips')} />
              <GridItem icon="add-circle-outline" label="Buat Trip"  color={Colors.primary} onPress={() => router.push('/trip/create')} />
              <GridItem icon="bag-handle-outline" label="Permintaan" color={Colors.warning} onPress={() => router.push('/request' as any)} />
            </View>
          </View>
        ) : user.verificationStatus === 'pending' ? (
          <VerificationPendingCard />
        ) : (
          <VerificationPromoCard rejected={user.verificationStatus === 'rejected'} />
        )}

        {/* ── Admin panel (hanya untuk role admin) ── */}
        {user.role === 'admin' && (
          <View style={s.card}>
            <Text style={s.cardTitle}>Admin</Text>
            <ActionRow
              icon="shield-checkmark-outline"
              label="Kelola Verifikasi"
              color={Colors.info}
              onPress={() => router.push('/admin/verifications' as any)}
            />
          </View>
        )}

        {/* ── Help & Support ── */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Bantuan</Text>
          <SettingRow icon="help-circle-outline"         label="Pusat Bantuan"      sub="FAQ & panduan penggunaan"  onPress={() => {}} />
          <SettingRow icon="chatbubble-ellipses-outline" label="Hubungi Kami"        sub="Chat dengan tim TipL"      onPress={() => {}} />
          <SettingRow icon="document-text-outline"       label="Syarat & Ketentuan"  sub="Kebijakan privasi"         onPress={() => {}} />
          <SettingRow icon="information-circle-outline"  label="Tentang TipL"        sub="Versi 1.0.0"               onPress={() => {}} last />
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

function VerificationPromoCard({ rejected }: { rejected: boolean }) {
  return (
    <View style={s.verifyCard}>
      <View style={s.verifyTop}>
        <View style={s.verifyIconWrap}>
          <Ionicons name="shield-checkmark-outline" size={28} color={Colors.primary} />
        </View>
        <View style={s.verifyTextWrap}>
          <Text style={s.verifyTitle}>Jadilah Jastiper</Text>
          <Text style={s.verifySub}>
            {rejected
              ? 'Verifikasi kamu ditolak. Coba ajukan kembali.'
              : 'Verifikasi identitasmu untuk mulai berjastip dan terima pesanan.'}
          </Text>
        </View>
      </View>
      {rejected && (
        <View style={s.rejectedPill}>
          <Ionicons name="close-circle" size={13} color={Colors.error} />
          <Text style={s.rejectedTxt}>Ditolak — ajukan ulang</Text>
        </View>
      )}
      <View style={s.verifyBenefits}>
        {['Buat & kelola trip sendiri', 'Terima pesanan dari tiper', 'Dapatkan penghasilan tambahan'].map((b) => (
          <View key={b} style={s.benefitRow}>
            <Ionicons name="checkmark-circle" size={14} color={Colors.success} />
            <Text style={s.benefitTxt}>{b}</Text>
          </View>
        ))}
      </View>
      <TouchableOpacity style={s.verifyBtn} onPress={() => router.push('/verification' as any)}>
        <Ionicons name="shield-checkmark" size={16} color={Colors.white} />
        <Text style={s.verifyBtnTxt}>{rejected ? 'Ajukan Ulang' : 'Mulai Verifikasi'}</Text>
      </TouchableOpacity>
    </View>
  );
}

function VerificationPendingCard() {
  return (
    <View style={[s.verifyCard, s.pendingCard]}>
      <View style={s.verifyTop}>
        <View style={[s.verifyIconWrap, { backgroundColor: `${Colors.warning}18` }]}>
          <Ionicons name="time-outline" size={28} color={Colors.warning} />
        </View>
        <View style={s.verifyTextWrap}>
          <Text style={s.verifyTitle}>Menunggu Verifikasi</Text>
          <Text style={s.verifySub}>
            Dokumenmu sedang ditinjau tim TipL. Proses membutuhkan 1–2 hari kerja.
          </Text>
        </View>
      </View>
      <View style={s.pendingPill}>
        <ActivityIndicator size="small" color={Colors.warning} style={{ transform: [{ scale: 0.7 }] }} />
        <Text style={s.pendingPillTxt}>Sedang ditinjau...</Text>
      </View>
    </View>
  );
}

function ActionRow({ icon, label, color, onPress }: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  color: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={s.actionRow} activeOpacity={0.7} onPress={onPress}>
      <View style={[s.actionIconBox, { backgroundColor: `${color}14` }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <Text style={s.actionLabel}>{label}</Text>
      <Ionicons name="chevron-forward" size={16} color={Colors.gray} />
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

  authRequired: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing['2xl'] },
  authTitle: { fontFamily: Typography.serifBold.fontFamily, fontSize: Typography.sizes.xl, color: Colors.nearBlack, marginTop: Spacing.md },
  authSub: { fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.sm, color: Colors.darkGray, textAlign: 'center', marginTop: Spacing.sm, lineHeight: 20 },
  signInBtn: { marginTop: Spacing.xl, backgroundColor: Colors.primary, paddingHorizontal: Spacing['2xl'], paddingVertical: Spacing.md, borderRadius: BorderRadius.full },
  signInTxt: { fontFamily: Typography.semiBold.fontFamily, fontSize: Typography.sizes.base, color: Colors.white },

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
    backgroundColor: Colors.offWhite,
    alignItems: 'center', justifyContent: 'center',
  },

  card: {
    backgroundColor: Colors.white, marginHorizontal: Spacing.xl, marginTop: Spacing.md,
    borderRadius: BorderRadius.lg, padding: Spacing.base,
    borderWidth: 1, borderColor: Colors.lightGray, ...Shadows.sm,
  },
  cardTitle: { fontFamily: Typography.semiBold.fontFamily, fontSize: Typography.sizes.base, color: Colors.nearBlack, marginBottom: Spacing.md },
  actionRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.md, gap: Spacing.md },
  actionIconBox: { width: 38, height: 38, borderRadius: BorderRadius.sm, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  actionLabel: { flex: 1, fontFamily: Typography.medium.fontFamily, fontSize: Typography.sizes.base, color: Colors.nearBlack },
  actionDivider: { height: 1, backgroundColor: Colors.lightGray },

  gridRow: { flexDirection: 'row', justifyContent: 'space-around' },
  gridItem: { alignItems: 'center', flex: 1, paddingVertical: Spacing.xs },
  gridIcon: { width: 54, height: 54, borderRadius: BorderRadius.lg, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.xs },
  gridLabel: { fontFamily: Typography.medium.fontFamily, fontSize: Typography.sizes.xs, color: Colors.charcoal, textAlign: 'center' },

  settingRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.md, gap: Spacing.md },
  settingRowBorder: { borderBottomWidth: 1, borderBottomColor: Colors.lightGray },
  settingIconBox: { width: 38, height: 38, borderRadius: BorderRadius.sm, backgroundColor: Colors.offWhite, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  settingInfo: { flex: 1 },
  settingLabel: { fontFamily: Typography.medium.fontFamily, fontSize: Typography.sizes.base, color: Colors.nearBlack },
  settingSub: { fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.xs, color: Colors.darkGray, marginTop: 2 },

  verifyCard: {
    backgroundColor: Colors.white, marginHorizontal: Spacing.xl, marginTop: Spacing.md,
    borderRadius: BorderRadius.lg, padding: Spacing.base,
    borderWidth: 1.5, borderColor: Colors.primaryLight, ...Shadows.sm, gap: Spacing.md,
  },
  pendingCard: { borderColor: `${Colors.warning}60` },
  verifyTop: { flexDirection: 'row', gap: Spacing.md, alignItems: 'flex-start' },
  verifyIconWrap: {
    width: 52, height: 52, borderRadius: BorderRadius.md,
    backgroundColor: Colors.primaryPale, alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  verifyTextWrap: { flex: 1, gap: 3 },
  verifyTitle: { fontFamily: Typography.semiBold.fontFamily, fontSize: Typography.sizes.base, color: Colors.nearBlack },
  verifySub: { fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.xs, color: Colors.darkGray, lineHeight: 17 },
  rejectedPill: {
    flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-start',
    backgroundColor: `${Colors.error}12`, paddingHorizontal: Spacing.sm, paddingVertical: 4,
    borderRadius: BorderRadius.full, borderWidth: 1, borderColor: `${Colors.error}30`,
  },
  rejectedTxt: { fontFamily: Typography.medium.fontFamily, fontSize: 11, color: Colors.error },
  verifyBenefits: { gap: 5 },
  benefitRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  benefitTxt: { fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.xs, color: Colors.charcoal },
  verifyBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm,
    backgroundColor: Colors.primary, paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full,
  },
  verifyBtnTxt: { fontFamily: Typography.semiBold.fontFamily, fontSize: Typography.sizes.base, color: Colors.white },
  pendingPill: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, alignSelf: 'flex-start',
    backgroundColor: `${Colors.warning}14`, paddingHorizontal: Spacing.md, paddingVertical: 6,
    borderRadius: BorderRadius.full, borderWidth: 1, borderColor: `${Colors.warning}40`,
  },
  pendingPillTxt: { fontFamily: Typography.medium.fontFamily, fontSize: Typography.sizes.xs, color: Colors.warning },

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
