import { supabase } from '@/src/lib/supabase';
import type { Database } from '@/src/lib/database.types';

type EscrowRow = Database['public']['Tables']['escrow_payments']['Row'];

const db = supabase as any;

export type EscrowStatus = 'held' | 'released' | 'refunded' | 'disputed';

export type EscrowPayment = EscrowRow;

export interface CreateEscrowPayload {
  order_id: string;
  buyer_id: string;
  traveler_id: string;
  amount: number;
  currency?: string;
}

export async function createEscrowPayment(payload: CreateEscrowPayload): Promise<EscrowPayment> {
  const { data, error } = await db
    .from('escrow_payments')
    .insert({
      order_id: payload.order_id,
      buyer_id: payload.buyer_id,
      traveler_id: payload.traveler_id,
      amount: payload.amount,
      currency: payload.currency ?? 'IDR',
      status: 'held',
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as EscrowPayment;
}

export async function getEscrowByOrderId(orderId: string): Promise<EscrowPayment | null> {
  const { data, error } = await supabase
    .from('escrow_payments')
    .select('*')
    .eq('order_id', orderId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data as EscrowPayment | null;
}

export async function releaseEscrow(orderId: string): Promise<void> {
  const { error } = await db
    .from('escrow_payments')
    .update({
      status: 'released',
      released_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('order_id', orderId);

  if (error) throw new Error(error.message);
}

export async function refundEscrow(orderId: string): Promise<void> {
  const { error } = await db
    .from('escrow_payments')
    .update({
      status: 'refunded',
      refunded_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('order_id', orderId);

  if (error) throw new Error(error.message);
}

export async function disputeEscrow(orderId: string, reason: string): Promise<void> {
  const { error } = await db
    .from('escrow_payments')
    .update({
      status: 'disputed',
      disputed_at: new Date().toISOString(),
      dispute_reason: reason,
      updated_at: new Date().toISOString(),
    })
    .eq('order_id', orderId);

  if (error) throw new Error(error.message);
}

export function subscribeToEscrow(
  orderId: string,
  callback: (payment: EscrowPayment) => void,
) {
  const channel = supabase
    .channel(`escrow:${orderId}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'escrow_payments', filter: `order_id=eq.${orderId}` },
      (payload) => callback(payload.new as EscrowPayment),
    )
    .subscribe();
  return () => supabase.removeChannel(channel);
}
