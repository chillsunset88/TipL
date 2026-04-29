/**
 * TipL — Trips Hook
 * Firestore queries for trip listings with pagination.
 */

import { useEffect, useState } from 'react';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  limit,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Trip } from '@/lib/types';

/** Listen to active/upcoming trips for the marketplace */
export function useTrips(maxItems: number = 20) {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'trips'),
      where('status', 'in', ['upcoming', 'active']),
      orderBy('departDate', 'asc'),
      limit(maxItems)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: Trip[] = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<Trip, 'id'>),
      }));
      setTrips(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [maxItems]);

  return { trips, loading };
}

/** Listen to a single trip document */
export function useTrip(tripId: string | undefined) {
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tripId) return;

    const unsubscribe = onSnapshot(doc(db, 'trips', tripId), (snapshot) => {
      if (snapshot.exists()) {
        setTrip({ id: snapshot.id, ...snapshot.data() } as Trip);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [tripId]);

  return { trip, loading };
}
