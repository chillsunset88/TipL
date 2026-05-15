import { supabase } from '@/src/lib/supabase';
import type { Database } from '@/src/lib/database.types';

type Order = Database['public']['Tables']['orders']['Row'];
type OrderInsert = Database['public']['Tables']['orders']['Insert'];

const db = supabase as any;

export type OrderWithProfiles = Order & {
  tiper: Pick<Database['public']['Tables']['profiles']['Row'], 'id' | 'full_name' | 'avatar_url'> | null;
  triper: Pick<Database['public']['Tables']['profiles']['Row'], 'id' | 'full_name' | 'avatar_url'> | null;
};

export async function getMyOrders(userId: string): Promise<OrderWithProfiles[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('*, tiper:profiles!orders_tiper_id_fkey(id,full_name,avatar_url), triper:profiles!orders_triper_id_fkey(id,full_name,avatar_url)')
    .or(`tiper_id.eq.${userId},triper_id.eq.${userId}`)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as OrderWithProfiles[];
}

export async function getOrderById(orderId: string): Promise<OrderWithProfiles | null> {
  const { data, error } = await supabase
    .from('orders')
    .select('*, tiper:profiles!orders_tiper_id_fkey(id,full_name,avatar_url), triper:profiles!orders_triper_id_fkey(id,full_name,avatar_url)')
    .eq('id', orderId)
    .maybeSingle();
  if (error) throw error;
  return data as OrderWithProfiles | null;
}

export async function createOrder(payload: OrderInsert): Promise<Order> {
  const { data, error } = await db
    .from('orders')
    .insert(payload)
    .select()
    .single();
  if (error) throw error;
  return data as Order;
}

export async function updateOrderStatus(
  orderId: string,
  status: 'pending' | 'accepted' | 'in_escrow' | 'purchased' | 'shipped' | 'delivered' | 'completed' | 'cancelled' | 'disputed',
): Promise<void> {
  const { error } = await db
    .from('orders')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', orderId);
  if (error) throw error;
}

export function subscribeToOrder(orderId: string, onChange: (order: OrderWithProfiles) => void) {
  const channel = supabase
    .channel(`order-${orderId}`)
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders', filter: `id=eq.${orderId}` }, async () => {
      const fresh = await getOrderById(orderId);
      if (fresh) onChange(fresh);
    })
    .subscribe();
  return () => supabase.removeChannel(channel);
}

export function subscribeToMyOrders(userId: string, onChange: (orders: OrderWithProfiles[]) => void) {
  const channel = supabase
    .channel(`my-orders-${userId}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, async () => {
      const fresh = await getMyOrders(userId);
      onChange(fresh);
    })
    .subscribe();
  return () => supabase.removeChannel(channel);
}
