import { useEffect, useState, useCallback } from 'react';
import {
  getMyOrders, getOrderById, createOrder as createOrderService,
  updateOrderStatus as updateOrderStatusService,
  subscribeToOrder, OrderWithProfiles,
} from '@/src/services/supabase/orders';

const POLL_INTERVAL = 30_000;

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

  // Silent fetch — no spinner, used by polling interval
  const poll = useCallback(async () => {
    if (!userId) return;
    try { setOrders(await getMyOrders(userId)); } catch { }
  }, [userId]);

  // Full fetch — shows spinner, used on initial load & manual refresh
  const load = useCallback(async () => {
    if (!userId) { setLoading(false); return; }
    setLoading(true);
    try { setOrders(await getMyOrders(userId)); } catch { }
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    load();
    if (!userId) return;
    const interval = setInterval(poll, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [userId, load, poll]);

  return { orders, loading, refetch: load };
}

export const updateOrderStatus = updateOrderStatusService;
export { createOrderService as createOrder };
