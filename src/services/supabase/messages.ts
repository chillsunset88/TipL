// src/services/supabase/messages.ts — MERGED
import { supabase } from '@/src/lib/supabase';
import type { Database } from '@/src/lib/database.types';

// ─── Types ────────────────────────────────────────────────────────────────────

type Message = Database['public']['Tables']['messages']['Row'];
type MessageInsert = Database['public']['Tables']['messages']['Insert'];

export type ChatMessage =
  Database['public']['Tables']['chat_messages']['Row'] & {
    sender: {
      id: string;
      full_name: string;
      profile_image: string | null;
    } | null;
  };

export type OtherUser = {
  id: string;
  full_name: string;
  profile_image: string | null;
};

// ─── Chat Room (chatRoomId-based) ─────────────────────────────────────────────

/** Ambil pesan dari chat_messages berdasarkan chatRoomId */
export async function getMessages(
  chatRoomId: string,
  limit = 50
): Promise<ChatMessage[]> {
  const { data, error } = await supabase
    .from('chat_messages')
    .select('*, sender:users!sender_id(id, full_name, profile_image)')
    .eq('chat_room_id', chatRoomId)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as ChatMessage[];
}

/** Kirim pesan teks */
export async function sendMessage({
  chatRoomId,
  senderId,
  text,
}: {
  chatRoomId: string;
  senderId: string;
  text: string;
}): Promise<ChatMessage> {
  const { data, error } = await supabase
    .from('chat_messages')
    .insert({ chat_room_id: chatRoomId, sender_id: senderId, text })
    .select('*, sender:users!sender_id(id, full_name, profile_image)')
    .single();
  if (error) throw error;
  return data as ChatMessage;
}

/** Kirim pesan gambar (setelah upload) */
export async function sendImageMessage({
  chatRoomId,
  senderId,
  imageUrl,
}: {
  chatRoomId: string;
  senderId: string;
  imageUrl: string;
}): Promise<ChatMessage> {
  const { data, error } = await supabase
    .from('chat_messages')
    .insert({ chat_room_id: chatRoomId, sender_id: senderId, image_url: imageUrl })
    .select('*, sender:users!sender_id(id, full_name, profile_image)')
    .single();
  if (error) throw error;
  return data as ChatMessage;
}

/** Upload gambar ke storage, return public URL */
export async function uploadChatImage(
  chatRoomId: string,
  userId: string,
  localUri: string
): Promise<string> {
  const response = await fetch(localUri);
  const blob = await response.blob();
  const ext = localUri.split('.').pop() ?? 'jpg';
  const path = `${userId}/${chatRoomId}/${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from('chat-images')
    .upload(path, blob, { contentType: 'image/jpeg', upsert: false });
  if (error) throw error;

  const { data } = supabase.storage.from('chat-images').getPublicUrl(path);
  return data.publicUrl;
}

/** Reset unread count via RPC saat chat dibuka */
export async function resetUnreadCount(
  chatRoomId: string,
  userId: string
): Promise<void> {
  await supabase.rpc('reset_unread_count', {
    p_chat_room_id: chatRoomId,
    p_user_id: userId,
  });
}

/** Mark pesan sebagai read berdasarkan chatRoomId + userId penerima */
export async function markMessagesRead(
  chatRoomId: string,
  userId: string
): Promise<void> {
  const { error } = await supabase
    .from('chat_messages')
    .update({ read_at: new Date().toISOString() })
    .eq('chat_room_id', chatRoomId)
    .neq('sender_id', userId)
    .is('read_at', null);
  if (error) throw error;
}

/** Ambil profil user lain dalam chat room */
export async function getOtherParticipant(
  chatRoomId: string,
  currentUserId: string
): Promise<OtherUser | null> {
  const { data } = await supabase
    .from('chat_participants')
    .select('users(id, full_name, profile_image)')
    .eq('chat_room_id', chatRoomId)
    .neq('user_id', currentUserId)
    .limit(1)
    .maybeSingle();
  return (data?.users as OtherUser) ?? null;
}

/** Subscribe realtime INSERT pada chat_messages.
 *  Unique suffix mencegah channel collision saat re-subscribe. */
export function subscribeToMessages(
  chatRoomId: string,
  onMessage: (msg: ChatMessage) => void
): () => void {
  const channel = supabase
    .channel(`chat-${chatRoomId}-${Date.now()}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
        filter: `chat_room_id=eq.${chatRoomId}`,
      },
      async (payload) => {
        // Fetch full row dengan sender info
        const { data } = await supabase
          .from('chat_messages')
          .select('*, sender:users!sender_id(id, full_name, profile_image)')
          .eq('id', payload.new.id)
          .single();
        if (data) onMessage(data as ChatMessage);
      }
    )
    .subscribe();

  return () => supabase.removeChannel(channel);
}

// ─── Legacy (orderId-based) — dipertahankan untuk getConversations & unread ───

/** Ambil daftar konversasi untuk tab Chats */
export async function getConversations(userId: string): Promise<any[]> {
  const { data, error } = await supabase
    .from('messages')
    .select('*, orders(id, item_name, status, tiper_id, triper_id)')
    .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

/** Hitung total unread untuk badge di tab bar */
export async function getUnreadCount(userId: string): Promise<number> {
  const { count, error } = await supabase
    .from('messages')
    .select('id', { count: 'exact', head: true })
    .eq('receiver_id', userId)
    .is('read_at', null);
  if (error) return 0;
  return count ?? 0;
}