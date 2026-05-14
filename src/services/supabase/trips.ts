import { supabase } from '@/src/lib/supabase';
import type { Database } from '@/src/lib/database.types';

type Trip = Database['public']['Tables']['trips']['Row'];
type TripInsert = Database['public']['Tables']['trips']['Insert'];
type Product = Database['public']['Tables']['products']['Row'];
type ProductInsert = Database['public']['Tables']['products']['Insert'];

const db = supabase as any;

export type TripWithProfile = Trip & {
  profiles: Pick<Database['public']['Tables']['profiles']['Row'], 'id' | 'full_name' | 'avatar_url' | 'rating' | 'total_trips' | 'total_reviews'> | null;
};

export async function getOpenTrips(limit = 20, offset = 0): Promise<TripWithProfile[]> {
  const { data, error } = await supabase
    .from('trips')
    .select('*, profiles(id, full_name, avatar_url, rating, total_trips, total_reviews)')
    .eq('status', 'open')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);
  if (error) throw error;
  return (data ?? []) as TripWithProfile[];
}

export async function getTripById(id: string): Promise<TripWithProfile | null> {
  const { data, error } = await supabase
    .from('trips')
    .select('*, profiles(id, full_name, avatar_url, rating, total_trips, total_reviews)')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data as TripWithProfile | null;
}

export async function getMyTrips(triperId: string): Promise<Trip[]> {
  const { data, error } = await supabase
    .from('trips')
    .select('*')
    .eq('triper_id', triperId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as Trip[];
}

export async function createTrip(payload: TripInsert): Promise<Trip> {
  const { data, error } = await db
    .from('trips')
    .insert(payload)
    .select()
    .single();
  if (error) throw error;
  return data as Trip;
}

export async function updateTripStatus(tripId: string, status: 'open' | 'closed' | 'completed'): Promise<void> {
  const { error } = await db
    .from('trips')
    .update({ status })
    .eq('id', tripId);
  if (error) throw error;
}

export async function getProductsByTrip(tripId: string): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('trip_id', tripId)
    .eq('is_available', true);
  if (error) throw error;
  return (data ?? []) as Product[];
}

export async function createProduct(payload: ProductInsert): Promise<Product> {
  const { data, error } = await db
    .from('products')
    .insert(payload)
    .select()
    .single();
  if (error) throw error;
  return data as Product;
}

export async function uploadProductImage(tripId: string, localUri: string): Promise<string> {
  const response = await fetch(localUri);
  const blob = await response.blob();
  const path = `${tripId}/${Date.now()}.jpg`;
  const { error } = await supabase.storage.from('item-images').upload(path, blob, { upsert: false });
  if (error) throw error;
  const { data } = supabase.storage.from('item-images').getPublicUrl(path);
  return data.publicUrl;
}

export type ProductWithTripInfo = Product & {
  trips: Pick<Trip, 'destination_country' | 'destination_city'> | null;
};

export async function getProductsByDestination(destination: string, limit = 8): Promise<ProductWithTripInfo[]> {
  const { data: matchedTrips } = await supabase
    .from('trips')
    .select('id')
    .ilike('destination_country', `%${destination}%`)
    .eq('status', 'open');
  const tripIds = (matchedTrips ?? []).map((t) => t.id);
  if (tripIds.length === 0) return [];

  const { data, error } = await supabase
    .from('products')
    .select('*, trips(destination_country, destination_city)')
    .in('trip_id', tripIds)
    .eq('is_available', true)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as ProductWithTripInfo[];
}

export async function searchProducts(query: string, destination?: string, limit = 20): Promise<ProductWithTripInfo[]> {
  let tripIds: string[] | null = null;
  if (destination) {
    const { data: trips } = await supabase
      .from('trips')
      .select('id')
      .ilike('destination_country', `%${destination}%`)
      .eq('status', 'open');
    tripIds = (trips ?? []).map((t) => t.id);
    if (tripIds.length === 0) return [];
  }

  let q = supabase
    .from('products')
    .select('*, trips(destination_country, destination_city)')
    .eq('is_available', true)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (query) q = q.ilike('name', `%${query}%`);
  if (tripIds) q = q.in('trip_id', tripIds);

  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as ProductWithTripInfo[];
}

export async function getProductWithTripInfo(id: string): Promise<(ProductWithTripInfo & { profiles: any | null }) | null> {
  const { data, error } = await supabase
    .from('products')
    .select('*, trips(destination_country, destination_city)')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;

  const product = data as ProductWithTripInfo;
  if (product.triper_id) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url, rating')
      .eq('id', product.triper_id)
      .maybeSingle();
    return { ...product, profiles: profile ?? null };
  }
  return { ...product, profiles: null };
}

export function subscribeToTrips(onChange: (trips: TripWithProfile[]) => void) {
  const channel = supabase
    .channel('trips-feed')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'trips' }, async () => {
      const fresh = await getOpenTrips();
      onChange(fresh);
    })
    .subscribe();
  return () => supabase.removeChannel(channel);
}
