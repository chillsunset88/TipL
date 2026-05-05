/**
 * TipL — Orders Hook
 * Real-time Firestore listener for order status (escrow state machine).
 */

import { useEffect, useState } from 'react';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
} from 'firebase/firestore';
import { db } from '@/src/lib/firebase';
import { Order } from '@/src/lib/types';
import { useOrderStore } from '@/src/store/orderStore';

/** Listen to a single order document (real-time escrow state) */
export function useOrder(orderId: string | undefined) {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) return;

    const unsubscribe = onSnapshot(doc(db, 'orders', orderId), (snapshot) => {
      if (snapshot.exists()) {
        const data = { id: snapshot.id, ...snapshot.data() } as Order;
        setOrder(data);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [orderId]);

  return { order, loading };
}

/** Listen to all orders for a user (buyer or traveler) */
export function useUserOrders(userId: string | undefined) {
  const setOrders = useOrderStore((s) => s.setOrders);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    // Listen to orders where user is buyer
    const buyerQuery = query(
      collection(db, 'orders'),
      where('buyerId', '==', userId),
      orderBy('updatedAt', 'desc')
    );

    const unsubscribe = onSnapshot(buyerQuery, (snapshot) => {
      const orders: Order[] = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<Order, 'id'>),
      }));
      setOrders(orders);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId, setOrders]);

  return { loading };
}
