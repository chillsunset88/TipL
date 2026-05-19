/**
 * TipL — My Trips Screen (Triper)
 * Shows the authenticated user's created trips from Supabase.
 * Theme-aware: supports Dark Mode & Light Mode.
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { PageHeader } from '@/src/components/ui/PageHeader';
import { LinearGradient } from 'expo-linear-gradient';
import { Typography, Spacing, BorderRadius, Shadows } from '@/src/lib/constants';
import { Badge } from '@/src/components/ui/Badge';
import { useAuthStore } from '@/src/store/authStore';
import { useMyTrips } from '@/src/lib/hooks/useTrips';
import type { Database } from '@/src/lib/database.types';
import { useThemeColors } from '@/src/lib/hooks/useThemeColors';

type Trip = Database['public']['Tables']['trips']['Row'];

function formatDate(iso: string | null | undefined) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function statusVariant(status: string): 'success' | 'info' | 'warning' | 'error' | 'gold' {
  if (status === 'open') return 'success';
  if (status === 'completed') return 'info';
  return 'warning';
}

export default function MyTripsScreen() {
  const C = useThemeColors();
  const user = useAuthStore((s) => s.user);
  const { trips, loading } = useMyTrips(user?.id);

  const s = React.useMemo(() => StyleSheet.create({
    safe: { flex: 1, backgroundColor: C.offWhite },
    floatingBack: {
      position: 'absolute', top: 12, left: 20, zIndex: 10,
      width: 38, height: 38, borderRadius: 19,
      backgroundColor: 'rgba(0,0,0,0.06)',
      alignItems: 'center', justifyContent: 'center',
    },
    centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing['2xl'] },
    list: { padding: Spacing.base, paddingBottom: 40 },
    tripCard: {
      backgroundColor: C.white,
      borderRadius: BorderRadius.xl,
      marginBottom: Spacing.md,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: C.lightGray,
      ...Shadows.md,
    },
    tripBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: Spacing.base,
      paddingVertical: Spacing.md,
      gap: Spacing.sm,
    },
    tripRoute: {
      fontFamily: Typography.regular.fontFamily,
      fontSize: Typography.sizes.base,
      color: '#FFFFFF',
      flex: 1,
    },
    tripBody: { padding: Spacing.base },
    tripMeta: { gap: 6, marginBottom: Spacing.md },
    metaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    metaText: {
      fontFamily: Typography.regular.fontFamily,
      fontSize: Typography.sizes.sm,
      color: C.darkGray,
    },
    tripFooter: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    emptyContainer: {
      alignItems: 'center',
      paddingTop: Spacing['5xl'],
      paddingHorizontal: Spacing['2xl'],
    },
    emptyTitle: {
      fontFamily: Typography.regular.fontFamily,
      fontSize: Typography.sizes.md,
      color: C.nearBlack,
      marginTop: Spacing.base,
    },
    emptySubtext: {
      fontFamily: Typography.regular.fontFamily,
      fontSize: Typography.sizes.sm,
      color: C.darkGray,
      textAlign: 'center',
      marginTop: Spacing.sm,
      lineHeight: 20,
    },
    createBtn: {
      marginTop: Spacing.xl,
      backgroundColor: C.primary,
      paddingHorizontal: Spacing.xl,
      paddingVertical: Spacing.md,
      borderRadius: BorderRadius.lg,
    },
    createBtnText: {
      fontFamily: Typography.regular.fontFamily,
      fontSize: Typography.sizes.base,
      color: '#FFFFFF',
    },
  }), [C]);

  return (
    <SafeAreaView style={s.safe} edges={[]}>
      <PageHeader title="Trip Saya" onBack={() => router.back()} rightIcon="add" rightIconColor={C.primary} onRightPress={() => router.push('/trip/create')} />

      {loading ? (
        <View style={s.centered}>
          <ActivityIndicator size="large" color={C.primary} />
        </View>
      ) : (
        <FlatList
          data={trips}
          keyExtractor={(item) => item.id}
          contentContainerStyle={trips.length === 0 ? s.centered : s.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }: { item: Trip }) => (
            <TouchableOpacity
              style={s.tripCard}
              activeOpacity={0.7}
              onPress={() => router.push(`/trip/${item.id}`)}
            >
              {/* Gradient banner */}
              <LinearGradient
                colors={['#C5A267', '#A37E43']}
                style={s.tripBanner}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Ionicons name="airplane" size={18} color="rgba(255,255,255,0.7)" />
                <Text style={s.tripRoute} numberOfLines={1}>
                  {item.origin_country} → {item.destination_country}
                </Text>
              </LinearGradient>

              <View style={s.tripBody}>
                <View style={s.tripMeta}>
                  <View style={s.metaItem}>
                    <Ionicons name="calendar-outline" size={13} color={C.darkGray} />
                    <Text style={s.metaText}>
                      {formatDate(item.departure_date)} — {formatDate(item.return_date)}
                    </Text>
                  </View>
                  {item.capacity_kg != null && (
                    <View style={s.metaItem}>
                      <Ionicons name="cube-outline" size={13} color={C.darkGray} />
                      <Text style={s.metaText}>{item.capacity_kg} kg</Text>
                    </View>
                  )}
                </View>
                <View style={s.tripFooter}>
                  <Badge
                    label={(item.status ?? 'closed').charAt(0).toUpperCase() + (item.status ?? 'closed').slice(1)}
                    variant={statusVariant(item.status ?? 'closed')}
                    small
                  />
                  <Ionicons name="chevron-forward" size={18} color={C.gray} />
                </View>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={s.emptyContainer}>
              <Ionicons name="airplane-outline" size={56} color={C.midGray} />
              <Text style={s.emptyTitle}>No trips yet</Text>
              <Text style={s.emptySubtext}>
                Create your first trip and start accepting jastip orders.
              </Text>
              <TouchableOpacity
                style={s.createBtn}
                onPress={() => router.push('/trip/create')}
              >
                <Text style={s.createBtnText}>Create a Trip</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
