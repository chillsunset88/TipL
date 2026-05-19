import { supabase } from '@/src/lib/supabase';

export async function isWishlisted(userId: string, productId: string): Promise<boolean> {
  const { data } = await (supabase.from('wishlists') as any)
    .select('id')
    .eq('user_id', userId)
    .eq('product_id', productId)
    .maybeSingle();
  return !!data;
}

export async function toggleWishlist(userId: string, productId: string): Promise<boolean> {
  const already = await isWishlisted(userId, productId);
  if (already) {
    await (supabase.from('wishlists') as any).delete().eq('user_id', userId).eq('product_id', productId);
    return false;
  } else {
    await (supabase.from('wishlists') as any).insert({ user_id: userId, product_id: productId });
    return true;
  }
}

export async function getWishlist(userId: string) {
  const { data, error } = await (supabase.from('wishlists') as any)
    .select('product_id, created_at, products(id, name, category, image_urls, price_min, price_max, trip_id, trips(destination_country, destination_city))')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as any[];
}
