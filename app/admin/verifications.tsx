import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, Alert, RefreshControl,
} from 'react-native';
import { Image } from 'expo-image';
import { router, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { PageHeader } from '@/src/components/ui/PageHeader';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/src/lib/constants';
import { useAuthStore } from '@/src/store/authStore';
import {
  getPendingVerifications,
  getSignedUrls,
  updateVerificationStatus,
  type VerificationWithProfile,
} from '@/src/services/supabase/verification';

type VerifWithUrls = VerificationWithProfile & {
  selfieSignedUrl: string | null;
  ktpSignedUrl: string | null;
};

export default function AdminVerificationsScreen() {
  const user = useAuthStore((s) => s.user);
  const [items, setItems] = useState<VerifWithUrls[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);

  // Guard: only admin can access
  if (user?.role !== 'admin') {
    return (
      <SafeAreaView style={st.safe} edges={[]}>
        <View style={st.denied}>
          <Ionicons name="lock-closed-outline" size={48} color={Colors.midGray} />
          <Text style={st.deniedTxt}>Akses ditolak</Text>
        </View>
      </SafeAreaView>
    );
  }

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const verifs = await getPendingVerifications();
      if (verifs.length === 0) {
        setItems([]);
        return;
      }
      const allPaths = verifs.flatMap((v) => [v.selfie_url, v.ktp_url]);
      const urlMap = await getSignedUrls(allPaths, 3600);

      setItems(
        verifs.map((v) => ({
          ...v,
          selfieSignedUrl: urlMap[v.selfie_url] ?? null,
          ktpSignedUrl: urlMap[v.ktp_url] ?? null,
        })),
      );
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Gagal memuat data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const handleAction = (item: VerifWithUrls, action: 'approved' | 'rejected') => {
    const label = action === 'approved' ? 'Setujui' : 'Tolak';
    const msg = action === 'approved'
      ? `Setujui verifikasi ${item.full_name ?? 'user ini'}? Mereka akan menjadi Jastiper.`
      : `Tolak verifikasi ${item.full_name ?? 'user ini'}?`;

    Alert.alert(label, msg, [
      { text: 'Batal', style: 'cancel' },
      {
        text: label,
        style: action === 'rejected' ? 'destructive' : 'default',
        onPress: async () => {
          setActionId(item.id);
          try {
            await updateVerificationStatus(item.id, action);
            setItems((prev) => prev.filter((v) => v.id !== item.id));
          } catch (e) {
            Alert.alert('Gagal', e instanceof Error ? e.message : 'Terjadi kesalahan');
          } finally {
            setActionId(null);
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={st.safe} edges={[]}>
      <PageHeader title="Kelola Verifikasi" onBack={() => router.back()} />

      {loading ? (
        <ActivityIndicator color={Colors.primary} style={{ marginTop: Spacing.xl }} />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          contentContainerStyle={st.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => load(true)}
              tintColor={Colors.primary}
            />
          }
          ListEmptyComponent={
            <View style={st.empty}>
              <Ionicons name="checkmark-circle-outline" size={56} color={Colors.success} />
              <Text style={st.emptyTitle}>Semua Selesai!</Text>
              <Text style={st.emptyTxt}>Tidak ada verifikasi yang menunggu.</Text>
            </View>
          }
          renderItem={({ item }) => (
            <VerificationCard
              item={item}
              isActing={actionId === item.id}
              onApprove={() => handleAction(item, 'approved')}
              onReject={() => handleAction(item, 'rejected')}
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}

function VerificationCard({ item, isActing, onApprove, onReject }: {
  item: VerifWithUrls;
  isActing: boolean;
  onApprove: () => void;
  onReject: () => void;
}) {
  const date = new Date(item.created_at).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });

  return (
    <View style={st.card}>
      {/* User info */}
      <View style={st.cardHeader}>
        <View style={st.userRow}>
          {item.avatar_url ? (
            <Image source={{ uri: item.avatar_url }} style={st.avatar} contentFit="cover" />
          ) : (
            <View style={[st.avatar, st.avatarFallback]}>
              <Ionicons name="person" size={18} color={Colors.midGray} />
            </View>
          )}
          <View>
            <Text style={st.userName}>{item.full_name ?? 'Pengguna'}</Text>
            <Text style={st.submitDate}>{date}</Text>
          </View>
        </View>
        <View style={st.pendingBadge}>
          <Text style={st.pendingBadgeTxt}>Pending</Text>
        </View>
      </View>

      {/* Photos */}
      <View style={st.photosRow}>
        <View style={st.photoWrap}>
          <Text style={st.photoLabel}>Selfie</Text>
          {item.selfieSignedUrl ? (
            <Image source={{ uri: item.selfieSignedUrl }} style={st.selfieImg} contentFit="cover" />
          ) : (
            <View style={[st.selfieImg, st.photoPlaceholder]}>
              <ActivityIndicator size="small" color={Colors.midGray} />
            </View>
          )}
        </View>
        <View style={[st.photoWrap, { flex: 1 }]}>
          <Text style={st.photoLabel}>KTP / Identitas</Text>
          {item.ktpSignedUrl ? (
            <Image source={{ uri: item.ktpSignedUrl }} style={st.ktpImg} contentFit="cover" />
          ) : (
            <View style={[st.ktpImg, st.photoPlaceholder]}>
              <ActivityIndicator size="small" color={Colors.midGray} />
            </View>
          )}
        </View>
      </View>

      {/* Action buttons */}
      {isActing ? (
        <ActivityIndicator color={Colors.primary} style={{ paddingVertical: Spacing.md }} />
      ) : (
        <View style={st.actions}>
          <TouchableOpacity style={st.rejectBtn} onPress={onReject}>
            <Ionicons name="close-circle-outline" size={18} color={Colors.error} />
            <Text style={st.rejectTxt}>Tolak</Text>
          </TouchableOpacity>
          <TouchableOpacity style={st.approveBtn} onPress={onApprove}>
            <Ionicons name="checkmark-circle-outline" size={18} color={Colors.white} />
            <Text style={st.approveTxt}>Setujui Jastiper</Text>
          </TouchableOpacity>
        </View>
      )}
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

  denied: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md },
  deniedTxt: { fontFamily: Typography.medium.fontFamily, fontSize: Typography.sizes.base, color: Colors.darkGray },

  list: { padding: Spacing.xl, paddingBottom: 80 },
  empty: { alignItems: 'center', paddingTop: 80, gap: Spacing.md },
  emptyTitle: { fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.lg, color: Colors.nearBlack },
  emptyTxt: { fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.sm, color: Colors.darkGray },

  card: {
    backgroundColor: Colors.white, borderRadius: BorderRadius.lg,
    padding: Spacing.base, marginBottom: Spacing.md,
    borderWidth: 1, borderColor: Colors.lightGray, ...Shadows.sm, gap: Spacing.md,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  userRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  avatar: { width: 42, height: 42, borderRadius: 21 },
  avatarFallback: { backgroundColor: Colors.cream, alignItems: 'center', justifyContent: 'center' },
  userName: { fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.base, color: Colors.nearBlack },
  submitDate: { fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.xs, color: Colors.darkGray, marginTop: 2 },
  pendingBadge: {
    backgroundColor: `${Colors.warning}18`, paddingHorizontal: Spacing.sm, paddingVertical: 4,
    borderRadius: BorderRadius.full, borderWidth: 1, borderColor: `${Colors.warning}40`,
  },
  pendingBadgeTxt: { fontFamily: Typography.regular.fontFamily, fontSize: 10, color: Colors.warning },

  photosRow: { flexDirection: 'row', gap: Spacing.md, alignItems: 'flex-start' },
  photoWrap: { gap: 6 },
  photoLabel: { fontFamily: Typography.medium.fontFamily, fontSize: Typography.sizes.xs, color: Colors.darkGray },
  selfieImg: { width: 90, height: 90, borderRadius: 8, borderWidth: 1, borderColor: Colors.lightGray },
  ktpImg: { width: '100%', height: 110, borderRadius: 8, borderWidth: 1, borderColor: Colors.lightGray },
  photoPlaceholder: { backgroundColor: Colors.cream, alignItems: 'center', justifyContent: 'center' },

  actions: { flexDirection: 'row', gap: Spacing.md },
  rejectBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    paddingVertical: Spacing.md, borderRadius: BorderRadius.md,
    borderWidth: 1.5, borderColor: Colors.error, backgroundColor: `${Colors.error}08`,
  },
  rejectTxt: { fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.base, color: Colors.error },
  approveBtn: {
    flex: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    paddingVertical: Spacing.md, borderRadius: BorderRadius.md, backgroundColor: Colors.success,
  },
  approveTxt: { fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.base, color: Colors.white },
});
