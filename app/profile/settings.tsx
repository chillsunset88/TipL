/**
 * TipL — Settings Screen
 * Shopee-inspired flat list: gray section headers, plain dividers, no card boxes.
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius } from '@/src/lib/constants';
import { useSettingsStore } from '@/src/store/settingsStore';
import { useAuthStore } from '@/src/store/authStore';
import { signOut } from '@/src/services/supabase/auth';
import { Locale } from '@/src/lib/i18n';

export default function SettingsScreen() {
  const [pushNotifications, setPushNotifications] = React.useState(true);
  const [orderUpdates, setOrderUpdates] = React.useState(true);
  const [chatNotifications, setChatNotifications] = React.useState(true);
  const { locale, setLocale, t } = useSettingsStore();
  const logout = useAuthStore((s) => s.logout);

  const handleLogout = () => {
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

  const toggleLanguage = () => {
    const next: Locale = locale === 'en' ? 'id' : 'en';
    setLocale(next);
  };

  return (
    <SafeAreaView style={st.safe} edges={['top']}>
      <TouchableOpacity onPress={() => router.back()} style={st.floatingBack}>
        <Ionicons name="arrow-back" size={20} color={Colors.nearBlack} />
      </TouchableOpacity>

      <ScrollView style={st.scroll} showsVerticalScrollIndicator={false}>

        {/* ── Akun Saya ── */}
        <SectionHeader label="Akun Saya" />
        <View style={st.group}>
          <RowItem
            icon="person-outline"
            label={t.editProfile}
            onPress={() => router.push('/profile/edit')}
          />
          <RowItem
            icon="card-outline"
            label={t.paymentMethods}
            onPress={() => router.push('/profile/payments')}
          />
          <RowItem
            icon="shield-checkmark-outline"
            label={t.verification}
            value={t.verified}
            onPress={() => {}}
            last
          />
        </View>

        {/* ── Pengaturan ── */}
        <SectionHeader label="Pengaturan" />
        <View style={st.group}>
          <TouchableOpacity style={st.row} activeOpacity={0.7} onPress={toggleLanguage}>
            <View style={st.rowLeft}>
              <Ionicons name="language-outline" size={20} color={Colors.charcoal} />
              <Text style={st.rowLabel}>{t.languageLabel}</Text>
            </View>
            <View style={st.rowRight}>
              <View style={st.langPill}>
                <Text style={st.langPillTxt}>{locale === 'en' ? '🇺🇸 EN' : '🇮🇩 ID'}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={Colors.gray} />
            </View>
          </TouchableOpacity>
          <ToggleRow
            icon="notifications-outline"
            label={t.pushNotifications}
            value={pushNotifications}
            onToggle={setPushNotifications}
          />
          <ToggleRow
            icon="receipt-outline"
            label={t.orderUpdates}
            value={orderUpdates}
            onToggle={setOrderUpdates}
          />
          <ToggleRow
            icon="chatbubble-outline"
            label={t.chatMessages}
            value={chatNotifications}
            onToggle={setChatNotifications}
            last
          />
        </View>

        {/* ── Bantuan ── */}
        <SectionHeader label="Bantuan" />
        <View style={st.group}>
          <RowItem icon="help-circle-outline" label={t.helpSupport} onPress={() => {}} />
          <RowItem icon="document-text-outline" label={t.termsPrivacy} onPress={() => {}} />
          <RowItem icon="information-circle-outline" label={t.aboutApp} value="v1.0.0" onPress={() => {}} last />
        </View>

        {/* ── Sign out ── */}
        <View style={st.signOutWrap}>
          <TouchableOpacity style={st.signOutRow} activeOpacity={0.7} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color={Colors.error} />
            <Text style={st.signOutTxt}>{t.signOut}</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 60 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function SectionHeader({ label }: { label: string }) {
  return (
    <View style={st.sectionHeader}>
      <Text style={st.sectionLabel}>{label}</Text>
    </View>
  );
}

function RowItem({
  icon,
  label,
  value,
  onPress,
  last = false,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
  onPress: () => void;
  last?: boolean;
}) {
  return (
    <TouchableOpacity
      style={[st.row, !last && st.rowBorder]}
      activeOpacity={0.7}
      onPress={onPress}
    >
      <View style={st.rowLeft}>
        <Ionicons name={icon} size={20} color={Colors.charcoal} />
        <Text style={st.rowLabel}>{label}</Text>
      </View>
      <View style={st.rowRight}>
        {value && <Text style={st.rowValue}>{value}</Text>}
        <Ionicons name="chevron-forward" size={16} color={Colors.gray} />
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
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: boolean;
  onToggle: (v: boolean) => void;
  last?: boolean;
}) {
  return (
    <View style={[st.row, !last && st.rowBorder]}>
      <View style={st.rowLeft}>
        <Ionicons name={icon} size={20} color={Colors.charcoal} />
        <Text style={st.rowLabel}>{label}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: Colors.midGray, true: Colors.primaryLight }}
        thumbColor={value ? Colors.primary : Colors.gray}
      />
    </View>
  );
}

const st = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.offWhite },

  floatingBack: {
    position: 'absolute', top: 12, left: 20, zIndex: 10,
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: 'rgba(0,0,0,0.06)',
    alignItems: 'center', justifyContent: 'center',
  },

  scroll: { flex: 1, paddingTop: 56 },

  sectionHeader: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.sm,
    backgroundColor: Colors.offWhite,
  },
  sectionLabel: {
    fontFamily: Typography.semiBold.fontFamily,
    fontSize: Typography.sizes.sm,
    color: Colors.charcoal,
    letterSpacing: 0.3,
  },

  group: {
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.lightGray,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: Spacing.xl,
    backgroundColor: Colors.white,
    minHeight: 52,
  },
  rowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.lightGray,
  },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, flex: 1 },
  rowRight: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  rowLabel: {
    fontFamily: Typography.regular.fontFamily,
    fontSize: Typography.sizes.base,
    color: Colors.nearBlack,
  },
  rowValue: {
    fontFamily: Typography.regular.fontFamily,
    fontSize: Typography.sizes.sm,
    color: Colors.darkGray,
  },

  langPill: {
    backgroundColor: Colors.primaryPale,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.primaryLight,
  },
  langPillTxt: {
    fontFamily: Typography.medium.fontFamily,
    fontSize: Typography.sizes.xs,
    color: Colors.primary,
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
    borderColor: Colors.errorLight,
    backgroundColor: Colors.white,
  },
  signOutTxt: {
    fontFamily: Typography.semiBold.fontFamily,
    fontSize: Typography.sizes.base,
    color: Colors.error,
  },
});
