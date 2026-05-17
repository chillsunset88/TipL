import { create } from 'zustand';
import { getOpenTrips, subscribeToTrips, TripWithProfile } from '@/src/services/supabase/trips';

interface TripsState {
  trips: TripWithProfile[];
  loading: boolean;
  error: string | null;
  initialized: boolean;
  fetch: () => Promise<void>;
  subscribe: () => () => void;
}

export const useTripsStore = create<TripsState>((set, get) => ({
  trips: [],
  loading: false,
  error: null,
  initialized: false,

  fetch: async () => {
    if (get().loading) return; // jangan fetch kalau sedang loading
    set((s) => ({ loading: !s.initialized, error: null }));
    try {
      const data = await getOpenTrips();
      set({ trips: data, initialized: true });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : 'Gagal memuat trips' });
    } finally {
      set({ loading: false });
    }
  },

  subscribe: () => {
    const unsub = subscribeToTrips((trips) => set({ trips }));
    return unsub;
  },
}));
