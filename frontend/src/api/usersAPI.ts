import { api } from "./axios";
import type { User } from "../types";

export interface CreateUserInput {
  email: string;
  password?: string;
}

export interface MessageContact {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  email: string;
  isStudent?: boolean;
  isTutor?: boolean;
  displayName: string;
}

export const usersAPI = {
  // Fetch all users (used by Admin / Directory)
  getUsers: async (): Promise<User[]> => {
    const response = await api.get("/users");
    // Defensive unwrapping in case backend sends { users: [...] } or direct array
    return Array.isArray(response.data)
      ? response.data
      : response.data.users || [];
  },

  // Create a new user (admin provision or signup)
  createUser: async (data: CreateUserInput): Promise<User> => {
    const response = await api.post("/users", data);
    return response.data.user || response.data;
  },

  // Fetch message contacts for the messaging component
  getMessageContacts: async (): Promise<MessageContact[]> => {
    const response = await api.get("/users/contacts");
    return Array.isArray(response.data)
      ? response.data
      : response.data.contacts || [];
  },

  // Update user roles (for Admin User Management)
  updateUserRoles: async (
    userId: string,
    roles: { isStudent?: boolean; isTutor?: boolean; isAdmin?: boolean }
  ): Promise<User> => {
    const response = await api.patch(`/users/${userId}/roles`, roles);
    return response.data.user || response.data;
  },
};