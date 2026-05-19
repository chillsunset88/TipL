/**
 * TipL — Create Request (tripper-specific)
 * Opened from trip detail page with tripId + triperId params.
 * Theme-aware: supports Dark Mode & Light Mode.
 */

import { Button } from '@/src/components/ui/Button';
import { Input } from '@/src/components/ui/Input';
import { PageHeader } from '@/src/components/ui/PageHeader';
import { BorderRadius, ITEM_CATEGORIES, Spacing, Typography } from '@/src/lib/constants';
import { useThemeColors } from '@/src/lib/hooks/useThemeColors';
import { acceptRequest, createRequest, updateRequestImageUrls, uploadRequestImage } from '@/src/services/supabase/requests';
import { useAuthStore } from '@/src/store/authStore';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const COUNTRIES = [
  'Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola', 'Antigua and Barbuda', 'Argentina', 'Armenia', 'Australia', 'Austria', 'Azerbaijan',
  'Bahamas', 'Bahrain', 'Bangladesh', 'Barbados', 'Belarus', 'Belgium', 'Belize', 'Benin', 'Bhutan', 'Bolivia', 'Bosnia and Herzegovina', 'Botswana', 'Brazil', 'Brunei', 'Bulgaria', 'Burkina Faso', 'Burundi',
  'Cabo Verde', 'Cambodia', 'Cameroon', 'Canada', 'Central African Republic', 'Chad', 'Chile', 'China', 'Colombia', 'Comoros', 'Costa Rica', 'Côte d’Ivoire', 'Croatia', 'Cuba', 'Cyprus', 'Czech Republic',
  'Democratic Republic of the Congo', 'Denmark', 'Djibouti', 'Dominica', 'Dominican Republic', 'Ecuador', 'Egypt', 'El Salvador', 'Equatorial Guinea', 'Eritrea', 'Estonia', 'Eswatini', 'Ethiopia',
  'Fiji', 'Finland', 'France', 'Gabon', 'Gambia', 'Georgia', 'Germany', 'Ghana', 'Greece', 'Grenada', 'Guatemala', 'Guinea', 'Guinea-Bissau', 'Guyana',
  'Haiti', 'Honduras', 'Hungary', 'Iceland', 'India', 'Indonesia', 'Iran', 'Iraq', 'Ireland', 'Israel', 'Italy', 'Jamaica', 'Japan', 'Jordan',
  'Kazakhstan', 'Kenya', 'Kiribati', 'Kosovo', 'Kuwait', 'Kyrgyzstan', 'Laos', 'Latvia', 'Lebanon', 'Lesotho', 'Liberia', 'Libya', 'Liechtenstein', 'Lithuania', 'Luxembourg',
  'Madagascar', 'Malawi', 'Malaysia', 'Maldives', 'Mali', 'Malta', 'Marshall Islands', 'Mauritania', 'Mauritius', 'Mexico', 'Micronesia', 'Moldova', 'Monaco', 'Mongolia', 'Montenegro', 'Morocco', 'Mozambique', 'Myanmar',
  'Namibia', 'Nauru', 'Nepal', 'Netherlands', 'New Zealand', 'Nicaragua', 'Niger', 'Nigeria', 'North Korea', 'North Macedonia', 'Norway', 'Oman', 'Pakistan', 'Palau', 'Panama', 'Papua New Guinea', 'Paraguay', 'Peru', 'Philippines', 'Poland', 'Portugal', 'Qatar',
  'Romania', 'Russia', 'Rwanda', 'Saint Kitts and Nevis', 'Saint Lucia', 'Saint Vincent and the Grenadines', 'Samoa', 'San Marino', 'Sao Tome and Principe', 'Saudi Arabia', 'Senegal', 'Serbia', 'Seychelles', 'Sierra Leone', 'Singapore', 'Slovakia', 'Slovenia', 'Solomon Islands', 'Somalia', 'South Africa', 'South Korea', 'South Sudan', 'Spain', 'Sri Lanka', 'Sudan', 'Suriname', 'Sweden', 'Switzerland', 'Syria',
  'Taiwan', 'Tajikistan', 'Tanzania', 'Thailand', 'Timor-Leste', 'Togo', 'Tonga', 'Trinidad and Tobago', 'Tunisia', 'Turkey', 'Turkmenistan', 'Tuvalu', 'Uganda', 'Ukraine', 'United Arab Emirates', 'United Kingdom', 'United States', 'Uruguay', 'Uzbekistan', 'Vanuatu', 'Vatican City', 'Venezuela', 'Vietnam', 'Yemen', 'Zambia', 'Zimbabwe',
];

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

export default function CreateRequestScreen() {
  const C = useThemeColors();
  const { tripId, triperId, triperName } = useLocalSearchParams<{
    tripId?: string;
    triperId?: string;
    triperName?: string;
  }>();
  const user = useAuthStore((s) => s.user);

  const [images, setImages] = useState<string[]>([]);
  const [itemName, setItemName] = useState('');
  const [brand, setBrand] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [currency, setCurrency] = useState('IDR');
  const [estimatedPrice, setEstimatedPrice] = useState('');
  const [maxBudget, setMaxBudget] = useState('');
  const [notes, setNotes] = useState('');
  const [targetCountry, setTargetCountry] = useState('');
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Izin Diperlukan', 'Izinkan akses galeri untuk mengunggah referensi foto.');
      return;
    }
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

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Izin Diperlukan', 'Izinkan akses kamera untuk mengambil referensi foto.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]?.uri) {
      setImages((prev) => [...prev, result.assets[0].uri]);
    }
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

  const styles = React.useMemo(() => StyleSheet.create({
    safe: { flex: 1, backgroundColor: C.white },
    floatingBack: {
      position: 'absolute', top: 12, left: 20, zIndex: 10,
      width: 38, height: 38, borderRadius: 19,
      backgroundColor: 'rgba(0,0,0,0.06)',
      alignItems: 'center', justifyContent: 'center',
    },

    scroll: { flex: 1 },
    content: { paddingHorizontal: Spacing.xl, paddingBottom: 40 },

    triperBanner: {
      flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
      backgroundColor: C.primary + '12', borderRadius: BorderRadius.lg,
      padding: Spacing.md, marginTop: Spacing.base,
      borderWidth: 1, borderColor: C.primary + '30',
    },
    triperAvatarCircle: {
      width: 40, height: 40, borderRadius: 20,
      backgroundColor: C.primary + '25', alignItems: 'center', justifyContent: 'center',
    },
    triperInitial: { fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.base, color: C.primary },
    triperBannerLabel: { fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.xs, color: C.gray },
    triperBannerName: { fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.base, color: C.nearBlack },

    pageDescription: {
      fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.sm,
      color: C.darkGray, lineHeight: 20, marginTop: Spacing.base,
      marginBottom: Spacing.xl, textAlign: 'center',
    },

    section: { marginBottom: Spacing['2xl'] },
    sectionTitle: { fontFamily: Typography.serifBold.fontFamily, fontSize: Typography.sizes.lg, color: C.nearBlack, marginBottom: Spacing.base },
    fieldLabel: { fontFamily: Typography.medium.fontFamily, fontSize: Typography.sizes.sm, color: C.darkGray, marginBottom: Spacing.sm },

    uploadActions: {
      flexDirection: 'row',
      gap: Spacing.sm,
      justifyContent: 'space-between',
      marginBottom: Spacing.md,
    },
    uploadButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: Spacing.xs,
      paddingVertical: Spacing.sm,
      borderRadius: BorderRadius.md,
      borderWidth: 1,
      borderColor: C.lightGray,
      backgroundColor: C.white,
    },
    uploadBtnText: {
      fontFamily: Typography.medium.fontFamily,
      fontSize: Typography.sizes.sm,
      color: C.primary,
    },
    uploadArea: {
      borderWidth: 2, borderColor: C.lightGray, borderStyle: 'dashed',
      borderRadius: BorderRadius.lg, padding: Spacing['2xl'], alignItems: 'center', backgroundColor: C.offWhite,
    },
    uploadIcon: { width: 64, height: 64, borderRadius: 32, backgroundColor: C.primary + '15', alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.md },
    uploadTitle: { fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.base, color: C.nearBlack, marginBottom: Spacing.xs },
    uploadSubtext: { fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.sm, color: C.gray },
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

    countryDropdown: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.md,
      borderRadius: BorderRadius.md,
      borderWidth: 1,
      borderColor: C.lightGray,
      backgroundColor: C.white,
    },
    countryDropdownText: {
      fontFamily: Typography.regular.fontFamily,
      fontSize: Typography.sizes.base,
      color: targetCountry ? C.nearBlack : C.gray,
      flex: 1,
    },

    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },
    modalContent: {
      backgroundColor: C.white,
      borderTopLeftRadius: BorderRadius.xl,
      borderTopRightRadius: BorderRadius.xl,
      maxHeight: '80%',
      paddingTop: Spacing.md,
    },
    modalHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: Spacing.xl,
      paddingVertical: Spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: C.lightGray,
    },
    modalTitle: {
      fontFamily: Typography.serifBold.fontFamily,
      fontSize: Typography.sizes.lg,
      color: C.nearBlack,
    },
    countryOption: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: Spacing.xl,
      paddingVertical: Spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: C.offWhite,
    },
    countryOptionText: {
      fontFamily: Typography.regular.fontFamily,
      fontSize: Typography.sizes.base,
      color: C.charcoal,
      flex: 1,
    },
    countryOptionTextActive: {
      fontFamily: Typography.medium.fontFamily,
      color: C.primary,
    },

    infoBanner: {
      flexDirection: 'row', alignItems: 'center', backgroundColor: C.primary + '12',
      borderRadius: BorderRadius.md, padding: Spacing.base, marginBottom: Spacing.xl,
      gap: Spacing.md, borderWidth: 1, borderColor: C.primary + '30',
    },
    infoText: { flex: 1, fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.xs, color: C.charcoal, lineHeight: 17 },
  }), [C, targetCountry]);

  return (
    <SafeAreaView style={styles.safe} edges={[]}>
      <PageHeader title="Buat Permintaan" onBack={() => router.back()} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
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
              <Ionicons name="airplane" size={20} color={C.primary} />
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
            <View style={styles.uploadActions}>
              <TouchableOpacity style={styles.uploadButton} onPress={pickImage} activeOpacity={0.8}>
                <Ionicons name="image-outline" size={24} color={C.primary} />
                <Text style={styles.uploadBtnText}>Gallery</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.uploadButton} onPress={takePhoto} activeOpacity={0.8}>
                <Ionicons name="camera-outline" size={24} color={C.primary} />
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
            {images.length > 0 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageRow}>
                {images.map((uri, idx) => (
                  <View key={idx} style={styles.previewContainer}>
                    <Image source={{ uri }} style={styles.previewImage} contentFit="cover" />
                    <TouchableOpacity style={styles.removeImage} onPress={() => removeImage(idx)}>
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
                  <Ionicons name={cat.icon as any} size={15} color={category === cat.id ? '#FFFFFF' : C.darkGray} />
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
              label="Estimated Item Price (IDR)"
              placeholder="Rp 1.500.000"
              value={estimatedPrice}
              onChangeText={(value) => handleRupiahInput(value, setEstimatedPrice)}
              keyboardType="numeric"
              icon="pricetag-outline"
            />
            <Input
              label="Maximum Budget (IDR)"
              placeholder="Rp 1.500.000"
              value={maxBudget}
              onChangeText={(value) => handleRupiahInput(value, setMaxBudget)}
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
            <TouchableOpacity
              style={styles.countryDropdown}
              onPress={() => setShowCountryModal(true)}
              activeOpacity={0.8}
            >
              <Text style={styles.countryDropdownText}>
                {targetCountry || 'Select a country...'}
              </Text>
              <Ionicons name="chevron-down" size={20} color={C.primary} />
            </TouchableOpacity>
          </View>

          {/* Info Banner */}
          <View style={styles.infoBanner}>
            <Ionicons name="shield-checkmark" size={20} color={C.primary} />
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

      {/* Country Selection Modal */}
      <Modal
        visible={showCountryModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCountryModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Country</Text>
              <TouchableOpacity
                onPress={() => setShowCountryModal(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close" size={24} color={C.nearBlack} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={COUNTRIES}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.countryOption}
                  onPress={() => {
                    setTargetCountry(item);
                    setShowCountryModal(false);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                >
                  <Text style={[styles.countryOptionText, targetCountry === item && styles.countryOptionTextActive]}>
                    {item}
                  </Text>
                  {targetCountry === item && (
                    <Ionicons name="checkmark" size={20} color={C.primary} />
                  )}
                </TouchableOpacity>
              )}
              scrollEnabled
              bounces={false}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
