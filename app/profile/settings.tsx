/**
 * TipL — Settings Screen
 * Account settings: Edit Profile, Notifications, Payment Methods, Verification, Help, Terms, Sign Out.
 * Language toggle: English / Bahasa Indonesia.
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
import { Button } from '@/src/components/ui/Button';
import { useSettingsStore } from '@/src/store/settingsStore';
import { Locale } from '@/src/lib/i18n';

export default function SettingsScreen() {
  const [pushNotifications, setPushNotifications] = React.useState(true);
  const [orderUpdates, setOrderUpdates] = React.useState(true);
  const [chatNotifications, setChatNotifications] = React.useState(true);
  const { locale, setLocale, t } = useSettingsStore();

  const handleLogout = () => {
    Alert.alert(t.signOut, t.signOutConfirm, [
      { text: t.cancel, style: 'cancel' },
      {
        text: t.signOut,
        style: 'destructive',
        onPress: () => router.replace('/(auth)/login'),
      },
    ]);
  };

  const toggleLanguage = () => {
    const next: Locale = locale === 'en' ? 'id' : 'en';
    setLocale(next);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.nearBlack} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t.settings}</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Account Section */}
        <Text style={styles.sectionLabel}>{t.account}</Text>
        <View style={styles.menuCard}>
          <MenuItem
            icon="person-outline"
            label={t.editProfile}
            onPress={() => router.push('/profile/edit')}
          />
          <MenuItem
            icon="card-outline"
            label={t.paymentMethods}
            onPress={() => router.push('/profile/payments')}
          />
          <MenuItem
            icon="shield-checkmark-outline"
            label={t.verification}
            subtitle={t.verified}
            onPress={() => {}}
          />
        </View>

        {/* Language Section */}
        <Text style={styles.sectionLabel}>{t.language}</Text>
        <View style={styles.menuCard}>
          <TouchableOpacity
            style={styles.menuItem}
            activeOpacity={0.7}
            onPress={toggleLanguage}
          >
            <Ionicons name="language-outline" size={22} color={Colors.charcoal} />
            <Text style={styles.menuLabel}>{t.languageLabel}</Text>
            <View style={styles.languagePill}>
              <Text style={styles.languagePillText}>
                {locale === 'en' ? '🇺🇸 English' : '🇮🇩 Indonesia'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.gray} />
          </TouchableOpacity>
        </View>

        {/* Notifications Section */}
        <Text style={styles.sectionLabel}>{t.notifications}</Text>
        <View style={styles.menuCard}>
          <ToggleItem
            icon="notifications-outline"
            label={t.pushNotifications}
            value={pushNotifications}
            onToggle={setPushNotifications}
          />
          <ToggleItem
            icon="receipt-outline"
            label={t.orderUpdates}
            value={orderUpdates}
            onToggle={setOrderUpdates}
          />
          <ToggleItem
            icon="chatbubble-outline"
            label={t.chatMessages}
            value={chatNotifications}
            onToggle={setChatNotifications}
          />
        </View>

        {/* Support Section */}
        <Text style={styles.sectionLabel}>{t.support}</Text>
        <View style={styles.menuCard}>
          <MenuItem
            icon="help-circle-outline"
            label={t.helpSupport}
            onPress={() => {}}
          />
          <MenuItem
            icon="document-text-outline"
            label={t.termsPrivacy}
            onPress={() => {}}
          />
          <MenuItem
            icon="information-circle-outline"
            label={t.aboutApp}
            subtitle="v1.0.0"
            onPress={() => {}}
          />
        </View>

        {/* Sign Out */}
        <Button
          title={t.signOut}
          onPress={handleLogout}
          variant="danger"
          fullWidth
          icon={<Ionicons name="log-out-outline" size={20} color={Colors.error} />}
          style={{ marginTop: Spacing.xl, marginBottom: Spacing['5xl'] }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

function MenuItem({
  icon,
  label,
  subtitle,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  subtitle?: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.menuItem} activeOpacity={0.7} onPress={onPress}>
      <Ionicons name={icon} size={22} color={Colors.charcoal} />
      <Text style={styles.menuLabel}>{label}</Text>
      {subtitle && (
        <Text style={styles.menuSubtitle}>{subtitle}</Text>
      )}
      <Ionicons name="chevron-forward" size={18} color={Colors.gray} />
    </TouchableOpacity>
  );
}

function ToggleItem({
  icon,
  label,
  value,
  onToggle,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: boolean;
  onToggle: (val: boolean) => void;
}) {
  return (
    <View style={styles.menuItem}>
      <Ionicons name={icon} size={22} color={Colors.charcoal} />
      <Text style={styles.menuLabel}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: Colors.midGray, true: Colors.primaryLight }}
        thumbColor={value ? Colors.primary : Colors.gray}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.white },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  backButton: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: Colors.offWhite,
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: Typography.serifBold.fontFamily,
    fontSize: Typography.sizes.md,
    color: Colors.nearBlack,
  },
  container: { flex: 1, paddingHorizontal: Spacing.xl },
  sectionLabel: {
    fontFamily: Typography.medium.fontFamily,
    fontSize: 11,
    color: Colors.darkGray,
    letterSpacing: 1.2,
    marginTop: Spacing.xl,
    marginBottom: Spacing.sm,
    marginLeft: Spacing.xs,
  },
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
    paddingVertical: 14,
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
  menuSubtitle: {
    fontFamily: Typography.regular.fontFamily,
    fontSize: Typography.sizes.sm,
    color: Colors.darkGray,
  },
  languagePill: {
    backgroundColor: '#EBF2FF',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  languagePillText: {
    fontFamily: Typography.medium.fontFamily,
    fontSize: Typography.sizes.sm,
    color: '#003F7F',
  },
});
