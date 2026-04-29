/**
 * TipL — Profile Screen
 * User profile with order history, settings, and stats.
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/lib/constants';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { MOCK_USERS, MOCK_ORDER } from '@/lib/mockData';

const currentUser = MOCK_USERS[1]; // Adriana V.

export default function ProfileScreen() {
  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: () => router.replace('/auth/login'),
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
          <TouchableOpacity style={styles.settingsButton} onPress={() => router.push('/profile/settings')}>
            <Ionicons name="settings-outline" size={22} color={Colors.nearBlack} />
          </TouchableOpacity>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <Avatar
            uri={currentUser.avatarUrl}
            name={currentUser.displayName}
            size="xl"
            verified={currentUser.verified}
          />
          <Text style={styles.userName}>{currentUser.displayName}</Text>
          <Text style={styles.userEmail}>{currentUser.email}</Text>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>47</Text>
              <Text style={styles.statLabel}>Orders</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{currentUser.rating}</Text>
              <Text style={styles.statLabel}>Rating</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>12</Text>
              <Text style={styles.statLabel}>Trips</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <ActionCard
              icon="receipt-outline"
              label="My Orders"
              onPress={() => router.push('/order/o1')}
              color={Colors.primary}
            />
            <ActionCard
              icon="airplane-outline"
              label="My Trips"
              onPress={() => router.push('/profile/trips')}
              color={Colors.info}
            />
            <ActionCard
              icon="wallet-outline"
              label="Payments"
              onPress={() => router.push('/profile/payments')}
              color={Colors.success}
            />
            <ActionCard
              icon="heart-outline"
              label="Wishlist"
              onPress={() => router.push('/profile/wishlist')}
              color={Colors.error}
            />
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.menuCard}>
            <MenuItem icon="person-outline" label="Edit Profile" onPress={() => router.push('/profile/edit')} />
            <MenuItem icon="notifications-outline" label="Notifications" onPress={() => router.push('/profile/settings')} />
            <MenuItem icon="card-outline" label="Payment Methods" onPress={() => router.push('/profile/payments')} />
            <MenuItem icon="shield-checkmark-outline" label="Verification" badge="Verified" onPress={() => {}} />
            <MenuItem icon="help-circle-outline" label="Help & Support" onPress={() => router.push('/profile/settings')} />
            <MenuItem icon="document-text-outline" label="Terms & Privacy" onPress={() => router.push('/profile/settings')} />
          </View>
        </View>

        {/* Logout */}
        <Button
          title="Sign Out"
          onPress={handleLogout}
          variant="ghost"
          fullWidth
          icon={<Ionicons name="log-out-outline" size={20} color={Colors.nearBlack} />}
          style={{ marginHorizontal: Spacing.xl, marginBottom: Spacing['5xl'] }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

function ActionCard({
  icon,
  label,
  onPress,
  color,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  color: string;
}) {
  return (
    <TouchableOpacity style={styles.actionCard} activeOpacity={0.7} onPress={onPress}>
      <View style={[styles.actionIcon, { backgroundColor: `${color}15` }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <Text style={styles.actionLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

function MenuItem({
  icon,
  label,
  badge,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  badge?: string;
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity style={styles.menuItem} activeOpacity={0.7} onPress={onPress}>
      <Ionicons name={icon} size={22} color={Colors.charcoal} />
      <Text style={styles.menuLabel}>{label}</Text>
      {badge && (
        <View style={styles.menuBadge}>
          <Text style={styles.menuBadgeText}>{badge}</Text>
        </View>
      )}
      <Ionicons name="chevron-forward" size={18} color={Colors.gray} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
  },
  headerTitle: {
    fontFamily: Typography.serifBold.fontFamily,
    fontSize: Typography.sizes.xl,
    color: Colors.nearBlack,
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.offWhite,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Profile Card
  profileCard: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    marginHorizontal: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  userName: {
    fontFamily: Typography.semiBold.fontFamily,
    fontSize: Typography.sizes.xl,
    color: Colors.nearBlack,
    marginTop: Spacing.md,
  },
  userEmail: {
    fontFamily: Typography.regular.fontFamily,
    fontSize: Typography.sizes.sm,
    color: Colors.darkGray,
    marginTop: Spacing.xs,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.xl,
    backgroundColor: Colors.offWhite,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.base,
    paddingHorizontal: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.lightGray,
    width: '100%',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontFamily: Typography.bold.fontFamily,
    fontSize: Typography.sizes.xl,
    color: Colors.nearBlack,
  },
  statLabel: {
    fontFamily: Typography.regular.fontFamily,
    fontSize: Typography.sizes.xs,
    color: Colors.darkGray,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: Colors.midGray,
  },

  // Section
  section: {
    marginBottom: Spacing.xl,
    paddingHorizontal: Spacing.xl,
  },
  sectionTitle: {
    fontFamily: Typography.serifBold.fontFamily,
    fontSize: Typography.sizes.lg,
    color: Colors.nearBlack,
    marginBottom: Spacing.base,
  },

  // Action Grid
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  actionCard: {
    width: '47%',
    backgroundColor: Colors.offWhite,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.lightGray,
    alignItems: 'center',
    gap: Spacing.sm,
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
  },
});
