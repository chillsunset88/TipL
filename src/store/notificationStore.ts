/**
 * TipL — Notification Store (Zustand)
 * Manages notification badge count and notification items.
 */

import { create } from 'zustand';

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  read: boolean;
  timestamp: number;
}

interface NotificationState {
  count: number;
  notifications: NotificationItem[];
  setNotifications: (items: NotificationItem[]) => void;
  markRead: (id: string) => void;
  clearAll: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  count: 3,
  notifications: [
    {
      id: 'n1',
      title: 'Order Update',
      body: 'Your item has been purchased by the traveler.',
      read: false,
      timestamp: Date.now() - 3600000,
    },
    {
      id: 'n2',
      title: 'New Message',
      body: 'Emi Tanaka sent you a message.',
      read: false,
      timestamp: Date.now() - 7200000,
    },
    {
      id: 'n3',
      title: 'Points Earned',
      body: 'You earned 50 points from your last order!',
      read: false,
      timestamp: Date.now() - 86400000,
    },
  ],
  setNotifications: (items) =>
    set({ notifications: items, count: items.filter((n) => !n.read).length }),
  markRead: (id) =>
    set((state) => {
      const updated = state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n,
      );
      return { notifications: updated, count: updated.filter((n) => !n.read).length };
    }),
  clearAll: () => set({ notifications: [], count: 0 }),
}));
