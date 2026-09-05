import { Router } from "express";
import {
  createConversation,
  deleteMessage,
  getConversations,
  getMessages,
  markConversationRead,
  sendMessage,
} from "../controllers/messageController";
import { authenticateToken } from "../middlewares/auth";

const router = Router();

router.use(authenticateToken);
router.get("/conversations", getConversations);
router.post("/conversations", createConversation);
router.get("/conversations/:conversationId/messages", getMessages);
router.post("/conversations/:conversationId/messages", sendMessage);
router.patch("/conversations/:conversationId/read", markConversationRead);
router.delete("/messages/:messageId", deleteMessage);

export default router;
