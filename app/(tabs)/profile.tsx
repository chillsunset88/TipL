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
  const { t } = useSettingsStore();

  const verifyButtonLabel = user?.verificationStatus === 'rejected'
    ? t.verificationReapply
    : t.verificationStart;

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
          <Text style={s.authTitle}>{t.signedOutTitle}</Text>
          <Text style={s.authSub}>{t.signedOutDesc}</Text>
          <TouchableOpacity style={s.signInBtn} onPress={() => router.push('/(auth)/login' as any)}>
            <Text style={s.signInTxt}>{t.signInSignUp}</Text>
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
              label={t.myOrders}
              color={C.primary}
              onPress={() => router.push('/profile/orders')}
              s={s}
            />
            <GridItem
              icon="heart-outline"
              label={t.myWishlist}
              color={C.error}
              onPress={() => router.push('/profile/wishlist')}
              s={s}
            />
            <GridItem
              icon="star-outline"
              label={t.myFavorites}
              color={C.warning}
              onPress={() => router.push('/profile/favorites' as any)}
              s={s}
            />
          </View>
        </View>

        {/* ── Jastip card ── */}
        {(user.verificationStatus === 'approved' || user.role === 'admin') ? (
          <View style={s.card}>
            <Text style={s.cardTitle}>{t.jastipSection}</Text>
            <View style={s.gridRow}>
              <GridItem icon="airplane-outline" label={t.myTrips} color={C.info} onPress={() => router.push('/profile/trips')} s={s} />
              <GridItem icon="add-circle-outline" label={t.createTrip} color={C.primary} onPress={() => router.push('/trip/create')} s={s} />
              <GridItem icon="cube-outline" label={t.incomingOrders} color={C.success} onPress={() => router.push('/profile/incoming-orders' as any)} s={s} />
            </View>
          </View>
        ) : user.verificationStatus === 'pending' ? (
          <VerificationPendingCard s={s} C={C} />
        ) : (
          <VerificationPromoCard rejected={user.verificationStatus === 'rejected'} verifyButtonLabel={verifyButtonLabel} s={s} C={C} />
        )}

        {/* ── Admin panel ── */}
        {user.role === 'admin' && (
          <View style={s.card}>
            <Text style={s.cardTitle}>{t.adminPanel}</Text>
            <ActionRow
              icon="shield-checkmark-outline"
              label={t.manageVerification}
              color={C.info}
              onPress={() => router.push('/admin/verifications' as any)}
              s={s}
              C={C}
            />
            <ActionRow
              icon="cube-outline"
              label={t.manageOrdersDemo}
              color={C.warning}
              onPress={() => router.push('/admin/orders' as any)}
              s={s}
              C={C}
            />
          </View>
        )}

        {/* ── Help & Support ── */}
        <View style={s.card}>
          <Text style={s.cardTitle}>{t.helpSection}</Text>
          <SettingRow icon="help-circle-outline" label={t.helpCenter} sub={t.helpCenterSub} onPress={() => router.push('/help')} s={s} C={C} />
          <SettingRow icon="chatbubble-ellipses-outline" label={t.contactUs} sub={t.contactUsSub} onPress={() => {}} s={s} C={C} />
          <SettingRow
            icon="document-text-outline"
            label={t.termsPrivacy}
            sub={t.privacyPolicySub}
            onPress={() => router.push('/terms')}
            s={s}
            C={C}
          />
          <SettingRow icon="information-circle-outline" label={t.aboutApp} sub={t.appVersion} onPress={() => {}} last s={s} C={C} />
        </View>

        {/* ── Sign out ── */}
        <View style={s.signOutWrap}>
          <TouchableOpacity style={s.signOutRow} activeOpacity={0.7} onPress={handleSignOut}>
            <Ionicons name="log-out-outline" size={20} color={C.error} />
            <Text style={s.signOutTxt}>{t.signOut}</Text>
          </TouchableOpacity>
          <Text style={s.versionTxt}>{t.appVersion}</Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Sub-components ──────────────────────────────────────────────────────────────

function VerificationPromoCard({ rejected, verifyButtonLabel, s, C }: {
  rejected: boolean;
  verifyButtonLabel: string;
  s: any;
  C: ReturnType<typeof useThemeColors>;
}) {
  const { t } = useSettingsStore();
  return (
    <View style={s.verifyCard}>
      <View style={s.verifyTop}>
        <View style={s.verifyIconWrap}>
          <Ionicons name="shield-checkmark-outline" size={28} color={C.primary} />
        </View>
        <View style={s.verifyTextWrap}>
          <Text style={s.verifyTitle}>{t.becomeTripper}</Text>
          <Text style={s.verifySub}>
            {rejected ? t.verificationRejectedDesc : t.becomeTriperDesc}
          </Text>
        </View>
      </View>
      {rejected && (
        <View style={s.rejectedPill}>
          <Ionicons name="close-circle" size={13} color={C.error} />
          <Text style={s.rejectedTxt}>{t.verificationRejectedBadge}</Text>
        </View>
      )}
      <View style={s.verifyBenefits}>
        {[t.verificationBenefit1, t.verificationBenefit2, t.verificationBenefit3].map((b) => (
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

function VerificationPendingCard({ s, C }: { s: any; C: ReturnType<typeof useThemeColors> }) {
  const { t } = useSettingsStore();
  return (
    <View style={[s.verifyCard, s.pendingCard]}>
      <View style={s.verifyTop}>
        <View style={[s.verifyIconWrap, { backgroundColor: `${C.warning}18` }]}>
          <Ionicons name="time-outline" size={28} color={C.warning} />
        </View>
        <View style={s.verifyTextWrap}>
          <Text style={s.verifyTitle}>{t.pendingVerification}</Text>
          <Text style={s.verifySub}>{t.pendingVerificationDesc}</Text>
        </View>
      </View>
      <View style={s.pendingPill}>
        <ActivityIndicator size="small" color={C.warning} style={{ transform: [{ scale: 0.7 }] }} />
        <Text style={s.pendingPillTxt}>{t.pendingVerificationStatus}</Text>
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
