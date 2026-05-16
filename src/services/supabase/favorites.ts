import { supabase } from '@/src/lib/supabase';

export async function isFavoriteTriper(userId: string, triperId: string): Promise<boolean> {
  const { data } = await supabase
    .from('favorite_tripers')
    .select('id')
    .eq('user_id', userId)
    .eq('triper_id', triperId)
    .maybeSingle();
  return !!data;
}

export async function toggleFavoriteTriper(userId: string, triperId: string): Promise<boolean> {
  const already = await isFavoriteTriper(userId, triperId);
  if (already) {
    await supabase.from('favorite_tripers').delete().eq('user_id', userId).eq('triper_id', triperId);
    return false;
  } else {
    await supabase.from('favorite_tripers').insert({ user_id: userId, triper_id: triperId });
    return true;
  }
}

export async function getFavoriteTripers(userId: string) {
  const { data, error } = await supabase
    .from('favorite_tripers')
    .select('triper_id, created_at, profiles!favorite_tripers_triper_id_fkey(id, full_name, avatar_url, rating, total_trips)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as any[];
}
