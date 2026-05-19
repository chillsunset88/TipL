/**
 * TipL — Settings Store (Zustand)
 * Manages app-wide settings: locale, theme preferences.
 * Persisted via AsyncStorage.
 */

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';
import { Locale, getTranslations, Translations } from '@/src/lib/i18n';

export type AppTheme = 'light' | 'dark';

const LOCALE_STORAGE_KEY = '@tipl_locale';
const TERMS_STORAGE_KEY = '@tipl_accepted_terms';
const THEME_STORAGE_KEY = '@tipl_theme';

interface SettingsState {
  locale: Locale;
  t: Translations;
  isLoaded: boolean;
  hasAcceptedTerms: boolean;
  theme: AppTheme;
  setLocale: (locale: Locale) => void;
  setHasAcceptedTerms: (accepted: boolean) => void;
  setTheme: (theme: AppTheme) => void;
  loadSettings: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  locale: 'en',
  t: getTranslations('en'),
  isLoaded: false,
  hasAcceptedTerms: false,
  theme: 'light',

  setLocale: (locale: Locale) => {
    set({ locale, t: getTranslations(locale) });
    AsyncStorage.setItem(LOCALE_STORAGE_KEY, locale).catch(console.error);
  },

  setHasAcceptedTerms: (accepted: boolean) => {
    set({ hasAcceptedTerms: accepted });
    if (accepted) {
      AsyncStorage.setItem(TERMS_STORAGE_KEY, 'true').catch(console.error);
    } else {
      AsyncStorage.removeItem(TERMS_STORAGE_KEY).catch(console.error);
    }
  },

  setTheme: (theme: AppTheme) => {
    set({ theme });
    AsyncStorage.setItem(THEME_STORAGE_KEY, theme).catch(console.error);
  },

  loadSettings: async () => {
    try {
      const storedLocale = await AsyncStorage.getItem(LOCALE_STORAGE_KEY);
      const storedTerms = await AsyncStorage.getItem(TERMS_STORAGE_KEY);
      const storedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      const hasAcceptedTerms = storedTerms === 'true';
      const theme: AppTheme = storedTheme === 'dark' ? 'dark' : 'light';

      if (storedLocale === 'en' || storedLocale === 'id') {
        set({
          locale: storedLocale,
          t: getTranslations(storedLocale),
          hasAcceptedTerms,
          theme,
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
          hasAcceptedTerms,
          theme,
          isLoaded: true,
        });
      }
    } catch {
      set({ isLoaded: true });
    }
  },
}));
