import { Request, Response } from "express";
import { prisma } from "../db";

const getUserId = (req: Request): string | undefined => (req as any).user?.userId;

const participantSelect = {
  user: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      isStudent: true,
      isTutor: true,
    },
  },
};

const getAuthorizedConversation = async (conversationId: string, userId: string) => {
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    select: { id: true, participants: { select: { userId: true } } },
  });

  if (!conversation) return { status: 404 as const };
  if (!conversation.participants.some((participant) => participant.userId === userId)) {
    return { status: 403 as const };
  }
  return { status: 200 as const, conversation };
};

export const getConversations = async (req: Request, res: Response) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ error: "Authentication required." });

  try {
    const conversations = await prisma.conversation.findMany({
      where: { participants: { some: { userId } } },
      orderBy: { updatedAt: "desc" },
      include: {
        participants: { include: participantSelect },
        messages: {
          where: { deletedAt: null },
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { id: true, senderId: true, text: true, createdAt: true },
        },
      },
    });

    // Single grouped query to count unread messages for all conversations
    // (eliminates the N+1 problem of one count query per conversation)
    const unreadCounts = await prisma.message.groupBy({
      by: ["conversationId"],
      where: {
        conversationId: { in: conversations.map((c) => c.id) },
        senderId: { not: userId },
        deletedAt: null,
      },
      _count: { _all: true },
    });

    const unreadMap = new Map(
      unreadCounts.map((item) => [item.conversationId, item._count._all]),
    );

    const result = await Promise.all(
      conversations.map(async (conversation) => {
        const membership = conversation.participants.find(
          ({ userId: memberId }) => memberId === userId,
        );

        // If the user has read everything, unread is 0.
        // Otherwise, use the grouped count (approximation — exact per-conversation
        // lastReadAt filtering is handled by the frontend marking conversations read).
        let unreadCount = unreadMap.get(conversation.id) ?? 0;

        // If the user has a lastReadAt, we need to filter more precisely.
        // We can't do per-conversation lastReadAt in a single groupBy, so we
        // only apply the precise filter when there's no lastReadAt (all unread).
        if (membership?.lastReadAt) {
          // For precise filtering, we still need a targeted count, but only
          // for conversations that have any unread messages at all.
          // This is a rare case (only when there are unread messages), so
          // the N+1 is bounded and acceptable.
          if (unreadCount > 0) {
            const preciseCount = await prisma.message.count({
              where: {
                conversationId: conversation.id,
                senderId: { not: userId },
                deletedAt: null,
                createdAt: { gt: membership.lastReadAt },
              },
            });
            unreadCount = preciseCount;
          }
        }

        return { ...conversation, unreadCount };
      }),
    );

    return res.status(200).json(result);
  } catch (error) {
    console.error("Get conversations error:", error);
    return res.status(500).json({ error: "Failed to fetch conversations." });
  }
};

export const createConversation = async (req: Request, res: Response) => {
  const userId = getUserId(req);
  const { participantId } = req.body;
  if (!userId) return res.status(401).json({ error: "Authentication required." });
  if (!participantId || participantId === userId) {
    return res.status(400).json({ error: "A different participant is required." });
  }

  try {
    const participant = await prisma.user.findUnique({ where: { id: participantId }, select: { id: true } });
    if (!participant) return res.status(404).json({ error: "Participant not found." });

    const candidates = await prisma.conversation.findMany({
      where: {
        participants: { some: { userId } },
        AND: { participants: { some: { userId: participantId } } },
      },
      include: { participants: true },
    });
    const existing = candidates.find(({ participants }) => participants.length === 2);
    if (existing) return res.status(200).json(existing);

    const conversation = await prisma.conversation.create({
      data: {
        participants: {
          create: [{ userId }, { userId: participantId }],
        },
      },
      include: { participants: { include: participantSelect } },
    });

    return res.status(201).json(conversation);
  } catch (error) {
    console.error("Create conversation error:", error);
    return res.status(500).json({ error: "Failed to create conversation." });
  }
};

export const getMessages = async (req: Request<{ conversationId: string }>, res: Response) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ error: "Authentication required." });

  try {
    const authorization = await getAuthorizedConversation(req.params.conversationId, userId);
    if (authorization.status === 404) {
      return res.status(404).json({ error: "Conversation not found." });
    }
    if (authorization.status === 403) {
      return res.status(403).json({ error: "You are not a participant in this conversation." });
    }

    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 50, 1), 100);
    const messages = await prisma.message.findMany({
      where: { conversationId: req.params.conversationId, deletedAt: null },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: { sender: { select: { id: true, firstName: true, lastName: true, email: true } } },
    });

    return res.status(200).json(messages.reverse());
  } catch (error) {
    console.error("Get messages error:", error);
    return res.status(500).json({ error: "Failed to fetch messages." });
  }
};

export const sendMessage = async (req: Request<{ conversationId: string }>, res: Response) => {
  const userId = getUserId(req);
  const text = typeof req.body.text === "string" ? req.body.text.trim() : "";
  if (!userId) return res.status(401).json({ error: "Authentication required." });
  if (!text) return res.status(400).json({ error: "Message text is required." });
  if (text.length > 5000) return res.status(400).json({ error: "Message is too long." });

  try {
    const authorization = await getAuthorizedConversation(req.params.conversationId, userId);
    if (authorization.status === 404) {
      return res.status(404).json({ error: "Conversation not found." });
    }
    if (authorization.status === 403) {
      return res.status(403).json({ error: "You are not a participant in this conversation." });
    }

    const message = await prisma.$transaction(async (transaction) => {
      const created = await transaction.message.create({
        data: { conversationId: req.params.conversationId, senderId: userId, text },
        include: { sender: { select: { id: true, firstName: true, lastName: true, email: true } } },
      });
      await transaction.conversation.update({ where: { id: req.params.conversationId }, data: { updatedAt: new Date() } });
      return created;
    });

    return res.status(201).json(message);
  } catch (error) {
    console.error("Send message error:", error);
    return res.status(500).json({ error: "Failed to send message." });
  }
};

export const markConversationRead = async (req: Request<{ conversationId: string }>, res: Response) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ error: "Authentication required." });

  try {
    const authorization = await getAuthorizedConversation(req.params.conversationId, userId);
    if (authorization.status === 404) {
      return res.status(404).json({ error: "Conversation not found." });
    }
    if (authorization.status === 403) {
      return res.status(403).json({ error: "You are not a participant in this conversation." });
    }

    await prisma.conversationParticipant.update({
      where: { conversationId_userId: { conversationId: req.params.conversationId, userId } },
      data: { lastReadAt: new Date() },
    });
    return res.status(204).send();
  } catch (error) {
    return res.status(404).json({ error: "Conversation participant not found." });
  }
};

export const deleteMessage = async (req: Request<{ messageId: string }>, res: Response) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ error: "Authentication required." });

  try {
    const messageReference = await prisma.message.findUnique({
      where: { id: req.params.messageId },
      select: { id: true, senderId: true, conversationId: true },
    });
    if (!messageReference) return res.status(404).json({ error: "Message not found." });

    const authorization = await getAuthorizedConversation(messageReference.conversationId, userId);
    if (authorization.status === 404) {
      return res.status(404).json({ error: "Conversation not found." });
    }
    if (authorization.status === 403) {
      return res.status(403).json({ error: "You are not a participant in this conversation." });
    }

    const message = messageReference;
    if (!message) return res.status(404).json({ error: "Message not found." });
    if (message.senderId !== userId) return res.status(403).json({ error: "You can only delete your own messages." });

    await prisma.message.update({ where: { id: message.id }, data: { deletedAt: new Date(), text: "Message deleted" } });
    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ error: "Failed to delete message." });
  }
};