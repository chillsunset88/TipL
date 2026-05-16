import { supabase } from '@/src/lib/supabase';
import type { Database } from '@/src/lib/database.types';

type CustomRequest = Database['public']['Tables']['custom_requests']['Row'];
type CustomRequestInsert = Database['public']['Tables']['custom_requests']['Insert'];

const db = supabase as any;

export type CustomRequestWithProfile = CustomRequest & {
  profiles: Pick<Database['public']['Tables']['profiles']['Row'], 'id' | 'full_name' | 'avatar_url'> | null;
};

export async function getOpenRequests(limit = 20, offset = 0): Promise<CustomRequestWithProfile[]> {
  const { data, error } = await supabase
    .from('custom_requests')
    .select('*, profiles!tiper_id(id, full_name, avatar_url)')
    .eq('status', 'open')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);
  if (error) throw error;
  return (data ?? []) as CustomRequestWithProfile[];
}

export async function getMyRequests(tiperId: string): Promise<CustomRequestWithProfile[]> {
  const { data, error } = await supabase
    .from('custom_requests')
    .select('*, profiles!tiper_id(id, full_name, avatar_url)')
    .eq('tiper_id', tiperId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as CustomRequestWithProfile[];
}

// Requests specifically directed at / accepted by this traveler
export async function getRequestsForTriper(triperId: string): Promise<CustomRequestWithProfile[]> {
  const { data, error } = await db
    .from('custom_requests')
    .select('*, profiles!tiper_id(id, full_name, avatar_url)')
    .eq('taken_by', triperId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as CustomRequestWithProfile[];
}

export async function createRequest(payload: CustomRequestInsert): Promise<CustomRequest> {
  const { data, error } = await db
    .from('custom_requests')
    .insert({ ...payload, status: 'open' })
    .select()
    .single();
  if (error) throw error;
  return data as CustomRequest;
}

export async function acceptRequest(requestId: string, triperId: string): Promise<void> {
  const { error } = await db
    .from('custom_requests')
    .update({ status: 'taken', taken_by: triperId, updated_at: new Date().toISOString() })
    .eq('id', requestId);
  if (error) throw error;
}

export async function uploadRequestImage(requestId: string, localUri: string): Promise<string> {
  const ext = (localUri.split('.').pop() ?? 'jpg').split('?')[0].toLowerCase();
  const contentType = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';
  const arrayBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.onload = () => resolve(xhr.response as ArrayBuffer);
    xhr.onerror = () => reject(new Error('Failed to read local file'));
    xhr.responseType = 'arraybuffer';
    xhr.open('GET', localUri, true);
    xhr.send();
  });
  const path = `requests/${requestId}/${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from('item-images').upload(path, arrayBuffer, { upsert: false, contentType });
  if (error) throw error;
  const { data } = supabase.storage.from('item-images').getPublicUrl(path);
  return data.publicUrl;
}

export async function updateRequestImageUrls(requestId: string, imageUrls: string[]): Promise<void> {
  const { error } = await db
    .from('custom_requests')
    .update({ image_urls: imageUrls })
    .eq('id', requestId);
  if (error) throw error;
}
