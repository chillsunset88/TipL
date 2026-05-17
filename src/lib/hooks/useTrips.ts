import { useEffect, useState, useCallback } from 'react';
import { getTripById, getMyTrips, createTrip as createTripService, getProductsByTrip, createProduct, uploadProductImage, TripWithProfile } from '@/src/services/supabase/trips';
import { useTripsStore } from '@/src/store/tripsStore';

export type { TripWithProfile };
import type { Database } from '@/src/lib/database.types';

type Trip = Database['public']['Tables']['trips']['Row'];
type Product = Database['public']['Tables']['products']['Row'];

export function useTrips() {
  const { trips, loading, error, fetch, subscribe } = useTripsStore();

  useEffect(() => {
    // Fetch hanya jika belum ada data — tidak repeat saat tab di-focus ulang
    fetch();
    const unsub = subscribe();
    return () => { unsub(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { trips, loading, error, refetch: fetch };
}

export function useTrip(tripId: string | undefined) {
  const [trip, setTrip] = useState<TripWithProfile | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tripId) return;
    setLoading(true);
    Promise.all([getTripById(tripId), getProductsByTrip(tripId)])
      .then(([t, p]) => { setTrip(t); setProducts(p); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [tripId]);

  return { trip, products, loading };
}

export function useMyTrips(triperId: string | undefined) {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!triperId) { setLoading(false); return; }
    setLoading(true);
    getMyTrips(triperId).then(setTrips).catch(() => {}).finally(() => setLoading(false));
  }, [triperId]);

  return { trips, loading };
}

export interface CreateTripPayload {
  triperId: string;
  originCountry: string;
  destinationCountry: string;
  destinationCity?: string;
  departureDate: string;
  returnDate: string;
  capacityKg?: number;
  capacityItems?: number;
  priceRangeMin?: number;
  priceRangeMax?: number;
  currency?: string;
  notes?: string;
  products?: Array<{
    name: string;
    category?: string;
    priceMin?: number;
    priceMax?: number;
    imageUris?: string[];
  }>;
}

export async function createTrip(payload: CreateTripPayload): Promise<string> {
  const trip = await createTripService({
    triper_id: payload.triperId,
    origin_country: payload.originCountry,
    destination_country: payload.destinationCountry,
    destination_city: payload.destinationCity,
    departure_date: payload.departureDate,
    return_date: payload.returnDate,
    capacity_kg: payload.capacityKg,
    capacity_items: payload.capacityItems,
    price_range_min: payload.priceRangeMin,
    price_range_max: payload.priceRangeMax,
    currency: payload.currency ?? 'IDR',
    notes: payload.notes,
    status: 'open',
  });

  if (payload.products && payload.products.length > 0) {
    for (const p of payload.products) {
      const imageUrls: string[] = [];
      for (const uri of (p.imageUris ?? [])) {
        try {
          const url = await uploadProductImage(trip.id, uri);
          imageUrls.push(url);
        } catch { /* skip failed uploads */ }
      }
      await createProduct({
        trip_id: trip.id,
        triper_id: payload.triperId,
        name: p.name,
        category: p.category,
        price_min: p.priceMin,
        price_max: p.priceMax,
        currency: payload.currency ?? 'IDR',
        image_urls: imageUrls,
        is_available: true,
      });
    }
  }

  return trip.id;
}
