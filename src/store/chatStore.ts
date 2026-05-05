/**
 * TipL — Chat Store (Zustand)
 * Manages unread counts and active chat metadata.
 */

import { create } from 'zustand';
import { ChatRoom as ChatRoomType } from '@/lib/types';

interface ChatState {
  chatRooms: ChatRoomType[];
  activeChatId: string | null;
  totalUnread: number;
  setChatRooms: (rooms: ChatRoomType[]) => void;
  setActiveChatId: (id: string | null) => void;
  setTotalUnread: (count: number) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  chatRooms: [],
  activeChatId: null,
  totalUnread: 0,
  setChatRooms: (chatRooms) => set({ chatRooms }),
  setActiveChatId: (activeChatId) => set({ activeChatId }),
  setTotalUnread: (totalUnread) => set({ totalUnread }),
}));
