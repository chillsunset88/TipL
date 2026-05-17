/**
 * TipL — Notification Store (Zustand)
 * Hanya menyimpan badge count — data notifikasi diambil langsung dari Supabase di notifications.tsx.
 */

import { create } from 'zustand';

export interface BannerPayload {
  title: string;
  body: string;
  orderId?: string;
}

interface NotificationState {
  count: number;
  setCount: (n: number) => void;
  incrementCount: () => void;
  banner: BannerPayload | null;
  showBanner: (payload: BannerPayload) => void;
  hideBanner: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  count: 0,
  setCount: (n) => set({ count: n }),
  incrementCount: () => set((s) => ({ count: s.count + 1 })),
  banner: null,
  showBanner: (payload) => set({ banner: payload }),
  hideBanner: () => set({ banner: null }),
}));
