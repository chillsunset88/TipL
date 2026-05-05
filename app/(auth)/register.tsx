/**
 * TipL — Register Screen
 * Premium sign-up UI consistent with TipL design language.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius } from '@/src/lib/constants';
import { Input } from '@/src/components/ui/Input';
import { Button } from '@/src/components/ui/Button';
import { registerWithEmail } from '@/src/lib/hooks/useAuth';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = 'Full name is required';
    if (!email.trim()) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Invalid email format';
    if (!password) e.password = 'Password is required';
    else if (password.length < 6) e.password = 'Minimum 6 characters';
    if (password !== confirmPassword) e.confirmPassword = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await registerWithEmail(email.trim(), password, name.trim());
      router.replace('/(tabs)');
    } catch (err: any) {
      Alert.alert('Registration Failed', err?.message || 'Please try again.');
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
          {/* Header */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.nearBlack} />
          </TouchableOpacity>

          {/* Brand */}
          <View style={styles.brandSection}>
            <LinearGradient
              colors={[Colors.primaryGradientStart, Colors.primaryGradientEnd]}
              style={styles.logoGradient}
            >
              <Ionicons name="airplane" size={28} color={Colors.white} />
            </LinearGradient>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>
              Join TipL and start discovering curated goods from around the world.
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <Input
              label="Full Name"
              icon="person-outline"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              autoComplete="name"
              error={errors.name}
            />

            <Input
              label="Email"
              icon="mail-outline"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              error={errors.email}
            />

            <View>
              <Input
                label="Password"
                icon="lock-closed-outline"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
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

            <Input
              label="Confirm Password"
              icon="shield-checkmark-outline"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showPassword}
              error={errors.confirmPassword}
            />

            <Button
              title="Create Account"
              onPress={handleRegister}
              loading={loading}
              fullWidth
              size="lg"
              style={{ marginTop: Spacing.base }}
            />
          </View>

          {/* Terms */}
          <Text style={styles.terms}>
            By creating an account, you agree to our{' '}
            <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
            <Text style={styles.termsLink}>Privacy Policy</Text>.
          </Text>

          {/* Login Link */}
          <View style={styles.loginRow}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={styles.loginLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  flex: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.base,
    paddingBottom: Spacing['2xl'],
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.offWhite,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  brandSection: {
    alignItems: 'center',
    marginBottom: Spacing['2xl'],
  },
  logoGradient: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  title: {
    fontFamily: Typography.serifBold.fontFamily,
    fontSize: Typography.sizes['2xl'],
    color: Colors.nearBlack,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontFamily: Typography.regular.fontFamily,
    fontSize: Typography.sizes.sm,
    color: Colors.darkGray,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: Spacing.xl,
  },
  form: {
    marginBottom: Spacing.xl,
  },
  eyeButton: {
    position: 'absolute',
    right: 16,
    top: 18,
  },
  terms: {
    fontFamily: Typography.regular.fontFamily,
    fontSize: Typography.sizes.xs,
    color: Colors.darkGray,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: Spacing.xl,
    paddingHorizontal: Spacing.base,
  },
  termsLink: {
    color: Colors.primary,
    fontFamily: Typography.medium.fontFamily,
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  loginText: {
    fontFamily: Typography.regular.fontFamily,
    fontSize: Typography.sizes.base,
    color: Colors.darkGray,
  },
  loginLink: {
    fontFamily: Typography.semiBold.fontFamily,
    fontSize: Typography.sizes.base,
    color: Colors.primary,
  },
});
