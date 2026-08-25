import {api} from "./axios"; // Your configured Axios instance
import type {
  AvailabilitySlot,
  CreateAvailabilityPayload,
  UpdateAvailabilityPayload,
  ApiResponse,
} from "../types";

/**
 * Fetch availability slots for a specific tutor
 * GET /availability/tutors/:tutorId
 */
export const getTutorSchedule = async (
  tutorId: string
): Promise<AvailabilitySlot[]> => {
  const response = await api.get<ApiResponse<AvailabilitySlot[]>>(
    `/availability/tutors/${tutorId}`
  );
  return response.data.data;
};

/**
 * Create a new availability slot (Requires Tutor Auth)
 * POST /availability
 */
export const createAvailabilitySlot = async (
  payload: CreateAvailabilityPayload
): Promise<AvailabilitySlot> => {
  const response = await api.post<ApiResponse<AvailabilitySlot>>(
    "/availability",
    payload
  );
  return response.data.data;
};

/**
 * Update an availability slot (Requires Tutor Auth)
 * PUT /availability/:slotId
 */
export const updateAvailabilitySlot = async (
  slotId: string,
  payload: UpdateAvailabilityPayload
): Promise<AvailabilitySlot> => {
  const response = await api.put<ApiResponse<AvailabilitySlot>>(
    `/availability/${slotId}`,
    payload
  );
  return response.data.data;
};

/**
 * Delete an availability slot (Requires Tutor Auth)
 * DELETE /availability/:slotId
 */
export const deleteAvailabilitySlot = async (
  slotId: string
): Promise<void> => {
  await api.delete<ApiResponse<null>>(`/availability/${slotId}`);
};