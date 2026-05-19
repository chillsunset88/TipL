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
import {
  createProduct, updateProduct, deleteProduct, uploadProductImage,
} from '@/src/services/supabase/trips';
import { supabase } from '@/src/lib/supabase';

const ACTIVE_ORDER_STATUSES = ['pending', 'accepted', 'in_escrow', 'purchased', 'shipped', 'delivered'];

async function getActiveOrderCountForProduct(productId: string): Promise<number> {
  const { count } = await supabase
    .from('orders')
    .select('id', { count: 'exact', head: true })
    .eq('product_id', productId)
    .in('status', ACTIVE_ORDER_STATUSES);
  return count ?? 0;
}

function fmtNum(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (!digits) return '';
  return Number(digits).toLocaleString('id-ID');
}
function parseNum(s: string): string { return s.replace(/\D/g, ''); }

export default function AddProductScreen() {
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
  const [priceMin, setPriceMin] = useState(productPriceMin ? fmtNum(productPriceMin) : '');
  const [priceMax, setPriceMax] = useState(productPriceMax ? fmtNum(productPriceMax) : '');
  const [description, setDescription] = useState(productDescription ?? '');
  const [imageUris, setImageUris] = useState<string[]>(() => {
    if (productImages) { try { return JSON.parse(productImages); } catch { return []; } }
    return [];
  });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Izin Diperlukan', 'Izinkan akses galeri untuk memilih foto.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'], allowsMultipleSelection: true, quality: 0.8, selectionLimit: 4,
    });
    if (!result.canceled) {
      setImageUris((prev) => [...prev, ...result.assets.map((a) => a.uri)].slice(0, 4));
    }
  };

  const handleSave = async () => {
    if (!name.trim()) { Alert.alert('Lengkapi Form', 'Nama produk wajib diisi'); return; }
    if (!category) { Alert.alert('Lengkapi Form', 'Pilih kategori produk'); return; }
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

      if (isEditMode) {
        await updateProduct(productId!, {
          name: name.trim(), category: category || null,
          description: description.trim() || null,
          price_min: numMin, price_max: numMax,
          image_urls: allUrls.length > 0 ? allUrls : null,
        });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert('Berhasil', 'Produk berhasil diperbarui!', [{ text: 'OK', onPress: () => router.back() }]);
      } else {
        if (!tripId) return;
        await createProduct({
          trip_id: tripId, triper_id: user.id, name: name.trim(),
          category: category || null, description: description.trim() || null,
          price_min: numMin, price_max: numMax,
          currency: 'IDR', image_urls: allUrls.length > 0 ? allUrls : null, is_available: true,
        } as any);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert('Berhasil', 'Produk berhasil ditambahkan ke trip!', [{ text: 'OK', onPress: () => router.back() }]);
      }
    } catch (e: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Gagal', e?.message ?? 'Gagal menyimpan produk. Coba lagi.');
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
        Alert.alert('Tidak Bisa Dihapus', `Ada ${activeCount} pesanan aktif untuk produk ini.`);
        return;
      }
      Alert.alert('Hapus Produk', 'Produk ini akan dihapus permanen. Yakin?', [
        { text: 'Batal', style: 'cancel' },
        { text: 'Hapus', style: 'destructive', onPress: async () => {
          try { await deleteProduct(productId); Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); router.back(); }
          catch (e: any) { Alert.alert('Gagal', e?.message ?? 'Gagal menghapus produk.'); }
        }},
      ]);
    } catch { Alert.alert('Error', 'Gagal memeriksa pesanan aktif.'); }
    finally { setDeleting(false); }
  };

  return (
    <SafeAreaView style={s.safe} edges={[]}>
      <PageHeader
        title={isEditMode ? 'Edit Produk' : 'Tambah Produk'}
        onBack={() => router.back()}
        rightIcon={isEditMode ? (deleting ? undefined : 'trash-outline') : undefined}
        rightIconColor={Colors.error}
        onRightPress={isEditMode ? handleDelete : undefined}
      />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          style={s.scroll}
          contentContainerStyle={s.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >

          {/* Section 1: Foto */}
          <View style={s.section}>
            <Text style={s.sectionTitle}>Foto Produk</Text>
            <TouchableOpacity style={s.uploadArea} onPress={pickImage} activeOpacity={0.8}>
              <View style={s.uploadIcon}>
                <Ionicons name="cloud-upload-outline" size={36} color={Colors.gray} />
              </View>
              <Text style={s.uploadTitle}>Upload Foto Produk</Text>
              <Text style={s.uploadSub}>Ketuk untuk pilih dari galeri (maks 4)</Text>
            </TouchableOpacity>
            {imageUris.length > 0 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.thumbRow}>
                {imageUris.map((uri, idx) => (
                  <View key={idx} style={s.thumbWrap}>
                    <Image source={{ uri }} style={s.thumb} contentFit="cover" />
                    <TouchableOpacity
                      style={s.thumbRemove}
                      onPress={() => setImageUris((prev) => prev.filter((_, i) => i !== idx))}
                    >
                      <Ionicons name="close-circle" size={22} color={Colors.error} />
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            )}
          </View>

          {/* Section 2: Detail */}
          <View style={s.section}>
            <Text style={s.sectionTitle}>Detail Produk</Text>
            <Input
              label="Nama Produk *"
              placeholder="Contoh: Parfum Chanel No.5"
              value={name}
              onChangeText={setName}
            />

            <Text style={s.fieldLabel}>Kategori *</Text>
            <View style={s.catGrid}>
              {ITEM_CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[s.catBtn, category === cat.id && s.catBtnActive]}
                  onPress={() => { setCategory(cat.id); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
                >
                  <Ionicons name={cat.icon as any} size={15} color={category === cat.id ? Colors.primary : Colors.darkGray} />
                  <Text style={[s.catTxt, category === cat.id && s.catTxtActive]}>{cat.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Input
              label="Deskripsi"
              placeholder="Warna, ukuran, spesifikasi produk..."
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
            />
          </View>

          {/* Section 3: Harga */}
          <View style={s.section}>
            <Text style={s.sectionTitle}>Rentang Harga (IDR)</Text>
            <View style={s.priceRow}>
              <View style={{ flex: 1 }}>
                <Input
                  label="Harga Min"
                  placeholder="0"
                  keyboardType="numeric"
                  value={priceMin}
                  onChangeText={(v) => setPriceMin(fmtNum(v))}
                  icon="chevron-down-outline"
                />
              </View>
              <Text style={s.priceDash}>–</Text>
              <View style={{ flex: 1 }}>
                <Input
                  label="Harga Max"
                  placeholder="0"
                  keyboardType="numeric"
                  value={priceMax}
                  onChangeText={(v) => setPriceMax(fmtNum(v))}
                  icon="chevron-up-outline"
                />
              </View>
            </View>
          </View>

          <View style={{ height: 32 }} />
        </ScrollView>

        <View style={s.footer}>
          <Button
            title={isEditMode ? 'Simpan Perubahan' : 'Simpan Produk'}
            onPress={handleSave}
            loading={saving}
            fullWidth
            size="lg"
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.white },
  scroll: { flex: 1 },
  content: { paddingHorizontal: Spacing.xl, paddingBottom: 16 },

  section: { marginBottom: Spacing['2xl'] },
  sectionTitle: {
    fontFamily: Typography.serifBold.fontFamily,
    fontSize: Typography.sizes.lg,
    color: Colors.nearBlack,
    marginBottom: Spacing.base,
    marginTop: Spacing.xl,
  },
  fieldLabel: {
    fontFamily: Typography.medium.fontFamily,
    fontSize: Typography.sizes.sm,
    color: Colors.darkGray,
    marginBottom: Spacing.sm,
    marginTop: Spacing.base,
  },

  uploadArea: {
    borderWidth: 2, borderColor: Colors.lightGray, borderStyle: 'dashed',
    borderRadius: BorderRadius.lg, paddingVertical: Spacing['2xl'],
    alignItems: 'center', backgroundColor: Colors.offWhite,
  },
  uploadIcon: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: `${Colors.primary}15`,
    alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.md,
  },
  uploadTitle: {
    fontFamily: Typography.medium.fontFamily,
    fontSize: Typography.sizes.base, color: Colors.nearBlack, marginBottom: Spacing.xs,
  },
  uploadSub: {
    fontFamily: Typography.regular.fontFamily,
    fontSize: Typography.sizes.sm, color: Colors.gray,
  },
  thumbRow: { marginTop: Spacing.md },
  thumbWrap: { marginRight: Spacing.sm, position: 'relative' },
  thumb: { width: 80, height: 80, borderRadius: BorderRadius.md },
  thumbRemove: { position: 'absolute', top: -6, right: -6 },

  catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.base },
  catBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full, borderWidth: 1,
    borderColor: Colors.lightGray, backgroundColor: Colors.offWhite,
  },
  catBtnActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryPale },
  catTxt: { fontFamily: Typography.medium.fontFamily, fontSize: Typography.sizes.xs, color: Colors.darkGray },
  catTxtActive: { color: Colors.primary },

  priceRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm },
  priceDash: {
    fontFamily: Typography.regular.fontFamily,
    fontSize: Typography.sizes.lg, color: Colors.gray, marginTop: 36,
  },

  footer: {
    paddingHorizontal: Spacing.xl, paddingTop: Spacing.base,
    paddingBottom: Spacing['2xl'],
    borderTopWidth: 1, borderTopColor: Colors.lightGray, backgroundColor: Colors.white,
  },
});
