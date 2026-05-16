import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Modal,
  FlatList,
  Image,
  Alert,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';

import { Colors, Typography, Spacing, BorderRadius, Shadows, ITEM_CATEGORIES } from '@/src/lib/constants';
import { useSettingsStore } from '@/src/store/settingsStore';
import { useAuthStore } from '@/src/store/authStore';
import { createTrip } from '@/src/lib/hooks/useTrips';
import { COUNTRIES_DATA } from '@/src/lib/countryData';

// ─── Product draft shape (matches CreateTripPayload.products element) ─────────
interface CreateTripProductDraft {
  name: string;
  category?: string;
  priceMin?: number;
  priceMax?: number;
  imageUris?: string[];
}

// ─── Country list (ISO subset) ───────────────────────────────────────────────
const COUNTRIES = [
  'Afghanistan','Albania','Algeria','Argentina','Australia','Austria','Bangladesh',
  'Belgium','Brazil','Cambodia','Canada','Chile','China','Colombia','Croatia',
  'Czech Republic','Denmark','Egypt','Ethiopia','Finland','France','Germany',
  'Ghana','Greece','Hong Kong','Hungary','India','Indonesia','Iran','Iraq',
  'Ireland','Israel','Italy','Japan','Jordan','Kenya','South Korea','Kuwait',
  'Malaysia','Mexico','Morocco','Myanmar','Nepal','Netherlands','New Zealand',
  'Nigeria','Norway','Pakistan','Peru','Philippines','Poland','Portugal',
  'Qatar','Romania','Russia','Saudi Arabia','Singapore','South Africa','Spain',
  'Sri Lanka','Sweden','Switzerland','Taiwan','Thailand','Turkey','UAE',
  'Ukraine','United Kingdom','United States','Vietnam','Zimbabwe',
].sort();

const CURRENCIES = ['IDR','USD','JPY','EUR','KRW','SGD','MYR','AUD','GBP'];

// ─── Sub-types ────────────────────────────────────────────────────────────────
interface ProductDraft extends CreateTripProductDraft {
  localId: string;
}

type DateField = 'depart' | 'return';

// ─── Component ────────────────────────────────────────────────────────────────
export default function CreateTripScreen() {
  const insets = useSafeAreaInsets();
  const { t } = useSettingsStore();
  const user = useAuthStore((s) => s.user);

  // Form state
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [destinationCity, setDestinationCity] = useState('');
  const [departDate, setDepartDate] = useState<Date>(new Date(Date.now() + 86400000 * 3));
  const [returnDate, setReturnDate] = useState<Date>(new Date(Date.now() + 86400000 * 10));
  const [capacity, setCapacity] = useState('');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [currency, setCurrency] = useState('IDR');
  const [notes, setNotes] = useState('');
  const [products, setProducts] = useState<ProductDraft[]>([]);

  // UI state
  const [countryModal, setCountryModal] = useState<'origin' | 'destination' | null>(null);
  const [countrySearch, setCountrySearch] = useState('');
  const [cityModal, setCityModal] = useState(false);
  const [citySearch, setCitySearch] = useState('');
  const [currencyModal, setCurrencyModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState<DateField | null>(null);
  const [pickerTempDate, setPickerTempDate] = useState<Date>(new Date());
  const [submitting, setSubmitting] = useState(false);

  const filteredCountries = COUNTRIES.filter((c) =>
    c.toLowerCase().includes(countrySearch.toLowerCase()),
  );

  // Kota tersedia untuk negara yang dipilih (dari COUNTRIES_DATA)
  const countryEntry = COUNTRIES_DATA.find(
    (c) => c.name.toLowerCase() === destination.toLowerCase()
  );
  const availableCities = countryEntry?.cities ?? [];
  const filteredCities = citySearch
    ? availableCities.filter((c) => c.toLowerCase().includes(citySearch.toLowerCase()))
    : availableCities;

  // ─── Date Picker helpers ──────────────────────────────────────────────────
  const openDatePicker = (field: DateField) => {
    setPickerTempDate(field === 'depart' ? departDate : returnDate);
    setShowDatePicker(field);
  };

  const confirmDate = () => {
    if (showDatePicker === 'depart') setDepartDate(pickerTempDate);
    else if (showDatePicker === 'return') setReturnDate(pickerTempDate);
    setShowDatePicker(null);
  };

  const formatDate = (d: Date) =>
    d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  // ─── Products ─────────────────────────────────────────────────────────────
  const addProduct = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setProducts((prev) => [
      ...prev,
      {
        localId: String(Date.now()),
        name: '',
        category: ITEM_CATEGORIES[0].id,
        priceMin: 0,
        priceMax: 0,
        imageUris: [],
      },
    ]);
  };

  const updateProduct = (localId: string, patch: Partial<ProductDraft>) => {
    setProducts((prev) => prev.map((p) => (p.localId === localId ? { ...p, ...patch } : p)));
  };

  const removeProduct = (localId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setProducts((prev) => prev.filter((p) => p.localId !== localId));
  };

  const pickProductImage = async (localId: string) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      const uri = result.assets[0].uri;
      setProducts((prev) =>
        prev.map((p) =>
          p.localId === localId
            ? { ...p, imageUris: [...(p.imageUris ?? []), uri] }
            : p,
        ),
      );
    }
  };

  // ─── Validation & Submit ──────────────────────────────────────────────────
  const validate = (): string | null => {
    if (!origin || !destination) return t.validationRequired;
    if (!destinationCity) return 'Pilih kota tujuan terlebih dahulu';
    const cap = parseFloat(capacity);
    if (!capacity || isNaN(cap) || cap <= 0) return t.validationCapacity;
    const min = parseFloat(priceMin);
    const max = parseFloat(priceMax);
    if (!priceMin || !priceMax || isNaN(min) || isNaN(max)) return t.validationRequired;
    if (min >= max) return t.validationPriceOrder;
    if (departDate >= returnDate) return t.validationDateOrder;
    const diff = (returnDate.getTime() - departDate.getTime()) / 86400000;
    if (diff < 1) return t.validationMinOneDay;
    return null;
  };

  const handleSubmit = async () => {
    const err = validate();
    if (err) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('', err);
      return;
    }
    if (!user) {
      Alert.alert('Sign In Required', 'Please sign in to create a trip.', [
        { text: 'Sign In', onPress: () => router.replace('/(auth)/login') },
      ]);
      return;
    }

    setSubmitting(true);
    try {
      await createTrip({
        triperId: user.id,
        originCountry: origin,
        destinationCountry: destination,
        destinationCity: destinationCity.trim() || undefined,
        departureDate: departDate.toISOString().split('T')[0],
        returnDate: returnDate.toISOString().split('T')[0],
        capacityKg: parseFloat(capacity),
        priceRangeMin: parseFloat(priceMin),
        priceRangeMax: parseFloat(priceMax),
        currency,
        notes,
        products: products.map(({ localId: _localId, ...p }) => ({
          name: p.name,
          category: p.category,
          priceMin: p.priceMin,
          priceMax: p.priceMax,
          imageUris: p.imageUris,
        })),
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(t.tripCreated, t.tripCreatedMsg, [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (e: unknown) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', e instanceof Error ? e.message : 'Failed to create trip');
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: Colors.offWhite }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={Colors.nearBlack} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t.createTrip}</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Origin */}
        <Text style={styles.label}>{t.tripOrigin} *</Text>
        <TouchableOpacity
          style={styles.selector}
          onPress={() => { setCountrySearch(''); setCountryModal('origin'); }}
        >
          <Ionicons name="airplane-outline" size={18} color={Colors.primary} style={styles.selectorIcon} />
          <Text style={[styles.selectorText, !origin && styles.placeholder]}>
            {origin || t.selectCountry}
          </Text>
          <Ionicons name="chevron-down" size={16} color={Colors.gray} />
        </TouchableOpacity>

        {/* Destination */}
        <Text style={styles.label}>{t.tripDestination} *</Text>
        <TouchableOpacity
          style={styles.selector}
          onPress={() => { setCountrySearch(''); setCountryModal('destination'); }}
        >
          <Ionicons name="location-outline" size={18} color={Colors.primary} style={styles.selectorIcon} />
          <Text style={[styles.selectorText, !destination && styles.placeholder]}>
            {destination || t.selectCountry}
          </Text>
          <Ionicons name="chevron-down" size={16} color={Colors.gray} />
        </TouchableOpacity>

        {/* Destination City — wajib */}
        <Text style={styles.label}>Kota Tujuan *</Text>
        <TouchableOpacity
          style={[styles.selector, !destination && styles.selectorDisabled]}
          onPress={() => {
            if (!destination) {
              Alert.alert('', 'Pilih negara tujuan dulu sebelum memilih kota');
              return;
            }
            setCitySearch('');
            setCityModal(true);
          }}
        >
          <Ionicons name="business-outline" size={18} color={destination ? Colors.primary : Colors.gray} style={styles.selectorIcon} />
          <Text style={[styles.selectorText, !destinationCity && styles.placeholder]}>
            {destinationCity || 'Pilih kota tujuan'}
          </Text>
          <Ionicons name="chevron-down" size={16} color={Colors.gray} />
        </TouchableOpacity>

        {/* Dates */}
        <View style={styles.row}>
          <View style={{ flex: 1, marginRight: Spacing.sm }}>
            <Text style={styles.label}>{t.departureDate} *</Text>
            <TouchableOpacity
              style={styles.selector}
              onPress={() => openDatePicker('depart')}
            >
              <Ionicons name="calendar-outline" size={18} color={Colors.primary} style={styles.selectorIcon} />
              <Text style={styles.selectorText}>{formatDate(departDate)}</Text>
            </TouchableOpacity>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>{t.returnDate} *</Text>
            <TouchableOpacity
              style={styles.selector}
              onPress={() => openDatePicker('return')}
            >
              <Ionicons name="calendar-outline" size={18} color={Colors.primary} style={styles.selectorIcon} />
              <Text style={styles.selectorText}>{formatDate(returnDate)}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Capacity */}
        <Text style={styles.label}>{t.capacityKg} *</Text>
        <View style={styles.inputRow}>
          <Ionicons name="cube-outline" size={18} color={Colors.primary} style={styles.selectorIcon} />
          <TextInput
            style={styles.textInput}
            value={capacity}
            onChangeText={setCapacity}
            keyboardType="decimal-pad"
            placeholder="e.g. 5"
            placeholderTextColor={Colors.gray}
          />
          <Text style={styles.unit}>kg</Text>
        </View>

        {/* Price Range */}
        <Text style={styles.label}>{t.priceRange} *</Text>
        <View style={styles.row}>
          <View style={[styles.inputRow, { flex: 1, marginRight: Spacing.sm }]}>
            <TextInput
              style={[styles.textInput, { flex: 1 }]}
              value={priceMin}
              onChangeText={setPriceMin}
              keyboardType="decimal-pad"
              placeholder={t.priceMin}
              placeholderTextColor={Colors.gray}
            />
          </View>
          <Text style={styles.rangeSep}>–</Text>
          <View style={[styles.inputRow, { flex: 1, marginLeft: Spacing.sm }]}>
            <TextInput
              style={[styles.textInput, { flex: 1 }]}
              value={priceMax}
              onChangeText={setPriceMax}
              keyboardType="decimal-pad"
              placeholder={t.priceMax}
              placeholderTextColor={Colors.gray}
            />
          </View>
        </View>

        {/* Currency */}
        <Text style={styles.label}>{t.currency}</Text>
        <TouchableOpacity style={styles.selector} onPress={() => setCurrencyModal(true)}>
          <Ionicons name="cash-outline" size={18} color={Colors.primary} style={styles.selectorIcon} />
          <Text style={styles.selectorText}>{currency}</Text>
          <Ionicons name="chevron-down" size={16} color={Colors.gray} />
        </TouchableOpacity>

        {/* Notes */}
        <Text style={styles.label}>{t.tripNotes}</Text>
        <TextInput
          style={[styles.textArea]}
          value={notes}
          onChangeText={setNotes}
          placeholder={t.tripNotesPlaceholder}
          placeholderTextColor={Colors.gray}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />

        {/* Products */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t.addProduct}</Text>
          <TouchableOpacity onPress={addProduct} style={styles.addBtn}>
            <Ionicons name="add" size={18} color={Colors.white} />
          </TouchableOpacity>
        </View>

        {products.map((product) => (
          <ProductCard
            key={product.localId}
            product={product}
            onUpdate={(patch) => updateProduct(product.localId, patch)}
            onRemove={() => removeProduct(product.localId)}
            onPickImage={() => pickProductImage(product.localId)}
            t={t}
          />
        ))}
      </ScrollView>

      {/* Submit button */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
        <TouchableOpacity
          style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={submitting}
          activeOpacity={0.85}
        >
          {submitting ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <Text style={styles.submitText}>{t.submitTrip}</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* City picker modal */}
      <Modal visible={cityModal} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Pilih Kota — {destination}</Text>
            <TouchableOpacity onPress={() => setCityModal(false)}>
              <Ionicons name="close" size={24} color={Colors.nearBlack} />
            </TouchableOpacity>
          </View>

          {availableCities.length > 0 ? (
            <>
              <TextInput
                style={styles.searchInput}
                value={citySearch}
                onChangeText={setCitySearch}
                placeholder="Cari kota..."
                placeholderTextColor={Colors.gray}
                autoFocus
              />
              <FlatList
                data={filteredCities}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.countryItem}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setDestinationCity(item);
                      setCityModal(false);
                    }}
                  >
                    <Text style={styles.countryText}>{item}</Text>
                    {destinationCity === item && (
                      <Ionicons name="checkmark" size={18} color={Colors.primary} />
                    )}
                  </TouchableOpacity>
                )}
                keyboardShouldPersistTaps="handled"
              />
            </>
          ) : (
            // Negara tidak ada di COUNTRIES_DATA — input manual
            <View style={styles.cityManualWrap}>
              <Text style={styles.cityManualLabel}>
                Masukkan nama kota untuk {destination}:
              </Text>
              <TextInput
                style={styles.cityManualInput}
                value={destinationCity}
                onChangeText={setDestinationCity}
                placeholder="Nama kota..."
                placeholderTextColor={Colors.gray}
                autoFocus
                returnKeyType="done"
                onSubmitEditing={() => {
                  if (destinationCity.trim()) setCityModal(false);
                }}
              />
              <TouchableOpacity
                style={[styles.cityManualBtn, !destinationCity.trim() && { opacity: 0.4 }]}
                disabled={!destinationCity.trim()}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setCityModal(false);
                }}
              >
                <Text style={styles.cityManualBtnTxt}>Konfirmasi</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Modal>

      {/* Country picker modal */}
      <Modal visible={!!countryModal} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{t.selectCountry}</Text>
            <TouchableOpacity onPress={() => setCountryModal(null)}>
              <Ionicons name="close" size={24} color={Colors.nearBlack} />
            </TouchableOpacity>
          </View>
          <TextInput
            style={styles.searchInput}
            value={countrySearch}
            onChangeText={setCountrySearch}
            placeholder={t.searchCountry}
            placeholderTextColor={Colors.gray}
            autoFocus
          />
          <FlatList
            data={filteredCountries}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.countryItem}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  if (countryModal === 'origin') {
                    setOrigin(item);
                  } else {
                    if (item !== destination) {
                      setDestination(item);
                      setDestinationCity(''); // reset kota jika negara berubah
                    }
                  }
                  setCountryModal(null);
                }}
              >
                <Text style={styles.countryText}>{item}</Text>
                {(countryModal === 'origin' ? origin : destination) === item && (
                  <Ionicons name="checkmark" size={18} color={Colors.primary} />
                )}
              </TouchableOpacity>
            )}
            keyboardShouldPersistTaps="handled"
          />
        </View>
      </Modal>

      {/* Date picker modal (no external dependency) */}
      <Modal visible={!!showDatePicker} animationType="slide" presentationStyle="pageSheet" transparent>
        <View style={styles.dateModalOverlay}>
          <View style={styles.dateModalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {showDatePicker === 'depart' ? t.departureDate : t.returnDate}
              </Text>
              <TouchableOpacity onPress={() => setShowDatePicker(null)}>
                <Ionicons name="close" size={24} color={Colors.nearBlack} />
              </TouchableOpacity>
            </View>

            <DateWheelPicker
              value={pickerTempDate}
              minDate={showDatePicker === 'return' ? departDate : new Date()}
              onChange={setPickerTempDate}
            />

            <View style={styles.dateModalActions}>
              <TouchableOpacity style={styles.dateModalCancel} onPress={() => setShowDatePicker(null)}>
                <Text style={styles.dateModalCancelText}>{t.cancel}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.dateModalConfirm} onPress={confirmDate}>
                <Text style={styles.dateModalConfirmText}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Currency picker modal */}
      <Modal visible={currencyModal} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{t.currency}</Text>
            <TouchableOpacity onPress={() => setCurrencyModal(false)}>
              <Ionicons name="close" size={24} color={Colors.nearBlack} />
            </TouchableOpacity>
          </View>
          {CURRENCIES.map((c) => (
            <TouchableOpacity
              key={c}
              style={styles.countryItem}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setCurrency(c);
                setCurrencyModal(false);
              }}
            >
              <Text style={styles.countryText}>{c}</Text>
              {currency === c && <Ionicons name="checkmark" size={18} color={Colors.primary} />}
            </TouchableOpacity>
          ))}
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

// ─── Date Wheel Picker (no external dep) ─────────────────────────────────────
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

interface DateWheelPickerProps {
  value: Date;
  minDate: Date;
  onChange: (d: Date) => void;
}

function DateWheelPicker({ value, minDate, onChange }: DateWheelPickerProps) {
  const year = value.getFullYear();
  const month = value.getMonth();
  const day = value.getDate();
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear + i);
  const days = Array.from({ length: daysInMonth(year, month) }, (_, i) => i + 1);

  const set = (patch: Partial<{ y: number; m: number; d: number }>) => {
    const ny = patch.y ?? year;
    const nm = patch.m ?? month;
    const nd = Math.min(patch.d ?? day, daysInMonth(ny, nm));
    const next = new Date(ny, nm, nd);
    if (next < minDate) {
      onChange(new Date(minDate));
    } else {
      onChange(next);
    }
  };

  return (
    <View style={dwStyles.container}>
      {/* Day */}
      <ScrollView style={dwStyles.col} showsVerticalScrollIndicator={false}>
        {days.map((d) => (
          <TouchableOpacity key={d} style={dwStyles.item} onPress={() => set({ d })}>
            <Text style={[dwStyles.itemText, day === d && dwStyles.selected]}>
              {String(d).padStart(2, '0')}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      {/* Month */}
      <ScrollView style={dwStyles.col} showsVerticalScrollIndicator={false}>
        {MONTHS.map((m, i) => (
          <TouchableOpacity key={m} style={dwStyles.item} onPress={() => set({ m: i })}>
            <Text style={[dwStyles.itemText, month === i && dwStyles.selected]}>{m}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      {/* Year */}
      <ScrollView style={dwStyles.col} showsVerticalScrollIndicator={false}>
        {years.map((y) => (
          <TouchableOpacity key={y} style={dwStyles.item} onPress={() => set({ y })}>
            <Text style={[dwStyles.itemText, year === y && dwStyles.selected]}>{y}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const dwStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: 200,
    paddingHorizontal: Spacing.base,
  },
  col: {
    flex: 1,
  },
  item: {
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemText: {
    ...Typography.regular,
    fontSize: Typography.sizes.base,
    color: Colors.darkGray,
  },
  selected: {
    ...Typography.bold,
    color: Colors.primary,
    fontSize: Typography.sizes.md,
  },
});

// ─── Product sub-card ─────────────────────────────────────────────────────────
interface ProductCardProps {
  product: ProductDraft;
  onUpdate: (patch: Partial<ProductDraft>) => void;
  onRemove: () => void;
  onPickImage: () => void;
  t: ReturnType<typeof useSettingsStore.getState>['t'];
}

function ProductCard({ product, onUpdate, onRemove, onPickImage, t }: ProductCardProps) {
  return (
    <View style={styles.productCard}>
      <View style={styles.productCardHeader}>
        <Text style={styles.productCardTitle}>{t.addProduct}</Text>
        <TouchableOpacity onPress={onRemove}>
          <Text style={styles.removeText}>{t.removeProduct}</Text>
        </TouchableOpacity>
      </View>

      {/* Image */}
      <TouchableOpacity style={styles.imagePickerBtn} onPress={onPickImage}>
        {product.imageUris?.[0] ? (
          <Image source={{ uri: product.imageUris[0] }} style={styles.productImage} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Ionicons name="camera-outline" size={28} color={Colors.gray} />
            <Text style={styles.imagePlaceholderText}>{t.addPhoto}</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Name */}
      <TextInput
        style={styles.productInput}
        value={product.name}
        onChangeText={(v) => onUpdate({ name: v })}
        placeholder={t.productName}
        placeholderTextColor={Colors.gray}
      />

      {/* Category chips */}
      <Text style={styles.productLabel}>{t.productCategory}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.chips}>
          {ITEM_CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[styles.chip, product.category === cat.id && styles.chipActive]}
              onPress={() => onUpdate({ category: cat.id })}
            >
              <Text style={[styles.chipText, product.category === cat.id && styles.chipTextActive]}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Price range */}
      <View style={styles.row}>
        <View style={[styles.inputRow, { flex: 1, marginRight: Spacing.sm }]}>
          <TextInput
            style={[styles.textInput, { flex: 1 }]}
            value={(product.priceMin ?? 0) > 0 ? String(product.priceMin) : ''}
            onChangeText={(v) => onUpdate({ priceMin: parseFloat(v) || 0 })}
            keyboardType="decimal-pad"
            placeholder={t.priceMin}
            placeholderTextColor={Colors.gray}
          />
        </View>
        <Text style={styles.rangeSep}>–</Text>
        <View style={[styles.inputRow, { flex: 1, marginLeft: Spacing.sm }]}>
          <TextInput
            style={[styles.textInput, { flex: 1 }]}
            value={(product.priceMax ?? 0) > 0 ? String(product.priceMax) : ''}
            onChangeText={(v) => onUpdate({ priceMax: parseFloat(v) || 0 })}
            keyboardType="decimal-pad"
            placeholder={t.priceMax}
            placeholderTextColor={Colors.gray}
          />
        </View>
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.md,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.cream,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...Typography.semiBold,
    fontSize: Typography.sizes.md,
    color: Colors.nearBlack,
  },
  content: {
    padding: Spacing.base,
  },
  label: {
    ...Typography.semiBold,
    fontSize: Typography.sizes.sm,
    color: Colors.charcoal,
    marginTop: Spacing.base,
    marginBottom: Spacing.xs,
  },
  selectorDisabled: {
    opacity: 0.5,
  },
  cityManualWrap: {
    flex: 1,
    padding: Spacing.base,
    gap: Spacing.md,
  },
  cityManualLabel: {
    ...Typography.medium,
    fontSize: Typography.sizes.sm,
    color: Colors.charcoal,
    marginTop: Spacing.sm,
  },
  cityManualInput: {
    backgroundColor: Colors.cream,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    height: 50,
    ...Typography.regular,
    fontSize: Typography.sizes.base,
    color: Colors.nearBlack,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  cityManualBtn: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.full,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.sm,
  },
  cityManualBtnTxt: {
    ...Typography.semiBold,
    fontSize: Typography.sizes.base,
    color: Colors.white,
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.midGray,
    paddingHorizontal: Spacing.md,
    height: 48,
    ...Shadows.sm,
  },
  selectorIcon: {
    marginRight: Spacing.sm,
  },
  selectorText: {
    flex: 1,
    ...Typography.regular,
    fontSize: Typography.sizes.base,
    color: Colors.nearBlack,
  },
  placeholder: {
    color: Colors.gray,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.midGray,
    paddingHorizontal: Spacing.md,
    height: 48,
    ...Shadows.sm,
  },
  textInput: {
    flex: 1,
    ...Typography.regular,
    fontSize: Typography.sizes.base,
    color: Colors.nearBlack,
    paddingVertical: 0,
  },
  unit: {
    ...Typography.medium,
    fontSize: Typography.sizes.sm,
    color: Colors.darkGray,
    marginLeft: Spacing.xs,
  },
  rangeSep: {
    ...Typography.bold,
    fontSize: Typography.sizes.md,
    color: Colors.gray,
    marginHorizontal: Spacing.xs,
    alignSelf: 'center',
  },
  textArea: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.midGray,
    padding: Spacing.md,
    ...Typography.regular,
    fontSize: Typography.sizes.base,
    color: Colors.nearBlack,
    minHeight: 100,
    ...Shadows.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.xl,
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    ...Typography.serifBold,
    fontSize: Typography.sizes.md,
    color: Colors.nearBlack,
  },
  addBtn: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  productCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.midGray,
    ...Shadows.md,
  },
  productCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  productCardTitle: {
    ...Typography.semiBold,
    fontSize: Typography.sizes.sm,
    color: Colors.charcoal,
  },
  removeText: {
    ...Typography.medium,
    fontSize: Typography.sizes.sm,
    color: Colors.error,
  },
  imagePickerBtn: {
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    marginBottom: Spacing.md,
  },
  productImage: {
    width: '100%',
    height: 160,
    borderRadius: BorderRadius.md,
  },
  imagePlaceholder: {
    height: 120,
    backgroundColor: Colors.cream,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.midGray,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
  },
  imagePlaceholderText: {
    ...Typography.regular,
    fontSize: Typography.sizes.sm,
    color: Colors.gray,
  },
  productInput: {
    backgroundColor: Colors.cream,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.midGray,
    paddingHorizontal: Spacing.md,
    height: 44,
    ...Typography.regular,
    fontSize: Typography.sizes.base,
    color: Colors.nearBlack,
    marginBottom: Spacing.md,
  },
  productLabel: {
    ...Typography.medium,
    fontSize: Typography.sizes.xs,
    color: Colors.darkGray,
    marginBottom: Spacing.xs,
  },
  chips: {
    flexDirection: 'row',
    gap: Spacing.xs,
    paddingBottom: Spacing.md,
  },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.cream,
    borderWidth: 1,
    borderColor: Colors.midGray,
  },
  chipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipText: {
    ...Typography.medium,
    fontSize: Typography.sizes.xs,
    color: Colors.darkGray,
  },
  chipTextActive: {
    color: Colors.white,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.base,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.lightGray,
  },
  submitBtn: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.glow,
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitText: {
    ...Typography.semiBold,
    fontSize: Typography.sizes.base,
    color: Colors.white,
    letterSpacing: 0.5,
  },
  dateModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  dateModalCard: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: BorderRadius['2xl'],
    borderTopRightRadius: BorderRadius['2xl'],
    paddingBottom: Spacing['2xl'],
    ...Shadows.lg,
  },
  dateModalActions: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.md,
    gap: Spacing.md,
  },
  dateModalCancel: {
    flex: 1,
    height: 48,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.midGray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateModalCancelText: {
    ...Typography.medium,
    fontSize: Typography.sizes.base,
    color: Colors.darkGray,
  },
  dateModalConfirm: {
    flex: 1,
    height: 48,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateModalConfirmText: {
    ...Typography.semiBold,
    fontSize: Typography.sizes.base,
    color: Colors.white,
  },
  modal: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  modalTitle: {
    ...Typography.serifBold,
    fontSize: Typography.sizes.md,
    color: Colors.nearBlack,
  },
  searchInput: {
    margin: Spacing.base,
    backgroundColor: Colors.cream,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    height: 44,
    ...Typography.regular,
    fontSize: Typography.sizes.base,
    color: Colors.nearBlack,
    borderWidth: 1,
    borderColor: Colors.midGray,
  },
  countryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  countryText: {
    ...Typography.regular,
    fontSize: Typography.sizes.base,
    color: Colors.nearBlack,
  },
});
