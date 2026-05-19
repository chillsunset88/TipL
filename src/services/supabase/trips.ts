// src/services/supabase/trips.ts
import { supabase } from '@/src/lib/supabase';
import type { Database } from '@/src/lib/database.types';

type Trip = Database['public']['Tables']['trips']['Row'];
type TripInsert = Database['public']['Tables']['trips']['Insert'];
type Product = Database['public']['Tables']['products']['Row'];
type ProductInsert = Database['public']['Tables']['products']['Insert'];
type ProductUpdate = Database['public']['Tables']['products']['Update'];

const db = supabase as any;

export type TripWithProfile = Trip & {
  profiles: Pick<
    Database['public']['Tables']['profiles']['Row'],
    'id' | 'full_name' | 'avatar_url' | 'rating' | 'total_trips' | 'total_reviews'
  > | null;
};

// ─── TRIPS — Read ─────────────────────────────────────────────────────────────

export async function getOpenTrips(limit = 20, offset = 0): Promise<TripWithProfile[]> {
  const today = new Date().toISOString().split('T')[0];
  const { data, error } = await supabase
    .from('trips')
    .select('*, profiles(id, full_name, avatar_url, rating, total_trips, total_reviews)')
    .eq('status', 'open')
    .or(`return_date.is.null,return_date.gte.${today}`)
    .order('departure_date', { ascending: true })
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

/** Fetch domestic trips (Indonesia → Indonesia) separately for the home feed. */
export async function getDomesticTrips(limit = 20): Promise<TripWithProfile[]> {
  const { data, error } = await supabase
    .from('trips')
    .select('*, profiles(id, full_name, avatar_url, rating, total_trips, total_reviews)')
    .eq('status', 'open')
    .eq('is_domestic', true)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as TripWithProfile[];
}

// ─── TRIPS — Create ───────────────────────────────────────────────────────────

export async function createTrip(payload: TripInsert): Promise<Trip> {
  const { data, error } = await db
    .from('trips')
    .insert(payload)
    .select()
    .single();
  if (error) throw error;
  return data as Trip;
}

// ─── TRIPS — Update ───────────────────────────────────────────────────────────

export async function updateTripStatus(
  tripId: string,
  status: 'open' | 'closed' | 'completed',
): Promise<void> {
  const { error } = await db.from('trips').update({ status }).eq('id', tripId);
  if (error) throw error;
}

/** Full trip update — triper can edit details before any orders are placed. */
export async function updateTrip(
  tripId: string,
  patch: Partial<
    Pick<
      Trip,
      | 'origin_country'
      | 'destination_country'
      | 'destination_city'
      | 'departure_date'
      | 'return_date'
      | 'capacity_kg'
      | 'price_range_min'
      | 'price_range_max'
      | 'currency'
      | 'notes'
      | 'status'
    >
  >,
): Promise<void> {
  const { error } = await db
    .from('trips')
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq('id', tripId);
  if (error) throw error;
}

// ─── TRIPS — Delete ───────────────────────────────────────────────────────────

export async function deleteTrip(tripId: string): Promise<void> {
  const { error } = await db.from('trips').delete().eq('id', tripId);
  if (error) throw error;
}

// ─── PRODUCTS — Read ──────────────────────────────────────────────────────────

export async function getProductsByTriper(triperId: string): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('triper_id', triperId)
    .eq('is_available', true)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as Product[];
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

/** Get domestic products (trip_id IS NULL or trip.is_domestic = true). */
export async function getDomesticProducts(limit = 20): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .is('trip_id', null)      // products posted without an international trip
    .eq('is_available', true)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as Product[];
}

// ─── PRODUCTS — Create ────────────────────────────────────────────────────────

export async function createProduct(payload: ProductInsert): Promise<Product> {
  const { data, error } = await db
    .from('products')
    .insert(payload)
    .select()
    .single();
  if (error) throw error;
  return data as Product;
}

/**
 * Create a domestic product — no trip_id required.
 * The seller is posting directly; buyer comes to them.
 */
export async function createDomesticProduct(
  payload: Omit<ProductInsert, 'trip_id'>,
): Promise<Product> {
  return createProduct({ ...payload, trip_id: null as any });
}

// ─── PRODUCTS — Update ────────────────────────────────────────────────────────

export async function updateProduct(
  productId: string,
  patch: Partial<Pick<Product, 'name' | 'category' | 'price_min' | 'price_max' | 'image_urls' | 'is_available' | 'description'>>,
): Promise<void> {
  const { error } = await db
    .from('products')
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq('id', productId);
  if (error) throw error;
}

// ─── PRODUCTS — Delete ────────────────────────────────────────────────────────

export async function deleteProduct(productId: string): Promise<void> {
  const { error } = await db.from('products').delete().eq('id', productId);
  if (error) throw error;
}

// ─── PRODUCTS — Image Upload ──────────────────────────────────────────────────

export async function uploadProductImage(tripId: string, localUri: string): Promise<string> {
  const ext = (localUri.split('.').pop() ?? 'jpg').split('?')[0].toLowerCase();
  const contentType =
    ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';

  const response = await fetch(localUri);
  if (!response.ok) throw new Error('Failed to read local file');
  const arrayBuffer = await response.arrayBuffer();

  const path = `${tripId}/${Date.now()}.${ext}`;
  const { error } = await supabase.storage
    .from('item-images')
    .upload(path, arrayBuffer, { upsert: false, contentType });
  if (error) throw error;

  const { data } = supabase.storage.from('item-images').getPublicUrl(path);
  return data.publicUrl;
}

// ─── DISCOVERY ────────────────────────────────────────────────────────────────

export type TripWithProducts = TripWithProfile & { products: Product[] };

export async function getTripsByDestinationWithProducts(
  destination: string,
): Promise<TripWithProducts[]> {
  const { data: raw, error } = await supabase
    .from('trips')
    .select('*, profiles(id, full_name, avatar_url, rating, total_trips, total_reviews)')
    .eq('status', 'open')
    .or(
      `destination_country.ilike.%${destination}%,destination_city.ilike.%${destination}%`,
    )
    .order('departure_date', { ascending: true })
    .limit(30);
  if (error) throw error;
  const trips = (raw ?? []) as TripWithProfile[];
  if (trips.length === 0) return [];

  const tripIds = trips.map((t) => t.id);
  const { data: rawProducts, error: pErr } = await supabase
    .from('products')
    .select('*')
    .in('trip_id', tripIds)
    .eq('is_available', true)
    .order('created_at', { ascending: false });
  if (pErr) throw pErr;
  const products = (rawProducts ?? []) as Product[];

  const byTrip: Record<string, Product[]> = {};
  for (const p of products) {
    if (!byTrip[p.trip_id!]) byTrip[p.trip_id!] = [];
    byTrip[p.trip_id!].push(p);
  }
  return trips.map((trip) => ({ ...trip, products: byTrip[trip.id] ?? [] }));
}

export type ProductWithTripInfo = Product & {
  trips: Pick<Trip, 'destination_country' | 'destination_city'> | null;
};

export async function getProductsByDestination(
  destination: string,
  limit = 8,
): Promise<ProductWithTripInfo[]> {
  const { data: matchedTrips } = await supabase
    .from('trips')
    .select('id')
    .ilike('destination_country', `%${destination}%`)
    .eq('status', 'open');
  const tripIds = ((matchedTrips ?? []) as { id: string }[]).map((t) => t.id);
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

export async function searchProducts(
  query: string,
  destination?: string,
  limit = 20,
): Promise<ProductWithTripInfo[]> {
  let tripIds: string[] | null = null;
  if (destination) {
    const { data: trips } = await supabase
      .from('trips')
      .select('id')
      .ilike('destination_country', `%${destination}%`)
      .eq('status', 'open');
    tripIds = ((trips ?? []) as { id: string }[]).map((t) => t.id);
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

export async function getProductWithTripInfo(
  id: string,
): Promise<(ProductWithTripInfo & { profiles: any | null }) | null> {
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

// ─── DISCOVERY — Countries & Cities ──────────────────────────────────────────

export async function getCountriesWithTripCount(): Promise<
  { country: string; count: number }[]
> {
  const { data, error } = await supabase
    .from('trips')
    .select('destination_country')
    .eq('status', 'open');
  if (error) throw error;
  const counts: Record<string, number> = {};
  for (const row of (data ?? []) as Array<{ destination_country: string }>) {
    const c = row.destination_country as string;
    if (c) counts[c] = (counts[c] ?? 0) + 1;
  }
  return Object.entries(counts)
    .map(([country, count]) => ({ country, count }))
    .sort((a, b) => b.count - a.count);
}

export async function getCitiesByCountry(
  country: string,
): Promise<{ city: string; count: number }[]> {
  const { data, error } = await supabase
    .from('trips')
    .select('destination_city')
    .ilike('destination_country', `%${country}%`)
    .eq('status', 'open')
    .not('destination_city', 'is', null);
  if (error) throw error;
  const counts: Record<string, number> = {};
  for (const row of (data ?? []) as Array<{ destination_city: string | null }>) {
    const c = row.destination_city as string;
    if (c) counts[c] = (counts[c] ?? 0) + 1;
  }
  return Object.entries(counts)
    .map(([city, count]) => ({ city, count }))
    .sort((a, b) => b.count - a.count);
}

// ─── REALTIME ─────────────────────────────────────────────────────────────────

export function subscribeToTrips(onChange: (trips: TripWithProfile[]) => void) {
  const channel = supabase
    .channel(`trips-feed-${Date.now()}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'trips' }, async () => {
      const fresh = await getOpenTrips();
      onChange(fresh);
    })
    .subscribe();
  return () => supabase.removeChannel(channel);
}

export function subscribeToProducts(onInsert: () => void) {
  const channel = supabase
    .channel(`products-feed-${Date.now()}`)
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'products' }, () => {
      onInsert();
    })
    .subscribe();
  return () => supabase.removeChannel(channel);
}