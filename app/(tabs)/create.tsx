/**
 * TipL — Create Request Screen (Request Jastip)
 * Multi-section form: Visual Reference, Item Details, Pricing Estimate.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { Colors, Typography, Spacing, BorderRadius, Shadows, ITEM_CATEGORIES } from '@/src/lib/constants';
import { Input } from '@/src/components/ui/Input';
import { Button } from '@/src/components/ui/Button';
import { useAuthStore } from '@/src/store/authStore';
import { createRequest, uploadRequestImage, updateRequestImageUrls } from '@/src/services/supabase/requests';

const COUNTRIES = [
  'Japan', 'South Korea', 'Singapore', 'United Kingdom', 'United States',
  'France', 'Germany', 'Australia', 'Thailand', 'Malaysia', 'Hong Kong',
];

export default function CreateRequestScreen() {
  const user = useAuthStore((s) => s.user);

  const [images, setImages]                   = useState<string[]>([]);
  const [itemName, setItemName]               = useState('');
  const [brand, setBrand]                     = useState('');
  const [description, setDescription]         = useState('');
  const [category, setCategory]               = useState('');
  const [quantity, setQuantity]               = useState('1');
  const [estimatedPrice, setEstimatedPrice]   = useState('');
  const [maxBudget, setMaxBudget]             = useState('');
  const [notes, setNotes]                     = useState('');
  const [targetCountry, setTargetCountry]     = useState('');
  const [loading, setLoading]                 = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 0.8,
      selectionLimit: 5,
    });
    if (!result.canceled) {
      setImages((prev) => [...prev, ...result.assets.map((a) => a.uri)]);
    }
  };

  const removeImage = (index: number) => setImages(images.filter((_, i) => i !== index));

  const reset = () => {
    setImages([]); setItemName(''); setBrand(''); setDescription('');
    setCategory(''); setQuantity('1'); setEstimatedPrice('');
    setMaxBudget(''); setNotes(''); setTargetCountry('');
  };

  const handleSubmit = async () => {
    if (!itemName.trim()) {
      Alert.alert('Info Kurang', 'Masukkan nama item.');
      return;
    }
    if (!category) {
      Alert.alert('Info Kurang', 'Pilih kategori.');
      return;
    }
    if (!maxBudget || isNaN(Number(maxBudget)) || Number(maxBudget) <= 0) {
      Alert.alert('Info Kurang', 'Masukkan budget maksimal yang valid.');
      return;
    }
    if (!targetCountry) {
      Alert.alert('Info Kurang', 'Pilih negara tujuan.');
      return;
    }
    if (!user) return;

    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      const fullDesc = [description.trim(), notes.trim()].filter(Boolean).join('\n\n');
      const request = await createRequest({
        tiper_id: user.id,
        item_name: itemName.trim(),
        description: fullDesc || undefined,
        budget_max: Number(maxBudget),
        currency: 'IDR',
        target_country: targetCountry,
        item_url: undefined,
      });

      // Upload images jika ada
      if (images.length > 0) {
        try {
          const urls: string[] = [];
          for (const uri of images) {
            const url = await uploadRequestImage(request.id, uri);
            urls.push(url);
          }
          await updateRequestImageUrls(request.id, urls);
        } catch { /* skip on upload failure */ }
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      reset();
      Alert.alert('Berhasil!', 'Permintaan jastip kamu sudah diposting.', [
        { text: 'Lihat Permintaan', onPress: () => router.push('/request' as any) },
        { text: 'OK' },
      ]);
    } catch (e: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', e?.message ?? 'Gagal submit permintaan. Coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={{ width: 44 }} />
          <Text style={styles.headerTitle}>Request Jastip</Text>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView
          style={styles.container}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Description */}
          <Text style={styles.pageDescription}>
            Provide the details of the item you wish{'\n'}
            to purchase. Our elite travelers will handle{'\n'}
            the rest.
          </Text>

          {/* Section 1: Visual Reference */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Visual Reference</Text>

            <TouchableOpacity style={styles.uploadArea} onPress={pickImage}>
              <View style={styles.uploadIcon}>
                <Ionicons name="cloud-upload-outline" size={36} color={Colors.gray} />
              </View>
              <Text style={styles.uploadTitle}>Upload Reference Photo</Text>
              <Text style={styles.uploadSubtext}>
                Drag and drop or click to{'\n'}browse
              </Text>
            </TouchableOpacity>

            {images.length > 0 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageRow}>
                {images.map((uri, idx) => (
                  <View key={idx} style={styles.previewContainer}>
                    <Image source={{ uri }} style={styles.previewImage} contentFit="cover" />
                    <TouchableOpacity style={styles.removeImage} onPress={() => removeImage(idx)}>
                      <Ionicons name="close-circle" size={22} color={Colors.error} />
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
              label="Item Name"
              placeholder="e.g. Artisan Ceramic Vase"
              value={itemName}
              onChangeText={setItemName}
            />

            <Input
              label="Brand (Optional)"
              placeholder="e.g. Studio Ghibli"
              value={brand}
              onChangeText={setBrand}
            />

            <Input
              label="Description"
              placeholder="Color, size, model, specifications..."
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
            />

            {/* Category Selector */}
            <Text style={styles.fieldLabel}>Category</Text>
            <View style={styles.chipGrid}>
              {ITEM_CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[styles.chip, category === cat.id && styles.chipActive]}
                  onPress={() => { setCategory(cat.id); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
                >
                  <Ionicons name={cat.icon as any} size={16} color={category === cat.id ? Colors.white : Colors.darkGray} />
                  <Text style={[styles.chipText, category === cat.id && styles.chipTextActive]}>{cat.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Input
              label="Quantity"
              value={quantity}
              onChangeText={setQuantity}
              keyboardType="numeric"
            />
          </View>

          {/* Section 3: Pricing Estimate */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Pricing Estimate</Text>

            <Input
              label="Estimated Item Price"
              placeholder="e.g. ¥5,000"
              value={estimatedPrice}
              onChangeText={setEstimatedPrice}
              keyboardType="numeric"
              icon="pricetag-outline"
            />

            <Input
              label="Maximum Budget (IDR)"
              placeholder="e.g. 1,500,000"
              value={maxBudget}
              onChangeText={setMaxBudget}
              keyboardType="numeric"
              icon="wallet-outline"
            />

            <Input
              label="Additional Notes"
              placeholder="Special instructions for the traveler..."
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
            />
          </View>

          {/* Section 4: Target Country */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Target Country</Text>
            <Text style={styles.fieldLabel}>Where should the traveler buy this?</Text>
            <View style={styles.chipGrid}>
              {COUNTRIES.map((country) => (
                <TouchableOpacity
                  key={country}
                  style={[styles.chip, targetCountry === country && styles.chipActive]}
                  onPress={() => { setTargetCountry(country); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
                >
                  <Text style={[styles.chipText, targetCountry === country && styles.chipTextActive]}>{country}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Info Banner */}
          <View style={styles.infoBanner}>
            <Ionicons name="shield-checkmark" size={20} color={Colors.primary} />
            <Text style={styles.infoText}>
              Funds will be held in escrow until you confirm delivery. Your purchase is protected.
            </Text>
          </View>

          {/* Submit */}
          <Button
            title="Submit Request"
            onPress={handleSubmit}
            loading={loading}
            fullWidth
            size="lg"
            style={{ marginBottom: Spacing['5xl'] }}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.white },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md,
    borderBottomWidth: 1, borderBottomColor: Colors.lightGray,
  },
  headerTitle: { fontFamily: Typography.serifBold.fontFamily, fontSize: Typography.sizes.md, color: Colors.nearBlack },
  container: { flex: 1, paddingHorizontal: Spacing.xl },
  pageDescription: {
    fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.sm,
    color: Colors.darkGray, lineHeight: 20, marginTop: Spacing.lg,
    marginBottom: Spacing['2xl'], textAlign: 'center',
  },
  section: { marginBottom: Spacing['2xl'] },
  sectionTitle: { fontFamily: Typography.serifBold.fontFamily, fontSize: Typography.sizes.lg, color: Colors.nearBlack, marginBottom: Spacing.base },
  uploadArea: {
    borderWidth: 2, borderColor: Colors.midGray, borderStyle: 'dashed',
    borderRadius: BorderRadius.lg, padding: Spacing['2xl'], alignItems: 'center', backgroundColor: Colors.offWhite,
  },
  uploadIcon: { width: 64, height: 64, borderRadius: 32, backgroundColor: Colors.cream, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.md },
  uploadTitle: { fontFamily: Typography.semiBold.fontFamily, fontSize: Typography.sizes.base, color: Colors.nearBlack, marginBottom: Spacing.xs },
  uploadSubtext: { fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.sm, color: Colors.gray, textAlign: 'center' },
  imageRow: { marginTop: Spacing.md },
  previewContainer: { marginRight: Spacing.sm, position: 'relative' },
  previewImage: { width: 80, height: 80, borderRadius: BorderRadius.md },
  removeImage: { position: 'absolute', top: -6, right: -6, backgroundColor: Colors.white, borderRadius: 11 },
  fieldLabel: { fontFamily: Typography.medium.fontFamily, fontSize: Typography.sizes.sm, color: Colors.darkGray, marginBottom: Spacing.sm },
  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.base },
  chip: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm, borderRadius: BorderRadius.full, borderWidth: 1,
    borderColor: Colors.midGray, backgroundColor: Colors.offWhite, gap: 6,
  },
  chipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipText: { fontFamily: Typography.medium.fontFamily, fontSize: Typography.sizes.xs, color: Colors.darkGray },
  chipTextActive: { color: Colors.white },
  infoBanner: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.primaryPale,
    borderRadius: BorderRadius.md, padding: Spacing.base, marginBottom: Spacing.xl,
    gap: Spacing.md, borderWidth: 1, borderColor: Colors.primaryLight,
  },
  infoText: { flex: 1, fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.xs, color: Colors.charcoal, lineHeight: 17 },
});
