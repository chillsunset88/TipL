/**
 * TipL — Chat Hook
 * Real-time Firestore listener for chat messages.
 * Isolated listener pattern: one snapshot per chat room.
 */

import { useEffect, useState, useCallback } from 'react';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  doc,
  updateDoc,
  serverTimestamp,
  limit,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ChatMessage, ProductCard } from '@/lib/types';

export function useChat(chatRoomId: string | undefined) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);

  // Isolated real-time listener — O(1) setup, auto-cleanup
  useEffect(() => {
    if (!chatRoomId) return;

    const messagesRef = collection(db, 'chatRooms', chatRoomId, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'desc'), limit(50));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs: ChatMessage[] = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<ChatMessage, 'id'>),
      }));
      setMessages(msgs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [chatRoomId]);

  const sendMessage = useCallback(
    async (senderId: string, senderName: string, senderAvatar: string | null, text: string) => {
      if (!chatRoomId) return;
      const messagesRef = collection(db, 'chatRooms', chatRoomId, 'messages');
      await addDoc(messagesRef, {
        senderId,
        senderName,
        senderAvatar,
        text,
        timestamp: Date.now(),
        read: false,
      });

      // Update last message on the chat room
      await updateDoc(doc(db, 'chatRooms', chatRoomId), {
        lastMessage: text,
        lastMessageTimestamp: Date.now(),
      });
    },
    [chatRoomId]
  );

  const sendImage = useCallback(
    async (senderId: string, senderName: string, senderAvatar: string | null, imageUrl: string) => {
      if (!chatRoomId) return;
      const messagesRef = collection(db, 'chatRooms', chatRoomId, 'messages');
      await addDoc(messagesRef, {
        senderId,
        senderName,
        senderAvatar,
        imageUrl,
        timestamp: Date.now(),
        read: false,
      });
    },
    [chatRoomId]
  );

  const sendProductCard = useCallback(
    async (senderId: string, senderName: string, senderAvatar: string | null, productCard: ProductCard) => {
      if (!chatRoomId) return;
      const messagesRef = collection(db, 'chatRooms', chatRoomId, 'messages');
      await addDoc(messagesRef, {
        senderId,
        senderName,
        senderAvatar,
        productCard,
        timestamp: Date.now(),
        read: false,
      });
    },
    [chatRoomId]
  );

  return { messages, loading, sendMessage, sendImage, sendProductCard };
}
