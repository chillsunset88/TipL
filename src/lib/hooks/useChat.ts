import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/src/services/supabase';
import { ChatMessageWithSender } from '@/src/types/chat';

export function useChat(chatRoomId: string | undefined, currentUserId: string | undefined) {
  const [messages, setMessages] = useState<ChatMessageWithSender[]>([]);
  const [loading, setLoading] = useState(true);
  const [otherUser, setOtherUser] = useState<{
    id: string;
    full_name: string;
    profile_image: string | null;
  } | null>(null);

  useEffect(() => {
    if (!chatRoomId || !currentUserId) return;

    let active = true;

    const init = async () => {
      await supabase.rpc('reset_unread_count', {
        p_chat_room_id: chatRoomId,
        p_user_id: currentUserId,
      });

      const { data: msgs, error: msgsErr } = await supabase
        .from('chat_messages')
        .select('*, sender:users!sender_id(id, full_name, profile_image)')
        .eq('chat_room_id', chatRoomId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (msgsErr) console.warn('useChat load error:', msgsErr.message);

      const { data: other } = await supabase
        .from('chat_participants')
        .select('users(id, full_name, profile_image)')
        .eq('chat_room_id', chatRoomId)
        .neq('user_id', currentUserId)
        .limit(1)
        .maybeSingle();

      if (!active) return;
      setMessages((msgs as ChatMessageWithSender[]) ?? []);
      if (other?.users) setOtherUser(other.users as any);
      setLoading(false);
    };

    init();

    // Unique suffix prevents "cannot add callbacks after subscribe()" on re-runs.
    const channel = supabase
      .channel(`room-${chatRoomId}-${Date.now()}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `chat_room_id=eq.${chatRoomId}`,
        },
        async (payload) => {
          const { data } = await supabase
            .from('chat_messages')
            .select('*, sender:users!sender_id(id, full_name, profile_image)')
            .eq('id', payload.new.id)
            .single();

          if (data && active) {
            setMessages((prev) => {
              // Deduplicate: optimistic update may have already added this message
              if (prev.some((m) => m.id === (data as ChatMessageWithSender).id)) return prev;
              return [data as ChatMessageWithSender, ...prev];
            });
          }
        }
      )
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, [chatRoomId, currentUserId]);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!chatRoomId || !currentUserId || !text.trim()) return;

      // Insert and immediately fetch the full row (with sender info) so we can
      // add it to local state right away without waiting for realtime.
      const { data, error } = await supabase
        .from('chat_messages')
        .insert({
          chat_room_id: chatRoomId,
          sender_id: currentUserId,
          text: text.trim(),
        })
        .select('*, sender:users!sender_id(id, full_name, profile_image)')
        .single();

      if (error) throw error;

      if (data) {
        setMessages((prev) => [data as ChatMessageWithSender, ...prev]);
      }
    },
    [chatRoomId, currentUserId]
  );

  const sendImage = useCallback(
    async (imageUri: string) => {
      if (!chatRoomId || !currentUserId) return;
      const ext = imageUri.split('.').pop() ?? 'jpg';
      const path = `${currentUserId}/${Date.now()}.${ext}`;

      const response = await fetch(imageUri);
      const blob = await response.blob();

      const { data: upload, error: uploadErr } = await supabase.storage
        .from('chat-images')
        .upload(path, blob, { contentType: 'image/jpeg', upsert: false });

      if (uploadErr) throw uploadErr;

      const { data: { publicUrl } } = supabase.storage
        .from('chat-images')
        .getPublicUrl(upload.path);

      const { data, error } = await supabase
        .from('chat_messages')
        .insert({
          chat_room_id: chatRoomId,
          sender_id: currentUserId,
          image_url: publicUrl,
        })
        .select('*, sender:users!sender_id(id, full_name, profile_image)')
        .single();

      if (error) throw error;

      if (data) {
        setMessages((prev) => [data as ChatMessageWithSender, ...prev]);
      }
    },
    [chatRoomId, currentUserId]
  );

  return { messages, loading, otherUser, sendMessage, sendImage };
}
