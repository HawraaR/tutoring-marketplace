import type { User } from "./user";

export interface RegisterInput {
  email: string;
  password?: string;
}

export interface LoginInput {
  email: string;
  password?: string;
}

export interface AuthResponse {
  message: string;
  token?: string;
  user?: User; // Cleanly references the exact 4-field User model!
}

export interface ApiErrorResponse {
  error?: string;
  details?: Array<{ field: string; message: string }>;
}