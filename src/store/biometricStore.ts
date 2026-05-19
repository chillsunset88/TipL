//src/store/biometricStore.ts
import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'biometric_enabled';

interface BiometricState {
  isEnabled: boolean;
  isLocked: boolean;
  hydrated: boolean;
  setEnabled: (val: boolean) => Promise<void>;
  lock: () => void;
  unlock: () => void;
  hydrate: () => Promise<void>;
}

export const useBiometricStore = create<BiometricState>((set) => ({
  isEnabled: false,
  isLocked: false,
  hydrated: false,

  hydrate: async () => {
    const stored = await AsyncStorage.getItem(KEY);
    const isEnabled = stored === 'true';
    set({ isEnabled, isLocked: isEnabled, hydrated: true });
  },

  setEnabled: async (val) => {
    await AsyncStorage.setItem(KEY, val ? 'true' : 'false');
    set({ isEnabled: val, isLocked: false });
  },

  lock: () => set({ isLocked: true }),
  unlock: () => set({ isLocked: false }),
}));
