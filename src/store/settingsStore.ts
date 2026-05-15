/**
 * TipL — Settings Store (Zustand)
 * Manages app-wide settings: locale, theme preferences.
 * Persisted via AsyncStorage.
 */

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';
import { Locale, getTranslations, Translations } from '@/src/lib/i18n';

const LOCALE_STORAGE_KEY = '@tipl_locale';

interface SettingsState {
  locale: Locale;
  t: Translations;
  isLoaded: boolean;
  setLocale: (locale: Locale) => void;
  loadSettings: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  locale: 'en',
  t: getTranslations('en'),
  isLoaded: false,

  setLocale: (locale: Locale) => {
    set({ locale, t: getTranslations(locale) });
    AsyncStorage.setItem(LOCALE_STORAGE_KEY, locale).catch(console.error);
  },

  loadSettings: async () => {
    try {
      const storedLocale = await AsyncStorage.getItem(LOCALE_STORAGE_KEY);
      if (storedLocale === 'en' || storedLocale === 'id') {
        set({
          locale: storedLocale,
          t: getTranslations(storedLocale),
          isLoaded: true,
        });
      } else {
        // Auto-detect system language
        const systemLocales = Localization.getLocales();
        const detectedCode = systemLocales[0]?.languageCode;
        const autoLocale: Locale = detectedCode === 'id' ? 'id' : 'en';
        set({
          locale: autoLocale,
          t: getTranslations(autoLocale),
          isLoaded: true,
        });
      }
    } catch {
      set({ isLoaded: true });
    }
  },
}));
