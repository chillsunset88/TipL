/**
 * TipL — Profile / Account Tab
 * Theme-aware: supports Dark Mode & Light Mode via useThemeColors.
 */

import { Avatar } from '@/src/components/ui/Avatar';
import { BorderRadius, Shadows, Spacing, Typography } from '@/src/lib/constants';
import { useThemeColors } from '@/src/lib/hooks/useThemeColors';
import { signOut } from '@/src/services/supabase/auth';
import { useAuthStore } from '@/src/store/authStore';
import { useSettingsStore } from '@/src/store/settingsStore';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProfileScreen() {
  const C = useThemeColors();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const { t, locale } = useSettingsStore();

  const copy = locale === 'id' ? {
    signedOutTitle: 'Belum Masuk',
    signedOutDesc: 'Masuk untuk melihat profil dan pesanan kamu',
    signInSignUp: 'Masuk / Daftar',
    jastipTitle: 'Jastip',
    incomingOrdersLabel: 'Pesanan Masuk',
    orderGridLabel: 'Pesanan Saya',
    wishlistGridLabel: 'Wishlist',
    favoritesGridLabel: 'Tripper Favorit',
    verificationTitle: 'Jadilah Jastiper',
    verificationDesc: 'Verifikasi identitasmu untuk mulai berjastip dan terima pesanan.',
    verificationRejectedDesc: 'Verifikasi kamu ditolak. Coba ajukan kembali.',
    verificationRejectedBadge: 'Ditolak — ajukan ulang',
    verificationBenefits: [
      'Buat & kelola trip sendiri',
      'Terima pesanan dari tiper',
      'Dapatkan penghasilan tambahan',
    ],
    verificationReapplyText: 'Ajukan Ulang',
    verificationStartText: 'Mulai Verifikasi',
    pendingTitle: 'Menunggu Verifikasi',
    pendingDesc: 'Dokumenmu sedang ditinjau tim TipL. Proses membutuhkan 1–2 hari kerja.',
    pendingStatus: 'Sedang ditinjau...',
    helpTitle: 'Bantuan',
    helpCenterLabel: 'Pusat Bantuan',
    contactUsLabel: 'Hubungi Kami',
    termsLabel: 'Syarat & Ketentuan',
    termsSub: 'Kebijakan privasi',
    aboutAppLabel: 'Tentang TipL',
    versionLabel: 'Versi 1.0.0',
    adminPanelLabel: 'Admin',
    manageVerification: 'Kelola Verifikasi',
    manageOrders: 'Kelola Paket (Demo)',
  } : {
    signedOutTitle: 'Not signed in',
    signedOutDesc: 'Sign in to view your profile and orders',
    signInSignUp: 'Sign In / Sign Up',
    jastipTitle: 'Jastip',
    incomingOrdersLabel: 'Incoming Orders',
    orderGridLabel: t.myOrders,
    wishlistGridLabel: t.myWishlist,
    favoritesGridLabel: t.myFavorites,
    verificationTitle: 'Become a Tripper',
    verificationDesc: 'Verify your identity to start accepting requests and earning.',
    verificationRejectedDesc: 'Your verification was rejected. Please reapply.',
    verificationRejectedBadge: 'Rejected — reapply now',
    verificationBenefits: [
      'Create & manage trips',
      'Accept orders from buyers',
      'Earn extra income',
    ],
    verificationReapplyText: 'Reapply',
    verificationStartText: 'Start Verification',
    pendingTitle: 'Waiting for Review',
    pendingDesc: 'Your documents are under review. This usually takes 1–2 business days.',
    pendingStatus: 'Under review...',
    helpTitle: 'Help',
    helpCenterLabel: 'Help Center',
    contactUsLabel: 'Contact Us',
    termsLabel: 'Terms & Privacy',
    termsSub: 'Privacy policy',
    aboutAppLabel: 'About TipL',
    versionLabel: 'Version 1.0.0',
    adminPanelLabel: 'Admin',
    manageVerification: 'Manage Verification',
    manageOrders: 'Manage Orders (Demo)',
  };

  const verifyButtonLabel = user?.verificationStatus === 'rejected'
    ? copy.verificationReapplyText
    : copy.verificationStartText;

  const handleSignOut = () => {
    Alert.alert(t.signOut, t.signOutConfirm, [
      { text: t.cancel, style: 'cancel' },
      {
        text: t.signOut,
        style: 'destructive',
        onPress: async () => {
          try { await signOut(); } catch {}
          logout();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  // Dynamic styles based on active theme
  const s = React.useMemo(() => StyleSheet.create({
    safe: { flex: 1, backgroundColor: C.offWhite },
    scroll: { flex: 1 },

    authRequired: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing['2xl'] },
    authTitle: { fontFamily: Typography.serifBold.fontFamily, fontSize: Typography.sizes.xl, color: C.nearBlack, marginTop: Spacing.md },
    authSub: { fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.sm, color: C.darkGray, textAlign: 'center', marginTop: Spacing.sm, lineHeight: 20 },
    signInBtn: { marginTop: Spacing.xl, backgroundColor: C.primary, paddingHorizontal: Spacing['2xl'], paddingVertical: Spacing.md, borderRadius: BorderRadius.full },
    signInTxt: { fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.base, color: '#FFFFFF' },

    profileStrip: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: Spacing.xl,
      paddingVertical: Spacing.xl,
      backgroundColor: C.white,
      gap: Spacing.base,
      marginHorizontal: Spacing.xl,
      marginTop: Spacing.md,
      borderRadius: BorderRadius.lg,
      borderWidth: 1,
      borderColor: C.lightGray,
      ...Shadows.sm,
    },
    profileInfo: { flex: 1 },
    profileName: { fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.md, color: C.nearBlack },
    profileEmail: { fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.sm, color: C.darkGray, marginTop: 2 },
    editBadge: {
      flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start',
      marginTop: Spacing.xs, backgroundColor: C.primaryPale,
      paddingHorizontal: Spacing.sm, paddingVertical: 3,
      borderRadius: BorderRadius.full, borderWidth: 1, borderColor: C.primaryLight,
    },
    editBadgeTxt: { fontFamily: Typography.medium.fontFamily, fontSize: 11, color: C.primary },
    topActions: { flexDirection: 'row', gap: Spacing.xs },
    topIconBtn: {
      width: 36, height: 36, borderRadius: 18,
      backgroundColor: C.offWhite,
      alignItems: 'center', justifyContent: 'center',
    },

    card: {
      backgroundColor: C.white, marginHorizontal: Spacing.xl, marginTop: Spacing.md,
      borderRadius: BorderRadius.lg, padding: Spacing.base,
      borderWidth: 1, borderColor: C.lightGray, ...Shadows.sm,
    },
    cardTitle: { fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.base, color: C.nearBlack, marginBottom: Spacing.md },
    actionRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.md, gap: Spacing.md },
    actionRowBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.lightGray },
    actionIconBox: { width: 38, height: 38, borderRadius: BorderRadius.sm, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
    actionLabel: { fontFamily: Typography.medium.fontFamily, fontSize: Typography.sizes.base, color: C.nearBlack },
    actionSub: { fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.xs, color: C.darkGray, marginTop: 1 },
    actionDivider: { height: 1, backgroundColor: C.lightGray },

    gridRow: { flexDirection: 'row', justifyContent: 'space-around' },
    gridDivider: { height: 1, backgroundColor: C.lightGray, marginVertical: Spacing.sm },
    gridItem: { alignItems: 'center', flex: 1, paddingVertical: Spacing.xs },
    gridIcon: { width: 54, height: 54, borderRadius: BorderRadius.lg, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.xs },
    gridLabel: { fontFamily: Typography.medium.fontFamily, fontSize: Typography.sizes.xs, color: C.charcoal, textAlign: 'center' },

    settingRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.md, gap: Spacing.md },
    settingRowBorder: { borderBottomWidth: 1, borderBottomColor: C.lightGray },
    settingIconBox: { width: 38, height: 38, borderRadius: BorderRadius.sm, backgroundColor: C.offWhite, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
    settingInfo: { flex: 1 },
    settingLabel: { fontFamily: Typography.medium.fontFamily, fontSize: Typography.sizes.base, color: C.nearBlack },
    settingSub: { fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.xs, color: C.darkGray, marginTop: 2 },

    verifyCard: {
      backgroundColor: C.white, marginHorizontal: Spacing.xl, marginTop: Spacing.md,
      borderRadius: BorderRadius.lg, padding: Spacing.base,
      borderWidth: 1.5, borderColor: C.primaryLight, ...Shadows.sm, gap: Spacing.md,
    },
    pendingCard: { borderColor: `${C.warning}60` },
    verifyTop: { flexDirection: 'row', gap: Spacing.md, alignItems: 'flex-start' },
    verifyIconWrap: {
      width: 52, height: 52, borderRadius: BorderRadius.md,
      backgroundColor: C.primaryPale, alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    },
    verifyTextWrap: { flex: 1, gap: 3 },
    verifyTitle: { fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.base, color: C.nearBlack },
    verifySub: { fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.xs, color: C.darkGray, lineHeight: 17 },
    rejectedPill: {
      flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-start',
      backgroundColor: `${C.error}12`, paddingHorizontal: Spacing.sm, paddingVertical: 4,
      borderRadius: BorderRadius.full, borderWidth: 1, borderColor: `${C.error}30`,
    },
    rejectedTxt: { fontFamily: Typography.medium.fontFamily, fontSize: 11, color: C.error },
    verifyBenefits: { gap: 5 },
    benefitRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
    benefitTxt: { fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.xs, color: C.charcoal },
    verifyBtn: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm,
      backgroundColor: C.primary, paddingVertical: Spacing.md,
      borderRadius: BorderRadius.full,
    },
    verifyBtnTxt: { fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.base, color: '#FFFFFF' },
    pendingPill: {
      flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, alignSelf: 'flex-start',
      backgroundColor: `${C.warning}14`, paddingHorizontal: Spacing.md, paddingVertical: 6,
      borderRadius: BorderRadius.full, borderWidth: 1, borderColor: `${C.warning}40`,
    },
    pendingPillTxt: { fontFamily: Typography.medium.fontFamily, fontSize: Typography.sizes.xs, color: C.warning },

    signOutWrap: { alignItems: 'center', marginHorizontal: Spacing.xl, marginTop: Spacing.md, gap: Spacing.md },
    signOutRow: {
      flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
      paddingVertical: Spacing.md, paddingHorizontal: Spacing.xl,
      borderRadius: BorderRadius.md, borderWidth: 1,
      borderColor: C.errorLight, backgroundColor: C.errorLight,
      alignSelf: 'stretch', justifyContent: 'center',
    },
    signOutTxt: { fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.base, color: C.error },
    versionTxt: { fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.xs, color: C.gray },
  }), [C]);

  if (!user) {
    return (
      <SafeAreaView style={s.safe} edges={['top']}>
        <View style={s.authRequired}>
          <Ionicons name="person-circle-outline" size={64} color={C.midGray} />
          <Text style={s.authTitle}>{copy.signedOutTitle}</Text>
          <Text style={s.authSub}>{copy.signedOutDesc}</Text>
          <TouchableOpacity style={s.signInBtn} onPress={() => router.push('/(auth)/login' as any)}>
            <Text style={s.signInTxt}>{copy.signInSignUp}</Text>
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
              <Ionicons name="pencil-outline" size={11} color={C.primary} />
              <Text style={s.editBadgeTxt}>{t.editProfile}</Text>
            </TouchableOpacity>
          </View>
          <View style={s.topActions}>
            <TouchableOpacity style={s.topIconBtn} onPress={() => router.push('/cart')}>
              <Ionicons name="cart-outline" size={22} color={C.nearBlack} />
            </TouchableOpacity>
            <TouchableOpacity style={s.topIconBtn} onPress={() => router.push('/notifications')}>
              <Ionicons name="notifications-outline" size={22} color={C.nearBlack} />
            </TouchableOpacity>
            <TouchableOpacity style={s.topIconBtn} onPress={() => router.push('/profile/settings')}>
              <Ionicons name="settings-outline" size={22} color={C.nearBlack} />
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Wishlist, Pesanan & Tripper Favorit ── */}
        <View style={s.card}>
          <View style={s.gridRow}>
            <GridItem
              icon="receipt-outline"
              label={copy.orderGridLabel}
              color={C.primary}
              onPress={() => router.push('/profile/orders')}
              s={s}
            />
            <GridItem
              icon="heart-outline"
              label={copy.wishlistGridLabel}
              color={C.error}
              onPress={() => router.push('/profile/wishlist')}
              s={s}
            />
            <GridItem
              icon="star-outline"
              label={copy.favoritesGridLabel}
              color={C.warning}
              onPress={() => router.push('/profile/favorites' as any)}
              s={s}
            />
          </View>
        </View>

        {/* ── Jastip card ── */}
        {(user.verificationStatus === 'approved' || user.role === 'admin') ? (
          <View style={s.card}>
            <Text style={s.cardTitle}>{copy.jastipTitle}</Text>
            <View style={s.gridRow}>
              <GridItem icon="airplane-outline" label={t.myTrips} color={C.info} onPress={() => router.push('/profile/trips')} s={s} />
              <GridItem icon="add-circle-outline" label={t.createTrip} color={C.primary} onPress={() => router.push('/trip/create')} s={s} />
              <GridItem icon="cube-outline" label={copy.incomingOrdersLabel} color={C.success} onPress={() => router.push('/profile/incoming-orders' as any)} s={s} />
            </View>
          </View>
        ) : user.verificationStatus === 'pending' ? (
          <VerificationPendingCard copy={copy} s={s} C={C} />
        ) : (
          <VerificationPromoCard rejected={user.verificationStatus === 'rejected'} copy={copy} verifyButtonLabel={verifyButtonLabel} s={s} C={C} />
        )}

        {/* ── Admin panel ── */}
        {user.role === 'admin' && (
          <View style={s.card}>
            <Text style={s.cardTitle}>{copy.adminPanelLabel}</Text>
            <ActionRow
              icon="shield-checkmark-outline"
              label={copy.manageVerification}
              color={C.info}
              onPress={() => router.push('/admin/verifications' as any)}
              s={s}
              C={C}
            />
            <ActionRow
              icon="cube-outline"
              label={copy.manageOrders}
              color={C.warning}
              onPress={() => router.push('/admin/orders' as any)}
              s={s}
              C={C}
            />
          </View>
        )}

        {/* ── Help & Support ── */}
        <View style={s.card}>
          <Text style={s.cardTitle}>{copy.helpTitle}</Text>
          <SettingRow icon="help-circle-outline" label={copy.helpCenterLabel} sub={locale === 'id' ? 'FAQ & panduan penggunaan' : 'FAQ & usage guide'} onPress={() => router.push('/help')} s={s} C={C} />
          <SettingRow icon="chatbubble-ellipses-outline" label={copy.contactUsLabel} sub={locale === 'id' ? 'Chat dengan tim TipL' : 'Chat with TipL support'} onPress={() => {}} s={s} C={C} />
          <SettingRow
            icon="document-text-outline"
            label={copy.termsLabel}
            sub={copy.termsSub}
            onPress={() => router.push('/terms')}
            s={s}
            C={C}
          />
          <SettingRow icon="information-circle-outline" label={copy.aboutAppLabel} sub={copy.versionLabel} onPress={() => {}} last s={s} C={C} />
        </View>

        {/* ── Sign out ── */}
        <View style={s.signOutWrap}>
          <TouchableOpacity style={s.signOutRow} activeOpacity={0.7} onPress={handleSignOut}>
            <Ionicons name="log-out-outline" size={20} color={C.error} />
            <Text style={s.signOutTxt}>{t.signOut}</Text>
          </TouchableOpacity>
          <Text style={s.versionTxt}>{copy.versionLabel}</Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Sub-components ──────────────────────────────────────────────────────────────

function VerificationPromoCard({ rejected, copy, verifyButtonLabel, s, C }: {
  rejected: boolean;
  copy: any;
  verifyButtonLabel: string;
  s: any;
  C: ReturnType<typeof useThemeColors>;
}) {
  return (
    <View style={s.verifyCard}>
      <View style={s.verifyTop}>
        <View style={s.verifyIconWrap}>
          <Ionicons name="shield-checkmark-outline" size={28} color={C.primary} />
        </View>
        <View style={s.verifyTextWrap}>
          <Text style={s.verifyTitle}>{copy.verificationTitle}</Text>
          <Text style={s.verifySub}>
            {rejected ? copy.verificationRejectedDesc : copy.verificationDesc}
          </Text>
        </View>
      </View>
      {rejected && (
        <View style={s.rejectedPill}>
          <Ionicons name="close-circle" size={13} color={C.error} />
          <Text style={s.rejectedTxt}>{copy.verificationRejectedBadge}</Text>
        </View>
      )}
      <View style={s.verifyBenefits}>
        {copy.verificationBenefits.map((b: string) => (
          <View key={b} style={s.benefitRow}>
            <Ionicons name="checkmark-circle" size={14} color={C.success} />
            <Text style={s.benefitTxt}>{b}</Text>
          </View>
        ))}
      </View>
      <TouchableOpacity style={s.verifyBtn} onPress={() => router.push('/verification' as any)}>
        <Ionicons name="shield-checkmark" size={16} color="#FFFFFF" />
        <Text style={s.verifyBtnTxt}>{verifyButtonLabel}</Text>
      </TouchableOpacity>
    </View>
  );
}

function VerificationPendingCard({ copy, s, C }: { copy: any; s: any; C: ReturnType<typeof useThemeColors> }) {
  return (
    <View style={[s.verifyCard, s.pendingCard]}>
      <View style={s.verifyTop}>
        <View style={[s.verifyIconWrap, { backgroundColor: `${C.warning}18` }]}>
          <Ionicons name="time-outline" size={28} color={C.warning} />
        </View>
        <View style={s.verifyTextWrap}>
          <Text style={s.verifyTitle}>{copy.pendingTitle}</Text>
          <Text style={s.verifySub}>{copy.pendingDesc}</Text>
        </View>
      </View>
      <View style={s.pendingPill}>
        <ActivityIndicator size="small" color={C.warning} style={{ transform: [{ scale: 0.7 }] }} />
        <Text style={s.pendingPillTxt}>{copy.pendingStatus}</Text>
      </View>
    </View>
  );
}

function ActionRow({ icon, label, sub, color, onPress, last = false, s, C }: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  sub?: string;
  color: string;
  onPress: () => void;
  last?: boolean;
  s: any;
  C: ReturnType<typeof useThemeColors>;
}) {
  return (
    <TouchableOpacity
      style={[s.actionRow, !last && s.actionRowBorder]}
      activeOpacity={0.7}
      onPress={onPress}
    >
      <View style={[s.actionIconBox, { backgroundColor: `${color}14` }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={s.actionLabel}>{label}</Text>
        {sub ? <Text style={s.actionSub}>{sub}</Text> : null}
      </View>
      <Ionicons name="chevron-forward" size={16} color={C.gray} />
    </TouchableOpacity>
  );
}

function GridItem({ icon, label, color, onPress, s }: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  color: string;
  onPress: () => void;
  s: any;
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

function SettingRow({ icon, label, sub, onPress, last = false, s, C }: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  sub: string;
  onPress: () => void;
  last?: boolean;
  s: any;
  C: ReturnType<typeof useThemeColors>;
}) {
  return (
    <TouchableOpacity
      style={[s.settingRow, !last && s.settingRowBorder]}
      activeOpacity={0.7}
      onPress={onPress}
    >
      <View style={s.settingIconBox}>
        <Ionicons name={icon} size={20} color={C.charcoal} />
      </View>
      <View style={s.settingInfo}>
        <Text style={s.settingLabel}>{label}</Text>
        <Text style={s.settingSub}>{sub}</Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color={C.gray} />
    </TouchableOpacity>
  );
}
