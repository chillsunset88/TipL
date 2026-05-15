// src/lib/hooks/useChat.ts
import { useEffect, useState, useCallback } from 'react';
import {
  getMessages,
  sendMessage as sendMessageService,
  sendImageMessage as sendImageMessageService,
  markMessagesRead as markReadService,
  uploadChatImage as uploadImageService,
  subscribeToMessages,
  resetUnreadCount,
  getOtherParticipant,
} from '@/src/services/supabase/messages';
import { ChatMessageWithSender } from '@/src/types/chat';

export function useChat(
  chatRoomId: string | undefined,
  currentUserId: string | undefined
) {
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
      // Reset unread count saat chat dibuka
      await resetUnreadCount(chatRoomId, currentUserId);

      const [msgs, other] = await Promise.all([
        getMessages(chatRoomId),
        getOtherParticipant(chatRoomId, currentUserId),
      ]);

      if (!active) return;
      setMessages(msgs ?? []);
      if (other) setOtherUser(other);
      setLoading(false);
    };

    init();

    // Unique suffix mencegah "cannot add callbacks after subscribe()" saat re-run
    const unsub = subscribeToMessages(chatRoomId, (newMsg) => {
      if (!active) return;
      setMessages((prev) => {
        // Deduplicate: optimistic update mungkin sudah menambahkan pesan ini
        if (prev.some((m) => m.id === newMsg.id)) return prev;
        return [newMsg, ...prev];
      });
    });

    return () => {
      active = false;
      unsub();
    };
  }, [chatRoomId, currentUserId]);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!chatRoomId || !currentUserId || !text.trim()) return;
      await sendMessageService({
        chatRoomId,
        senderId: currentUserId,
        text: text.trim(),
      });
    },
    [chatRoomId, currentUserId]
  );

  const sendImage = useCallback(
    async (imageUri: string) => {
      if (!chatRoomId || !currentUserId) return;
      const publicUrl = await uploadImageService(chatRoomId, currentUserId, imageUri);
      await sendImageMessageService({
        chatRoomId,
        senderId: currentUserId,
        imageUrl: publicUrl,
      });
    },
    [chatRoomId, currentUserId]
  );

  const markMessagesRead = useCallback(async () => {
    if (!chatRoomId || !currentUserId) return;
    await markReadService(chatRoomId, currentUserId);
  }, [chatRoomId, currentUserId]);

  const uploadChatImage = useCallback(
    async (localUri: string): Promise<string> => {
      if (!chatRoomId || !currentUserId) throw new Error('chatRoomId or currentUserId missing');
      return uploadImageService(chatRoomId, currentUserId, localUri);
    },
    [chatRoomId, currentUserId]
  );

  return { messages, loading, otherUser, sendMessage, sendImage, markMessagesRead, uploadChatImage };
}