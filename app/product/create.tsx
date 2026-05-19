import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput,
  TouchableOpacity, Alert, ActivityIndicator,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { PageHeader } from '@/src/components/ui/PageHeader';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { Colors, Typography, Spacing, BorderRadius, ITEM_CATEGORIES } from '@/src/lib/constants';
import { useAuthStore } from '@/src/store/authStore';
import {
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImage,
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

export default function AddProductScreen() {
  const {
    tripId,
    productId,
    productName,
    productCategory,
    productPriceMin,
    productPriceMax,
    productDescription,
    productImages,
  } = useLocalSearchParams<{
    tripId?: string;
    productId?: string;
    productName?: string;
    productCategory?: string;
    productPriceMin?: string;
    productPriceMax?: string;
    productDescription?: string;
    productImages?: string;
  }>();

  const isEditMode = !!productId;
  const user = useAuthStore((s) => s.user);

  const [name, setName] = useState(productName ?? '');
  const [category, setCategory] = useState(productCategory ?? '');
  const [priceMin, setPriceMin] = useState(productPriceMin ?? '');
  const [priceMax, setPriceMax] = useState(productPriceMax ?? '');
  const [description, setDescription] = useState(productDescription ?? '');
  const [imageUris, setImageUris] = useState<string[]>(() => {
    if (productImages) {
      try { return JSON.parse(productImages); } catch { return []; }
    }
    return [];
  });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
      selectionLimit: 4,
    });
    if (!result.canceled) {
      const picked = result.assets.map((a) => a.uri);
      setImageUris((prev) => [...prev, ...picked].slice(0, 4));
    }
  };

  const validate = (): string | null => {
    if (!name.trim()) return 'Nama produk wajib diisi';
    if (!category) return 'Pilih kategori produk';
    return null;
  };

  const handleSave = async () => {
    const err = validate();
    if (err) { Alert.alert('Lengkapi Form', err); return; }
    if (!user) return;

    try {
      setSaving(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      // Split existing uploaded URLs vs new local URIs
      const alreadyUploaded = imageUris.filter((u) => u.startsWith('http'));
      const toUpload = imageUris.filter((u) => !u.startsWith('http'));
      const refId = tripId ?? productId!;
      const newUrls = toUpload.length > 0
        ? await Promise.all(toUpload.map((uri) => uploadProductImage(refId, uri)))
        : [];
      const allUrls = [...alreadyUploaded, ...newUrls];

      if (isEditMode) {
        await updateProduct(productId!, {
          name: name.trim(),
          category: category || null,
          description: description.trim() || null,
          price_min: priceMin ? parseInt(priceMin, 10) : null,
          price_max: priceMax ? parseInt(priceMax, 10) : null,
          image_urls: allUrls.length > 0 ? allUrls : null,
        });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert('Berhasil', 'Produk berhasil diperbarui!', [
          { text: 'OK', onPress: () => router.back() },
        ]);
      } else {
        if (!tripId) return;
        await createProduct({
          trip_id: tripId,
          triper_id: user.id,
          name: name.trim(),
          category: category || null,
          description: description.trim() || null,
          price_min: priceMin ? parseInt(priceMin, 10) : null,
          price_max: priceMax ? parseInt(priceMax, 10) : null,
          currency: 'IDR',
          image_urls: allUrls.length > 0 ? allUrls : null,
          is_available: true,
        } as any);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert('Berhasil', 'Produk berhasil ditambahkan ke trip!', [
          { text: 'OK', onPress: () => router.back() },
        ]);
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
        Alert.alert(
          'Tidak Bisa Dihapus',
          `Ada ${activeCount} pesanan aktif untuk produk ini. Selesaikan semua pesanan terlebih dahulu sebelum menghapus produk.`,
        );
        return;
      }

      Alert.alert(
        'Hapus Produk',
        'Produk ini akan dihapus permanen. Yakin?',
        [
          { text: 'Batal', style: 'cancel' },
          {
            text: 'Hapus',
            style: 'destructive',
            onPress: async () => {
              try {
                await deleteProduct(productId);
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                router.back();
              } catch (e: any) {
                Alert.alert('Gagal', e?.message ?? 'Gagal menghapus produk.');
              }
            },
          },
        ],
      );
    } catch {
      Alert.alert('Error', 'Gagal memeriksa pesanan aktif.');
    } finally {
      setDeleting(false);
    }
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
        <ScrollView style={s.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          {/* Images */}
          <View style={s.section}>
            <Text style={s.label}>Foto Produk</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.imgRow}>
              {imageUris.map((uri) => (
                <View key={uri} style={s.imgWrap}>
                  <Image source={{ uri }} style={s.imgThumb} contentFit="cover" />
                  <TouchableOpacity
                    style={s.imgRemove}
                    onPress={() => setImageUris((prev) => prev.filter((u) => u !== uri))}
                  >
                    <Ionicons name="close" size={14} color={Colors.white} />
                  </TouchableOpacity>
                </View>
              ))}
              {imageUris.length < 4 && (
                <TouchableOpacity style={s.imgAdd} onPress={pickImage}>
                  <Ionicons name="camera-outline" size={24} color={Colors.gray} />
                  <Text style={s.imgAddTxt}>Tambah</Text>
                </TouchableOpacity>
              )}
            </ScrollView>
          </View>

          {/* Name */}
          <View style={s.section}>
            <Text style={s.label}>Nama Produk <Text style={s.required}>*</Text></Text>
            <TextInput
              style={s.input}
              placeholder="Contoh: Parfum Chanel No.5"
              placeholderTextColor={Colors.gray}
              value={name}
              onChangeText={setName}
            />
          </View>

          {/* Category */}
          <View style={s.section}>
            <Text style={s.label}>Kategori <Text style={s.required}>*</Text></Text>
            <View style={s.catGrid}>
              {ITEM_CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[s.catBtn, category === cat.id && s.catBtnActive]}
                  onPress={() => setCategory(cat.id)}
                >
                  <Ionicons
                    name={cat.icon as any}
                    size={16}
                    color={category === cat.id ? Colors.primary : Colors.darkGray}
                  />
                  <Text style={[s.catTxt, category === cat.id && s.catTxtActive]}>{cat.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Price */}
          <View style={s.section}>
            <Text style={s.label}>Harga (IDR)</Text>
            <View style={s.priceRow}>
              <View style={s.priceField}>
                <Text style={s.priceLabel}>Min</Text>
                <TextInput
                  style={s.priceInput}
                  placeholder="0"
                  placeholderTextColor={Colors.gray}
                  keyboardType="numeric"
                  value={priceMin}
                  onChangeText={setPriceMin}
                />
              </View>
              <Text style={s.priceDash}>–</Text>
              <View style={s.priceField}>
                <Text style={s.priceLabel}>Max</Text>
                <TextInput
                  style={s.priceInput}
                  placeholder="0"
                  placeholderTextColor={Colors.gray}
                  keyboardType="numeric"
                  value={priceMax}
                  onChangeText={setPriceMax}
                />
              </View>
            </View>
          </View>

          {/* Description */}
          <View style={s.section}>
            <Text style={s.label}>Deskripsi</Text>
            <TextInput
              style={[s.input, s.textarea]}
              placeholder="Info tambahan tentang produk ini..."
              placeholderTextColor={Colors.gray}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              value={description}
              onChangeText={setDescription}
            />
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Save button */}
        <View style={s.footer}>
          <TouchableOpacity style={s.saveBtn} onPress={handleSave} disabled={saving || deleting} activeOpacity={0.85}>
            {saving ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <>
                <Ionicons name="checkmark-circle-outline" size={20} color={Colors.white} />
                <Text style={s.saveTxt}>{isEditMode ? 'Simpan Perubahan' : 'Simpan Produk'}</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.white },
  scroll: { flex: 1, paddingHorizontal: Spacing.xl },
  section: { marginTop: Spacing.xl },
  label: { fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.sm, color: Colors.charcoal, marginBottom: Spacing.sm },
  required: { color: Colors.error },

  imgRow: { flexDirection: 'row' },
  imgWrap: { position: 'relative', marginRight: Spacing.sm },
  imgThumb: { width: 80, height: 80, borderRadius: BorderRadius.md },
  imgRemove: {
    position: 'absolute', top: 4, right: 4,
    backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 10, width: 20, height: 20,
    alignItems: 'center', justifyContent: 'center',
  },
  imgAdd: {
    width: 80, height: 80, borderRadius: BorderRadius.md,
    borderWidth: 1.5, borderColor: Colors.lightGray, borderStyle: 'dashed',
    alignItems: 'center', justifyContent: 'center', gap: 4,
  },
  imgAddTxt: { fontFamily: Typography.regular.fontFamily, fontSize: 10, color: Colors.gray },

  input: {
    backgroundColor: Colors.offWhite, borderRadius: BorderRadius.lg,
    borderWidth: 1, borderColor: Colors.lightGray,
    paddingHorizontal: Spacing.base, paddingVertical: Spacing.md,
    fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.base, color: Colors.nearBlack,
  },
  textarea: { height: 100 },

  catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  catBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full, borderWidth: 1, borderColor: Colors.lightGray,
    backgroundColor: Colors.offWhite,
  },
  catBtnActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryPale },
  catTxt: { fontFamily: Typography.medium.fontFamily, fontSize: Typography.sizes.xs, color: Colors.darkGray },
  catTxtActive: { color: Colors.primary },

  priceRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  priceField: { flex: 1 },
  priceLabel: { fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.xs, color: Colors.gray, marginBottom: 4 },
  priceInput: {
    backgroundColor: Colors.offWhite, borderRadius: BorderRadius.lg,
    borderWidth: 1, borderColor: Colors.lightGray,
    paddingHorizontal: Spacing.base, paddingVertical: Spacing.md,
    fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.base, color: Colors.nearBlack,
  },
  priceDash: { fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.lg, color: Colors.gray, marginTop: 18 },

  footer: {
    paddingHorizontal: Spacing.xl, paddingTop: Spacing.base, paddingBottom: Spacing['2xl'],
    borderTopWidth: 1, borderTopColor: Colors.lightGray, backgroundColor: Colors.white,
  },
  saveBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm,
    backgroundColor: Colors.primary, borderRadius: BorderRadius.xl, paddingVertical: Spacing.base,
  },
  saveTxt: { fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.base, color: Colors.white, letterSpacing: 0.3 },
});
