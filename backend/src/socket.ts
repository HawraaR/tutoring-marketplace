import { Server as HTTPServer } from "http";
import { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { prisma } from "./db";

export interface AuthedSocket extends Socket {
  data: {
    userId: string;
  };
}

let io: Server;

export function initSocket(httpServer: HTTPServer) {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
      credentials: true,
    },
  });

  // 1. Auth Middleware: Synchronized with your REST authenticateToken middleware
  io.use((socket, next) => {
    const token =
      (socket.handshake.auth?.token as string | undefined) ||
      socket.handshake.headers?.authorization?.split(" ")[1];

    // Guard against missing or literal stringified null/undefined tokens
    if (!token || token === "undefined" || token === "null") {
      return next(new Error("Unauthorized: no token provided"));
    }

    try {
      const secret = process.env.JWT_SECRET || "fallback_secret";
      const decoded = jwt.verify(token, secret) as {
        userId?: string;
        id?: string;
        email?: string;
      };

      const userId = decoded.userId || decoded.id;
      if (!userId) {
        return next(new Error("Unauthorized: invalid token payload"));
      }

      // Attach verified userId to socket instance
      (socket as AuthedSocket).data.userId = userId;
      next();
    } catch {
      next(new Error("Unauthorized: invalid or expired token"));
    }
  });

  io.on("connection", (socket: AuthedSocket) => {
    const userId = socket.data.userId;

    // Join personal notification room for global user alerts
    socket.join(`user:${userId}`);

    // 2. Join Conversation Room (Verified against ConversationParticipant)
    socket.on(
      "join_conversation",
      async ({ conversationId }: { conversationId: string }) => {
        const participant = await prisma.conversationParticipant.findUnique({
          where: {
            conversationId_userId: {
              conversationId,
              userId,
            },
          },
        });

        // Silently ignore if user is not a participant
        if (!participant) return;

        socket.join(`conversation:${conversationId}`);
      },
    );

    // Leave Conversation Room
    socket.on(
      "leave_conversation",
      ({ conversationId }: { conversationId: string }) => {
        socket.leave(`conversation:${conversationId}`);
      },
    );

    // 3. Send Message Event (Verified against ConversationParticipant)
    socket.on(
      "send_message",
      async ({
        conversationId,
        message,
      }: {
        conversationId: string;
        message: {
          id: string;
          senderId: string;
          text: string;
          attachments?: string[];
          createdAt: string;
        };
      }) => {
        // Fetch all participants in this conversation
        const participants = await prisma.conversationParticipant.findMany({
          where: { conversationId },
          select: { userId: true },
        });

        // Verify sender is a participant
        const isParticipant = participants.some((p) => p.userId === userId);
        if (!isParticipant || message.senderId !== userId) return;

        const payload = {
          ...message,
          conversationId,
          attachments: message.attachments || [],
        };

        // Broadcast to active room members
        io.to(`conversation:${conversationId}`).emit("receive_message", payload);

        // Broadcast to personal inbox rooms for unread indicators/alerts
        participants.forEach((p) => {
          io.to(`user:${p.userId}`).emit("receive_message", payload);
        });
      },
    );
  });

  return io;
}

// Access Socket Server instance across Express controllers/routes
export function getIO(): Server {
  if (!io) {
    throw new Error("Socket.IO not initialized — call initSocket() first.");
  }
  return io;
}