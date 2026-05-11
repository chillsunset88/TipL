/**
 * TipL — Wallet Store (Zustand)
 * Manages points, balance, vouchers, and crew level for the Points & Balance card.
 */

import { create } from 'zustand';

interface WalletState {
  points: number;
  balance: number;
  vouchers: number;
  crewLevel: string;
  setPoints: (points: number) => void;
  setBalance: (balance: number) => void;
  addPoints: (amount: number) => void;
  deductBalance: (amount: number) => void;
  setVouchers: (count: number) => void;
  setCrewLevel: (level: string) => void;
}

export const useWalletStore = create<WalletState>((set) => ({
  points: 0,
  balance: 0,
  vouchers: 0,
  crewLevel: 'Crew',

  setPoints: (points) => set({ points }),
  setBalance: (balance) => set({ balance }),
  addPoints: (amount) => set((state) => ({ points: state.points + amount })),
  deductBalance: (amount) => set((state) => ({ balance: state.balance - amount })),
  setVouchers: (count) => set({ vouchers: count }),
  setCrewLevel: (level) => set({ crewLevel: level }),
}));
