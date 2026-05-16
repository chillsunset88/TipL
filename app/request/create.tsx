/**
 * TipL — Create Request (tripper-specific)
 * Opened from trip detail page with tripId + triperId params.
 * Same UI style as the Order tab form.
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
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { Colors, Typography, Spacing, BorderRadius, Shadows, ITEM_CATEGORIES } from '@/src/lib/constants';
import { Input } from '@/src/components/ui/Input';
import { Button } from '@/src/components/ui/Button';
import { useAuthStore } from '@/src/store/authStore';
import { createRequest, uploadRequestImage, updateRequestImageUrls, acceptRequest } from '@/src/services/supabase/requests';

const COUNTRIES = [
  'Japan', 'South Korea', 'Singapore', 'United Kingdom', 'United States',
  'France', 'Germany', 'Australia', 'Thailand', 'Malaysia', 'Hong Kong',
];

export default function CreateRequestScreen() {
  const { tripId, triperId, triperName } = useLocalSearchParams<{
    tripId?: string;
    triperId?: string;
    triperName?: string;
  }>();
  const user = useAuthStore((s) => s.user);

  const [images, setImages]                 = useState<string[]>([]);
  const [itemName, setItemName]             = useState('');
  const [brand, setBrand]                   = useState('');
  const [description, setDescription]       = useState('');
  const [category, setCategory]             = useState('');
  const [quantity, setQuantity]             = useState('1');
  const [estimatedPrice, setEstimatedPrice] = useState('');
  const [maxBudget, setMaxBudget]           = useState('');
  const [notes, setNotes]                   = useState('');
  const [targetCountry, setTargetCountry]   = useState('');
  const [loading, setLoading]               = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 0.8,
      selectionLimit: 5,
    });
    if (!result.canceled) setImages((prev) => [...prev, ...result.assets.map((a) => a.uri)]);
  };

  const removeImage = (index: number) => setImages(images.filter((_, i) => i !== index));

  const handleSubmit = async () => {
    if (!itemName.trim()) { Alert.alert('Info Kurang', 'Masukkan nama item.'); return; }
    if (!category) { Alert.alert('Info Kurang', 'Pilih kategori.'); return; }
    if (!maxBudget || isNaN(Number(maxBudget)) || Number(maxBudget) <= 0) {
      Alert.alert('Info Kurang', 'Masukkan budget maksimal yang valid.'); return;
    }
    if (!targetCountry) { Alert.alert('Info Kurang', 'Pilih negara tujuan.'); return; }
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

      // Langsung link ke tripper jika ini request spesifik
      if (triperId) {
        await acceptRequest(request.id, triperId);
      }

      // Upload images
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
      Alert.alert(
        'Berhasil!',
        triperId
          ? `Permintaanmu sudah dikirim ke ${triperName ?? 'traveler'}.`
          : 'Permintaanmu sudah diposting.',
        [{ text: 'OK', onPress: () => router.back() }],
      );
    } catch (e: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', e?.message ?? 'Gagal submit permintaan. Coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <TouchableOpacity onPress={() => router.back()} style={styles.floatingBack}>
          <Ionicons name="arrow-back" size={20} color={Colors.nearBlack} />
        </TouchableOpacity>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Tripper banner jika request spesifik */}
          {triperId && (
            <View style={styles.triperBanner}>
              <View style={styles.triperAvatarCircle}>
                <Text style={styles.triperInitial}>
                  {(triperName?.[0] ?? 'T').toUpperCase()}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.triperBannerLabel}>Requesting to</Text>
                <Text style={styles.triperBannerName}>{triperName ?? 'Traveler'}</Text>
              </View>
              <Ionicons name="airplane" size={20} color={Colors.primary} />
            </View>
          )}

          {/* Deskripsi halaman */}
          <Text style={styles.pageDescription}>
            {triperId
              ? `Ceritakan barang yang kamu inginkan. ${triperName ?? 'Traveler'} akan membawakan untuk kamu.`
              : 'Provide the details of the item you wish to purchase. Our elite travelers will handle the rest.'}
          </Text>

          {/* Section 1: Visual Reference */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Visual Reference</Text>
            <TouchableOpacity style={styles.uploadArea} onPress={pickImage} activeOpacity={0.8}>
              <View style={styles.uploadIcon}>
                <Ionicons name="cloud-upload-outline" size={36} color={Colors.gray} />
              </View>
              <Text style={styles.uploadTitle}>Upload Reference Photo</Text>
              <Text style={styles.uploadSubtext}>Tap to browse from gallery</Text>
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
            <Input label="Item Name" placeholder="e.g. Artisan Ceramic Vase" value={itemName} onChangeText={setItemName} />
            <Input label="Brand (Optional)" placeholder="e.g. Studio Ghibli" value={brand} onChangeText={setBrand} />
            <Input
              label="Description"
              placeholder="Color, size, model, specifications..."
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
            />

            <Text style={styles.fieldLabel}>Category</Text>
            <View style={styles.chipGrid}>
              {ITEM_CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[styles.chip, category === cat.id && styles.chipActive]}
                  onPress={() => { setCategory(cat.id); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
                >
                  <Ionicons name={cat.icon as any} size={15} color={category === cat.id ? Colors.white : Colors.darkGray} />
                  <Text style={[styles.chipText, category === cat.id && styles.chipTextActive]}>{cat.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Input label="Quantity" value={quantity} onChangeText={setQuantity} keyboardType="numeric" />
          </View>

          {/* Section 3: Pricing */}
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

          <Button
            title={triperId ? `Kirim ke ${triperName ?? 'Traveler'}` : 'Submit Request'}
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
  floatingBack: {
    position: 'absolute', top: 12, left: 20, zIndex: 10,
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: 'rgba(0,0,0,0.06)',
    alignItems: 'center', justifyContent: 'center',
  },

  scroll: { flex: 1 },
  content: { paddingHorizontal: Spacing.xl, paddingTop: 60, paddingBottom: 40 },

  triperBanner: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    backgroundColor: Colors.primary + '12', borderRadius: BorderRadius.lg,
    padding: Spacing.md, marginTop: Spacing.base,
    borderWidth: 1, borderColor: Colors.primary + '30',
  },
  triperAvatarCircle: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.primary + '25', alignItems: 'center', justifyContent: 'center',
  },
  triperInitial: { fontFamily: Typography.bold.fontFamily, fontSize: Typography.sizes.base, color: Colors.primary },
  triperBannerLabel: { fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.xs, color: Colors.gray },
  triperBannerName: { fontFamily: Typography.semiBold.fontFamily, fontSize: Typography.sizes.base, color: Colors.nearBlack },

  pageDescription: {
    fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.sm,
    color: Colors.darkGray, lineHeight: 20, marginTop: Spacing.base,
    marginBottom: Spacing.xl, textAlign: 'center',
  },

  section: { marginBottom: Spacing['2xl'] },
  sectionTitle: { fontFamily: Typography.serifBold.fontFamily, fontSize: Typography.sizes.lg, color: Colors.nearBlack, marginBottom: Spacing.base },
  fieldLabel: { fontFamily: Typography.medium.fontFamily, fontSize: Typography.sizes.sm, color: Colors.darkGray, marginBottom: Spacing.sm },

  uploadArea: {
    borderWidth: 2, borderColor: Colors.midGray, borderStyle: 'dashed',
    borderRadius: BorderRadius.lg, padding: Spacing['2xl'], alignItems: 'center', backgroundColor: Colors.offWhite,
  },
  uploadIcon: { width: 64, height: 64, borderRadius: 32, backgroundColor: Colors.cream, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.md },
  uploadTitle: { fontFamily: Typography.semiBold.fontFamily, fontSize: Typography.sizes.base, color: Colors.nearBlack, marginBottom: Spacing.xs },
  uploadSubtext: { fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.sm, color: Colors.gray },
  imageRow: { marginTop: Spacing.md },
  previewContainer: { marginRight: Spacing.sm, position: 'relative' },
  previewImage: { width: 80, height: 80, borderRadius: BorderRadius.md },
  removeImage: { position: 'absolute', top: -6, right: -6, backgroundColor: Colors.white, borderRadius: 11 },

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
