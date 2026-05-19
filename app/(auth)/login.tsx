/**
 * TipL — Login Screen
 */

import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView, Platform, ScrollView,
  StyleSheet, Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/src/components/ui/Button';
import { BorderRadius, Colors, Shadows, Spacing, Typography } from '@/src/lib/constants';
import { useSettingsStore } from '@/src/store/settingsStore';
import { signIn } from '@/src/services/supabase/auth';

export default function LoginScreen() {
  const { t } = useSettingsStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validate = () => {
    const e: typeof errors = {};
    if (!email.trim()) e.email = t.emailRequired;
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = t.invalidEmail;
    if (!password) e.password = t.passwordRequired;
    else if (password.length < 6) e.password = t.minSixChars;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await signIn(email.trim(), password);
    } catch (err: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      const msg = err?.message ?? t.loginFailed;
      if (msg.toLowerCase().includes('email')) {
        setErrors({ email: t.emailNotFoundError });
      } else if (msg.toLowerCase().includes('password')) {
        setErrors({ password: t.incorrectPassword });
      } else {
        Alert.alert(t.error, msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

          {/* Hero */}
          <LinearGradient colors={['#F9F7F2', '#F0EBE1']} style={styles.hero}>
            <View style={styles.logoWrap}>
              <Image source={require('@/assets/images/tipl-icon.png')} style={styles.logoIcon} contentFit="contain" />
            </View>
            <Text style={styles.brandName}>TipL</Text>
            <Text style={styles.brandTagline}>{t.tagline}</Text>
          </LinearGradient>

          <View style={styles.form}>
            <Text style={styles.formTitle}>{t.welcomeBack}</Text>
            <Text style={styles.formSubtitle}>{t.signInToContinue}</Text>

            {/* Email */}
            <View style={styles.fieldWrap}>
              <Text style={styles.label}>Email</Text>
              <View style={[styles.inputRow, errors.email && styles.inputError]}>
                <Ionicons name="mail-outline" size={18} color={errors.email ? Colors.error : Colors.gray} />
                <TextInput
                  style={styles.input}
                  placeholder="you@example.com"
                  placeholderTextColor={Colors.gray}
                  value={email}
                  onChangeText={(t) => { setEmail(t); if (errors.email) setErrors((p) => ({ ...p, email: undefined })); }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  returnKeyType="next"
                />
              </View>
              {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
            </View>

            {/* Password */}
            <View style={styles.fieldWrap}>
              <Text style={styles.label}>Password</Text>
              <View style={[styles.inputRow, errors.password && styles.inputError]}>
                <Ionicons name="lock-closed-outline" size={18} color={errors.password ? Colors.error : Colors.gray} />
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor={Colors.gray}
                  value={password}
                  onChangeText={(t) => { setPassword(t); if (errors.password) setErrors((p) => ({ ...p, password: undefined })); }}
                  secureTextEntry={!showPassword}
                  autoComplete="password"
                  returnKeyType="done"
                  onSubmitEditing={handleLogin}
                />
                <TouchableOpacity onPress={() => setShowPassword((v) => !v)}>
                  <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color={Colors.gray} />
                </TouchableOpacity>
              </View>
              {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
            </View>

            {/* Forgot */}
            <TouchableOpacity onPress={() => router.push('/auth/reset' as any)} style={styles.forgotBtn}>
              <Text style={styles.forgotText}>{t.forgotPassword}</Text>
            </TouchableOpacity>

            <Button
              title={t.signIn}
              onPress={handleLogin}
              loading={loading}
              fullWidth
              size="lg"
              style={{ marginTop: Spacing.lg }}
            />
          </View>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>{t.or}</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Social Buttons */}
          <View style={styles.socialRow}>
            <TouchableOpacity style={styles.socialButton}>
              <Ionicons name="logo-google" size={22} color={Colors.nearBlack} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialButton}>
              <Ionicons name="logo-apple" size={22} color={Colors.nearBlack} />
            </TouchableOpacity>
          </View>

          {/* Register Link */}
          <View style={styles.registerRow}>
            <Text style={styles.registerText}>{t.dontHaveAccount} </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
              <Text style={styles.registerLink}>{t.signUp}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.offWhite },
  flex: { flex: 1 },
  scroll: { flexGrow: 1 },

  hero: {
    alignItems: 'center',
    paddingTop: Spacing['4xl'],
    paddingBottom: Spacing['2xl'],
    paddingHorizontal: Spacing.xl,
  },
  logoWrap: {
    width: 75, height: 75, borderRadius: 4,
    backgroundColor: Colors.white,
    alignItems: 'center', justifyContent: 'center',
    ...Shadows.md,
    marginBottom: Spacing.md,
  },
  logoIcon: { width: 72, height: 72, borderRadius : 4 },
  brandName: {
    fontFamily: Typography.serifBold.fontFamily,
    fontSize: Typography.sizes['3xl'],
    color: Colors.primaryDark,
    letterSpacing: 2,
  },
  brandTagline: {
    fontFamily: Typography.regular.fontFamily,
    fontSize: Typography.sizes.sm,
    color: Colors.darkGray,
    marginTop: 4,
  },

  form: {
    flex: 1,
    backgroundColor: Colors.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: Spacing.xl,
    paddingTop: Spacing['2xl'],
    ...Shadows.lg,
  },
  formTitle: {
    fontFamily: Typography.regular.fontFamily,
    fontSize: Typography.sizes['2xl'],
    color: Colors.nearBlack,
    marginBottom: 4,
  },
  formSubtitle: {
    fontFamily: Typography.regular.fontFamily,
    fontSize: Typography.sizes.sm,
    color: Colors.gray,
    marginBottom: Spacing.xl,
  },

  fieldWrap: { marginBottom: Spacing.base },
  label: {
    fontFamily: Typography.regular.fontFamily,
    fontSize: Typography.sizes.sm,
    color: Colors.charcoal,
    marginBottom: 6,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderColor: Colors.lightGray,
    paddingHorizontal: Spacing.md,
    height: 52,
  },
  inputError: { borderColor: Colors.error, backgroundColor: Colors.errorLight },
  input: {
    flex: 1,
    fontFamily: Typography.regular.fontFamily,
    fontSize: Typography.sizes.base,
    color: Colors.nearBlack,
  },
  errorText: {
    fontFamily: Typography.regular.fontFamily,
    fontSize: Typography.sizes.xs,
    color: Colors.error,
    marginTop: 4,
    marginLeft: 4,
  },
  forgotBtn: { alignSelf: 'flex-end', marginTop: Spacing.xs, marginBottom: Spacing.sm },
  forgotText: {
    fontFamily: Typography.medium.fontFamily,
    fontSize: Typography.sizes.sm,
    color: Colors.primary,
  },

  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.xl,
    paddingHorizontal: Spacing.xl,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: Colors.midGray },
  dividerText: {
    fontFamily: Typography.regular.fontFamily,
    fontSize: Typography.sizes.sm,
    color: Colors.gray,
    marginHorizontal: Spacing.base,
  },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.base,
    marginBottom: Spacing['2xl'],
  },
  socialButton: {
    width: 56, height: 56,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    borderColor: Colors.midGray,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.offWhite,
  },
  registerRow: { flexDirection: 'row', justifyContent: 'center', paddingBottom: Spacing.xl },
  registerText: {
    fontFamily: Typography.regular.fontFamily,
    fontSize: Typography.sizes.base,
    color: Colors.darkGray,
  },
  registerLink: {
    fontFamily: Typography.regular.fontFamily,
    fontSize: Typography.sizes.sm,
    color: Colors.primary,
  },
});
