//TipL/app/(auth)/login.tsx

/**
 * TipL — Login Screen
 * Premium UI with Supabase Auth
 */

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Import constants & components sesuai struktur baru
import { Button } from '@/src/components/ui/Button';
import { Input } from '@/src/components/ui/Input';
import { Colors, Spacing, Typography } from '@/src/lib/constants';

import { loginWithEmail } from '@/src/services/supabase';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fungsi Validasi dari 
  const validate = () => {
    const e: Record<string, string> = {}; // Beri tipe di sini
    if (!email.trim()) e.email = 'Email wajib diisi';
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Format email tidak valid';

    if (!password) e.password = 'Password wajib diisi';
    else if (password.length < 6) e.password = 'Password minimal 6 karakter';

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await loginWithEmail(email.trim(), password);
      // Navigation is handled automatically by the auth guard in _layout.tsx
    } catch (err: any) {
      Alert.alert('Login Gagal', supabaseErrorMessage(err?.message || ''));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Brand Section */}
          <View style={styles.brandSection}>
            <View style={styles.logoContainer}>
              <LinearGradient
                colors={[Colors.primaryGradientStart, Colors.primaryGradientEnd]}
                style={styles.logoGradient}
              >
                <Ionicons name="airplane" size={32} color={Colors.white} />
              </LinearGradient>
            </View>
            <Text style={styles.brandName}>TipL</Text>
            <Text style={styles.tagline}>
              Curated goods from afar,{'\n'}brought home by locals.
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <Text style={styles.formTitle}>Welcome Back</Text>
            <Text style={styles.formSubtitle}>
              Sign in to your account to continue
            </Text>

            <Input
              label="Email"
              icon="mail-outline"
              value={email}
              onChangeText={(v) => {
                setEmail(v);
                if (errors.email) setErrors(p => ({ ...p, email: '' }));
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              error={errors.email}
            />

            <View style={{ position: 'relative' }}>
              <Input
                label="Password"
                icon="lock-closed-outline"
                value={password}
                onChangeText={(v) => {
                  setPassword(v);
                  if (errors.password) setErrors(p => ({ ...p, password: '' }));
                }}
                secureTextEntry={!showPassword}
                autoComplete="password"
                error={errors.password}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={Colors.darkGray}
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.forgotButton}>
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>

            <Button
              title="Sign In"
              onPress={handleLogin}
              loading={loading}
              fullWidth
              size="lg"
              style={{ marginTop: Spacing.lg }}
            />
          </View>


          {/* Register Link */}
          <View style={styles.registerRow}>
            <Text style={styles.registerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
              <Text style={styles.registerLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function supabaseErrorMessage(message: string) {
  const msg = message.toLowerCase();
  if (msg.includes('invalid login credentials') || msg.includes('invalid_credentials')) {
    return 'Email atau password salah.';
  }
  if (msg.includes('email not confirmed')) {
    return 'Email belum diverifikasi. Cek inbox kamu.';
  }
  if (msg.includes('too many requests') || msg.includes('rate limit')) {
    return 'Terlalu banyak percobaan. Coba lagi beberapa menit lagi.';
  }
  if (msg.includes('network') || msg.includes('fetch')) {
    return 'Koneksi gagal. Periksa internet kamu.';
  }
  return message || 'Terjadi kesalahan. Silakan coba lagi.';
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.white },
  flex: { flex: 1 },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing['3xl'],
    paddingBottom: Spacing['2xl'],
  },
  brandSection: { alignItems: 'center', marginBottom: Spacing['3xl'] },
  logoContainer: { marginBottom: Spacing.base },
  logoGradient: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandName: {
    fontFamily: Typography.serifBold.fontFamily,
    fontSize: Typography.sizes['3xl'],
    color: Colors.nearBlack,
    letterSpacing: -0.5,
  },
  tagline: {
    fontFamily: Typography.regular.fontFamily,
    fontSize: Typography.sizes.sm,
    color: Colors.darkGray,
    textAlign: 'center',
    marginTop: Spacing.sm,
    lineHeight: 20,
  },
  form: { marginBottom: Spacing.xl },
  formTitle: {
    fontFamily: Typography.serifBold.fontFamily,
    fontSize: Typography.sizes.xl,
    color: Colors.nearBlack,
    marginBottom: Spacing.xs,
  },
  formSubtitle: {
    fontFamily: Typography.regular.fontFamily,
    fontSize: Typography.sizes.sm,
    color: Colors.darkGray,
    marginBottom: Spacing.xl,
  },
  eyeButton: {
    position: 'absolute',
    right: 16,
    top: 40, // Disesuaikan dengan posisi label Input custom
  },
  forgotButton: { alignSelf: 'center' },
  forgotText: {
    fontFamily: Typography.medium.fontFamily,
    fontSize: Typography.sizes.sm,
    color: Colors.primary,
  },
  registerRow: { flexDirection: 'row', justifyContent: 'center' },
  registerText: {
    fontFamily: Typography.regular.fontFamily,
    fontSize: Typography.sizes.base,
    color: Colors.darkGray,
  },
  registerLink: {
    fontFamily: Typography.semiBold.fontFamily,
    fontSize: Typography.sizes.base,
    color: Colors.primary,
  },
});