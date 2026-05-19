// src/services/supabase/addresses.ts
import { supabase } from '@/src/lib/supabase';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface UserAddress {
  id: string;
  user_id: string;
  label: string;           // e.g. 'Rumah', 'Kantor', 'Kos'
  recipient_name: string;
  phone: string;
  full_address: string;    // single text field (not address_line)
  city: string;
  province: string;
  postal_code: string;
  is_default: boolean;
  created_at: string | null;
}

export type UserAddressInsert = Omit<UserAddress, 'id' | 'created_at'>;
export type UserAddressUpdate = Partial<Omit<UserAddress, 'id' | 'user_id' | 'created_at'>>;

const db = supabase as any;

// ─── SELECT ──────────────────────────────────────────────────────────────────

export async function getMyAddresses(userId: string): Promise<UserAddress[]> {
  const { data, error } = await db
    .from('user_addresses')
    .select('*')
    .eq('user_id', userId)
    .order('is_default', { ascending: false })  // default first
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data ?? []) as UserAddress[];
}

export async function getDefaultAddress(userId: string): Promise<UserAddress | null> {
  const { data, error } = await db
    .from('user_addresses')
    .select('*')
    .eq('user_id', userId)
    .eq('is_default', true)
    .maybeSingle();
  if (error) throw error;
  return data as UserAddress | null;
}

export async function getAddressById(id: string): Promise<UserAddress | null> {
  const { data, error } = await db
    .from('user_addresses')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data as UserAddress | null;
}

// ─── INSERT ──────────────────────────────────────────────────────────────────

export async function createAddress(payload: UserAddressInsert): Promise<UserAddress> {
  // Clear existing default first if this one is marked default
  if (payload.is_default) {
    await db
      .from('user_addresses')
      .update({ is_default: false })
      .eq('user_id', payload.user_id)
      .eq('is_default', true);
  }

  const { data, error } = await db
    .from('user_addresses')
    .insert(payload)
    .select()
    .single();
  if (error) throw error;
  return data as UserAddress;
}

// ─── UPDATE ───────────────────────────────────────────────────────────────────

export async function updateAddress(
  id: string,
  patch: UserAddressUpdate,
): Promise<void> {
  // If setting as default, clear others first
  if (patch.is_default) {
    const current = await getAddressById(id);
    if (current) {
      await db
        .from('user_addresses')
        .update({ is_default: false })
        .eq('user_id', current.user_id)
        .eq('is_default', true)
        .neq('id', id);
    }
  }

  const { error } = await db
    .from('user_addresses')
    .update(patch)
    .eq('id', id);
  if (error) throw error;
}

export async function setDefaultAddress(
  addressId: string,
  userId: string,
): Promise<void> {
  // Clear all defaults for this user first
  await db
    .from('user_addresses')
    .update({ is_default: false })
    .eq('user_id', userId);

  const { error } = await db
    .from('user_addresses')
    .update({ is_default: true })
    .eq('id', addressId);
  if (error) throw error;
}

// ─── DELETE ───────────────────────────────────────────────────────────────────

export async function deleteAddress(id: string): Promise<void> {
  const addr = await getAddressById(id);
  const { error } = await db.from('user_addresses').delete().eq('id', id);
  if (error) throw error;

  // If we deleted the default, promote the next address to default
  if (addr?.is_default) {
    const { data: remaining } = await db
      .from('user_addresses')
      .select('id')
      .eq('user_id', addr.user_id)
      .order('created_at', { ascending: true })
      .limit(1);
    if (remaining && remaining.length > 0) {
      await db
        .from('user_addresses')
        .update({ is_default: true })
        .eq('id', (remaining[0] as { id: string }).id);
    }
  }
}