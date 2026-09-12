import { api } from "./axios"; // Your configured Axios instance
import type { Subject, CreateSubjectPayload } from "../types";

// Note: the backend returns these endpoints' payloads directly (a plain
// array/object), not wrapped in the generic { data } envelope — match that
// here rather than assuming an ApiResponse<T> shape.

/**
 * Fetch all subjects
 * GET /subjects
 */
export const getSubjects = async (): Promise<Subject[]> => {
  const response = await api.get<Subject[]>("/subjects");
  return response.data;
};

/**
 * Fetch a single subject by ID
 * GET /subjects/:id
 */
export const getSubjectById = async (id: string): Promise<Subject> => {
  const response = await api.get<Subject>(`/subjects/${id}`);
  return response.data;
};

/**
 * Create a new subject
 * POST /subjects
 */
export const createSubject = async (
  payload: CreateSubjectPayload,
): Promise<Subject> => {
  const response = await api.post<Subject>("/subjects", payload);
  return response.data;
};
