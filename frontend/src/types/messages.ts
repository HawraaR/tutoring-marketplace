export interface MessageUser {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  email: string;
  isStudent?: boolean;
  isTutor?: boolean;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  createdAt: string;
  updatedAt?: string;
  deletedAt?: string | null;
  sender: MessageUser;
}

export interface ConversationParticipant {
  conversationId: string;
  userId: string;
  joinedAt: string;
  lastReadAt?: string | null;
  user: MessageUser;
}

export interface Conversation {
  id: string;
  createdAt: string;
  updatedAt: string;
  participants: ConversationParticipant[];
  messages: Array<Pick<ChatMessage, "id" | "senderId" | "text" | "createdAt">>;
  unreadCount: number;
}

export interface CreateConversationResponse {
  id: string;
  createdAt: string;
  updatedAt: string;
  participants: ConversationParticipant[];
}
