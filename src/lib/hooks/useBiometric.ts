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
  const hasFace = types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION);
  const type = hasFace ? 'Face ID' : 'Sidik Jari';
  return { available: true, type };
}

export async function authenticateBiometric(reason = 'Konfirmasi identitas kamu'): Promise<boolean> {
  try {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: reason,
      cancelLabel: 'Batal',
      fallbackLabel: 'Gunakan Password',
      disableDeviceFallback: false,
    });
    return result.success;
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

    // Verifikasi biometrik dulu sebelum mengaktifkan
    const success = await authenticateBiometric(`Konfirmasi ${type} untuk mengaktifkan kunci biometrik`);
    if (!success) return false;

    await setEnabled(true);
    Alert.alert('Berhasil', `Kunci ${type} berhasil diaktifkan.`);
    return true;
  };

  const disable = async (): Promise<boolean> => {
    const success = await authenticateBiometric('Konfirmasi untuk menonaktifkan kunci biometrik');
    if (!success) return false;
    await setEnabled(false);
    return true;
  };

  return { isEnabled, enable, disable };
}
