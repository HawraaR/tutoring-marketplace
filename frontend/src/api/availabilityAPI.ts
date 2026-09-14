import {api} from "./axios"; // Your configured Axios instance
import type {
  AvailabilitySlot,
  CreateAvailabilityPayload,
  UpdateAvailabilityPayload,
  ApiResponse,
  OpenSlot,
} from "../types";

/**
 * Fetch all availability slots
 * GET /availability/
 */
export const getAvailableSlots = async (): Promise<AvailabilitySlot[]> => {
  const response = await api.get<ApiResponse<AvailabilitySlot[]>>(
    `/availability/`
  );
  return response.data.data;
};


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
 * Fetch a tutor's availability slots for a date range (public endpoint).
 * GET /availability/tutor/:tutorId?from=<ISO>&to=<ISO>
 */
export const getTutorAvailability = async (
  tutorId: string,
  from: string,
  to: string
): Promise<AvailabilitySlot[]> => {
  const response = await api.get<AvailabilitySlot[]>(
    `/availability/tutor/${tutorId}`,
    { params: { from, to } }
  );
  return response.data;
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
/**
 * Fetch bookable (open) slots for a date range, enriched with tutor
 * rate + subjects. Powers the booking modal week grid.
 * GET /availability/open?from=<ISO>&to=<ISO>
 */
export const getOpenSlots = async (from: string, to: string): Promise<OpenSlot[]> => {
  const response = await api.get<ApiResponse<OpenSlot[]>>(`/availability/open`, {
    params: { from, to },
  });
  const body = response.data;
  if (!body || !Array.isArray(body.data)) {
    throw new Error("The availability response has an invalid format.");
  }
  return body.data;
};