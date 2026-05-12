/**
 * TipL — Cart Store (Zustand)
 * Manages shopping cart items and badge count.
 */

import { create } from 'zustand';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  travelerId: string;
  travelerName: string;
}

interface CartState {
  items: CartItem[];
  count: number;
  selectedItems: string[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  toggleSelection: (id: string) => void;
  toggleTravelerSelection: (travelerId: string, isSelected: boolean) => void;
  toggleAllSelection: (isSelected: boolean) => void;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  count: 0,
  selectedItems: [],

  addItem: (item) =>
    set((state) => {
      const existing = state.items.find((i) => i.id === item.id);
      let updated: CartItem[];
      if (existing) {
        updated = state.items.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i,
        );
      } else {
        updated = [...state.items, item];
      }
      return { items: updated, count: updated.reduce((sum, i) => sum + i.quantity, 0) };
    }),

  removeItem: (id) =>
    set((state) => {
      const updated = state.items.filter((i) => i.id !== id);
      const newSelected = state.selectedItems.filter((selId) => selId !== id);
      return { items: updated, count: updated.reduce((sum, i) => sum + i.quantity, 0), selectedItems: newSelected };
    }),

  clearCart: () => set({ items: [], count: 0, selectedItems: [] }),

  toggleSelection: (id) =>
    set((state) => {
      const isSelected = state.selectedItems.includes(id);
      if (isSelected) {
        return { selectedItems: state.selectedItems.filter((i) => i !== id) };
      } else {
        return { selectedItems: [...state.selectedItems, id] };
      }
    }),

  toggleTravelerSelection: (travelerId, isSelected) =>
    set((state) => {
      const itemsForTraveler = state.items.filter((i) => i.travelerId === travelerId).map((i) => i.id);
      if (isSelected) {
        const newSelection = Array.from(new Set([...state.selectedItems, ...itemsForTraveler]));
        return { selectedItems: newSelection };
      } else {
        const newSelection = state.selectedItems.filter((id) => !itemsForTraveler.includes(id));
        return { selectedItems: newSelection };
      }
    }),

  toggleAllSelection: (isSelected) =>
    set((state) => {
      if (isSelected) {
        return { selectedItems: state.items.map((i) => i.id) };
      } else {
        return { selectedItems: [] };
      }
    }),
}));
