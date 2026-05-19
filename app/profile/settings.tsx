/**
 * TipL — Settings Screen
 * Supports Dark Mode / Light Mode via settingsStore theme toggle.
 */

import { PageHeader } from '@/src/components/ui/PageHeader';
import { BorderRadius, Spacing, Typography } from '@/src/lib/constants';
import { useThemeColors } from '@/src/lib/hooks/useThemeColors';
import { checkBiometricAvailable, useBiometric } from '@/src/lib/hooks/useBiometric';
import { Locale } from '@/src/lib/i18n';
import { signOut } from '@/src/services/supabase/auth';
import { useAuthStore } from '@/src/store/authStore';
import { useSettingsStore, AppTheme } from '@/src/store/settingsStore';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SettingsScreen() {
  const C = useThemeColors();
  const [pushNotifications, setPushNotifications] = React.useState(true);
  const [orderUpdates, setOrderUpdates] = React.useState(true);
  const [chatNotifications, setChatNotifications] = React.useState(true);
  const [biometricSupported, setBiometricSupported] = React.useState(false);
  const [biometricType, setBiometricType] = React.useState('Sidik Jari');

  const { locale, setLocale, t, theme, setTheme } = useSettingsStore();
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);
  const verificationStatus = user?.verificationStatus ?? 'none';
  const { isEnabled, enable, disable } = useBiometric();
  const isDark = theme === 'dark';

  const verificationLabel = (() => {
    if (verificationStatus === 'approved') return t.verifiedStatus;
    if (verificationStatus === 'pending') return t.pendingReview;
    if (verificationStatus === 'rejected') return t.rejected;
    return t.verifyNow;
  })();

  React.useEffect(() => {
    checkBiometricAvailable().then(({ available, type }) => {
      setBiometricSupported(available);
      if (type) setBiometricType(type);
    });
  }, []);

  const getBiometricLabel = React.useCallback(() => {
    const type = biometricType.toLowerCase();
    if (type.includes('face')) return t.faceIdLock;
    if (type.includes('sidik') || type.includes('finger')) return t.fingerprintLock;
    return t.biometricLock;
  }, [biometricType, t]);

  const handleBiometricToggle = async (val: boolean) => {
    if (val) await enable();
    else await disable();
  };

  const handleLogout = () => {
    Alert.alert(t.signOut, t.signOutConfirm, [
      { text: t.cancel, style: 'cancel' },
      {
        text: t.signOut,
        style: 'destructive',
        onPress: async () => {
          try { await signOut(); } catch { }
          logout();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  const toggleLanguage = () => {
    const next: Locale = locale === 'en' ? 'id' : 'en';
    setLocale(next);
  };

  const toggleTheme = () => {
    const next: AppTheme = isDark ? 'light' : 'dark';
    setTheme(next);
  };

  // Dynamic styles based on current theme colors
  const dynStyles = React.useMemo(() => StyleSheet.create({
    safe: { flex: 1, backgroundColor: C.offWhite },
    scroll: { flex: 1 },
    sectionHeader: {
      paddingHorizontal: Spacing.xl,
      paddingTop: Spacing.xl,
      paddingBottom: Spacing.sm,
      backgroundColor: C.offWhite,
    },
    sectionLabel: {
      fontFamily: Typography.regular.fontFamily,
      fontSize: Typography.sizes.sm,
      color: C.charcoal,
      letterSpacing: 0.3,
      textTransform: 'uppercase',
    },
    group: {
      backgroundColor: C.white,
      borderTopWidth: 1,
      borderBottomWidth: 1,
      borderColor: C.lightGray,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 14,
      paddingHorizontal: Spacing.xl,
      backgroundColor: C.white,
      minHeight: 52,
    },
    rowBorder: {
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: C.lightGray,
    },
    rowLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, flex: 1 },
    rowRight: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
    rowLabel: {
      fontFamily: Typography.regular.fontFamily,
      fontSize: Typography.sizes.base,
      color: C.nearBlack,
    },
    rowValue: {
      fontFamily: Typography.regular.fontFamily,
      fontSize: Typography.sizes.sm,
      color: C.darkGray,
    },
    langPill: {
      backgroundColor: C.primaryPale,
      paddingHorizontal: Spacing.sm,
      paddingVertical: 3,
      borderRadius: BorderRadius.full,
      borderWidth: 1,
      borderColor: C.primaryLight,
    },
    langPillTxt: {
      fontFamily: Typography.medium.fontFamily,
      fontSize: Typography.sizes.xs,
      color: C.primary,
    },
    themePill: {
      paddingHorizontal: Spacing.sm,
      paddingVertical: 3,
      borderRadius: BorderRadius.full,
      borderWidth: 1,
      backgroundColor: isDark ? C.primaryPale : C.cream,
      borderColor: isDark ? C.primaryLight : C.lightGray,
    },
    themePillTxt: {
      fontFamily: Typography.medium.fontFamily,
      fontSize: Typography.sizes.xs,
      color: isDark ? C.primary : C.darkGray,
    },
    signOutWrap: {
      marginHorizontal: Spacing.xl,
      marginTop: Spacing.xl,
    },
    signOutRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: Spacing.sm,
      paddingVertical: Spacing.md,
      borderRadius: BorderRadius.md,
      borderWidth: 1,
      borderColor: C.errorLight,
      backgroundColor: C.white,
    },
    signOutTxt: {
      fontFamily: Typography.regular.fontFamily,
      fontSize: Typography.sizes.base,
      color: C.error,
    },
  }), [C, isDark]);

  return (
    <SafeAreaView style={dynStyles.safe} edges={[]}>
      <PageHeader title={t.settings} onBack={() => router.back()} />

      <ScrollView style={dynStyles.scroll} showsVerticalScrollIndicator={false}>

        {/* ── Akun Saya ── */}
        <SectionHeader label={t.account} style={dynStyles.sectionHeader} labelStyle={dynStyles.sectionLabel} />
        <View style={dynStyles.group}>
          <RowItem
            icon="person-outline"
            label={t.editProfile}
            onPress={() => router.push('/profile/edit')}
            C={C}
            dynStyles={dynStyles}
          />
          <RowItem
            icon="location-outline"
            label={t.myAddresses}
            onPress={() => router.push('/profile/addresses')}
            C={C}
            dynStyles={dynStyles}
          />
          {/* <RowItem
            icon="card-outline"
            label={t.paymentMethods}
            onPress={() => router.push('/profile/payments')}
            C={C}
            dynStyles={dynStyles}
          />
          <RowItem
            icon="shield-checkmark-outline"
            label={t.verification}
            value={verificationLabel}
            onPress={() => {
              if (verificationStatus !== 'approved') router.push('/verification');
            }}
          /> */}
        </View>

        {/* ── Tampilan / Appearance ── */}
        <SectionHeader label={t.appearance} style={dynStyles.sectionHeader} labelStyle={dynStyles.sectionLabel} />
        <View style={dynStyles.group}>
          <TouchableOpacity style={dynStyles.row} activeOpacity={0.7} onPress={toggleTheme}>
            <View style={dynStyles.rowLeft}>
              <Ionicons
                name={isDark ? 'moon' : 'sunny-outline'}
                size={20}
                color={isDark ? C.primary : C.charcoal}
              />
              <Text style={dynStyles.rowLabel}>
                {isDark ? t.darkMode : t.lightMode}
              </Text>
            </View>
            <View style={dynStyles.rowRight}>
              <Switch
                value={isDark}
                onValueChange={toggleTheme}
                trackColor={{ false: C.midGray, true: C.primaryLight }}
                thumbColor="#FFFFFF"
              />
            </View>
          </TouchableOpacity>
        </View>

        {/* ── Pengaturan ── */}
        <SectionHeader label={t.settings} style={dynStyles.sectionHeader} labelStyle={dynStyles.sectionLabel} />
        <View style={dynStyles.group}>
          <TouchableOpacity style={dynStyles.row} activeOpacity={0.7} onPress={toggleLanguage}>
            <View style={dynStyles.rowLeft}>
              <Ionicons name="language-outline" size={20} color={C.charcoal} />
              <Text style={dynStyles.rowLabel}>{t.languageLabel}</Text>
            </View>
            <View style={dynStyles.rowRight}>
              <View style={dynStyles.langPill}>
                <Text style={dynStyles.langPillTxt}>{locale === 'en' ? '🇺🇸 EN' : '🇮🇩 ID'}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={C.gray} />
            </View>
          </TouchableOpacity>
          <ToggleRow
            icon="notifications-outline"
            label={t.pushNotifications}
            value={pushNotifications}
            onToggle={setPushNotifications}
            C={C}
            dynStyles={dynStyles}
          />
          <ToggleRow
            icon="receipt-outline"
            label={t.orderUpdates}
            value={orderUpdates}
            onToggle={setOrderUpdates}
            C={C}
            dynStyles={dynStyles}
          />
          <ToggleRow
            icon="chatbubble-outline"
            label={t.chatMessages}
            value={chatNotifications}
            onToggle={setChatNotifications}
            last={!biometricSupported}
            C={C}
            dynStyles={dynStyles}
          />
          {biometricSupported && (
            <ToggleRow
              icon="finger-print"
              label={getBiometricLabel()}
              value={isEnabled}
              onToggle={handleBiometricToggle}
              last
              C={C}
              dynStyles={dynStyles}
            />
          )}
        </View>

        {/* ── Bantuan ── */}
        <SectionHeader label={t.support} style={dynStyles.sectionHeader} labelStyle={dynStyles.sectionLabel} />
        <View style={dynStyles.group}>
          <RowItem icon="help-circle-outline" label={t.helpSupport} onPress={() => router.push('/help')} C={C} dynStyles={dynStyles} />
          <RowItem icon="document-text-outline" label={t.termsPrivacy} onPress={() => router.push('/terms')} C={C} dynStyles={dynStyles} />
          <RowItem icon="information-circle-outline" label={t.aboutApp} value="v1.0.0" onPress={() => { }} last C={C} dynStyles={dynStyles} />
        </View>

        {/* ── Sign out ── */}
        <View style={dynStyles.signOutWrap}>
          <TouchableOpacity style={dynStyles.signOutRow} activeOpacity={0.7} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color={C.error} />
            <Text style={dynStyles.signOutTxt}>{t.signOut}</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 60 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components (receive C + dynStyles as props to avoid hooks-in-callbacks)
// ─────────────────────────────────────────────────────────────────────────────

function SectionHeader({
  label,
  style,
  labelStyle,
}: {
  label: string;
  style: object;
  labelStyle: object;
}) {
  return (
    <View style={style}>
      <Text style={labelStyle}>{label}</Text>
    </View>
  );
}

function RowItem({
  icon,
  label,
  value,
  onPress,
  last = false,
  C,
  dynStyles,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
  onPress: () => void;
  last?: boolean;
  C: ReturnType<typeof useThemeColors>;
  dynStyles: any;
}) {
  return (
    <TouchableOpacity
      style={[dynStyles.row, !last && dynStyles.rowBorder]}
      activeOpacity={0.7}
      onPress={onPress}
    >
      <View style={dynStyles.rowLeft}>
        <Ionicons name={icon} size={20} color={C.charcoal} />
        <Text style={dynStyles.rowLabel}>{label}</Text>
      </View>
      <View style={dynStyles.rowRight}>
        {value && <Text style={dynStyles.rowValue}>{value}</Text>}
        <Ionicons name="chevron-forward" size={16} color={C.gray} />
      </View>
    </TouchableOpacity>
  );
}


function ToggleRow({
  icon,
  label,
  value,
  onToggle,
  last = false,
  C,
  dynStyles,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: boolean;
  onToggle: (v: boolean) => void;
  last?: boolean;
  C: ReturnType<typeof useThemeColors>;
  dynStyles: any;
}) {
  return (
    <View style={[dynStyles.row, !last && dynStyles.rowBorder]}>
      <View style={dynStyles.rowLeft}>
        <Ionicons name={icon} size={20} color={C.charcoal} />
        <Text style={dynStyles.rowLabel}>{label}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: C.midGray, true: C.primaryLight }}
        thumbColor="#FFFFFF"
      />
    </View>
  );
}
