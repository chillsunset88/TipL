import React, { useCallback, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, Dimensions,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { PageHeader } from '@/src/components/ui/PageHeader';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/src/lib/constants';
import { Avatar } from '@/src/components/ui/Avatar';
import { useAuthStore } from '@/src/store/authStore';
import { getFavoriteTripers, toggleFavoriteTriper } from '@/src/services/supabase/favorites';

const { width: SW } = Dimensions.get('window');

export default function FavoritesScreen() {
  const user = useAuthStore((s) => s.user);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await getFavoriteTripers(user.id);
      setItems(data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [user]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const handleRemove = async (triperId: string) => {
    if (!user) return;
    setRemoving(triperId);
    try {
      await toggleFavoriteTriper(user.id, triperId);
      setItems((prev) => prev.filter((i) => i.triper_id !== triperId));
    } finally {
      setRemoving(null);
    }
  };

  return (
    <SafeAreaView style={s.safe} edges={[]}>
      <PageHeader title="Tripper Favorit" onBack={() => router.back()} />

      {loading ? (
        <ActivityIndicator color={Colors.primary} style={{ marginTop: Spacing.xl }} />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(i) => i.triper_id}
          contentContainerStyle={s.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={s.empty}>
              <View style={s.emptyIconWrap}>
                <Ionicons name="heart-outline" size={40} color={Colors.primary} />
              </View>
              <Text style={s.emptyTitle}>Belum ada tripper favorit</Text>
              <Text style={s.emptyDesc}>
                Kunjungi profil tripper dan tekan tombol "Ikuti Tripper" untuk menyimpannya di sini
              </Text>
              <TouchableOpacity style={s.emptyBtn} onPress={() => router.push('/(tabs)/trips' as any)}>
                <Text style={s.emptyBtnTxt}>Jelajahi Tripper</Text>
                <Ionicons name="arrow-forward" size={14} color={Colors.primary} />
              </TouchableOpacity>
            </View>
          }
          renderItem={({ item }) => {
            const p = item.profiles;
            if (!p) return null;
            const rating = p.rating ?? 0;
            const totalTrips = p.total_trips ?? 0;
            const isRemoving = removing === p.id;

            return (
              <TouchableOpacity
                style={s.card}
                activeOpacity={0.88}
                onPress={() => router.push(`/triper/${p.id}` as any)}
              >
                {/* Gold left accent */}
                <LinearGradient
                  colors={[Colors.primary, Colors.primaryDark]}
                  style={s.cardAccent}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0, y: 1 }}
                />

                <View style={s.cardInner}>
                  {/* Top row: avatar + info + unfav button */}
                  <View style={s.cardTop}>
                    <View style={s.avatarRing}>
                      <Avatar uri={p.avatar_url ?? null} name={p.full_name ?? 'T'} size="lg" />
                    </View>

                    <View style={s.triperInfo}>
                      <Text style={s.triperName}>{p.full_name ?? 'Tripper'}</Text>

                      {/* Rating */}
                      <View style={s.ratingRow}>
                        {[1,2,3,4,5].map((i: number) => (
                          <Ionicons
                            key={i}
                            name={i <= Math.round(rating) ? 'star' : 'star-outline'}
                            size={13}
                            color={Colors.primary}
                          />
                        ))}
                        <Text style={s.ratingTxt}>
                          {rating > 0 ? rating.toFixed(1) : '—'}
                        </Text>
                      </View>

                      <Text style={s.tripsStat}>
                        {totalTrips} trip selesai
                      </Text>
                    </View>

                    {/* Unfavorite button */}
                    <TouchableOpacity
                      style={s.unfavBtn}
                      onPress={() => handleRemove(p.id)}
                      disabled={isRemoving}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      {isRemoving ? (
                        <ActivityIndicator size="small" color={Colors.error} />
                      ) : (
                        <Ionicons name="heart-dislike-outline" size={18} color={Colors.error} />
                      )}
                    </TouchableOpacity>
                  </View>

                  {/* Divider */}
                  <View style={s.cardDivider} />

                  {/* Bottom row: CTA */}
                  <View style={s.cardBottom}>
                    <View style={s.tagRow}>
                      <View style={s.tag}>
                        <Ionicons name="airplane-outline" size={11} color={Colors.primary} />
                        <Text style={s.tagTxt}>Aktif berjastip</Text>
                      </View>
                    </View>
                    <View style={s.viewProfileBtn}>
                      <Text style={s.viewProfileTxt}>Lihat Profil</Text>
                      <Ionicons name="chevron-forward" size={13} color={Colors.primary} />
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.offWhite },
  floatingBack: {
    position: 'absolute', top: 12, left: 20, zIndex: 10,
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: 'rgba(0,0,0,0.06)',
    alignItems: 'center', justifyContent: 'center',
  },

  list: { padding: Spacing.xl, paddingBottom: 60 },

  // ── Card
  card: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    borderWidth: 1, borderColor: Colors.lightGray,
    marginBottom: Spacing.md,
    overflow: 'hidden',
    ...Shadows.md,
  },
  cardAccent: { width: 5 },
  cardInner: { flex: 1, padding: Spacing.base },

  cardTop: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  avatarRing: {
    borderRadius: 40, padding: 2,
    borderWidth: 2, borderColor: Colors.primaryLight,
  },
  triperInfo: { flex: 1, gap: 3 },
  triperName: {
    fontFamily: Typography.regular.fontFamily,
    fontSize: Typography.sizes.base, color: Colors.nearBlack,
  },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  ratingTxt: {
    fontFamily: Typography.medium.fontFamily,
    fontSize: Typography.sizes.xs, color: Colors.charcoal,
    marginLeft: 4,
  },
  tripsStat: {
    fontFamily: Typography.regular.fontFamily,
    fontSize: Typography.sizes.xs, color: Colors.darkGray,
  },

  unfavBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.errorLight,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: '#F5C6C6',
  },

  cardDivider: { height: 1, backgroundColor: Colors.lightGray, marginVertical: Spacing.sm },

  cardBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  tagRow: { flexDirection: 'row', gap: Spacing.sm },
  tag: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: Colors.primaryPale, borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.sm, paddingVertical: 3,
    borderWidth: 1, borderColor: Colors.primaryLight,
  },
  tagTxt: { fontFamily: Typography.medium.fontFamily, fontSize: 10, color: Colors.primary },

  viewProfileBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
  },
  viewProfileTxt: {
    fontFamily: Typography.regular.fontFamily,
    fontSize: Typography.sizes.sm, color: Colors.primary,
  },

  // ── Empty state
  empty: {
    alignItems: 'center', paddingTop: 80,
    gap: Spacing.md, paddingHorizontal: Spacing['2xl'],
  },
  emptyIconWrap: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: Colors.primaryPale,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Colors.primaryLight,
    marginBottom: Spacing.sm,
  },
  emptyTitle: {
    fontFamily: Typography.regular.fontFamily,
    fontSize: Typography.sizes.lg, color: Colors.charcoal,
  },
  emptyDesc: {
    fontFamily: Typography.regular.fontFamily,
    fontSize: Typography.sizes.sm, color: Colors.darkGray,
    textAlign: 'center', lineHeight: 20,
  },
  emptyBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    marginTop: Spacing.sm,
    paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full,
    borderWidth: 1.5, borderColor: Colors.primary,
    backgroundColor: Colors.primaryPale,
  },
  emptyBtnTxt: {
    fontFamily: Typography.regular.fontFamily,
    fontSize: Typography.sizes.sm, color: Colors.primary,
  },
});
