import { create } from 'zustand';
import type { CartItem } from './cartStore';
import type { UserAddress } from '@/src/services/supabase/addresses';

interface CheckoutState {
  pendingItems: CartItem[];
  selectedAddress: UserAddress | null;
  setPendingItems: (items: CartItem[]) => void;
  setSelectedAddress: (address: UserAddress | null) => void;
  clear: () => void;
}

export const useCheckoutStore = create<CheckoutState>((set) => ({
  pendingItems: [],
  selectedAddress: null,
  setPendingItems: (items) => set({ pendingItems: items }),
  setSelectedAddress: (address) => set({ selectedAddress: address }),
  clear: () => set({ pendingItems: [], selectedAddress: null }),
}));
