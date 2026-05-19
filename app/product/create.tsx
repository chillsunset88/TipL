import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Alert, ActivityIndicator,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { PageHeader } from '@/src/components/ui/PageHeader';
import { Input } from '@/src/components/ui/Input';
import { Button } from '@/src/components/ui/Button';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { Colors, Typography, Spacing, BorderRadius, ITEM_CATEGORIES } from '@/src/lib/constants';
import { useAuthStore } from '@/src/store/authStore';
import { useSettingsStore } from '@/src/store/settingsStore';
import { useThemeColors } from '@/src/lib/hooks/useThemeColors';
import {
  createProduct, updateProduct, deleteProduct, uploadProductImage,
} from '@/src/services/supabase/trips';
import { supabase } from '@/src/lib/supabase';

const ACTIVE_ORDER_STATUSES = ['pending', 'accepted', 'in_escrow', 'purchased', 'shipped', 'delivered'];

const CURRENCIES = [
  { code: 'IDR', label: 'IDR', symbol: 'Rp' },
  { code: 'USD', label: 'USD', symbol: '$' },
  { code: 'JPY', label: 'JPY', symbol: '¥' },
  { code: 'SGD', label: 'SGD', symbol: 'S$' },
  { code: 'GBP', label: 'GBP', symbol: '£' },
  { code: 'EUR', label: 'EUR', symbol: '€' },
  { code: 'AUD', label: 'AUD', symbol: 'A$' },
  { code: 'KRW', label: 'KRW', symbol: '₩' },
];

function fmtNum(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (!digits) return '';
  return Number(digits).toLocaleString('id-ID');
}
function parseNum(s: string): string { return s.replace(/\D/g, ''); }

async function getActiveOrderCountForProduct(productId: string): Promise<number> {
  const { count } = await supabase
    .from('orders')
    .select('id', { count: 'exact', head: true })
    .eq('product_id', productId)
    .in('status', ACTIVE_ORDER_STATUSES);
  return count ?? 0;
}

export default function AddProductScreen() {
  const C = useThemeColors();
  const { t } = useSettingsStore();
  const {
    tripId, productId, productName, productCategory,
    productPriceMin, productPriceMax, productDescription, productImages,
  } = useLocalSearchParams<{
    tripId?: string; productId?: string; productName?: string;
    productCategory?: string; productPriceMin?: string; productPriceMax?: string;
    productDescription?: string; productImages?: string;
  }>();

  const isEditMode = !!productId;
  const user = useAuthStore((s) => s.user);

  const [name, setName] = useState(productName ?? '');
  const [category, setCategory] = useState(productCategory ?? '');
  const [currency, setCurrency] = useState('IDR');
  const [priceMin, setPriceMin] = useState(productPriceMin ? fmtNum(productPriceMin) : '');
  const [priceMax, setPriceMax] = useState(productPriceMax ? fmtNum(productPriceMax) : '');
  const [description, setDescription] = useState(productDescription ?? '');
  const [notes, setNotes] = useState('');
  const [imageUris, setImageUris] = useState<string[]>(() => {
    if (productImages) { try { return JSON.parse(productImages); } catch { return []; } }
    return [];
  });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const currencySymbol = CURRENCIES.find((c) => c.code === currency)?.symbol ?? currency;

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(t.permissionRequired, t.galleryPermission);
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'], allowsMultipleSelection: true, quality: 0.8, selectionLimit: 4,
    });
    if (!result.canceled) {
      setImageUris((prev) => [...prev, ...result.assets.map((a) => a.uri)].slice(0, 4));
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(t.permissionRequired, t.cameraPermission);
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'], allowsEditing: true, quality: 0.8,
    });
    if (!result.canceled && result.assets[0]?.uri) {
      setImageUris((prev) => [...prev, result.assets[0].uri].slice(0, 4));
    }
  };

  const handleSave = async () => {
    if (!name.trim()) { Alert.alert(t.incompleteForm, t.productNameRequiredMsg); return; }
    if (!category) { Alert.alert(t.incompleteForm, t.categoryRequiredMsg); return; }
    if (!user) return;

    try {
      setSaving(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const alreadyUploaded = imageUris.filter((u) => u.startsWith('http'));
      const toUpload = imageUris.filter((u) => !u.startsWith('http'));
      const refId = tripId ?? productId!;
      const newUrls = toUpload.length > 0
        ? await Promise.all(toUpload.map((uri) => uploadProductImage(refId, uri))) : [];
      const allUrls = [...alreadyUploaded, ...newUrls];
      const numMin = priceMin ? parseInt(parseNum(priceMin), 10) : null;
      const numMax = priceMax ? parseInt(parseNum(priceMax), 10) : null;
      const fullDesc = [description.trim(), notes.trim()].filter(Boolean).join('\n\n');

      if (isEditMode) {
        await updateProduct(productId!, {
          name: name.trim(), category: category || null,
          description: fullDesc || null,
          price_min: numMin, price_max: numMax,
          image_urls: allUrls.length > 0 ? allUrls : null,
        });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert(t.success, t.productUpdatedMsg, [{ text: t.ok, onPress: () => router.back() }]);
      } else {
        if (!tripId) return;
        await createProduct({
          trip_id: tripId, triper_id: user.id, name: name.trim(),
          category: category || null, description: fullDesc || null,
          price_min: numMin, price_max: numMax,
          currency, image_urls: allUrls.length > 0 ? allUrls : null, is_available: true,
        } as any);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert(t.success, t.productAddedMsg, [{ text: t.ok, onPress: () => router.back() }]);
      }
    } catch (e: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(t.error, e?.message ?? t.failedSaveProduct);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!productId) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      setDeleting(true);
      const activeCount = await getActiveOrderCountForProduct(productId);
      if (activeCount > 0) {
        Alert.alert(t.cannotDeleteProduct, `${activeCount} ${t.activeOrdersBlock}`);
        return;
      }
      Alert.alert(t.deleteProductTitle, t.deleteProductConfirmMsg, [
        { text: t.cancel, style: 'cancel' },
        { text: t.delete, style: 'destructive', onPress: async () => {
          try {
            await deleteProduct(productId);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            router.back();
          } catch (e: any) { Alert.alert(t.error, e?.message ?? t.failedDeleteProduct); }
        }},
      ]);
    } catch { Alert.alert(t.error, t.failedCheckOrders); }
    finally { setDeleting(false); }
  };

  const styles = React.useMemo(() => StyleSheet.create({
    safe: { flex: 1, backgroundColor: C.white },
    scroll: { flex: 1 },
    content: { paddingHorizontal: Spacing.xl, paddingBottom: 40 },

    section: { marginBottom: Spacing['2xl'] },
    sectionTitle: {
      fontFamily: Typography.serifBold.fontFamily,
      fontSize: Typography.sizes.lg, color: C.nearBlack,
      marginBottom: Spacing.base,
    },
    fieldLabel: {
      fontFamily: Typography.medium.fontFamily,
      fontSize: Typography.sizes.sm, color: C.darkGray,
      marginBottom: Spacing.sm,
    },

    uploadActions: {
      flexDirection: 'row', gap: Spacing.sm,
      justifyContent: 'space-between', marginBottom: Spacing.md,
    },
    uploadButton: {
      flex: 1, flexDirection: 'row', alignItems: 'center',
      justifyContent: 'center', gap: Spacing.xs,
      paddingVertical: Spacing.sm, borderRadius: BorderRadius.md,
      borderWidth: 1, borderColor: C.lightGray, backgroundColor: C.white,
    },
    uploadBtnText: {
      fontFamily: Typography.medium.fontFamily,
      fontSize: Typography.sizes.sm, color: C.primary,
    },
    uploadArea: {
      borderWidth: 2, borderColor: C.lightGray, borderStyle: 'dashed',
      borderRadius: BorderRadius.lg, padding: Spacing['2xl'],
      alignItems: 'center', backgroundColor: C.offWhite,
    },
    uploadIcon: {
      width: 64, height: 64, borderRadius: 32,
      backgroundColor: C.primary + '15',
      alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.md,
    },
    uploadTitle: {
      fontFamily: Typography.regular.fontFamily,
      fontSize: Typography.sizes.base, color: C.nearBlack, marginBottom: Spacing.xs,
    },
    uploadSubtext: {
      fontFamily: Typography.regular.fontFamily,
      fontSize: Typography.sizes.sm, color: C.gray, textAlign: 'center',
    },
    imageRow: { marginTop: Spacing.md },
    previewContainer: { marginRight: Spacing.sm, position: 'relative' },
    previewImage: { width: 80, height: 80, borderRadius: BorderRadius.md },
    removeImage: { position: 'absolute', top: -6, right: -6, backgroundColor: C.white, borderRadius: 11 },

    chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.base },
    chip: {
      flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.sm, borderRadius: BorderRadius.full, borderWidth: 1,
      borderColor: C.lightGray, backgroundColor: C.offWhite, gap: 6,
    },
    chipActive: { backgroundColor: C.primary, borderColor: C.primary },
    chipText: { fontFamily: Typography.medium.fontFamily, fontSize: Typography.sizes.xs, color: C.darkGray },
    chipTextActive: { color: '#FFFFFF' },

    infoBanner: {
      flexDirection: 'row', alignItems: 'center', backgroundColor: C.primary + '12',
      borderRadius: BorderRadius.md, padding: Spacing.base, marginBottom: Spacing.xl,
      gap: Spacing.md, borderWidth: 1, borderColor: C.primary + '30',
    },
    infoText: { flex: 1, fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.xs, color: C.charcoal, lineHeight: 17 },
  }), [C]);

  return (
    <SafeAreaView style={styles.safe} edges={[]}>
      <PageHeader
        title={isEditMode ? 'Edit Produk' : 'Tambah Produk'}
        onBack={() => router.back()}
        rightIcon={isEditMode ? (deleting ? undefined : 'trash-outline') : undefined}
        rightIconColor={Colors.error}
        onRightPress={isEditMode ? handleDelete : undefined}
      />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >

          {/* Section 1: Visual Reference */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Visual Reference</Text>
            <View style={styles.uploadActions}>
              <TouchableOpacity style={styles.uploadButton} onPress={pickImage} activeOpacity={0.8}>
                <Ionicons name="image-outline" size={22} color={C.primary} />
                <Text style={styles.uploadBtnText}>Gallery</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.uploadButton} onPress={takePhoto} activeOpacity={0.8}>
                <Ionicons name="camera-outline" size={22} color={C.primary} />
                <Text style={styles.uploadBtnText}>Camera</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.uploadArea}>
              <View style={styles.uploadIcon}>
                <Ionicons name="cloud-upload-outline" size={36} color={C.gray} />
              </View>
              <Text style={styles.uploadTitle}>Upload Reference Photo</Text>
              <Text style={styles.uploadSubtext}>Use gallery or camera to add a visual sample.</Text>
            </View>
            {imageUris.length > 0 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageRow}>
                {imageUris.map((uri, idx) => (
                  <View key={idx} style={styles.previewContainer}>
                    <Image source={{ uri }} style={styles.previewImage} contentFit="cover" />
                    <TouchableOpacity style={styles.removeImage} onPress={() => setImageUris((prev) => prev.filter((_, i) => i !== idx))}>
                      <Ionicons name="close-circle" size={22} color={C.error} />
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            )}
          </View>

          {/* Section 2: Item Details */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Item Details</Text>
            <Input
              label="Item Name *"
              placeholder="e.g. Parfum Chanel No.5"
              value={name}
              onChangeText={setName}
            />
            <Input
              label="Description"
              placeholder="Color, size, model, specifications..."
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
            />

            <Text style={styles.fieldLabel}>Category *</Text>
            <View style={styles.chipGrid}>
              {ITEM_CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[styles.chip, category === cat.id && styles.chipActive]}
                  onPress={() => { setCategory(cat.id); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
                >
                  <Ionicons name={cat.icon as any} size={15} color={category === cat.id ? '#FFFFFF' : C.darkGray} />
                  <Text style={[styles.chipText, category === cat.id && styles.chipTextActive]}>{cat.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Section 3: Pricing */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Pricing Estimate</Text>

            <Text style={styles.fieldLabel}>Currency</Text>
            <View style={styles.chipGrid}>
              {CURRENCIES.map((cur) => (
                <TouchableOpacity
                  key={cur.code}
                  style={[styles.chip, currency === cur.code && styles.chipActive]}
                  onPress={() => { setCurrency(cur.code); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
                >
                  <Text style={[styles.chipText, currency === cur.code && styles.chipTextActive]}>
                    {cur.symbol} {cur.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Input
              label={`Minimum Price (${currency})`}
              placeholder={`${currencySymbol} 0`}
              keyboardType="numeric"
              value={priceMin}
              onChangeText={(v) => setPriceMin(fmtNum(v))}
              icon="chevron-down-outline"
            />
            <Input
              label={`Maximum Price (${currency})`}
              placeholder={`${currencySymbol} 0`}
              keyboardType="numeric"
              value={priceMax}
              onChangeText={(v) => setPriceMax(fmtNum(v))}
              icon="chevron-up-outline"
            />
            <Input
              label="Additional Notes"
              placeholder="Special instructions for the buyer..."
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
            />
          </View>

          {/* Info Banner */}
          <View style={styles.infoBanner}>
            <Ionicons name="shield-checkmark" size={20} color={C.primary} />
            <Text style={styles.infoText}>
              Harga yang kamu masukkan akan ditampilkan ke pembeli sebagai rentang harga produkmu.
            </Text>
          </View>

          <Button
            title={isEditMode ? 'Simpan Perubahan' : 'Simpan Produk'}
            onPress={handleSave}
            loading={saving}
            fullWidth
            size="lg"
            style={{ marginBottom: Spacing['5xl'] }}
          />

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
