/**
 * TipL — Register Screen
 */

import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Alert,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/src/lib/constants';
import { signUp } from '@/src/services/supabase/auth';

export default function RegisterScreen() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!fullName.trim()) e.fullName = 'Nama lengkap wajib diisi';
    if (!email.trim()) e.email = 'Email wajib diisi';
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Format email tidak valid';
    if (!password) e.password = 'Password wajib diisi';
    else if (password.length < 8) e.password = 'Minimal 8 karakter';
    if (password !== confirmPassword) e.confirmPassword = 'Password tidak sama';
    if (!agreed) e.terms = 'Harap setujui syarat & ketentuan';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await signUp(email.trim(), password, fullName.trim());
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        'Akun Berhasil Dibuat!',
        'Cek email kamu untuk verifikasi akun, lalu masuk.',
        [{ text: 'OK', onPress: () => router.back() }],
      );
    } catch (err: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Registrasi Gagal', err?.message ?? 'Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={22} color={Colors.nearBlack} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Buat Akun</Text>
            <View style={{ width: 38 }} />
          </View>

          <View style={styles.content}>
            <Text style={styles.subtitle}>Bergabung dengan komunitas jastip terpercaya</Text>

            {/* Full Name */}
            <View style={styles.fieldWrap}>
              <Text style={styles.label}>Nama Lengkap</Text>
              <View style={[styles.inputRow, errors.fullName && styles.inputError]}>
                <Ionicons name="person-outline" size={18} color={errors.fullName ? Colors.error : Colors.gray} />
                <TextInput
                  style={styles.input}
                  placeholder="Nama lengkap kamu"
                  placeholderTextColor={Colors.gray}
                  value={fullName}
                  onChangeText={(t) => { setFullName(t); setErrors((p) => ({ ...p, fullName: '' })); }}
                  autoCapitalize="words"
                  returnKeyType="next"
                />
              </View>
              {errors.fullName ? <Text style={styles.errorText}>{errors.fullName}</Text> : null}
            </View>

            {/* Email */}
            <View style={styles.fieldWrap}>
              <Text style={styles.label}>Email</Text>
              <View style={[styles.inputRow, errors.email && styles.inputError]}>
                <Ionicons name="mail-outline" size={18} color={errors.email ? Colors.error : Colors.gray} />
                <TextInput
                  style={styles.input}
                  placeholder="kamu@email.com"
                  placeholderTextColor={Colors.gray}
                  value={email}
                  onChangeText={(t) => { setEmail(t); setErrors((p) => ({ ...p, email: '' })); }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  returnKeyType="next"
                />
              </View>
              {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
            </View>

            {/* Password */}
            <View style={styles.fieldWrap}>
              <Text style={styles.label}>Password</Text>
              <View style={[styles.inputRow, errors.password && styles.inputError]}>
                <Ionicons name="lock-closed-outline" size={18} color={errors.password ? Colors.error : Colors.gray} />
                <TextInput
                  style={styles.input}
                  placeholder="Min. 8 karakter"
                  placeholderTextColor={Colors.gray}
                  value={password}
                  onChangeText={(t) => { setPassword(t); setErrors((p) => ({ ...p, password: '' })); }}
                  secureTextEntry={!showPassword}
                  returnKeyType="next"
                />
                <TouchableOpacity onPress={() => setShowPassword((v) => !v)}>
                  <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color={Colors.gray} />
                </TouchableOpacity>
              </View>
              {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}
            </View>

            {/* Confirm Password */}
            <View style={styles.fieldWrap}>
              <Text style={styles.label}>Konfirmasi Password</Text>
              <View style={[styles.inputRow, errors.confirmPassword && styles.inputError]}>
                <Ionicons name="lock-closed-outline" size={18} color={errors.confirmPassword ? Colors.error : Colors.gray} />
                <TextInput
                  style={styles.input}
                  placeholder="Ulangi password"
                  placeholderTextColor={Colors.gray}
                  value={confirmPassword}
                  onChangeText={(t) => { setConfirmPassword(t); setErrors((p) => ({ ...p, confirmPassword: '' })); }}
                  secureTextEntry={!showPassword}
                  returnKeyType="done"
                  onSubmitEditing={handleRegister}
                />
              </View>
              {errors.confirmPassword ? <Text style={styles.errorText}>{errors.confirmPassword}</Text> : null}
            </View>

            {/* Terms */}
            <TouchableOpacity
              style={styles.termsRow}
              onPress={() => { setAgreed((v) => !v); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
            >
              <View style={[styles.checkbox, agreed && styles.checkboxActive]}>
                {agreed && <Ionicons name="checkmark" size={12} color={Colors.white} />}
              </View>
              <Text style={styles.termsText}>
                Saya setuju dengan <Text style={styles.termsLink}>Syarat & Ketentuan</Text> dan <Text style={styles.termsLink}>Kebijakan Privasi</Text>
              </Text>
            </TouchableOpacity>
            {errors.terms ? <Text style={styles.errorText}>{errors.terms}</Text> : null}

            {/* Submit */}
            <TouchableOpacity
              style={[styles.submitBtn, loading && { opacity: 0.7 }]}
              onPress={handleRegister}
              disabled={loading}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={[Colors.primaryLight, Colors.primaryDark]}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={styles.submitGradient}
              >
                {loading
                  ? <ActivityIndicator color={Colors.white} />
                  : <Text style={styles.submitText}>Daftar Sekarang</Text>
                }
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.loginRow}>
              <Text style={styles.loginPrompt}>Sudah punya akun? </Text>
              <TouchableOpacity onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.back(); }}>
                <Text style={styles.loginLink}>Masuk</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.offWhite },
  flex: { flex: 1 },
  scroll: { flexGrow: 1, paddingBottom: 32 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.base, paddingVertical: Spacing.base,
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: Colors.lightGray, alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.lg, color: Colors.nearBlack },
  content: { paddingHorizontal: Spacing.base },
  subtitle: {
    fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.sm,
    color: Colors.gray, marginBottom: Spacing.xl,
  },
  fieldWrap: { marginBottom: Spacing.base },
  label: { fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.sm, color: Colors.charcoal, marginBottom: 6 },
  inputRow: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    backgroundColor: Colors.white, borderRadius: BorderRadius.md,
    borderWidth: 1.5, borderColor: Colors.lightGray,
    paddingHorizontal: Spacing.md, height: 52,
  },
  inputError: { borderColor: Colors.error, backgroundColor: Colors.errorLight },
  input: { flex: 1, fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.base, color: Colors.nearBlack },
  errorText: { fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.xs, color: Colors.error, marginTop: 4, marginLeft: 4 },
  termsRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm, marginBottom: Spacing.base },
  checkbox: {
    width: 20, height: 20, borderRadius: 4,
    borderWidth: 2, borderColor: Colors.midGray,
    alignItems: 'center', justifyContent: 'center', marginTop: 2,
  },
  checkboxActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  termsText: { flex: 1, fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.sm, color: Colors.darkGray, lineHeight: 20 },
  termsLink: { color: Colors.primary, fontFamily: Typography.medium.fontFamily },
  submitBtn: { borderRadius: BorderRadius.lg, overflow: 'hidden', ...Shadows.glow, marginTop: Spacing.sm, marginBottom: Spacing.xl },
  submitGradient: { height: 54, alignItems: 'center', justifyContent: 'center' },
  submitText: { fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.base, color: Colors.white },
  loginRow: { flexDirection: 'row', justifyContent: 'center' },
  loginPrompt: { fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.sm, color: Colors.gray },
  loginLink: { fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.sm, color: Colors.primary },
});
