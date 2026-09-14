/* eslint-disable @typescript-eslint/no-unused-vars */
import { api } from "./axios";
import type { ChatMessage, Conversation, CreateConversationResponse } from "../types";
import { Link, useParams, useNavigate } from "react-router-dom";

export interface MessageContact {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  displayName?: string;
  email: string;
  isStudent: boolean;
  isTutor: boolean;
}

export const getMessageContacts = async (): Promise<MessageContact[]> => {
  const response = await api.get<MessageContact[]>("/users/contacts");
  return response.data;
};

export const getConversations = async (): Promise<Conversation[]> => {
  const response = await api.get<Conversation[]>("/conversations");
  return response.data;
};

export const createConversation = async (participantId: string): Promise<CreateConversationResponse> => {
  const response = await api.post<CreateConversationResponse>("/conversations", { participantId });
  return response.data;
};

export const getMessages = async (conversationId: string): Promise<ChatMessage[]> => {
  const response = await api.get<ChatMessage[]>(`/conversations/${conversationId}/messages`);
  return response.data;
};

export const sendMessage = async (conversationId: string, text: string): Promise<ChatMessage> => {
  const response = await api.post<ChatMessage>(`/conversations/${conversationId}/messages`, { text });
  return response.data;
};

export const markConversationRead = async (conversationId: string): Promise<void> => {
  await api.patch(`/conversations/${conversationId}/read`);
};