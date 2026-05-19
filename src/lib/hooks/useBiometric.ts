// src/lib/hooks/useBiometric.ts
import * as LocalAuthentication from 'expo-local-authentication';
import { Alert } from 'react-native';
import { useBiometricStore } from '@/src/store/biometricStore';

export async function checkBiometricAvailable(): Promise<{
  available: boolean;
  type: string;
}> {
  const compatible = await LocalAuthentication.hasHardwareAsync();
  if (!compatible) return { available: false, type: '' };

  const enrolled = await LocalAuthentication.isEnrolledAsync();
  if (!enrolled) return { available: false, type: '' };

  const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
  const hasFingerprint = types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT);
  const hasFace = types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION);
  const type = hasFingerprint ? 'Sidik Jari' : hasFace ? 'Face ID' : 'Biometrik';
  return { available: true, type };
}

export async function authenticateBiometric(
  reason = 'Konfirmasi identitas kamu',
  _retryCount = 0,
): Promise<boolean> {
  try {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: reason,
      cancelLabel: 'Batal',
      fallbackLabel: 'Gunakan Password',
      disableDeviceFallback: false,
    });

    if (result.success) return true;

    // system_cancel = OS interrupt auth karena app briefly inactive
    // (terjadi di Expo Go iOS saat passcode dialog muncul).
    // Retry sekali otomatis dengan delay kecil supaya OS settle dulu.
    if (result.error === 'system_cancel' && _retryCount === 0) {
      await new Promise((r) => setTimeout(r, 400));
      return authenticateBiometric(reason, 1);
    }

    // app_cancel = auth di-cancel secara programmatic — cukup return false
    // user_cancel = user tap "Batal" — return false, jangan retry
    // user_fallback = user tap "Gunakan Password" button (bukan system passcode)
    //   → return false, biarkan user ketuk Coba Lagi manual
    return false;
  } catch {
    return false;
  }
}

export function useBiometric() {
  const { isEnabled, setEnabled } = useBiometricStore();

  const enable = async (): Promise<boolean> => {
    const { available, type } = await checkBiometricAvailable();
    if (!available) {
      Alert.alert(
        'Tidak Tersedia',
        'Perangkat kamu tidak mendukung biometrik atau belum ada sidik jari/face ID yang terdaftar.',
      );
      return false;
    }

    const success = await authenticateBiometric(
      `Konfirmasi ${type} untuk mengaktifkan kunci biometrik`,
    );
    if (!success) return false;

    await setEnabled(true);
    Alert.alert('Berhasil', `Kunci ${type} berhasil diaktifkan.`);
    return true;
  };

  const disable = async (): Promise<boolean> => {
    const success = await authenticateBiometric(
      'Konfirmasi untuk menonaktifkan kunci biometrik',
    );
    if (!success) return false;
    await setEnabled(false);
    return true;
  };

  return { isEnabled, enable, disable };
}