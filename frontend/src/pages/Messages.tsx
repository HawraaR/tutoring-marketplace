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
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import { useOutletContext, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { firstNameFromEmail } from "../lib/displayName";
import {
  createConversation,
  getConversations,
  getMessageContacts,
  getMessages,
  markConversationRead,
  sendMessage,
} from "../api/messageAPI";
import type {
  ChatMessage,
  Conversation,
  ConversationParticipant,
} from "../types";
import type { MessageContact } from "../api/messageAPI";

const roleTone = (isTutor?: boolean) =>
  (isTutor ? "burgundy" : "slate") as "burgundy" | "slate";

type Tone = "burgundy" | "olive" | "slate";

function displayName(participant: ConversationParticipant) {
  const name = [participant.user.firstName, participant.user.lastName]
    .filter(Boolean)
    .join(" ");
  const role = participant.user.isTutor
    ? "Tutor"
    : participant.user.isStudent
      ? "Student"
      : "Member";
  return `${name || participant.user.email} · ${role}`;
}

function contactName(contact: MessageContact) {
  return (
    contact.displayName ||
    [contact.firstName, contact.lastName].filter(Boolean).join(" ") ||
    contact.email
  );
}

function conversationPeer(conversation: Conversation, userId?: string) {
  return (
    conversation.participants.find(
      ({ userId: participantId }) => participantId !== userId,
    ) ?? conversation.participants[0]
  );
}

function formatTime(value: string) {
  return new Date(value).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

function Avatar({
  name,
  tone,
  online = false,
}: {
  name: string;
  tone: Tone;
  online?: boolean;
}) {
  const toneClass =
    tone === "burgundy"
      ? "bg-burgundy"
      : tone === "olive"
        ? "bg-olive"
        : "bg-slate-blue";
  return (
    <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-sm bg-surface-bg text-xs font-semibold text-ink">
      <span className={`absolute inset-0 rounded-sm opacity-15 ${toneClass}`} />
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

export function Messages() {
  const { onMenuClick } = useOutletContext<{ onMenuClick: () => void }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedId, setSelectedId] = useState<string>();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [search, setSearch] = useState("");
  const [draft, setDraft] = useState("");
  const [showThread, setShowThread] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showNewMessage, setShowNewMessage] = useState(false);
  const [contacts, setContacts] = useState<MessageContact[]>([]);
  const [contactSearch, setContactSearch] = useState("");
  const [contactsLoading, setContactsLoading] = useState(false);
  const requestedConversationId = searchParams.get("conversationId");
  const currentUser = firstNameFromEmail(user?.email);
  const selectedConversation = conversations.find(
    ({ id }) => id === selectedId,
  );
  const peer = selectedConversation
    ? conversationPeer(selectedConversation, user?.id)
    : undefined;

  const filteredConversations = useMemo(
    () =>
      conversations.filter((conversation) => {
        const participant = conversationPeer(conversation, user?.id);
        const name = participant ? displayName(participant) : "";
        return `${name} ${conversation.messages[0]?.text ?? ""}`
          .toLowerCase()
          .includes(search.toLowerCase());
      }),
    [conversations, search, user?.id],
  );

  const filteredContacts = contacts.filter((contact) =>
    `${contactName(contact)} ${contact.email}`
      .toLowerCase()
      .includes(contactSearch.toLowerCase()),
  );

  const loadConversations = async () => {
    try {
      const result = await getConversations();
      setConversations(result);
      const requested =
        requestedConversationId &&
        result.some(({ id }) => id === requestedConversationId)
          ? requestedConversationId
          : undefined;
      setSelectedId(
        (current) =>
          requested ||
          (current && result.some(({ id }) => id === current)
            ? current
            : undefined),
      );
      if (requested) setShowThread(true);
    } catch (error) {
      console.error(error);
      toast.error("Could not load conversations.");
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
      const result = await getMessages(conversationId);
      setMessages(result);
      await markConversationRead(conversationId);
      setConversations((items) =>
        items.map((item) =>
          item.id === conversationId ? { ...item, unreadCount: 0 } : item,
        ),
      );
    } catch (error) {
      console.error(error);
      toast.error("Could not load messages.");
    }
  };

  useEffect(() => {
    void loadConversations();
    const interval = window.setInterval(() => void loadConversations(), 5000);
    return () => window.clearInterval(interval);
  }, [requestedConversationId]);

  useEffect(() => {
    if (selectedId) void loadMessages(selectedId);
  }, [selectedId]);

  const selectConversation = (id: string) => {
    setSelectedId(id);
    setShowThread(true);
    setSearchParams({ conversationId: id }, { replace: true });
  };

  const openNewMessage = async () => {
    setShowNewMessage(true);
    setContactSearch("");
    setContactsLoading(true);
    try {
      setContacts(await getMessageContacts());
    } catch (error) {
      console.error(error);
      toast.error("Could not load contacts.");
    } finally {
      setContactsLoading(false);
    }
  };

  const startConversation = async (participantId: string) => {
    try {
      const conversation = await createConversation(participantId);
      setShowNewMessage(false);
      selectConversation(conversation.id);
    } catch (error) {
      console.error(error);
      toast.error("Could not start conversation.");
    }
  };

  const handleSend = async () => {
    const text = draft.trim();
    if (!text || !selectedId) return;
    try {
      const message = await sendMessage(selectedId, text);
      setMessages((items) => [...items, message]);
      setDraft("");
      void loadConversations();
    } catch (error) {
      console.error(error);
      toast.error("Could not send message.");
    }
  };

  return (
    <div className="mx-auto flex h-full min-h-0 max-w-7xl flex-col">
      <section className="flex min-h-0 flex-1 overflow-hidden rounded-sm border border-border-subtle bg-surface-card shadow-warm">
        <aside
          className={`${showThread ? "hidden md:flex" : "flex"} w-full shrink-0 flex-col border-r border-border-subtle md:w-[290px] lg:w-[320px]`}
        >
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
              <h1 className="flex-1 font-serif text-lg font-semibold text-ink">
                Messages
              </h1>
              <button
                type="button"
                aria-label="Start a new message"
                title="New message"
                onClick={() => void openNewMessage()}
                className="shrink-0 rounded-sm bg-brand-primary p-2 text-white hover:bg-brand-primary-hover"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <label className="relative mt-3 block">
              <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted" />
              <span className="sr-only">Search messages</span>
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search messages"
                className="w-full rounded-sm border border-border-subtle bg-surface-bg py-2 pr-3 pl-9 text-sm text-ink outline-none placeholder:text-muted focus:border-brand-primary"
              />
            </label>
          </div>
          <div className="chat-scrollbar min-h-0 flex-1 overflow-y-auto">
            <div className="flex items-center justify-between px-4 py-3">
              <p className="text-[11px] font-medium tracking-wide text-muted uppercase">
                Inbox
              </p>
              <span className="text-xs text-muted">
                {conversations.reduce(
                  (total, item) => total + item.unreadCount,
                  0,
                )}{" "}
                unread
              </span>
            </div>
            {loading ? (
              <p className="px-4 py-8 text-sm text-muted">
                Loading conversations...
              </p>
            ) : filteredConversations.length === 0 ? (
              <p className="px-4 py-8 text-sm text-muted">
                No conversations yet.
              </p>
            ) : (
              filteredConversations.map((conversation) => {
                const participant = conversationPeer(conversation, user?.id);
                if (!participant) return null;
                const name = displayName(participant);
                const tone = roleTone(participant.user.isTutor);
                return (
                  <button
                    key={conversation.id}
                    type="button"
                    onClick={() => selectConversation(conversation.id)}
                    className={`flex w-full gap-3 border-l-[3px] px-4 py-3 text-left transition hover:bg-surface-bg ${conversation.id === selectedId ? "border-brand-primary bg-brand-primary/5" : "border-transparent"}`}
                  >
                    <Avatar name={name} tone={tone} />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-baseline justify-between gap-2">
                        <span className="truncate text-sm font-medium text-ink">
                          {name}
                        </span>
                        <span className="shrink-0 text-[11px] text-muted">
                          {formatTime(conversation.updatedAt)}
                        </span>
                      </span>
                      <span className="mt-1 block truncate text-xs text-muted">
                        {conversation.messages[0]?.text ?? "No messages yet"}
                      </span>
                    </span>
                    {conversation.unreadCount > 0 && (
                      <span className="mt-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-burgundy px-1 text-[10px] font-semibold text-white">
                        {conversation.unreadCount}
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </aside>

        <div
          className={`${showThread ? "flex" : "hidden md:flex"} min-w-0 flex-1 flex-col`}
        >
          {selectedConversation && peer ? (
            <>
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
                    name={displayName(peer)}
                    tone={roleTone(peer.user.isTutor)}
                  />
                  <div className="min-w-0">
                    <h2 className="truncate text-sm font-semibold text-ink">
                      {displayName(peer)}
                    </h2>
                    <p className="truncate text-xs text-muted">
                      Tutorium conversation
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-muted">
                  <button
                    type="button"
                    aria-label="Start video call"
                    className="rounded-sm p-2 hover:bg-surface-bg hover:text-ink"
                  >
                    <Video className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    aria-label="Start audio call"
                    className="rounded-sm p-2 hover:bg-surface-bg hover:text-ink"
                  >
                    <Phone className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    aria-label="More conversation options"
                    className="rounded-sm p-2 hover:bg-surface-bg hover:text-ink"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </div>
              </header>
              <div className="chat-scrollbar flex-1 space-y-1 overflow-y-auto bg-[#fdfcfb] px-4 py-3 md:px-8">
                <div className="mx-auto flex max-w-md items-center gap-3 text-[10px] font-medium tracking-wide text-muted uppercase">
                  <span className="h-px flex-1 bg-border-subtle" />
                  Conversation
                  <span className="h-px flex-1 bg-border-subtle" />
                </div>
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.senderId === user?.id ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`flex max-w-[min(78%,420px)] flex-col ${message.senderId === user?.id ? "items-end" : "items-start"}`}
                    >
                      <div
                        className={`rounded-sm px-3 py-1.5 text-sm leading-relaxed ${message.senderId === user?.id ? "bg-brand-primary text-white" : "border border-border-subtle bg-surface-card text-ink"}`}
                      >
                        {message.text}
                      </div>
                      <span className="mt-0 px-1 text-[10px] text-muted">
                        {message.senderId === user?.id
                          ? currentUser
                          : displayName(peer)}{" "}
                        · {formatTime(message.createdAt)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  void handleSend();
                }}
                className="border-t border-border-subtle bg-surface-card p-3 md:p-4"
              >
                <div className="flex items-end gap-2 rounded-sm border border-border-subtle bg-surface-bg p-1.5 focus-within:border-brand-primary">
                  <button
                    type="button"
                    aria-label="Attach a file"
                    className="mb-0.5 rounded-sm p-2 text-muted hover:bg-surface-card hover:text-ink"
                  >
                    <Paperclip className="h-4 w-4" />
                  </button>
                  <textarea
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" && !event.shiftKey) {
                        event.preventDefault();
                        void handleSend();
                      }
                    }}
                    rows={1}
                    placeholder={`Message ${displayName(peer)}...`}
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
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center text-sm text-muted">
              Select a conversation to start messaging.
            </div>
          )}
        </div>
      </section>

      {showNewMessage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/30 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="new-message-title"
        >
          <div className="w-full max-w-md rounded-sm border border-border-subtle bg-surface-card p-5 shadow-xl">
            <div className="flex items-center justify-between">
              <h2
                id="new-message-title"
                className="font-serif text-lg font-semibold text-ink"
              >
                Start a conversation
              </h2>
              <button
                type="button"
                aria-label="Close new conversation"
                onClick={() => setShowNewMessage(false)}
                className="rounded-sm p-2 text-muted hover:bg-surface-bg hover:text-ink"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <input
              autoFocus
              value={contactSearch}
              onChange={(event) => setContactSearch(event.target.value)}
              placeholder="Search students or tutors"
              className="mt-4 w-full rounded-sm border border-border-subtle bg-surface-bg px-3 py-2 text-sm text-ink outline-none placeholder:text-muted focus:border-brand-primary"
            />
            <div className="mt-3 flex items-center gap-3 border-t border-border-subtle pt-3 text-[10px] font-semibold uppercase tracking-wide">
              <span className="inline-flex items-center gap-1 text-burgundy">
                <span className="h-2 w-2 rounded-full bg-burgundy" />
                Tutor
              </span>
              <span className="inline-flex items-center gap-1 text-slate-blue">
                <span className="h-2 w-2 rounded-full bg-slate-blue" />
                Student
              </span>
            </div>
            <div className="mt-1 max-h-72 overflow-y-auto">
              {contactsLoading ? (
                <p className="py-6 text-center text-sm text-muted">
                  Loading contacts...
                </p>
              ) : filteredContacts.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted">
                  No contacts found.
                </p>
              ) : (
                filteredContacts.map((contact) => {
                  const name = contactName(contact);
                  const tutor = contact.isTutor;
                  return (
                    <button
                      key={contact.id}
                      type="button"
                      onClick={() => void startConversation(contact.id)}
                      className="flex w-full items-center gap-3 border-b border-border-subtle px-2 py-3 text-left last:border-0 hover:bg-surface-bg"
                    >
                      <Avatar name={name} tone={roleTone(tutor)} />
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-2">
                          <span className="truncate text-sm font-medium text-ink">
                            {name}
                          </span>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${tutor ? "bg-burgundy/10 text-burgundy" : "bg-slate-blue/10 text-slate-blue"}`}
                          >
                            {tutor ? "Tutor" : "Student"}
                          </span>
                        </span>
                        <span className="block truncate text-xs text-muted">
                          {contact.email}
                        </span>
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
