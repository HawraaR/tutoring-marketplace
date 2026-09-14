import { useEffect } from "react";
import { socket, connectSocket } from "../lib/socket";
import type { ChatMessage, Conversation } from "../types"; // Adjust path to your types file

interface UseSocketProps {
  token: string | null;
  onNewMessage?: (message: ChatMessage) => void;
  onMessageDeleted?: (data: { messageId: string; conversationId: string }) => void;
  onConversationRead?: (data: { conversationId: string; userId: string; lastReadAt: string }) => void;
  onNewConversation?: (conversation: Conversation) => void;
}

export const useSocket = ({
  token,
  onNewMessage,
  onMessageDeleted,
  onConversationRead,
  onNewConversation,
}: UseSocketProps) => {
  useEffect(() => {
    if (!token) return;

    connectSocket();

    if (onNewMessage) socket.on("receive_message", onNewMessage);
    if (onMessageDeleted) socket.on("message_deleted", onMessageDeleted);
    if (onConversationRead) socket.on("conversation_read", onConversationRead);
    if (onNewConversation) socket.on("new_conversation", onNewConversation);

    return () => {
      if (onNewMessage) socket.off("receive_message", onNewMessage);
      if (onMessageDeleted) socket.off("message_deleted", onMessageDeleted);
      if (onConversationRead) socket.off("conversation_read", onConversationRead);
      if (onNewConversation) socket.off("new_conversation", onNewConversation);
    };
  }, [token, onNewMessage, onMessageDeleted, onConversationRead, onNewConversation]);

  const joinConversation = (conversationId: string): void => {
    // Explicitly emit as an object to match backend destructuring ({ conversationId })
    socket.emit("join_conversation", { conversationId });
  };

  const leaveConversation = (conversationId: string): void => {
    socket.emit("leave_conversation", { conversationId });
  };

  // const joinConversation = (conversationId: string): void => {
  //   socket.emit("join_conversation", conversationId);
  // };

  // const leaveConversation = (conversationId: string): void => {
  //   socket.emit("leave_conversation", conversationId);
  // };

  return {
    joinConversation,
    leaveConversation,
  };
};