/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Menu,
  MoreHorizontal,
  Paperclip,
  Phone,
  Plus,
  Search,
  Send,
  Video,
} from "lucide-react";
import { useOutletContext, useSearchParams } from "react-router-dom"; // 1. Added useSearchParams
import { useAuth } from "../context/AuthContext";
import { firstNameFromEmail } from "../lib/displayName";
import {
  initialConversations,
  toneStyles,
  type Conversation,
} from "../data/messages";

// 2. Import your real backend APIs
import { 
  getConversations as fetchConversations, 
  getMessages as fetchMessages, 
  sendMessage as sendMessageApi,
  markConversationRead 
} from "../api/messageAPI";

function Avatar({
  name,
  tone,
  online = false,
}: {
  name: string;
  tone: Conversation["tone"];
  online?: boolean;
}) {
  return (
    <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-sm bg-surface-bg text-xs font-semibold text-ink">
      <span
        className={`absolute inset-0 rounded-sm opacity-15 ${toneStyles[tone]?.avatar || ""}`}
      />
      {name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0])
        .join("")}
      {online && (
        <span className="absolute right-[-2px] bottom-[-2px] h-2.5 w-2.5 rounded-full border-2 border-surface-card bg-olive" />
      )}
    </span>
  );
}

export function Messages2() {
  const { onMenuClick } = useOutletContext<{ onMenuClick: () => void }>();
  const { user } = useAuth();
  
  // 3. Read URL parameters
  const [searchParams] = useSearchParams();
  const urlConversationId = searchParams.get("conversationId");

  const [conversations, setConversations] = useState<Conversation[]>(initialConversations);
  
  // 4. Initialize selectedId from URL if present
  const [selectedId, setSelectedId] = useState(urlConversationId || "layla");
  const [showThread, setShowThread] = useState(!!urlConversationId);
  
  const [search, setSearch] = useState("");
  const [draft, setDraft] = useState("");
  const [activeMessages, setActiveMessages] = useState<any[]>([]); // Holds real/mock messages for the active chat
  
  const currentUser = firstNameFromEmail(user?.email);

  // 5. React to URL changes (e.g. navigating from Tutor Details)
  useEffect(() => {
    const id = searchParams.get("conversationId");
    if (id) {
      setSelectedId(id);
      setShowThread(true);
    }
  }, [searchParams]);

  // 6. Fetch real conversations from backend on mount
  useEffect(() => {
    const loadConversations = async () => {
      try {
        const backendConvs = await fetchConversations();
        
        // Map backend response to your UI Conversation type
        const mappedConvs: Conversation[] = backendConvs.map((c: any) => {
          const other = c.participants.find((p: any) => p.userId !== user?.id)?.user;
          const name = other ? `${other.firstName || ""} ${other.lastName || ""}`.trim() || other.email : "Unknown";
          const lastMsg = c.messages?.[0];
          
          return {
            id: c.id,
            name,
            course: other?.isTutor ? "Tutoring" : "Peer Chat",
            role: other?.isTutor ? "Tutor" : "Peer",
            tone: "olive", // Ensure this matches a key in your toneStyles
            online: false,
            updated: lastMsg ? new Date(lastMsg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Now",
            preview: lastMsg?.text || "Start of conversation",
            unread: c.unreadCount || 0,
            messages: [] // We load these separately when the chat is clicked
          };
        });

        // Merge backend conversations with your mock data
        setConversations((prev) => {
          const existingIds = new Set(prev.map((p) => p.id));
          const newConvs = mappedConvs.filter((c) => !existingIds.has(c.id));
          return [...prev, ...newConvs];
        });
      } catch (error) {
        console.error("Failed to load conversations:", error);
      }
    };

    if (user?.id) loadConversations();
  }, [user?.id]);

  // 7. Fetch messages when a conversation is selected
  useEffect(() => {
    if (!selectedId || selectedId === "layla") {
       // If it's the mock "layla" conversation, use mock messages
       const mockConv = conversations.find(c => c.id === "layla");
       setActiveMessages(mockConv?.messages || []);
       return;
    }

    const loadMessages = async () => {
      try {
        const msgs = await fetchMessages(selectedId);
        const mappedMsgs = msgs.map((m: any) => ({
          id: m.id,
          text: m.text,
          time: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          own: m.senderId === user?.id
        }));
        setActiveMessages(mappedMsgs);
        
        // Mark as read
        await markConversationRead(selectedId);
      } catch (error) {
        console.error("Failed to load messages:", error);
      }
    };
    
    loadMessages();
  }, [selectedId, user?.id]);

  const currentConversation =
    conversations.find(({ id }) => id === selectedId) ?? conversations[0];

  const filteredConversations = useMemo(
    () =>
      conversations.filter(({ name, course, preview }) =>
        `${name} ${course} ${preview}`
          .toLowerCase()
          .includes(search.toLowerCase()),
      ),
    [conversations, search],
  );

  const selectConversation = (id: string) => {
    setSelectedId(id);
    setShowThread(true);
    setConversations((items) =>
      items.map((item) => (item.id === id ? { ...item, unread: 0 } : item)),
    );
  };

  // 8. Send message using API
  const sendMessage = async () => {
    const text = draft.trim();
    if (!text || !currentConversation) return;

    // Optimistic UI update (show message immediately before API responds)
    const tempId = `temp-${Date.now()}`;
    const optimisticMsg = {
      id: tempId,
      text,
      time: "now",
      own: true,
    };
    setActiveMessages((prev) => [...prev, optimisticMsg]);
    setDraft("");

    try {
      if (selectedId === "layla") {
        // Mock behavior for the hardcoded conversation
        setConversations((items) =>
          items.map((item) =>
            item.id === selectedId
              ? { ...item, preview: text, updated: "now", messages: [...item.messages, optimisticMsg] }
              : item,
          ),
        );
      } else {
        // Real API call
        const sentMsg = await sendMessageApi(selectedId, text);
        
        // Update active messages with the real ID and time
        setActiveMessages((prev) =>
          prev.map((m) =>
            m.id === tempId
              ? {
                  ...m,
                  id: sentMsg.id,
                  time: new Date(sentMsg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                }
              : m,
          ),
        );

        // Update sidebar preview
        setConversations((items) =>
          items.map((item) =>
            item.id === selectedId
              ? { ...item, preview: text, updated: "now" }
              : item,
          ),
        );
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      // Optionally remove optimistic message on failure
    }
  };

  return (
    <div className="mx-auto flex h-full min-h-0 max-w-7xl flex-col">
      <section className="flex min-h-0 flex-1 overflow-hidden rounded-sm border border-border-subtle bg-surface-card shadow-warm">
        <aside
          className={`${showThread ? "hidden md:flex" : "flex"} w-full shrink-0 flex-col border-r border-border-subtle md:w-[290px] lg:w-[320px]`}
        >
          {/* ... Sidebar Header and Search (Unchanged) ... */}
          <div className="border-b border-border-subtle p-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label="Open menu"
                title="Open menu"
                className="shrink-0 rounded-sm border border-border-subtle bg-surface-bg p-2 text-muted hover:text-ink md:hidden"
                onClick={onMenuClick}
              >
                <Menu className="h-4 w-4" />
              </button>
              <h1 className="font-serif flex-1 text-lg font-semibold text-ink">Messages</h1>
              <button
                type="button"
                aria-label="Start a new message"
                title="New message"
                className="shrink-0 rounded-sm bg-brand-primary p-2 text-white hover:bg-brand-primary-hover"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <label className="relative mt-3 block">
              <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search messages"
                className="w-full rounded-sm border border-border-subtle bg-surface-bg py-2 pl-9 pr-3 text-sm text-ink outline-none placeholder:text-muted focus:border-brand-primary"
              />
            </label>
          </div>
          <div className="chat-scrollbar min-h-0 flex-1 overflow-y-auto">
            <div className="flex items-center justify-between px-4 py-3">
              <p className="text-[11px] font-medium tracking-wide text-muted uppercase">
                Inbox
              </p>
              <span className="text-xs text-muted">
                {conversations.reduce((total, item) => total + item.unread, 0)}{" "}
                unread
              </span>
            </div>
            {filteredConversations.map((conversation) => (
              <button
                key={conversation.id}
                type="button"
                onClick={() => selectConversation(conversation.id)}
                className={`flex w-full gap-3 border-l-[3px] px-4 py-3 text-left transition hover:bg-surface-bg ${conversation.id === selectedId ? "border-brand-primary bg-brand-primary/5" : "border-transparent"}`}
              >
                <Avatar
                  name={conversation.name}
                  tone={conversation.tone}
                  online={conversation.online}
                />
                <span className="min-w-0 flex-1">
                  <span className="flex items-baseline justify-between gap-2">
                    <span className="truncate text-sm font-medium text-ink">
                      {conversation.name}
                    </span>
                    <span className="shrink-0 text-[11px] text-muted">
                      {conversation.updated}
                    </span>
                  </span>
                  <span
                    className={`mt-0.5 block text-[11px] ${toneStyles[conversation.tone]?.label || ""}`}
                  >
                    {conversation.role} · {conversation.course.split(" · ")[0]}
                  </span>
                  <span className="mt-1 block truncate text-xs text-muted">
                    {conversation.preview}
                  </span>
                </span>
                {conversation.unread > 0 && (
                  <span className="mt-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-burgundy px-1 text-[10px] font-semibold text-white">
                    {conversation.unread}
                  </span>
                )}
              </button>
            ))}
          </div>
        </aside>

        <div
          className={`${showThread ? "flex" : "hidden md:flex"} min-w-0 flex-1 flex-col`}
        >
          <header className="flex items-center justify-between border-b border-border-subtle px-4 py-3 md:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                aria-label="Back to conversations"
                onClick={() => setShowThread(false)}
                className="text-muted hover:text-ink md:hidden"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <Avatar
                name={currentConversation.name}
                tone={currentConversation.tone}
                online={currentConversation.online}
              />
              <div className="min-w-0">
                <h2 className="truncate text-sm font-semibold text-ink">
                  {currentConversation.name}
                </h2>
                <p className="truncate text-xs text-muted">
                  {currentConversation.course} ·{" "}
                  {currentConversation.online
                    ? "Active now"
                    : "Last seen recently"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-muted">
              <button type="button" aria-label="Start video call" className="rounded-sm p-2 hover:bg-surface-bg hover:text-ink"><Video className="h-4 w-4" /></button>
              <button type="button" aria-label="Start audio call" className="rounded-sm p-2 hover:bg-surface-bg hover:text-ink"><Phone className="h-4 w-4" /></button>
              <button type="button" aria-label="More conversation options" className="rounded-sm p-2 hover:bg-surface-bg hover:text-ink"><MoreHorizontal className="h-4 w-4" /></button>
            </div>
          </header>

          <div className="chat-scrollbar flex-1 space-y-1 overflow-y-auto bg-[#fdfcfb] px-4 py-3 md:px-8">
            <div className="mx-auto flex max-w-md items-center gap-3 text-[10px] font-medium tracking-wide text-muted uppercase">
              <span className="h-px flex-1 bg-border-subtle" />
              Today
              <span className="h-px flex-1 bg-border-subtle" />
            </div>
            
            {/* 9. CHANGED: Render activeMessages instead of currentConversation.messages */}
            {activeMessages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.own ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[min(78%,420px)] ${message.own ? "items-end" : "items-start"} flex flex-col`}
                >
                  <div
                    className={`rounded-sm px-3 py-1.5 text-sm leading-relaxed ${message.own ? "bg-brand-primary text-white" : "border border-border-subtle bg-surface-card text-ink"}`}
                  >
                    {message.text}
                  </div>
                    <span className="mt-0 px-1 text-[10px] text-muted">
                    {message.own
                      ? `${currentUser} · `
                      : `${currentConversation.name.split(" ")[0]} · `}
                    {message.time}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <form
            onSubmit={(event) => {
              event.preventDefault();
              sendMessage();
            }}
            className="border-t border-border-subtle bg-surface-card p-3 md:p-4"
          >
            <div className="flex items-end gap-2 rounded-sm border border-border-subtle bg-surface-bg p-1.5 focus-within:border-brand-primary">
              <button type="button" aria-label="Attach a file" className="mb-0.5 rounded-sm p-2 text-muted hover:bg-surface-card hover:text-ink"><Paperclip className="h-4 w-4" /></button>
              <textarea
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    sendMessage();
                  }
                }}
                rows={1}
                placeholder={`Message ${currentConversation.name.split(" ")[0]}...`}
                className="max-h-24 min-h-9 flex-1 resize-none bg-transparent px-1 py-2 text-sm text-ink outline-none placeholder:text-muted"
              />
              <button
                type="submit"
                aria-label="Send message"
                disabled={!draft.trim()}
                className="mb-0.5 rounded-sm bg-brand-primary p-2 text-white hover:bg-brand-primary-hover disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-2 hidden text-[11px] text-muted sm:block">
              Messages are shared only with people in this conversation.
            </p>
          </form>
        </div>
      </section>
    </div>
  );
}