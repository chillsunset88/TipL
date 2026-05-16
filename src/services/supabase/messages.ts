import { supabase } from '@/src/lib/supabase';
import type { Database } from '@/src/lib/database.types';

type Message = Database['public']['Tables']['messages']['Row'];
type MessageInsert = Database['public']['Tables']['messages']['Insert'];

const db = supabase as any;

// ─── Order-based (legacy) ────────────────────────────────────────────────────

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

export async function markMessagesRead(orderId: string, receiverId: string): Promise<void> {
  const { error } = await db
    .from('messages')
    .update({ read_at: new Date().toISOString() })
    .eq('order_id', orderId)
    .eq('receiver_id', receiverId)
    .is('read_at', null);
  if (error) throw error;
}

export function subscribeToMessages(orderId: string, onMessage: (msg: Message) => void) {
  const channel = supabase
    .channel(`messages-${orderId}-${Date.now()}`)
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

// ─── Direct (user-pair) ───────────────────────────────────────────────────────

export async function getDirectMessages(userA: string, userB: string, limit = 60): Promise<Message[]> {
  const { data, error } = await db
    .from('messages')
    .select('*')
    .or(
      `and(sender_id.eq.${userA},receiver_id.eq.${userB}),and(sender_id.eq.${userB},receiver_id.eq.${userA})`
    )
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as Message[];
}

export async function sendDirectMessage(
  senderId: string,
  receiverId: string,
  content: string,
): Promise<Message> {
  const payload: MessageInsert = {
    sender_id: senderId,
    receiver_id: receiverId,
    content,
    order_id: null,
    message_type: 'text',
  };
  const { data, error } = await db.from('messages').insert(payload).select().single();
  if (error) throw error;
  return data as Message;
}

export async function sendDirectImage(
  senderId: string,
  receiverId: string,
  imageUrl: string,
): Promise<Message> {
  const payload: MessageInsert = {
    sender_id: senderId,
    receiver_id: receiverId,
    image_url: imageUrl,
    order_id: null,
    message_type: 'image',
  };
  const { data, error } = await db.from('messages').insert(payload).select().single();
  if (error) throw error;
  return data as Message;
}

export async function markDirectMessagesRead(myId: string, partnerId: string): Promise<void> {
  const { error } = await db
    .from('messages')
    .update({ read_at: new Date().toISOString() })
    .eq('sender_id', partnerId)
    .eq('receiver_id', myId)
    .is('read_at', null);
  if (error) throw error;
}

// Subscribes to all incoming messages for `myId` from `partnerId` only.
export function subscribeToDirectMessages(
  myId: string,
  partnerId: string,
  onMessage: (msg: Message) => void,
) {
  const channel = supabase
    .channel(`direct-${[myId, partnerId].sort().join('-')}-${Date.now()}`)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'messages', filter: `receiver_id=eq.${myId}` },
      (payload) => {
        const msg = payload.new as Message;
        if (msg.sender_id === partnerId) onMessage(msg);
      },
    )
    .subscribe();
  return () => supabase.removeChannel(channel);
}

// ─── Shared utilities ─────────────────────────────────────────────────────────

export async function sendMessage(payload: MessageInsert): Promise<Message> {
  const { data, error } = await db.from('messages').insert(payload).select().single();
  if (error) throw error;
  return data as Message;
}

export async function uploadChatImage(roomId: string, localUri: string): Promise<string> {
  const response = await fetch(localUri);
  const blob = await response.blob();
  const path = `${roomId}/${Date.now()}.jpg`;
  const { error } = await supabase.storage.from('chat-images').upload(path, blob);
  if (error) throw error;
  const { data } = supabase.storage.from('chat-images').getPublicUrl(path);
  return data.publicUrl;
}

export async function getConversations(userId: string): Promise<any[]> {
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
