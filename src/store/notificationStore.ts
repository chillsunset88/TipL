/**
 * TipL — Notification Store (Zustand)
 * Hanya menyimpan badge count — data notifikasi diambil langsung dari Supabase di notifications.tsx.
 */

import { create } from 'zustand';

interface NotificationState {
  count: number;
  setCount: (n: number) => void;
  incrementCount: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  count: 0,
  setCount: (n) => set({ count: n }),
  incrementCount: () => set((s) => ({ count: s.count + 1 })),
}));
