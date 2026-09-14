import { Request, Response } from "express";
import { prisma } from "../db";

const getUserId = (req: Request): string | undefined =>
  (req as any).user?.userId;

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

const getAuthorizedConversation = async (
  conversationId: string,
  userId: string,
) => {
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    select: {
      id: true,
      participants: {
        select: { userId: true },
      },
    },
  });

  if (!conversation) return { status: 404 as const, conversation: null };

  const isParticipant = conversation.participants.some(
    (participant) => participant.userId === userId,
  );

  if (!isParticipant) {
    return { status: 403 as const, conversation: null };
  }

  return { status: 200 as const, conversation };
};

export const getConversations = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const userId = getUserId(req);
  if (!userId) {
    res.status(401).json({ error: "Authentication required." });
    return;
  }

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

        let unreadCount = unreadMap.get(conversation.id) ?? 0;

        if (membership?.lastReadAt) {
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

    res.status(200).json(result);
    return;
  } catch (error) {
    console.error("Get conversations error:", error);
    res.status(500).json({ error: "Failed to fetch conversations." });
    return;
  }
};

export const createConversation = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const userId = getUserId(req);
  const { participantId } = req.body;

  if (!userId) {
    res.status(401).json({ error: "Authentication required." });
    return;
  }
  if (!participantId || participantId === userId) {
    res.status(400).json({ error: "A different participant is required." });
    return;
  }

  try {
    const participant = await prisma.user.findUnique({
      where: { id: participantId },
      select: { id: true },
    });
    if (!participant) {
      res.status(404).json({ error: "Participant not found." });
      return;
    }

    const candidates = await prisma.conversation.findMany({
      where: {
        participants: { some: { userId } },
        AND: { participants: { some: { userId: participantId } } },
      },
      include: { participants: { include: participantSelect } },
    });

    const existing = candidates.find(
      ({ participants }) => participants.length === 2,
    );
    if (existing) {
      res.status(200).json(existing);
      return;
    }

    const conversation = await prisma.conversation.create({
      data: {
        participants: {
          create: [{ userId }, { userId: participantId }],
        },
      },
      include: { participants: { include: participantSelect } },
    });

    // --- Socket.IO Emission ---
    // Notify the recipient's personal room so their chat list/inbox updates live
    const io = req.app.get("io");
    if (io) {
      io.to(`user:${participantId}`).emit("new_conversation", conversation);
    }

    res.status(201).json(conversation);
    return;
  } catch (error) {
    console.error("Create conversation error:", error);
    res.status(500).json({ error: "Failed to create conversation." });
    return;
  }
};

export const getMessages = async (
  req: Request<
    { conversationId: string },
    any,
    any,
    { page?: string; limit?: string }
  >,
  res: Response,
): Promise<void> => {
  const userId = getUserId(req);
  if (!userId) {
    res.status(401).json({ error: "Authentication required." });
    return;
  }

  try {
    const authorization = await getAuthorizedConversation(
      req.params.conversationId,
      userId,
    );
    if (authorization.status === 404) {
      res.status(404).json({ error: "Conversation not found." });
      return;
    }
    if (authorization.status === 403) {
      res
        .status(403)
        .json({ error: "You are not a participant in this conversation." });
      return;
    }

    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 50, 1), 100);

    const messages = await prisma.message.findMany({
      where: { conversationId: req.params.conversationId, deletedAt: null },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        sender: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });

    res.status(200).json(messages.reverse());
    return;
  } catch (error) {
    console.error("Get messages error:", error);
    res.status(500).json({ error: "Failed to fetch messages." });
    return;
  }
};

//with socket.io
export const sendMessage = async (
  req: Request<{ conversationId: string }, any, { text?: string }>,
  res: Response,
): Promise<void> => {
  const userId = getUserId(req);
  const text = typeof req.body.text === "string" ? req.body.text.trim() : "";

  if (!userId) {
    res.status(401).json({ error: "Authentication required." });
    return;
  }
  if (!text) {
    res.status(400).json({ error: "Message text is required." });
    return;
  }
  if (text.length > 5000) {
    res.status(400).json({ error: "Message is too long." });
    return;
  }

  try {
    const authorization = await getAuthorizedConversation(
      req.params.conversationId,
      userId,
    );

    if (authorization.status === 404) {
      res.status(404).json({ error: "Conversation not found." });
      return;
    }
    if (authorization.status === 403) {
      res
        .status(403)
        .json({ error: "You are not a participant in this conversation." });
      return;
    }

    const message = await prisma.$transaction(async (transaction) => {
      const created = await transaction.message.create({
        data: {
          conversationId: req.params.conversationId,
          senderId: userId,
          text,
        },
        include: {
          sender: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
        },
      });

      await transaction.conversation.update({
        where: { id: req.params.conversationId },
        data: { updatedAt: new Date() },
      });

      return created;
    });

    // --- Socket.IO Emission ---
    const io = req.app.get("io");
    console.log(
      "IO instance found:",
      !!io,
      "Emitting to conversation:",
      req.params.conversationId,
    );
    if (io) {
      io.to(`conversation:${req.params.conversationId}`).emit(
        "receive_message",
        message,
      );

          // 2. Fetch participants and emit to their personal user rooms for inbox/badge updates
const participants = await prisma.conversationParticipant.findMany({
  where: { conversationId: req.params.conversationId },
  select: { userId: true },
});

participants.forEach((p) => {
  io.to(`user:${p.userId}`).emit("receive_message", message);
});
    }

    res.status(201).json(message);
    return;
  } catch (error) {
    console.error("Send message error:", error);
    res.status(500).json({ error: "Failed to send message." });
    return;
  }
};

// export const sendMessage = async (
//   req: Request<{ conversationId: string }>,
//   res: Response,
// ) => {
//   const userId = getUserId(req);
//   const text = typeof req.body.text === "string" ? req.body.text.trim() : "";
//   if (!userId)
//     return res.status(401).json({ error: "Authentication required." });
//   if (!text)
//     return res.status(400).json({ error: "Message text is required." });
//   if (text.length > 5000)
//     return res.status(400).json({ error: "Message is too long." });

//   try {
//     const authorization = await getAuthorizedConversation(
//       req.params.conversationId,
//       userId,
//     );
//     if (authorization.status === 404) {
//       return res.status(404).json({ error: "Conversation not found." });
//     }
//     if (authorization.status === 403) {
//       return res
//         .status(403)
//         .json({ error: "You are not a participant in this conversation." });
//     }

//     const message = await prisma.$transaction(async (transaction) => {
//       const created = await transaction.message.create({
//         data: {
//           conversationId: req.params.conversationId,
//           senderId: userId,
//           text,
//         },
//         include: {
//           sender: {
//             select: { id: true, firstName: true, lastName: true, email: true },
//           },
//         },
//       });
//       await transaction.conversation.update({
//         where: { id: req.params.conversationId },
//         data: { updatedAt: new Date() },
//       });
//       return created;
//     });

//     return res.status(201).json(message);
//   } catch (error) {
//     console.error("Send message error:", error);
//     return res.status(500).json({ error: "Failed to send message." });
//   }
// };

export const markConversationRead = async (
  req: Request<{ conversationId: string }>,
  res: Response,
): Promise<void> => {
  const userId = getUserId(req);
  if (!userId) {
    res.status(401).json({ error: "Authentication required." });
    return;
  }

  try {
    const authorization = await getAuthorizedConversation(
      req.params.conversationId,
      userId,
    );
    if (authorization.status === 404) {
      res.status(404).json({ error: "Conversation not found." });
      return;
    }
    if (authorization.status === 403) {
      res
        .status(403)
        .json({ error: "You are not a participant in this conversation." });
      return;
    }

    const updatedParticipant = await prisma.conversationParticipant.update({
      where: {
        conversationId_userId: {
          conversationId: req.params.conversationId,
          userId,
        },
      },
      data: { lastReadAt: new Date() },
    });

    // --- Socket.IO Emission ---
    // Notify the room that messages have been read by this user
    const io = req.app.get("io");
    if (io) {
      io.to(req.params.conversationId).emit("conversation_read", {
        conversationId: req.params.conversationId,
        userId,
        lastReadAt: updatedParticipant.lastReadAt,
      });
    }

    res.status(204).send();
    return;
  } catch (error) {
    console.error("Mark conversation read error:", error);
    res.status(404).json({ error: "Conversation participant not found." });
    return;
  }
};

export const deleteMessage = async (
  req: Request<{ messageId: string }>,
  res: Response,
): Promise<void> => {
  const userId = getUserId(req);
  if (!userId) {
    res.status(401).json({ error: "Authentication required." });
    return;
  }

  try {
    const messageReference = await prisma.message.findUnique({
      where: { id: req.params.messageId },
      select: { id: true, senderId: true, conversationId: true },
    });
    if (!messageReference) {
      res.status(404).json({ error: "Message not found." });
      return;
    }

    const authorization = await getAuthorizedConversation(
      messageReference.conversationId,
      userId,
    );
    if (authorization.status === 404) {
      res.status(404).json({ error: "Conversation not found." });
      return;
    }
    if (authorization.status === 403) {
      res
        .status(403)
        .json({ error: "You are not a participant in this conversation." });
      return;
    }

    if (messageReference.senderId !== userId) {
      res.status(403).json({ error: "You can only delete your own messages." });
      return;
    }

    await prisma.message.update({
      where: { id: messageReference.id },
      data: { deletedAt: new Date(), text: "Message deleted" },
    });

    // --- Socket.IO Emission ---
    const io = req.app.get("io");
    if (io) {
      io.to(messageReference.conversationId).emit("message_deleted", {
        messageId: messageReference.id,
        conversationId: messageReference.conversationId,
      });
    }

    res.status(204).send();
    return;
  } catch (error) {
    console.error("Delete message error:", error);
    res.status(500).json({ error: "Failed to delete message." });
    return;
  }
};
