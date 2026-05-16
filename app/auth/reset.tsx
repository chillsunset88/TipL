import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { resetPassword } from '@/src/lib/hooks/useAuth';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/src/lib/constants';

export default function ResetPasswordScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleReset = async () => {
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }
    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await resetPassword(email.trim());
      setSent(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', err?.message ?? 'Failed to send reset email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={Colors.nearBlack} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Reset Password</Text>
        <View style={{ width: 38 }} />
      </View>

      <View style={styles.content}>
        {sent ? (
          <View style={styles.successWrap}>
            <Text style={styles.successIcon}>📧</Text>
            <Text style={styles.successTitle}>Email Sent!</Text>
            <Text style={styles.successBody}>Check your inbox for a password reset link. Don't forget to check your spam folder.</Text>
            <TouchableOpacity style={styles.backToLoginBtn} onPress={() => router.back()}>
              <Text style={styles.backToLoginText}>Back to Login</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <Text style={styles.desc}>Enter your registered email and we'll send you a reset link.</Text>
            <View style={styles.inputRow}>
              <Ionicons name="mail-outline" size={18} color={Colors.gray} />
              <TextInput
                style={styles.input}
                placeholder="you@example.com"
                placeholderTextColor={Colors.gray}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                returnKeyType="send"
                onSubmitEditing={handleReset}
              />
            </View>
            <TouchableOpacity style={[styles.submitBtn, loading && { opacity: 0.7 }]} onPress={handleReset} disabled={loading} activeOpacity={0.85}>
              <LinearGradient colors={[Colors.primaryLight, Colors.primaryDark]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.submitGradient}>
                {loading ? <ActivityIndicator color={Colors.white} /> : <Text style={styles.submitText}>Send Reset Link</Text>}
              </LinearGradient>
            </TouchableOpacity>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.offWhite },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.base, paddingVertical: Spacing.base },
  backBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: Colors.lightGray, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.lg, color: Colors.nearBlack },
  content: { flex: 1, paddingHorizontal: Spacing.xl, paddingTop: Spacing.xl },
  desc: { fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.base, color: Colors.darkGray, lineHeight: 24, marginBottom: Spacing.xl },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, backgroundColor: Colors.white, borderRadius: BorderRadius.md, borderWidth: 1.5, borderColor: Colors.lightGray, paddingHorizontal: Spacing.md, height: 52, marginBottom: Spacing.xl },
  input: { flex: 1, fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.base, color: Colors.nearBlack },
  submitBtn: { borderRadius: BorderRadius.lg, overflow: 'hidden', ...Shadows.glow },
  submitGradient: { height: 54, alignItems: 'center', justifyContent: 'center' },
  submitText: { fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.base, color: Colors.white },
  successWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md },
  successIcon: { fontSize: 64 },
  successTitle: { fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.xl, color: Colors.nearBlack },
  successBody: { fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.base, color: Colors.gray, textAlign: 'center', lineHeight: 24, paddingHorizontal: Spacing.xl },
  backToLoginBtn: { marginTop: Spacing.xl, backgroundColor: Colors.primary, borderRadius: BorderRadius.lg, paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md },
  backToLoginText: { fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.base, color: Colors.white },
});
