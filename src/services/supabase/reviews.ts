import { supabase } from '@/src/lib/supabase';
import type { Database } from '@/src/lib/database.types';

type Review = Database['public']['Tables']['reviews']['Row'];
type ReviewInsert = Database['public']['Tables']['reviews']['Insert'];

const db = supabase as any;

export type ReviewWithProfile = Review & {
  reviewer: Pick<Database['public']['Tables']['profiles']['Row'], 'id' | 'full_name' | 'avatar_url'> | null;
};

export async function getReviewsForUser(userId: string, limit = 20): Promise<ReviewWithProfile[]> {
  const { data, error } = await db
    .from('reviews')
    .select('*, reviewer:profiles!reviews_reviewer_id_fkey(id, full_name, avatar_url)')
    .eq('reviewee_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as ReviewWithProfile[];
}

export async function submitReview(payload: ReviewInsert): Promise<Review> {
  const { data, error } = await db
    .from('reviews')
    .insert(payload)
    .select()
    .single();
  if (error) throw error;
  return data as Review;
}

export async function hasReviewed(orderId: string, reviewerId: string): Promise<boolean> {
  const { count } = await db
    .from('reviews')
    .select('id', { count: 'exact', head: true })
    .eq('order_id', orderId)
    .eq('reviewer_id', reviewerId);
  return (count ?? 0) > 0;
}

/** Hitung ulang rating & total_reviews di profiles setelah review baru masuk */
export async function recalculateProfileRating(revieweeId: string): Promise<void> {
  const { data } = await db
    .from('reviews')
    .select('rating')
    .eq('reviewee_id', revieweeId);

  if (!data || data.length === 0) return;

  const total = data.length;
  const avg = data.reduce((sum: number, r: any) => sum + r.rating, 0) / total;

  await db
    .from('profiles')
    .update({
      rating: Math.round(avg * 10) / 10,
      total_reviews: total,
      updated_at: new Date().toISOString(),
    })
    .eq('id', revieweeId);
}
