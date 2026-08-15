import type { AuthResponse, LoginInput, RegisterInput } from "../../types";
import { api } from "./axios";


export const registerUser = async (data: RegisterInput): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>("/auth/register", data);
  return response.data;
};

export const loginUser = async (data: LoginInput): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>("/auth/login", data);
  return response.data;
};