/**
 * TipL — Address Management Screen
 * List, add, edit, delete, and set default shipping addresses.
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { PageHeader } from '@/src/components/ui/PageHeader';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/src/lib/constants';
import { useSettingsStore } from '@/src/store/settingsStore';
import { useAuthStore } from '@/src/store/authStore';
import {
  getAddresses,
  upsertAddress,
  deleteAddress,
  setDefaultAddress,
  type UserAddress,
} from '@/src/services/supabase/addresses';

const EMPTY_FORM = {
  label: 'Rumah',
  recipient_name: '',
  phone: '',
  full_address: '',
  city: '',
  province: '',
  postal_code: '',
  is_default: false,
};

export default function AddressesScreen() {
  const user = useAuthStore((s) => s.user);
  const userId = user?.id ?? '';

  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { t } = useSettingsStore();

  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const load = useCallback(async () => {
    if (!userId) { setLoading(false); return; }
    try {
      const data = await getAddresses(userId);
      setAddresses(data);
    } catch {}
    finally { setLoading(false); }
  }, [userId]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const openAdd = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setModalVisible(true);
  };

  const openEdit = (addr: UserAddress) => {
    setEditingId(addr.id);
    setForm({
      label: addr.label,
      recipient_name: addr.recipient_name,
      phone: addr.phone,
      full_address: addr.full_address,
      city: addr.city,
      province: addr.province,
      postal_code: addr.postal_code,
      is_default: addr.is_default,
    });
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!form.recipient_name.trim() || !form.phone.trim() || !form.full_address.trim() || !form.city.trim()) {
      Alert.alert(t.error, 'Nama penerima, nomor HP, alamat, dan kota wajib diisi.');
      return;
    }
    setSaving(true);
    try {
      const payload: any = { ...form, user_id: userId };
      if (editingId) payload.id = editingId;
      const saved = await upsertAddress(payload);
      if (form.is_default) await setDefaultAddress(userId, saved.id);
      setModalVisible(false);
      load();
    } catch (e: any) {
      Alert.alert('Gagal menyimpan', e?.message ?? 'Terjadi kesalahan.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (addr: UserAddress) => {
    Alert.alert(t.deleteAddressTitle, `Hapus "${addr.label}"?`, [
      { text: t.cancel, style: 'cancel' },
      {
        text: 'Hapus', style: 'destructive', onPress: async () => {
          await deleteAddress(addr.id).catch(() => {});
          load();
        },
      },
    ]);
  };

  const handleSetDefault = async (addr: UserAddress) => {
    await setDefaultAddress(addr.id, userId).catch(() => {});
    load();
  };

  const renderItem = ({ item }: { item: UserAddress }) => (
    <View style={st.card}>
      <View style={st.cardTop}>
        <View style={st.labelRow}>
          <View style={st.labelPill}>
            <Text style={st.labelTxt}>{item.label}</Text>
          </View>
          {item.is_default && (
            <View style={st.defaultPill}>
              <Text style={st.defaultTxt}>{t.defaultAddress}</Text>
            </View>
          )}
        </View>
        <View style={st.cardActions}>
          <TouchableOpacity onPress={() => openEdit(item)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="pencil-outline" size={18} color={Colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleDelete(item)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="trash-outline" size={18} color={Colors.error} />
          </TouchableOpacity>
        </View>
      </View>
      <Text style={st.name}>{item.recipient_name}</Text>
      <Text style={st.phone}>{item.phone}</Text>
      <Text style={st.address}>{item.full_address}, {item.city}, {item.province} {item.postal_code}</Text>
      {!item.is_default && (
        <TouchableOpacity style={st.setDefaultBtn} onPress={() => handleSetDefault(item)}>
          <Text style={st.setDefaultTxt}>{t.setAsDefault}</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <SafeAreaView style={st.safe} edges={[]}>
      <PageHeader title={t.myAddresses} onBack={() => router.back()} rightIcon="add" rightIconColor={Colors.primary} onRightPress={openAdd} />

      {loading ? (
        <View style={st.centered}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={addresses}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={addresses.length === 0 ? st.centered : st.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={st.emptyWrap}>
              <Ionicons name="location-outline" size={56} color={Colors.midGray} />
              <Text style={st.emptyTitle}>{t.noAddresses}</Text>
              <Text style={st.emptySub}>Tambahkan alamat pengiriman untuk mempermudah checkout.</Text>
              <TouchableOpacity style={st.addBtn} onPress={openAdd}>
                <Text style={st.addBtnTxt}>{t.addAddress}</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}

      {/* Add/Edit Modal */}
      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setModalVisible(false)}>
        <SafeAreaView style={st.modalSafe} edges={['top', 'bottom']}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'padding'} style={{ flex: 1 }}>
            <View style={st.modalHeader}>
              <Text style={st.modalTitle}>{editingId ? t.edit + ' Alamat' : t.addAddress}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={Colors.nearBlack} />
              </TouchableOpacity>
            </View>
            <ScrollView style={st.modalBody} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              <Field label={t.addressLabel} value={form.label} onChangeText={(v) => setForm(f => ({ ...f, label: v }))} />
              <Field label={t.recipientName} value={form.recipient_name} onChangeText={(v) => setForm(f => ({ ...f, recipient_name: v }))} />
              <Field label={t.phoneNumber} value={form.phone} onChangeText={(v) => setForm(f => ({ ...f, phone: v }))} keyboardType="phone-pad" />
              <Field label={t.fullAddress} value={form.full_address} onChangeText={(v) => setForm(f => ({ ...f, full_address: v }))} multiline />
              <Field label={t.city} value={form.city} onChangeText={(v) => setForm(f => ({ ...f, city: v }))} />
              <Field label={t.province} value={form.province} onChangeText={(v) => setForm(f => ({ ...f, province: v }))} />
              <Field label={t.postalCode} value={form.postal_code} onChangeText={(v) => setForm(f => ({ ...f, postal_code: v }))} keyboardType="number-pad" />

              <TouchableOpacity style={st.defaultToggle} onPress={() => setForm(f => ({ ...f, is_default: !f.is_default }))}>
                <Ionicons
                  name={form.is_default ? 'checkbox' : 'square-outline'}
                  size={22}
                  color={form.is_default ? Colors.primary : Colors.darkGray}
                />
                <Text style={st.defaultToggleTxt}>{t.setAsDefault}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={st.saveBtn} onPress={handleSave} disabled={saving}>
                {saving
                  ? <ActivityIndicator color={Colors.white} />
                  : <Text style={st.saveBtnTxt}>{t.saveAddress}</Text>
                }
              </TouchableOpacity>
              <View style={{ height: 40 }} />
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

function Field({
  label,
  value,
  onChangeText,
  keyboardType = 'default',
  multiline = false,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  keyboardType?: any;
  multiline?: boolean;
}) {
  return (
    <View style={st.fieldWrap}>
      <Text style={st.fieldLabel}>{label}</Text>
      <TextInput
        style={[st.fieldInput, multiline && { minHeight: 72, textAlignVertical: 'top' }]}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        multiline={multiline}
        placeholderTextColor={Colors.darkGray}
      />
    </View>
  );
}

const st = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.offWhite },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing['2xl'] },
  list: { padding: Spacing.base, paddingBottom: 40 },

  card: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.base,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.lightGray,
    ...Shadows.sm,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  labelPill: {
    backgroundColor: Colors.primaryPale,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.primaryLight,
  },
  labelTxt: { fontFamily: Typography.medium.fontFamily, fontSize: Typography.sizes.xs, color: Colors.primary },
  defaultPill: {
    backgroundColor: Colors.successLight,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  defaultTxt: { fontFamily: Typography.medium.fontFamily, fontSize: Typography.sizes.xs, color: Colors.success },
  cardActions: { flexDirection: 'row', gap: Spacing.base },
  name: { fontFamily: Typography.medium.fontFamily, fontSize: Typography.sizes.base, color: Colors.nearBlack },
  phone: { fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.sm, color: Colors.darkGray, marginTop: 2 },
  address: { fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.sm, color: Colors.charcoal, marginTop: 4, lineHeight: 18 },
  setDefaultBtn: {
    marginTop: Spacing.md,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: Colors.primaryLight,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
  },
  setDefaultTxt: { fontFamily: Typography.medium.fontFamily, fontSize: Typography.sizes.xs, color: Colors.primary },

  emptyWrap: { alignItems: 'center', paddingTop: Spacing['5xl'], paddingHorizontal: Spacing['2xl'] },
  emptyTitle: { fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.md, color: Colors.nearBlack, marginTop: Spacing.base },
  emptySub: { fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.sm, color: Colors.darkGray, textAlign: 'center', marginTop: Spacing.sm, lineHeight: 20 },
  addBtn: { marginTop: Spacing.xl, backgroundColor: Colors.primary, paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md, borderRadius: BorderRadius.lg },
  addBtnTxt: { fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.base, color: Colors.white },

  modalSafe: { flex: 1, backgroundColor: Colors.white },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  modalTitle: { fontFamily: Typography.medium.fontFamily, fontSize: Typography.sizes.md, color: Colors.nearBlack },
  modalBody: { flex: 1, paddingHorizontal: Spacing.xl, paddingTop: Spacing.base },

  fieldWrap: { marginBottom: Spacing.base },
  fieldLabel: { fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.sm, color: Colors.charcoal, marginBottom: Spacing.xs },
  fieldInput: {
    borderWidth: 1,
    borderColor: Colors.lightGray,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontFamily: Typography.regular.fontFamily,
    fontSize: Typography.sizes.base,
    color: Colors.nearBlack,
    backgroundColor: Colors.cream,
  },

  defaultToggle: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.xl },
  defaultToggleTxt: { fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.base, color: Colors.nearBlack },

  saveBtn: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.base,
    alignItems: 'center',
  },
  saveBtnTxt: { fontFamily: Typography.medium.fontFamily, fontSize: Typography.sizes.base, color: Colors.white },
});
