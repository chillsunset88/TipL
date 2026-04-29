/**
 * TipL — Order Store (Zustand)
 * Tracks active order state for real-time escrow UI.
 */

import { create } from 'zustand';
import { Order } from '@/lib/types';

interface OrderState {
  activeOrder: Order | null;
  orders: Order[];
  setActiveOrder: (order: Order | null) => void;
  setOrders: (orders: Order[]) => void;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
}

export const useOrderStore = create<OrderState>((set) => ({
  activeOrder: null,
  orders: [],
  setActiveOrder: (activeOrder) => set({ activeOrder }),
  setOrders: (orders) => set({ orders }),
  updateOrderStatus: (orderId, status) =>
    set((state) => ({
      orders: state.orders.map((o) =>
        o.id === orderId ? { ...o, status } : o
      ),
      activeOrder:
        state.activeOrder?.id === orderId
          ? { ...state.activeOrder, status }
          : state.activeOrder,
    })),
}));
