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
import { Colors, Typography, Spacing, BorderRadius, Shadows, ITEM_CATEGORIES } from '@/src/lib/constants';
import { useAuthStore } from '@/src/store/authStore';
import { createProduct, uploadProductImage } from '@/src/services/supabase/trips';

export default function AddProductScreen() {
  const { tripId } = useLocalSearchParams<{ tripId: string }>();
  const user = useAuthStore((s) => s.user);

  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [description, setDescription] = useState('');
  const [imageUris, setImageUris] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

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

  const removeImage = (uri: string) => {
    setImageUris((prev) => prev.filter((u) => u !== uri));
  };

  const validate = (): string | null => {
    if (!name.trim()) return 'Nama produk wajib diisi';
    if (!category) return 'Pilih kategori produk';
    return null;
  };

  const handleSave = async () => {
    const err = validate();
    if (err) { Alert.alert('Lengkapi Form', err); return; }
    if (!user || !tripId) return;

    try {
      setSaving(true);
      let uploadedUrls: string[] = [];
      if (imageUris.length > 0) {
        uploadedUrls = await Promise.all(imageUris.map((uri) => uploadProductImage(tripId, uri)));
      }
      await createProduct({
        trip_id: tripId,
        triper_id: user.id,
        name: name.trim(),
        category: category || null,
        description: description.trim() || null,
        price_min: priceMin ? parseInt(priceMin, 10) : null,
        price_max: priceMax ? parseInt(priceMax, 10) : null,
        currency: 'IDR',
        image_urls: uploadedUrls.length > 0 ? uploadedUrls : null,
        is_available: true,
      } as any);
      Alert.alert('Berhasil', 'Produk berhasil ditambahkan ke trip!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (e: any) {
      Alert.alert('Gagal', e?.message ?? 'Gagal menyimpan produk. Coba lagi.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={s.safe} edges={[]}>
      <PageHeader title="Tambah Produk" onBack={() => router.back()} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView style={s.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          {/* Images */}
          <View style={s.section}>
            <Text style={s.label}>Foto Produk</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.imgRow}>
              {imageUris.map((uri) => (
                <View key={uri} style={s.imgWrap}>
                  <Image source={{ uri }} style={s.imgThumb} contentFit="cover" />
                  <TouchableOpacity style={s.imgRemove} onPress={() => removeImage(uri)}>
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
          <TouchableOpacity style={s.saveBtn} onPress={handleSave} disabled={saving} activeOpacity={0.85}>
            {saving ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <>
                <Ionicons name="checkmark-circle-outline" size={20} color={Colors.white} />
                <Text style={s.saveTxt}>Simpan Produk</Text>
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
  floatingBack: {
    position: 'absolute', top: 12, left: 20, zIndex: 10,
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: 'rgba(0,0,0,0.06)',
    alignItems: 'center', justifyContent: 'center',
  },

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
