//src/lib/hooks/useChat.ts
import { useEffect, useState, useCallback } from 'react';
import {
  getDirectMessages,
  sendDirectMessage,
  sendDirectImage,
  markDirectMessagesRead,
  subscribeToDirectMessages,
  uploadChatImage as uploadImageService,
} from '@/src/services/supabase/messages';
import type { Database } from '@/src/lib/database.types';

type Message = Database['public']['Tables']['messages']['Row'];

export function useChat(currentUserId: string, otherUserId: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUserId || !otherUserId) return;

    setLoading(true);
    getDirectMessages(currentUserId, otherUserId)
      .then(setMessages)
      .catch(() => {})
      .finally(() => setLoading(false));

    const unsub = subscribeToDirectMessages(currentUserId, otherUserId, (newMsg) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === newMsg.id)) return prev;
        return [newMsg, ...prev];
      });
    });

    return () => { unsub(); };
  }, [currentUserId, otherUserId]);

  const sendMessage = useCallback(async (text: string): Promise<void> => {
    if (!currentUserId || !otherUserId) throw new Error('User IDs missing');
    const msg = await sendDirectMessage(currentUserId, otherUserId, text);
    // Add optimistically — real-time won't fire for sender's own messages via receiver filter
    setMessages((prev) => {
      if (prev.some((m) => m.id === msg.id)) return prev;
      return [msg, ...prev];
    });
  }, [currentUserId, otherUserId]);

  const sendImage = useCallback(async (imageUrl: string): Promise<void> => {
    if (!currentUserId || !otherUserId) throw new Error('User IDs missing');
    const msg = await sendDirectImage(currentUserId, otherUserId, imageUrl);
    setMessages((prev) => {
      if (prev.some((m) => m.id === msg.id)) return prev;
      return [msg, ...prev];
    });
  }, [currentUserId, otherUserId]);

  const sendProductCard = useCallback(async (product: {
  id: string;
  name: string;
  price: string;
  imageUrl: string;
}): Promise<void> => {
  const content = JSON.stringify({ _type: 'product', ...product });
  await sendMessage(content);
}, [sendMessage]);


  const markMessagesRead = useCallback(async (): Promise<void> => {
    if (!currentUserId || !otherUserId) return;
    await markDirectMessagesRead(currentUserId, otherUserId);
  }, [currentUserId, otherUserId]);

  const uploadChatImage = useCallback(async (localUri: string): Promise<string> => {
    const roomId = [currentUserId, otherUserId].sort().join('-');
    return uploadImageService(roomId, localUri);
  }, [currentUserId, otherUserId]);

  return { messages, loading, sendMessage, sendImage, sendProductCard, markMessagesRead, uploadChatImage };
}
