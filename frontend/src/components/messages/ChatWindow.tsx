import React, { useEffect, useState, useRef } from "react";
import type { ChatMessage } from "../../types";
import { useSocket } from "../../hooks/useSocket";

interface ChatWindowProps {
  conversationId: string | null;
  token: string | null;
  currentUserId: string;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  conversationId,
  token,
  currentUserId,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Hook into socket events for this session
  const { joinConversation, leaveConversation } = useSocket({
    token,
    onNewMessage: (message) => {
      if (message.conversationId === conversationId) {
        setMessages((prev) => [...prev, message]);
        // Auto mark read if window is active
        markAsRead();
      }
    },
    onMessageDeleted: ({ messageId }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId
            ? { ...msg, text: "Message deleted", deletedAt: new Date().toISOString() }
            : msg
        )
      );
    },
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const markAsRead = async () => {
    if (!conversationId || !token) return;
    try {
      await fetch(`/api/conversations/${conversationId}/read`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (err) {
      console.error("Failed to mark conversation read", err);
    }
  };

  // Fetch messages and manage room connection when conversation changes
  useEffect(() => {
    if (!conversationId || !token) return;

    joinConversation(conversationId);
    markAsRead();

    const fetchMessages = async () => {
      try {
        const res = await fetch(`/api/conversations/${conversationId}/messages`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data: ChatMessage[] = await res.json();
          setMessages(data);
          scrollToBottom();
        }
      } catch (err) {
        console.error("Failed to load messages", err);
      }
    };

    fetchMessages();

    return () => {
      leaveConversation(conversationId);
    };
  }, [conversationId, token]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !conversationId || !token) return;

    const textToSend = inputText;
    setInputText("");

    try {
      const res = await fetch(`/api/conversations/${conversationId}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text: textToSend }),
      });

      if (!res.ok) {
        console.error("Failed to send message");
        setInputText(textToSend); // Restore text on failure
      }
    } catch (err) {
      console.error("Send message error:", err);
      setInputText(textToSend);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!token) return;
    try {
      await fetch(`/api/messages/${messageId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (err) {
      console.error("Failed to delete message", err);
    }
  };

  if (!conversationId) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400 bg-gray-50">
        Select a conversation to start chatting
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-gray-50">
      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => {
          const isOwnMessage = msg.senderId === currentUserId;
          const isDeleted = Boolean(msg.deletedAt);

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isOwnMessage ? "items-end" : "items-start"}`}
            >
              <div
                className={`max-w-md px-4 py-2 rounded-2xl shadow-sm text-sm ${
                  isOwnMessage
                    ? "bg-blue-600 text-white rounded-br-none"
                    : "bg-white text-gray-900 border border-gray-200 rounded-bl-none"
                } ${isDeleted ? "italic opacity-70" : ""}`}
              >
                <p>{msg.text}</p>
              </div>

              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] text-gray-400">
                  {new Date(msg.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                {isOwnMessage && !isDeleted && (
                  <button
                    onClick={() => handleDeleteMessage(msg.id)}
                    className="text-[10px] text-red-500 hover:underline"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input Form */}
      <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-gray-200 flex gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500 text-sm"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-5 py-2 rounded-lg font-medium text-sm hover:bg-blue-700 transition-colors"
        >
          Send
        </button>
      </form>
    </div>
  );
};