import { supabase } from '@/src/lib/supabase';
import type { Database } from '@/src/lib/database.types';

type Notification = Database['public']['Tables']['notifications']['Row'];

const db = supabase as any;

export async function getNotifications(userId: string, limit = 30): Promise<Notification[]> {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as Notification[];
}

export async function markNotificationRead(notifId: string): Promise<void> {
  const { error } = await db
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('id', notifId);
  if (error) throw error;
}

export async function markAllRead(userId: string): Promise<void> {
  const { error } = await db
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('user_id', userId)
    .is('read_at', null);
  if (error) throw error;
}

export async function getUnreadNotifCount(userId: string): Promise<number> {
  const { count, error } = await supabase
    .from('notifications')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .is('read_at', null);
  if (error) return 0;
  return count ?? 0;
}

export function subscribeToNotifications(userId: string, onNotif: (n: Notification) => void) {
  const channel = supabase
    .channel(`notifs-${userId}`)
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'notifications',
      filter: `user_id=eq.${userId}`,
    }, (payload) => {
      onNotif(payload.new as Notification);
    })
    .subscribe();
  return () => { supabase.removeChannel(channel); };
}
