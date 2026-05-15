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

type Role = 'tiper' | 'triper';

const ROLES: Array<{ id: Role; emoji: string; title: string; desc: string }> = [
  { id: 'tiper', emoji: '🛍️', title: 'Tiper (Buyer)', desc: 'I want to request items from travelers' },
  { id: 'triper', emoji: '✈️', title: 'Triper (Traveler)', desc: 'I travel and bring items for others' },
];

export default function RegisterScreen() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<Role>('tiper');
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!fullName.trim()) e.fullName = 'Full name is required';
    if (!email.trim()) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Invalid email format';
    if (!password) e.password = 'Password is required';
    else if (password.length < 8) e.password = 'Minimum 8 characters';
    if (password !== confirmPassword) e.confirmPassword = 'Passwords do not match';
    if (!agreed) e.terms = 'Please accept the terms';
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
      await signUp(email.trim(), password, fullName.trim(), role);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        'Account Created!',
        'Please check your email to verify your account, then sign in.',
        [{ text: 'OK', onPress: () => router.back() }],
      );
    } catch (err: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Registration Failed', err?.message ?? 'Please try again.');
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
            <Text style={styles.headerTitle}>Create Account</Text>
            <View style={{ width: 38 }} />
          </View>

          <View style={styles.content}>
            <Text style={styles.subtitle}>Join thousands of trusted jastip users</Text>

            {/* Role Selector */}
            <Text style={styles.sectionLabel}>I am a...</Text>
            <View style={styles.roleGrid}>
              {ROLES.map((r) => (
                <TouchableOpacity
                  key={r.id}
                  style={[styles.roleCard, role === r.id && styles.roleCardActive]}
                  onPress={() => { setRole(r.id); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
                  activeOpacity={0.8}
                >
                  <Text style={styles.roleEmoji}>{r.emoji}</Text>
                  <Text style={[styles.roleTitle, role === r.id && styles.roleTextActive]}>{r.title}</Text>
                  <Text style={[styles.roleDesc, role === r.id && styles.roleDescActive]}>{r.desc}</Text>
                  {role === r.id && (
                    <View style={styles.roleCheck}>
                      <Ionicons name="checkmark-circle" size={18} color={Colors.primary} />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>

            {/* Fields */}
            {[
              { key: 'fullName', label: 'Full Name', value: fullName, set: setFullName, icon: 'person-outline', placeholder: 'Your full name', type: 'default' },
              { key: 'email', label: 'Email', value: email, set: setEmail, icon: 'mail-outline', placeholder: 'you@example.com', type: 'email-address' },
            ].map((f) => (
              <View key={f.key} style={styles.fieldWrap}>
                <Text style={styles.label}>{f.label}</Text>
                <View style={[styles.inputRow, errors[f.key] && styles.inputError]}>
                  <Ionicons name={f.icon as any} size={18} color={errors[f.key] ? Colors.error : Colors.gray} />
                  <TextInput
                    style={styles.input}
                    placeholder={f.placeholder}
                    placeholderTextColor={Colors.gray}
                    value={f.value}
                    onChangeText={(t) => { f.set(t); setErrors((p) => ({ ...p, [f.key]: '' })); }}
                    keyboardType={f.type as any}
                    autoCapitalize={f.key === 'email' ? 'none' : 'words'}
                    returnKeyType="next"
                  />
                </View>
                {errors[f.key] ? <Text style={styles.errorText}>{errors[f.key]}</Text> : null}
              </View>
            ))}

            {/* Password */}
            <View style={styles.fieldWrap}>
              <Text style={styles.label}>Password</Text>
              <View style={[styles.inputRow, errors.password && styles.inputError]}>
                <Ionicons name="lock-closed-outline" size={18} color={errors.password ? Colors.error : Colors.gray} />
                <TextInput style={styles.input} placeholder="Min. 8 characters" placeholderTextColor={Colors.gray}
                  value={password} onChangeText={(t) => { setPassword(t); setErrors((p) => ({ ...p, password: '' })); }}
                  secureTextEntry={!showPassword} returnKeyType="next" />
                <TouchableOpacity onPress={() => setShowPassword((v) => !v)}>
                  <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color={Colors.gray} />
                </TouchableOpacity>
              </View>
              {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}
            </View>

            <View style={styles.fieldWrap}>
              <Text style={styles.label}>Confirm Password</Text>
              <View style={[styles.inputRow, errors.confirmPassword && styles.inputError]}>
                <Ionicons name="lock-closed-outline" size={18} color={errors.confirmPassword ? Colors.error : Colors.gray} />
                <TextInput style={styles.input} placeholder="Re-enter password" placeholderTextColor={Colors.gray}
                  value={confirmPassword} onChangeText={(t) => { setConfirmPassword(t); setErrors((p) => ({ ...p, confirmPassword: '' })); }}
                  secureTextEntry={!showPassword} returnKeyType="done" onSubmitEditing={handleRegister} />
              </View>
              {errors.confirmPassword ? <Text style={styles.errorText}>{errors.confirmPassword}</Text> : null}
            </View>

            {/* Terms */}
            <TouchableOpacity style={styles.termsRow} onPress={() => { setAgreed((v) => !v); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}>
              <View style={[styles.checkbox, agreed && styles.checkboxActive]}>
                {agreed && <Ionicons name="checkmark" size={12} color={Colors.white} />}
              </View>
              <Text style={styles.termsText}>
                I agree to the <Text style={styles.termsLink}>Terms of Service</Text> and <Text style={styles.termsLink}>Privacy Policy</Text>
              </Text>
            </TouchableOpacity>
            {errors.terms ? <Text style={styles.errorText}>{errors.terms}</Text> : null}

            {/* Submit */}
            <TouchableOpacity style={[styles.submitBtn, loading && { opacity: 0.7 }]} onPress={handleRegister} disabled={loading} activeOpacity={0.85}>
              <LinearGradient colors={[Colors.primaryLight, Colors.primaryDark]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.submitGradient}>
                {loading ? <ActivityIndicator color={Colors.white} /> : <Text style={styles.submitText}>Create Account</Text>}
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.loginRow}>
              <Text style={styles.loginPrompt}>Already have an account? </Text>
              <TouchableOpacity onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.back(); }}>
                <Text style={styles.loginLink}>Sign In</Text>
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
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.base, paddingVertical: Spacing.base },
  backBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: Colors.lightGray, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontFamily: Typography.bold.fontFamily, fontSize: Typography.sizes.lg, color: Colors.nearBlack },
  content: { paddingHorizontal: Spacing.base },
  subtitle: { fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.sm, color: Colors.gray, marginBottom: Spacing.xl },
  sectionLabel: { fontFamily: Typography.semiBold.fontFamily, fontSize: Typography.sizes.sm, color: Colors.charcoal, marginBottom: Spacing.sm },
  roleGrid: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.xl },
  roleCard: { flex: 1, backgroundColor: Colors.white, borderRadius: BorderRadius.lg, padding: Spacing.md, borderWidth: 2, borderColor: Colors.lightGray, ...Shadows.sm },
  roleCardActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryPale },
  roleEmoji: { fontSize: 28, marginBottom: 6 },
  roleTitle: { fontFamily: Typography.semiBold.fontFamily, fontSize: Typography.sizes.sm, color: Colors.charcoal, marginBottom: 4 },
  roleTextActive: { color: Colors.primaryDark },
  roleDesc: { fontFamily: Typography.regular.fontFamily, fontSize: 11, color: Colors.gray, lineHeight: 15 },
  roleDescActive: { color: Colors.charcoal },
  roleCheck: { position: 'absolute', top: 8, right: 8 },
  fieldWrap: { marginBottom: Spacing.base },
  label: { fontFamily: Typography.semiBold.fontFamily, fontSize: Typography.sizes.sm, color: Colors.charcoal, marginBottom: 6 },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, backgroundColor: Colors.white, borderRadius: BorderRadius.md, borderWidth: 1.5, borderColor: Colors.lightGray, paddingHorizontal: Spacing.md, height: 52 },
  inputError: { borderColor: Colors.error, backgroundColor: Colors.errorLight },
  input: { flex: 1, fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.base, color: Colors.nearBlack },
  errorText: { fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.xs, color: Colors.error, marginTop: 4, marginLeft: 4 },
  termsRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm, marginBottom: Spacing.base },
  checkbox: { width: 20, height: 20, borderRadius: 4, borderWidth: 2, borderColor: Colors.midGray, alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  checkboxActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  termsText: { flex: 1, fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.sm, color: Colors.darkGray, lineHeight: 20 },
  termsLink: { color: Colors.primary, fontFamily: Typography.medium.fontFamily },
  submitBtn: { borderRadius: BorderRadius.lg, overflow: 'hidden', ...Shadows.glow, marginTop: Spacing.sm, marginBottom: Spacing.xl },
  submitGradient: { height: 54, alignItems: 'center', justifyContent: 'center' },
  submitText: { fontFamily: Typography.bold.fontFamily, fontSize: Typography.sizes.base, color: Colors.white },
  loginRow: { flexDirection: 'row', justifyContent: 'center' },
  loginPrompt: { fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.sm, color: Colors.gray },
  loginLink: { fontFamily: Typography.semiBold.fontFamily, fontSize: Typography.sizes.sm, color: Colors.primary },
});
