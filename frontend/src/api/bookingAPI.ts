import {api} from "./axios"; // Your configured Axios instance
import type {
  Booking,
  CreateBookingPayload,
  UpdateBookingStatusPayload,
  ApiResponse,
} from "../types";

/**
 * Fetch all bookings for the currently authenticated user (Student or Tutor)
 * GET /bookings/user
 */
export const getUserBookings = async (): Promise<Booking[]> => {
  const response = await api.get<ApiResponse<Booking[]>>("/bookings/user");
  return response.data.data;
};

/**
 * Create a new booking request
 * POST /bookings
 */
export const createBooking = async (
  payload: CreateBookingPayload
): Promise<Booking> => {
  const response = await api.post<ApiResponse<Booking>>("/bookings", payload);
  return response.data.data;
};

/**
 * Update the status of a booking (e.g., CONFIRMED, CANCELLED)
 * PATCH /bookings/:bookingId/status
 */
export const updateBookingStatus = async (
  bookingId: string,
  payload: UpdateBookingStatusPayload
): Promise<Booking> => {
  const response = await api.patch<ApiResponse<Booking>>(
    `/bookings/${bookingId}/status`,
    payload
  );
  return response.data.data;
};

/**
 * Delete/Cancel a booking by ID
 * DELETE /bookings/:bookingId
 */
export const deleteBooking = async (bookingId: string): Promise<void> => {
  await api.delete<ApiResponse<null>>(`/bookings/${bookingId}`);
};