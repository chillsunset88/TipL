/**
 * TipL — Search History Store (Zustand)
 * Persists search history via AsyncStorage.
 */

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SEARCH_HISTORY_KEY = '@tipl_search_history';
const MAX_HISTORY = 20;

interface SearchState {
  history: string[];
  isLoaded: boolean;
  loadHistory: () => Promise<void>;
  addSearch: (query: string) => void;
  removeSearch: (query: string) => void;
  clearAll: () => void;
}

export const useSearchStore = create<SearchState>((set, get) => ({
  history: [],
  isLoaded: false,

  loadHistory: async () => {
    try {
      const stored = await AsyncStorage.getItem(SEARCH_HISTORY_KEY);
      if (stored) {
        set({ history: JSON.parse(stored), isLoaded: true });
      } else {
        set({ isLoaded: true });
      }
    } catch {
      set({ isLoaded: true });
    }
  },

  addSearch: (query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return;
    const current = get().history.filter((h) => h !== trimmed);
    const updated = [trimmed, ...current].slice(0, MAX_HISTORY);
    set({ history: updated });
    AsyncStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updated)).catch(console.error);
  },

  removeSearch: (query: string) => {
    const updated = get().history.filter((h) => h !== query);
    set({ history: updated });
    AsyncStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updated)).catch(console.error);
  },

  clearAll: () => {
    set({ history: [] });
    AsyncStorage.removeItem(SEARCH_HISTORY_KEY).catch(console.error);
  },
}));
