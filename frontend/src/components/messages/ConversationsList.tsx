import React, { useEffect, useState } from "react";
import type { Conversation } from "../../types";
import { getConversations } from "../../api/messageAPI";

interface ConversationsListProps {
  token: string | null;
  currentUserId: string;
  activeConversationId: string | null;
  onSelectConversation: (conversationId: string) => void;
  newConversation?: Conversation | null;
}

export const ConversationsList: React.FC<ConversationsListProps> = ({
  token,
  currentUserId,
  activeConversationId,
  onSelectConversation,
  newConversation,
}) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch initial conversations list
  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    const fetchConversationsData = async () => {
      try {
        const data = await getConversations(); // Calls your messageAPI service
        setConversations(data);
        console.log("conversations are ", data);
      } catch (err) {
        console.error("Failed to fetch conversations", err);
      } finally {
        setLoading(false);
      }
    };

    fetchConversationsData();
  }, [token]);

  // Handle incoming new conversation from socket
  useEffect(() => {
    if (!newConversation) return;
    setConversations((prev) => {
      // Avoid duplicates if it already exists in the list
      if (prev.some((c) => c.id === newConversation.id)) return prev;
      return [newConversation, ...prev];
    });
  }, [newConversation]);

  if (loading) {
    return <div className="p-4 text-gray-500">Loading chats...</div>;
  }

  return (
    <div className="w-80 border-r border-gray-200 flex flex-col h-full bg-white">
      <div className="p-4 border-b border-gray-200 font-semibold text-lg">
        Messages
      </div>
      <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
        {conversations.length === 0 ? (
          <p className="p-4 text-gray-400 text-sm">No conversations yet.</p>
        ) : (
          conversations.map((conv) => {
            // Find the other participant in the conversation
            const otherParticipant = conv.participants.find(
              (p) => p.userId !== currentUserId,
            );
            const otherUser = otherParticipant?.user;
            const lastMessage = conv.messages?.[0];

            return (
              <div
                key={conv.id}
                onClick={() => onSelectConversation(conv.id)}
                className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors flex justify-between items-start ${
                  activeConversationId === conv.id ? "bg-blue-50" : ""
                }`}
              >
                <div>
                  <h4 className="font-medium text-gray-900">
                    {otherUser
                      ? `${otherUser.firstName ?? ""} ${otherUser.lastName ?? ""}`.trim() ||
                        otherUser.email
                      : "Chat"}
                  </h4>
                  <p className="text-sm text-gray-500 truncate max-w-[180px]">
                    {lastMessage ? lastMessage.text : "No messages yet"}
                  </p>
                </div>
                {conv.unreadCount > 0 && (
                  <span className="bg-blue-600 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                    {conv.unreadCount}
                  </span>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
