import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Colors, Typography, Spacing, BorderRadius } from '@/src/lib/constants';
import { authenticateBiometric, checkBiometricAvailable } from '@/src/lib/hooks/useBiometric';
import { useBiometricStore } from '@/src/store/biometricStore';
import { useAuthStore } from '@/src/store/authStore';
import { signOut } from '@/src/services/supabase/auth';

export function LockScreen() {
  const unlock = useBiometricStore((s) => s.unlock);
  const setEnabled = useBiometricStore((s) => s.setEnabled);
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);

  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const [biometricType, setBiometricType] = useState('Sidik Jari');

  useEffect(() => {
    checkBiometricAvailable().then(({ type }) => {
      if (type) setBiometricType(type);
    });
    // Langsung trigger prompt saat lock screen muncul
    handleAuthenticate();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAuthenticate = async () => {
    setLoading(true);
    setFailed(false);
    const success = await authenticateBiometric(`Gunakan ${biometricType} untuk masuk ke TipL`);
    setLoading(false);
    if (success) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      unlock();
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setFailed(true);
    }
  };

  const handleLogout = () => {
    setEnabled(false);
    signOut().catch(() => {});
    logout();
    router.replace('/(auth)/login');
  };

  return (
    <LinearGradient
      colors={[Colors.nearBlack, '#2D1F1A']}
      style={st.fill}
    >
      <SafeAreaView style={st.fill} edges={['top', 'bottom']}>
        <View style={st.center}>
          {/* Logo area */}
          <View style={st.logoWrap}>
            <Text style={st.logoText}>TipL</Text>
            <Text style={st.logoSub}>Jastip Marketplace</Text>
          </View>

          {/* User info */}
          {user && (
            <View style={st.userInfo}>
              <Ionicons name="person-circle-outline" size={40} color="rgba(255,255,255,0.5)" />
              <Text style={st.userName}>{user.displayName}</Text>
            </View>
          )}

          {/* Biometric icon */}
          <TouchableOpacity
            style={[st.biometricBtn, failed && st.biometricBtnFailed]}
            onPress={handleAuthenticate}
            activeOpacity={0.8}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={Colors.white} size="large" />
            ) : (
              <Ionicons
                name="finger-print"
                size={56}
                color={failed ? Colors.error : Colors.primary}
              />
            )}
          </TouchableOpacity>

          <Text style={st.hint}>
            {loading
              ? 'Memverifikasi...'
              : failed
              ? 'Gagal — Coba lagi'
              : `Gunakan ${biometricType} untuk membuka`}
          </Text>

          {failed && (
            <TouchableOpacity style={st.retryBtn} onPress={handleAuthenticate}>
              <Text style={st.retryTxt}>Coba Lagi</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Keluar akun */}
        <TouchableOpacity style={st.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={16} color="rgba(255,255,255,0.4)" />
          <Text style={st.logoutTxt}>Keluar & Ganti Akun</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </LinearGradient>
  );
}

const st = StyleSheet.create({
  fill: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.xl, paddingHorizontal: Spacing['2xl'] },

  logoWrap: { alignItems: 'center', gap: 4 },
  logoText: {
    fontFamily: Typography.serifBold.fontFamily,
    fontSize: 42,
    color: Colors.white,
    letterSpacing: 2,
  },
  logoSub: {
    fontFamily: Typography.regular.fontFamily,
    fontSize: Typography.sizes.sm,
    color: Colors.primary,
    letterSpacing: 1,
  },

  userInfo: { alignItems: 'center', gap: Spacing.sm },
  userName: {
    fontFamily: Typography.medium.fontFamily,
    fontSize: Typography.sizes.base,
    color: 'rgba(255,255,255,0.7)',
  },

  biometricBtn: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.15)',
    marginTop: Spacing.lg,
  },
  biometricBtnFailed: {
    borderColor: `${Colors.error}60`,
    backgroundColor: `${Colors.error}10`,
  },

  hint: {
    fontFamily: Typography.regular.fontFamily,
    fontSize: Typography.sizes.sm,
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
  },

  retryBtn: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  retryTxt: {
    fontFamily: Typography.medium.fontFamily,
    fontSize: Typography.sizes.sm,
    color: Colors.primary,
  },

  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: Spacing.sm, paddingBottom: Spacing.xl,
  },
  logoutTxt: {
    fontFamily: Typography.regular.fontFamily,
    fontSize: Typography.sizes.sm,
    color: 'rgba(255,255,255,0.4)',
  },
});
