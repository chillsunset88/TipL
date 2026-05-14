import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/src/services/supabase';
import { ChatRoomWithParticipant } from '@/src/types/chat';

export function useChatRooms(currentUserId: string | undefined) {
  const [rooms, setRooms] = useState<ChatRoomWithParticipant[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!currentUserId) return;

    // Step 1: get all rooms where current user is a participant + unread count
    const { data: myParticipations } = await supabase
      .from('chat_participants')
      .select('chat_room_id, unread_count')
      .eq('user_id', currentUserId);

    const roomIds = myParticipations?.map((r) => r.chat_room_id) ?? [];
    if (roomIds.length === 0) {
      setRooms([]);
      setLoading(false);
      return;
    }

    // Step 2: get room metadata sorted by most recent message
    const { data: chatRooms } = await supabase
      .from('chat_rooms')
      .select('id, order_id, last_message, last_message_at, created_at')
      .in('id', roomIds)
      .order('last_message_at', { ascending: false, nullsFirst: false });

    // Step 3: get the other participant's user profile for each room
    const { data: others } = await supabase
      .from('chat_participants')
      .select('chat_room_id, users(id, full_name, profile_image)')
      .in('chat_room_id', roomIds)
      .neq('user_id', currentUserId);

    const unreadMap: Record<string, number> = Object.fromEntries(
      myParticipations?.map((r) => [r.chat_room_id, r.unread_count]) ?? []
    );
    const otherMap: Record<string, any> = Object.fromEntries(
      others?.map((p) => [p.chat_room_id, p.users]) ?? []
    );

    const result: ChatRoomWithParticipant[] = (chatRooms ?? []).map((room) => ({
      ...room,
      unread_count: unreadMap[room.id] ?? 0,
      other_user: otherMap[room.id] ?? { id: '', full_name: 'Unknown', profile_image: null },
    }));

    setRooms(result);
    setLoading(false);
  }, [currentUserId]);

  useEffect(() => {
    load();
  }, [load]);

  // Realtime: refresh inbox when any room's last_message changes
  useEffect(() => {
    if (!currentUserId) return;

    const channel = supabase
      .channel(`inbox-${currentUserId}-${Date.now()}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'chat_rooms' },
        () => load()
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'chat_participants', filter: `user_id=eq.${currentUserId}` },
        () => load()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUserId, load]);

  return { rooms, loading, refresh: load };
}
