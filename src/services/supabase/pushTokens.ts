import { supabase } from '@/src/lib/supabase';

const db = supabase as any;

export type Platform = 'ios' | 'android' | 'web';

export async function upsertPushToken(
  userId: string,
  token: string,
  platform: Platform,
): Promise<void> {
  const { error } = await db
    .from('push_tokens')
    .upsert(
      { user_id: userId, token, platform, updated_at: new Date().toISOString() },
      { onConflict: 'user_id,platform' },
    );

  if (error) throw new Error(error.message);
}

export async function deletePushToken(userId: string, platform: Platform): Promise<void> {
  const { error } = await supabase
    .from('push_tokens')
    .delete()
    .eq('user_id', userId)
    .eq('platform', platform);

  if (error) throw new Error(error.message);
}

export async function getPushTokensForUsers(userIds: string[]): Promise<
  { user_id: string; token: string; platform: Platform }[]
> {
  const { data, error } = await supabase
    .from('push_tokens')
    .select('user_id, token, platform')
    .in('user_id', userIds);

  if (error) throw new Error(error.message);
  return (data ?? []) as { user_id: string; token: string; platform: Platform }[];
}
