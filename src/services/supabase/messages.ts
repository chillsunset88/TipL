import { supabase } from '@/src/lib/supabase';
import type { Database } from '@/src/lib/database.types';

type Message = Database['public']['Tables']['messages']['Row'];
type MessageInsert = Database['public']['Tables']['messages']['Insert'];

const db = supabase as any;

export async function getMessages(orderId: string, limit = 50): Promise<Message[]> {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('order_id', orderId)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as Message[];
}

export async function sendMessage(payload: MessageInsert): Promise<Message> {
  const { data, error } = await db
    .from('messages')
    .insert(payload)
    .select()
    .single();
  if (error) throw error;
  return data as Message;
}

export async function markMessagesRead(orderId: string, receiverId: string): Promise<void> {
  const { error } = await db
    .from('messages')
    .update({ read_at: new Date().toISOString() })
    .eq('order_id', orderId)
    .eq('receiver_id', receiverId)
    .is('read_at', null);
  if (error) throw error;
}

export async function uploadChatImage(orderId: string, localUri: string): Promise<string> {
  const response = await fetch(localUri);
  const blob = await response.blob();
  const path = `${orderId}/${Date.now()}.jpg`;
  const { error } = await supabase.storage.from('chat-images').upload(path, blob);
  if (error) throw error;
  const { data } = supabase.storage.from('chat-images').getPublicUrl(path);
  return data.publicUrl;
}

export async function getConversations(userId: string) {
  const { data, error } = await supabase
    .from('messages')
    .select('*, orders(id, item_name, status, tiper_id, triper_id)')
    .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getUnreadCount(userId: string): Promise<number> {
  const { count, error } = await supabase
    .from('messages')
    .select('id', { count: 'exact', head: true })
    .eq('receiver_id', userId)
    .is('read_at', null);
  if (error) return 0;
  return count ?? 0;
}

export function subscribeToMessages(orderId: string, onMessage: (msg: Message) => void) {
  const channel = supabase
    .channel(`messages-${orderId}`)
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'messages',
      filter: `order_id=eq.${orderId}`,
    }, (payload) => {
      onMessage(payload.new as Message);
    })
    .subscribe();
  return () => supabase.removeChannel(channel);
}
