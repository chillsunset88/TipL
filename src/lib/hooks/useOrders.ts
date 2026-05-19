import { useEffect, useState, useCallback } from 'react';
import {
  getMyOrders, getOrderById, createOrder as createOrderService,
  updateOrderStatus as updateOrderStatusService,
  subscribeToOrder, subscribeToMyOrders, OrderWithProfiles,
} from '@/src/services/supabase/orders';

export function useOrder(orderId: string | undefined) {
  const [order, setOrder] = useState<OrderWithProfiles | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) return;
    setLoading(true);
    getOrderById(orderId).then(setOrder).catch(() => {}).finally(() => setLoading(false));
    const unsub = subscribeToOrder(orderId, setOrder);
    return () => { unsub(); };
  }, [orderId]);

  return { order, loading };
}

export function useMyOrders(userId: string | undefined) {
  const [orders, setOrders] = useState<OrderWithProfiles[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!userId) { setLoading(false); return; }
    setLoading(true);
    try { setOrders(await getMyOrders(userId)); } catch { }
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    load();
    if (!userId) return;
    const unsub = subscribeToMyOrders(userId, setOrders);
    return () => { unsub(); };
  }, [userId, load]);

  return { orders, loading, refetch: load };
}

export const updateOrderStatus = updateOrderStatusService;
export { createOrderService as createOrder };
