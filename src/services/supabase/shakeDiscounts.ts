import { supabase } from '@/src/lib/supabase';
import type { Database } from '@/src/lib/database.types';

type ShakeDiscountRow = Database['public']['Tables']['shake_discounts']['Row'];

const db = supabase as any;

export type ShakeDiscount = ShakeDiscountRow;

const COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24 hours

export async function getShakeDiscount(userId: string): Promise<ShakeDiscount | null> {
  const { data, error } = await supabase
    .from('shake_discounts')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data as ShakeDiscount | null;
}

export async function isEligibleForShake(userId: string): Promise<boolean> {
  const record = await getShakeDiscount(userId);
  if (!record) return true;
  const elapsed = Date.now() - new Date(record.last_shake_at).getTime();
  return elapsed >= COOLDOWN_MS;
}

function generateCode(pct: number): string {
  const suffix = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `SHAKE${pct}OFF-${suffix}`;
}

export async function claimShakeDiscount(userId: string): Promise<ShakeDiscount> {
  const discountPct = Math.floor(Math.random() * 10) + 1; // 1–10%
  const discountCode = generateCode(discountPct);
  const now = new Date().toISOString();

  const { data, error } = await db
    .from('shake_discounts')
    .upsert(
      {
        user_id: userId,
        discount_pct: discountPct,
        discount_code: discountCode,
        last_shake_at: now,
        is_used: false,
        used_at: null,
        updated_at: now,
      },
      { onConflict: 'user_id' },
    )
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as ShakeDiscount;
}

export async function markDiscountUsed(userId: string): Promise<void> {
  const { error } = await db
    .from('shake_discounts')
    .update({ is_used: true, used_at: new Date().toISOString() })
    .eq('user_id', userId);

  if (error) throw new Error(error.message);
}
