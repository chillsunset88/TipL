import { supabase } from '@/src/lib/supabase';

export type UserAddress = {
  id: string;
  user_id: string;
  label: string;
  recipient_name: string;
  phone: string;
  full_address: string;
  city: string;
  province: string;
  postal_code: string;
  is_default: boolean;
  created_at: string | null;
};

export async function getAddresses(userId: string): Promise<UserAddress[]> {
  const { data, error } = await supabase
    .from('user_addresses')
    .select('*')
    .eq('user_id', userId)
    .order('is_default', { ascending: false })
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as UserAddress[];
}

export async function upsertAddress(
  address: Omit<UserAddress, 'created_at'> & { id?: string },
): Promise<UserAddress> {
  const { data, error } = await supabase
    .from('user_addresses')
    .upsert(address)
    .select()
    .single();
  if (error) throw error;
  return data as UserAddress;
}

export async function deleteAddress(id: string): Promise<void> {
  const { error } = await supabase.from('user_addresses').delete().eq('id', id);
  if (error) throw error;
}

export async function setDefaultAddress(userId: string, addressId: string): Promise<void> {
  await supabase.from('user_addresses').update({ is_default: false }).eq('user_id', userId);
  const { error } = await supabase
    .from('user_addresses')
    .update({ is_default: true })
    .eq('id', addressId);
  if (error) throw error;
}
