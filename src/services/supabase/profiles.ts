import { supabase } from '@/src/lib/supabase';
import type { Database } from '@/src/lib/database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];
type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

// Workaround: supabase-js v2 + TS 5.x + "module: preserve" resolves .update()
// argument to never when strict is true. Cast the table query to any for writes.
const db = supabase as any;

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();
  if (error) throw error;
  return data as Profile | null;
}

export async function updateProfile(userId: string, updates: ProfileUpdate): Promise<Profile> {
  const patch = { ...updates, updated_at: new Date().toISOString() };
  const { data, error } = await db
    .from('profiles')
    .update(patch)
    .eq('id', userId)
    .select()
    .single();
  if (error) throw error;
  return data as Profile;
}

export async function uploadAvatar(userId: string, localUri: string): Promise<string> {
  const ext = (localUri.split('.').pop() ?? 'jpg').split('?')[0].toLowerCase();
  const contentType = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';
  const response = await fetch(localUri);
  if (!response.ok) throw new Error('Failed to read local file');
  const arrayBuffer = await response.arrayBuffer();
  const path = `${userId}/avatar_${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from('avatars').upload(path, arrayBuffer, { upsert: true, contentType });
  if (error) throw error;
  const { data } = supabase.storage.from('avatars').getPublicUrl(path);
  return data.publicUrl;
}

export async function getProfilesByIds(ids: string[]): Promise<Profile[]> {
  if (ids.length === 0) return [];
  const { data, error } = await supabase.from('profiles').select('*').in('id', ids);
  if (error) throw error;
  return (data ?? []) as Profile[];
}
