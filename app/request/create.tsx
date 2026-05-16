/**
 * TipL — Create Custom Request Screen (Tiper/Buyer)
 * Premium UI for buyers to post a custom jastip request.
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { createRequest, uploadRequestImage, updateRequestImageUrls } from '@/src/services/supabase/requests';
import { useAuthStore } from '@/src/store/authStore';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/src/lib/constants';

const CATEGORIES = [
  { id: 'luxury', label: 'Luxury', icon: 'diamond-outline' },
  { id: 'skincare', label: 'Skincare', icon: 'leaf-outline' },
  { id: 'food', label: 'Food', icon: 'restaurant-outline' },
  { id: 'electronics', label: 'Electronics', icon: 'hardware-chip-outline' },
  { id: 'fashion', label: 'Fashion', icon: 'shirt-outline' },
  { id: 'other', label: 'Other', icon: 'grid-outline' },
];

const COUNTRIES = [
  'Japan', 'South Korea', 'Singapore', 'United Kingdom', 'United States',
  'France', 'Germany', 'Australia', 'Thailand', 'Malaysia', 'Hong Kong',
];

export default function CreateCustomRequestScreen() {
  const user = useAuthStore((s) => s.user);

  const [productName, setProductName] = useState('');
  const [description, setDescription] = useState('');
  const [maxBudget, setMaxBudget] = useState('');
  const [currency, setCurrency] = useState('IDR');
  const [category, setCategory] = useState('');
  const [targetCountries, setTargetCountries] = useState<string[]>([]);
  const [referenceUrl, setReferenceUrl] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const toggleCountry = useCallback((country: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTargetCountries((prev) =>
      prev.includes(country) ? prev.filter((c) => c !== country) : [...prev, country],
    );
  }, []);

  const handlePickImage = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });
    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
    }
  }, []);

  const validate = (): string | null => {
    if (!productName.trim()) return 'Product name is required.';
    if (!description.trim()) return 'Description is required.';
    if (!maxBudget || isNaN(Number(maxBudget)) || Number(maxBudget) <= 0) return 'Enter a valid budget.';
    if (!category) return 'Select a category.';
    if (targetCountries.length === 0) return 'Select at least one target country.';
    return null;
  };

  const handleSubmit = useCallback(async () => {
    const err = validate();
    if (err) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Validation', err);
      return;
    }
    if (!user) return;

    setSubmitting(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      // Create the request first
      const request = await createRequest({
        tiper_id: user.id,
        item_name: productName.trim(),
        item_url: referenceUrl.trim() || undefined,
        description: description.trim() || undefined,
        target_country: targetCountries[0] ?? '',
        budget_max: Number(maxBudget),
        currency,
      });

      // Upload image and save URL back to the request row
      if (imageUri) {
        try {
          const url = await uploadRequestImage(request.id, imageUri);
          await updateRequestImageUrls(request.id, [url]);
        } catch { /* skip on upload failure, request is still created */ }
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        'Request Posted!',
        'Travelers matching your destination will see your request.',
        [{ text: 'OK', onPress: () => router.back() }],
      );
    } catch (e) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', 'Failed to post request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productName, description, maxBudget, currency, category, targetCountries, referenceUrl, imageUri, user]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <LinearGradient colors={['#1A1A1A', '#2A2A2A']} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={Colors.white} />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>New Request</Text>
          <Text style={styles.headerSub}>Tell travelers what you need</Text>
        </View>
        <View style={styles.headerIcon}>
          <Ionicons name="bag-handle-outline" size={22} color={Colors.primary} />
        </View>
      </LinearGradient>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Product Image */}
          <Text style={styles.sectionLabel}>Product Photo</Text>
          <TouchableOpacity style={styles.imagePicker} onPress={handlePickImage} activeOpacity={0.8}>
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.imagePreview} contentFit="cover" />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Ionicons name="camera-outline" size={32} color={Colors.primary} />
                <Text style={styles.imagePlaceholderText}>Add reference photo</Text>
              </View>
            )}
            {imageUri && (
              <View style={styles.imageEditBadge}>
                <Ionicons name="pencil" size={12} color={Colors.white} />
              </View>
            )}
          </TouchableOpacity>

          {/* Product Name */}
          <Text style={styles.sectionLabel}>Product Name <Text style={styles.required}>*</Text></Text>
          <View style={styles.inputWrap}>
            <Ionicons name="cube-outline" size={18} color={Colors.gray} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="e.g. Dyson Airwrap Limited Edition"
              placeholderTextColor={Colors.gray}
              value={productName}
              onChangeText={setProductName}
              returnKeyType="next"
            />
          </View>

          {/* Description */}
          <Text style={styles.sectionLabel}>Description <Text style={styles.required}>*</Text></Text>
          <View style={[styles.inputWrap, styles.textAreaWrap]}>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Color, size, specific variant, where to buy..."
              placeholderTextColor={Colors.gray}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* Budget */}
          <Text style={styles.sectionLabel}>Maximum Budget <Text style={styles.required}>*</Text></Text>
          <View style={styles.budgetRow}>
            <TouchableOpacity
              style={[styles.currencyBtn, currency === 'IDR' && styles.currencyBtnActive]}
              onPress={() => { setCurrency('IDR'); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
            >
              <Text style={[styles.currencyText, currency === 'IDR' && styles.currencyTextActive]}>IDR</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.currencyBtn, currency === 'USD' && styles.currencyBtnActive]}
              onPress={() => { setCurrency('USD'); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
            >
              <Text style={[styles.currencyText, currency === 'USD' && styles.currencyTextActive]}>USD</Text>
            </TouchableOpacity>
            <View style={[styles.inputWrap, styles.budgetInput]}>
              <Ionicons name="wallet-outline" size={18} color={Colors.gray} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="500,000"
                placeholderTextColor={Colors.gray}
                value={maxBudget}
                onChangeText={setMaxBudget}
                keyboardType="numeric"
                returnKeyType="done"
              />
            </View>
          </View>

          {/* Category */}
          <Text style={styles.sectionLabel}>Category <Text style={styles.required}>*</Text></Text>
          <View style={styles.chipGrid}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[styles.chip, category === cat.id && styles.chipActive]}
                onPress={() => { setCategory(cat.id); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={cat.icon as any}
                  size={14}
                  color={category === cat.id ? Colors.white : Colors.darkGray}
                />
                <Text style={[styles.chipText, category === cat.id && styles.chipTextActive]}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Target Countries */}
          <Text style={styles.sectionLabel}>Target Countries <Text style={styles.required}>*</Text></Text>
          <Text style={styles.sectionHint}>Which countries can travelers buy this from?</Text>
          <View style={styles.chipGrid}>
            {COUNTRIES.map((country) => (
              <TouchableOpacity
                key={country}
                style={[styles.chip, targetCountries.includes(country) && styles.chipActive]}
                onPress={() => toggleCountry(country)}
                activeOpacity={0.7}
              >
                <Text style={[styles.chipText, targetCountries.includes(country) && styles.chipTextActive]}>
                  {country}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Reference URL */}
          <Text style={styles.sectionLabel}>Reference Link</Text>
          <View style={styles.inputWrap}>
            <Ionicons name="link-outline" size={18} color={Colors.gray} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="https://store.com/product..."
              placeholderTextColor={Colors.gray}
              value={referenceUrl}
              onChangeText={setReferenceUrl}
              keyboardType="url"
              autoCapitalize="none"
              returnKeyType="done"
            />
          </View>

          {/* Info Banner */}
          <View style={styles.infoBanner}>
            <Ionicons name="shield-checkmark-outline" size={18} color={Colors.primary} />
            <Text style={styles.infoText}>
              Your payment is protected by TipL escrow. Funds are only released after you confirm receipt.
            </Text>
          </View>

          {/* Submit */}
          <TouchableOpacity
            style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
            onPress={handleSubmit}
            disabled={submitting}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={[Colors.primaryGradientStart, Colors.primaryGradientEnd]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.submitGradient}
            >
              {submitting ? (
                <ActivityIndicator color={Colors.white} />
              ) : (
                <>
                  <Ionicons name="paper-plane-outline" size={20} color={Colors.white} />
                  <Text style={styles.submitText}>Post Request</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.offWhite },
  flex: { flex: 1 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.base,
    gap: Spacing.md,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: { flex: 1 },
  headerTitle: {
    fontFamily: Typography.bold.fontFamily,
    fontSize: Typography.sizes.lg,
    color: Colors.white,
  },
  headerSub: {
    fontFamily: Typography.regular.fontFamily,
    fontSize: Typography.sizes.xs,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 2,
  },
  headerIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(196,162,101,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  scroll: { flex: 1 },
  content: { padding: Spacing.base, paddingBottom: 40 },

  sectionLabel: {
    fontFamily: Typography.semiBold.fontFamily,
    fontSize: Typography.sizes.sm,
    color: Colors.charcoal,
    marginBottom: Spacing.sm,
    marginTop: Spacing.base,
  },
  sectionHint: {
    fontFamily: Typography.regular.fontFamily,
    fontSize: Typography.sizes.xs,
    color: Colors.gray,
    marginTop: -Spacing.xs,
    marginBottom: Spacing.sm,
  },
  required: { color: Colors.error },

  imagePicker: {
    width: 120,
    height: 120,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    marginBottom: Spacing.xs,
    ...Shadows.md,
  },
  imagePreview: { width: '100%', height: '100%' },
  imagePlaceholder: {
    flex: 1,
    backgroundColor: Colors.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
  },
  imagePlaceholderText: {
    fontFamily: Typography.regular.fontFamily,
    fontSize: Typography.sizes.xs,
    color: Colors.gray,
    textAlign: 'center',
  },
  imageEditBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.midGray,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
    ...Shadows.sm,
  },
  inputIcon: { marginRight: Spacing.sm },
  input: {
    flex: 1,
    fontFamily: Typography.regular.fontFamily,
    fontSize: Typography.sizes.base,
    color: Colors.nearBlack,
    paddingVertical: Spacing.md,
  },
  textAreaWrap: { alignItems: 'flex-start', paddingTop: Spacing.sm },
  textArea: { minHeight: 100, paddingVertical: Spacing.sm },

  budgetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  currencyBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderColor: Colors.midGray,
    backgroundColor: Colors.white,
  },
  currencyBtnActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '15',
  },
  currencyText: {
    fontFamily: Typography.semiBold.fontFamily,
    fontSize: Typography.sizes.sm,
    color: Colors.darkGray,
  },
  currencyTextActive: { color: Colors.primaryDark },
  budgetInput: { flex: 1, marginBottom: 0 },

  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1.5,
    borderColor: Colors.midGray,
    backgroundColor: Colors.white,
  },
  chipActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary,
  },
  chipText: {
    fontFamily: Typography.medium.fontFamily,
    fontSize: Typography.sizes.xs,
    color: Colors.darkGray,
  },
  chipTextActive: { color: Colors.white },

  infoBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    backgroundColor: Colors.primary + '12',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.primary + '30',
  },
  infoText: {
    flex: 1,
    fontFamily: Typography.regular.fontFamily,
    fontSize: Typography.sizes.xs,
    color: Colors.charcoal,
    lineHeight: 18,
  },

  submitBtn: { marginTop: Spacing.md, borderRadius: BorderRadius.lg, overflow: 'hidden', ...Shadows.glow },
  submitBtnDisabled: { opacity: 0.7 },
  submitGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.base,
  },
  submitText: {
    fontFamily: Typography.bold.fontFamily,
    fontSize: Typography.sizes.base,
    color: Colors.white,
    letterSpacing: 0.5,
  },
});
