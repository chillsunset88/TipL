// src/services/supabase/orders.ts
import { supabase } from '@/src/lib/supabase';
import type { Database } from '@/src/lib/database.types';

type Order = Database['public']['Tables']['orders']['Row'];
type OrderInsert = Database['public']['Tables']['orders']['Insert'];

const db = supabase as any;

export type OrderWithProfiles = Order & {
  tiper:  Pick<Database['public']['Tables']['profiles']['Row'], 'id' | 'full_name' | 'avatar_url'> | null;
  triper: Pick<Database['public']['Tables']['profiles']['Row'], 'id' | 'full_name' | 'avatar_url'> | null;
};

// ─── SELECT ──────────────────────────────────────────────────────────────────

export async function getMyOrders(userId: string): Promise<OrderWithProfiles[]> {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      tiper:profiles!orders_tiper_id_fkey(id,full_name,avatar_url),
      triper:profiles!orders_triper_id_fkey(id,full_name,avatar_url)
    `)
    .or(`tiper_id.eq.${userId},triper_id.eq.${userId}`)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as OrderWithProfiles[];
}

export async function getOrderById(orderId: string): Promise<OrderWithProfiles | null> {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      tiper:profiles!orders_tiper_id_fkey(id,full_name,avatar_url),
      triper:profiles!orders_triper_id_fkey(id,full_name,avatar_url)
    `)
    .eq('id', orderId)
    .maybeSingle();
  if (error) throw error;
  return data as OrderWithProfiles | null;
}

/** Admin: ambil semua order tanpa filter user (butuh RLS admin policy). */
export async function getAllOrders(): Promise<OrderWithProfiles[]> {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      tiper:profiles!orders_tiper_id_fkey(id,full_name,avatar_url),
      triper:profiles!orders_triper_id_fkey(id,full_name,avatar_url)
    `)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as OrderWithProfiles[];
}

// ─── INSERT ──────────────────────────────────────────────────────────────────

export async function createOrder(payload: OrderInsert): Promise<Order> {
  const { data, error } = await db
    .from('orders')
    .insert(payload)
    .select()
    .single();
  if (error) throw error;
  return data as Order;
}

// ─── UPDATE STATUS ────────────────────────────────────────────────────────────

export type OrderStatus =
  | 'pending'
  | 'accepted'
  | 'in_escrow'
  | 'purchased'
  | 'shipped'
  | 'delivered'
  | 'completed'
  | 'cancelled'
  | 'disputed';

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
): Promise<void> {
  const { error } = await db
    .from('orders')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', orderId);
  if (error) throw error;
}

// ─── CANCEL (Tiper only, pending/accepted) ────────────────────────────────────

/**
 * Cancel an order. Only the tiper can cancel, and only when status is
 * 'pending' or 'accepted'. RLS enforces this on the server too.
 */
export async function cancelOrder(orderId: string): Promise<void> {
  const { error } = await db
    .from('orders')
    .update({ status: 'cancelled', updated_at: new Date().toISOString() })
    .eq('id', orderId)
    .in('status', ['pending', 'accepted']); // extra client-side guard
  if (error) throw error;
}

// ─── UPDATE PROOF URLS (Triper uploads purchase/ship proof) ───────────────────

export async function updateOrderProofUrls(
  orderId: string,
  proofUrls: string[],
): Promise<void> {
  const { error } = await db
    .from('orders')
    .update({ proof_urls: proofUrls, updated_at: new Date().toISOString() })
    .eq('id', orderId);
  if (error) throw error;
}

// ─── UPDATE TRACKING / RESI ───────────────────────────────────────────────────

export async function updateOrderTracking(
  orderId: string,
  trackingNumber: string,
): Promise<void> {
  const { error } = await db
    .from('orders')
    .update({ tracking_number: trackingNumber, updated_at: new Date().toISOString() })
    .eq('id', orderId);
  if (error) throw error;
}

// ─── UPDATE DELIVERY ADDRESS ──────────────────────────────────────────────────

export async function updateOrderDeliveryAddress(
  orderId: string,
  addressId: string,
): Promise<void> {
  const { error } = await db
    .from('orders')
    .update({ delivery_address_id: addressId, updated_at: new Date().toISOString() })
    .eq('id', orderId);
  if (error) throw error;
}

// ─── REALTIME ─────────────────────────────────────────────────────────────────

export function subscribeToOrder(orderId: string, onChange: (order: OrderWithProfiles) => void) {
  const channel = supabase
    .channel(`order-${orderId}-${Date.now()}`)
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders', filter: `id=eq.${orderId}` }, async () => {
      const fresh = await getOrderById(orderId);
      if (fresh) onChange(fresh);
    })
    .subscribe();
  return () => supabase.removeChannel(channel);
}

export function subscribeToMyOrders(userId: string, onChange: (orders: OrderWithProfiles[]) => void) {
  const refetch = async () => {
    try {
      const fresh = await getMyOrders(userId);
      onChange(fresh);
    } catch {}
  };

  // Two channels needed: one as buyer (tiper), one as traveler (triper)
  const ch1 = supabase
    .channel(`my-orders-tiper-${userId}`)
    .on('postgres_changes', {
      event: '*', schema: 'public', table: 'orders',
      filter: `tiper_id=eq.${userId}`,
    }, refetch)
    .subscribe();

  const ch2 = supabase
    .channel(`my-orders-triper-${userId}`)
    .on('postgres_changes', {
      event: '*', schema: 'public', table: 'orders',
      filter: `triper_id=eq.${userId}`,
    }, refetch)
    .subscribe();

  return () => {
    supabase.removeChannel(ch1);
    supabase.removeChannel(ch2);
  };
}

export function subscribeToAllOrders(onChange: (orders: OrderWithProfiles[]) => void) {
  const channel = supabase
    .channel(`admin-all-orders-${Date.now()}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, async () => {
      const fresh = await getAllOrders();
      onChange(fresh);
    })
    .subscribe();
  return () => supabase.removeChannel(channel);
}