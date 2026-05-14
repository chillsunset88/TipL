// Types matching the Supabase chat schema exactly.
// Column names follow the DB snake_case convention.

export interface DbChatRoom {
  id: string;
  order_id: string | null;
  last_message: string | null;
  last_message_at: string | null;
  created_at: string;
}

export interface DbChatParticipant {
  chat_room_id: string;
  user_id: string;
  unread_count: number;
  joined_at: string;
}

export interface DbChatMessage {
  id: string;
  chat_room_id: string;
  sender_id: string;
  text: string | null;
  image_url: string | null;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
}

// Message with sender info joined from users table
export interface ChatMessageWithSender extends DbChatMessage {
  sender: {
    id: string;
    full_name: string;
    profile_image: string | null;
  } | null;
}

// Room with the other participant's info — used in inbox list
export interface ChatRoomWithParticipant extends DbChatRoom {
  other_user: {
    id: string;
    full_name: string;
    profile_image: string | null;
  };
  unread_count: number;
}
