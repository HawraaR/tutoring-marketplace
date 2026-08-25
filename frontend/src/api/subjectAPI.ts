import { api } from "./axios"; // Your configured Axios instance
import type { Subject, CreateSubjectPayload, ApiResponse } from "../types";

/**
 * Fetch all subjects
 * GET /subjects
 */
export const getSubjects = async (): Promise<Subject[]> => {
  const response = await api.get<ApiResponse<Subject[]>>("/subjects");
  return response.data.data;
};

/**
 * Fetch a single subject by ID
 * GET /subjects/:id
 */
export const getSubjectById = async (id: string): Promise<Subject> => {
  const response = await api.get<ApiResponse<Subject>>(`/subjects/${id}`);
  return response.data.data;
};

/**
 * Create a new subject
 * POST /subjects
 */
export const createSubject = async (
  payload: CreateSubjectPayload,
): Promise<Subject> => {
  const response = await api.post<ApiResponse<Subject>>("/subjects", payload);
  return response.data.data;
};
