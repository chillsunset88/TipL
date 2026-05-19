import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator, Alert,
} from 'react-native';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { PageHeader } from '@/src/components/ui/PageHeader';
import { Button } from '@/src/components/ui/Button';
import * as Haptics from 'expo-haptics';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/src/lib/constants';
import { useAuthStore } from '@/src/store/authStore';
import { useSettingsStore } from '@/src/store/settingsStore';
import {
  getRequestById,
  completeRequest,
  type CustomRequestWithProfile,
} from '@/src/services/supabase/requests';
import { createOrder } from '@/src/services/supabase/orders';

// STATUS_LABEL is computed inside component using t (see below)
const STATUS_COLOR: Record<string, string> = {
  open:      '#2196F3',
  taken:     '#F59E0B',
  completed: '#43A047',
  cancelled: '#EF5350',
};

function fmtAmount(n: number | null, currency = 'IDR'): string {
  if (!n) return 'Nego';
  return n.toLocaleString('id-ID', { style: 'currency', currency, maximumFractionDigits: 0 });
}

function fmtDate(iso: string | null): string {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function RequestDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const user = useAuthStore((s) => s.user);
  const { t } = useSettingsStore();
  const STATUS_LABEL: Record<string, string> = {
    open:      t.reqOpen,
    taken:     t.reqTaken,
    completed: t.orderStatusCompleted,
    cancelled: t.orderStatusCancelled,
  };
  const [request, setRequest] = useState<CustomRequestWithProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [taking, setTaking] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await getRequestById(id);
      setRequest(data);
    } catch {
      Alert.alert(t.error, t.failedLoadRequest);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const handleTake = async () => {
    if (!request || !user) return;
    Alert.alert(
      t.takeRequestTitle,
      t.takeRequestBody,
      [
        { text: t.cancel, style: 'cancel' },
        {
          text: t.takeRequestBtn,
          onPress: async () => {
            setTaking(true);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            try {
              const order = await createOrder({
                tiper_id: request.tiper_id,
                triper_id: user.id,
                item_name: request.item_name,
                notes: request.description ?? undefined,
                total_amount: request.budget_max ?? undefined,
                currency: request.currency ?? 'IDR',
                custom_request_id: request.id,
              });
              await completeRequest(request.id);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              router.replace(`/order/${order.id}` as any);
            } catch (e: any) {
              Alert.alert(t.error, e?.message ?? t.takeRequestFailed);
            } finally {
              setTaking(false);
            }
          },
        },
      ],
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={st.safe} edges={[]}>
        <PageHeader title={t.requestDetail} onBack={() => router.back()} />
        <View style={st.centered}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!request) {
    return (
      <SafeAreaView style={st.safe} edges={[]}>
        <PageHeader title={t.requestDetail} onBack={() => router.back()} />
        <View style={st.centered}>
          <Ionicons name="alert-circle-outline" size={56} color={Colors.midGray} />
          <Text style={st.emptyTitle}>{t.requestNotFound}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const status = request.status ?? 'open';
  const statusColor = STATUS_COLOR[status] ?? Colors.gray;
  const statusLabel = STATUS_LABEL[status] ?? status;
  const images = (request.image_urls as string[] | null) ?? [];
  const buyer = request.profiles as any;
  const isTaken = status === 'taken';
  const isTriper = request.taken_by === user?.id;

  return (
    <SafeAreaView style={st.safe} edges={[]}>
      <PageHeader
        title={t.requestDetail}
        onBack={() => router.back()}
        rightLabel={isTaken && isTriper ? undefined : undefined}
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={st.scroll}>

        {/* Images */}
        {images.length > 0 ? (
          <View>
            <Image
              source={{ uri: images[imageIndex] }}
              style={st.heroImage}
              contentFit="cover"
              transition={200}
            />
            {images.length > 1 && (
              <View style={st.imageDots}>
                {images.map((_, i) => (
                  <TouchableOpacity key={i} onPress={() => setImageIndex(i)}>
                    <View style={[st.dot, i === imageIndex && st.dotActive]} />
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        ) : (
          <View style={st.heroPlaceholder}>
            <Ionicons name="cube-outline" size={56} color={Colors.midGray} />
            <Text style={st.noImageText}>{t.noReferencePhoto}</Text>
          </View>
        )}

        <View style={st.body}>

          {/* Status pill */}
          <View style={[st.statusPill, { backgroundColor: `${statusColor}18`, borderColor: `${statusColor}40` }]}>
            <View style={[st.statusDot, { backgroundColor: statusColor }]} />
            <Text style={[st.statusLabel, { color: statusColor }]}>{statusLabel}</Text>
          </View>

          {/* Item name */}
          <Text style={st.itemName}>{request.item_name}</Text>

          {/* Buyer card */}
          <View style={st.buyerCard}>
            <View style={st.buyerAvatar}>
              <Text style={st.buyerInitial}>
                {(buyer?.full_name?.[0] ?? 'U').toUpperCase()}
              </Text>
            </View>
            <View style={st.buyerInfo}>
              <Text style={st.buyerLabel}>{t.requestedBy}</Text>
              <Text style={st.buyerName}>{buyer?.full_name ?? t.buyer}</Text>
            </View>
          </View>

          {/* Description */}
          {request.description ? (
            <View style={st.section}>
              <Text style={st.sectionTitle}>{t.descriptionLabel}</Text>
              <Text style={st.descText}>{request.description}</Text>
            </View>
          ) : null}

          {/* Detail grid */}
          <View style={st.detailGrid}>
            <View style={st.detailRow}>
              <Ionicons name="wallet-outline" size={16} color={Colors.primary} />
              <Text style={st.detailLabel}>{t.maxBudget}</Text>
              <Text style={st.detailValue}>{fmtAmount(request.budget_max, request.currency ?? 'IDR')}</Text>
            </View>

            {request.target_country ? (
              <View style={st.detailRow}>
<<<<<<< HEAD
                <Ionicons name="location-outline" size={16} color={Colors.primary} />
                <Text style={st.detailLabel}>{t.targetCountrySection}</Text>
                <Text style={st.detailValue}>{request.target_country}</Text>
=======
                  <Ionicons name="location-outline" size={16} color={Colors.primary} />
                    <Text style={st.detailLabel}>Tujuan</Text>
                    <Text style={st.detailValue}>{request.target_country}</Text>
>>>>>>> 9c72e3b2eb2a056c75199d51fcaa755fd7def8cd
              </View>
            ) : null}

            {(request as any).category ? (
              <View style={st.detailRow}>
                <Ionicons name="grid-outline" size={16} color={Colors.primary} />
                <Text style={st.detailLabel}>{t.productCategory}</Text>
                <Text style={st.detailValue}>{(request as any).category}</Text>
              </View>
            ) : null}

            {request.item_url ? (
              <View style={st.detailRow}>
                <Ionicons name="link-outline" size={16} color={Colors.primary} />
                <Text style={st.detailLabel}>{t.referenceLink}</Text>
                <Text style={[st.detailValue, { color: Colors.primary }]} numberOfLines={2}>
                  {request.item_url}
                </Text>
              </View>
            ) : null}

            <View style={st.detailRow}>
              <Ionicons name="calendar-outline" size={16} color={Colors.primary} />
              <Text style={st.detailLabel}>{t.dateLabel}</Text>
              <Text style={st.detailValue}>{fmtDate(request.created_at)}</Text>
            </View>
          </View>

          {/* CTA */}
          {isTaken && isTriper && (
            <View style={st.ctaWrap}>
              <Button
                title={t.takeRequestBtn}
                onPress={handleTake}
                loading={taking}
                fullWidth
                size="lg"
              />
            </View>
          )}

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.white },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md },
  emptyTitle: { fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.md, color: Colors.darkGray },
  scroll: { paddingBottom: 40 },

  heroImage: { width: '100%', height: 280 },
  heroPlaceholder: {
    width: '100%', height: 180,
    backgroundColor: Colors.offWhite,
    alignItems: 'center', justifyContent: 'center', gap: Spacing.sm,
  },
  noImageText: { fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.sm, color: Colors.gray },
  imageDots: { flexDirection: 'row', justifyContent: 'center', gap: 6, paddingVertical: Spacing.sm },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: Colors.lightGray },
  dotActive: { backgroundColor: Colors.primary, width: 18 },

  body: { padding: Spacing.xl, gap: Spacing.base },

  statusPill: {
    flexShrink: 1, alignSelf: 'flex-start',
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: Spacing.md, paddingVertical: 5,
    borderRadius: BorderRadius.full, borderWidth: 1,
  },
  statusDot: { width: 7, height: 7, borderRadius: 4 },
  statusLabel: { fontFamily: Typography.medium.fontFamily, fontSize: Typography.sizes.xs },

  itemName: {
    fontFamily: Typography.serifBold?.fontFamily ?? Typography.regular.fontFamily,
    fontSize: 22, color: Colors.nearBlack, lineHeight: 28,
  },

  buyerCard: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    backgroundColor: Colors.offWhite, borderRadius: BorderRadius.lg,
    padding: Spacing.md, borderWidth: 1, borderColor: Colors.lightGray,
  },
  buyerAvatar: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: `${Colors.primary}25`,
    alignItems: 'center', justifyContent: 'center',
  },
  buyerInitial: { fontFamily: Typography.medium.fontFamily, fontSize: Typography.sizes.base, color: Colors.primary },
  buyerInfo: { flex: 1 },
  buyerLabel: { fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.xs, color: Colors.gray },
  buyerName: { fontFamily: Typography.medium.fontFamily, fontSize: Typography.sizes.sm, color: Colors.nearBlack },
  section: { gap: 4 },
  sectionTitle: { fontFamily: Typography.medium.fontFamily, fontSize: Typography.sizes.sm, color: Colors.charcoal },
  descText: { fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.sm, color: Colors.darkGray, lineHeight: 22 },

  detailGrid: {
    backgroundColor: Colors.offWhite, borderRadius: BorderRadius.lg,
    borderWidth: 1, borderColor: Colors.lightGray, overflow: 'hidden',
  },
  detailRow: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.md,
    borderBottomWidth: 1, borderBottomColor: Colors.lightGray,
  },
  detailLabel: { fontFamily: Typography.medium.fontFamily, fontSize: Typography.sizes.xs, color: Colors.gray, width: 110 },
  detailValue: { flex: 1, fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.sm, color: Colors.nearBlack },

  ctaWrap: { gap: Spacing.sm, marginTop: Spacing.base },
});
