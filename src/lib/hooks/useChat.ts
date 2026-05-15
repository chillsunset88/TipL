import { useEffect, useState, useCallback } from 'react';
import {
  getMessages, sendMessage as sendMessageService,
  markMessagesRead as markReadService,
  uploadChatImage as uploadImageService,
  subscribeToMessages,
} from '@/src/services/supabase/messages';
import type { Database } from '@/src/lib/database.types';

type Message = Database['public']['Tables']['messages']['Row'];

export function useChat(orderId: string | undefined) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) return;
    setLoading(true);
    getMessages(orderId).then(setMessages).catch(() => {}).finally(() => setLoading(false));

    const unsub = subscribeToMessages(orderId, (newMsg) => {
      setMessages((prev) => [newMsg, ...prev]);
    });
    return () => { unsub(); };
  }, [orderId]);

  const sendMessage = useCallback(async (
    senderId: string,
    receiverId: string,
    content: string,
    orderId_: string,
  ) => {
    await sendMessageService({ sender_id: senderId, receiver_id: receiverId, content, order_id: orderId_, message_type: 'text' });
  }, []);

  const sendImage = useCallback(async (
    senderId: string,
    receiverId: string,
    imageUrl: string,
    orderId_: string,
  ) => {
    await sendMessageService({ sender_id: senderId, receiver_id: receiverId, image_url: imageUrl, order_id: orderId_, message_type: 'image' });
  }, []);

  const markMessagesRead = useCallback(async (receiverId: string) => {
    if (!orderId) return;
    await markReadService(orderId, receiverId);
  }, [orderId]);

  const uploadChatImage = useCallback(async (localUri: string): Promise<string> => {
    if (!orderId) throw new Error('No orderId');
    return uploadImageService(orderId, localUri);
  }, [orderId]);

  return { messages, loading, sendMessage, sendImage, markMessagesRead, uploadChatImage };
}
