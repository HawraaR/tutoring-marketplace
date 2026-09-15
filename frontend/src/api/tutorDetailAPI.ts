/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable preserve-caught-error */
import { api } from "./axios";
import type { Booking, CreateBookingInput, TutorDetailResponse } from "../types/tutor";

/** GET /api/tutors/:id (public) — controller returns the object directly */
export async function fetchTutorDetail(id: string): Promise<TutorDetailResponse> {
  try {
    const res = await api.get<TutorDetailResponse>(`/tutors/${id}`);
    console.log("fetchTutorDetail res.data", res.data);
    return res.data;
  } catch (err: any) {
    if (err?.response?.status === 404) throw new Error("NOT_FOUND");
    throw new Error(err?.response?.data?.error ?? "Failed to load tutor profile");
  }
}

/** POST /api/bookings — controller reads ONLY these 3 fields; tutor/times come from the slot */
export async function createBooking(input: CreateBookingInput): Promise<Booking> {
  try {
    const res = await api.post<{ message: string; booking: Booking }>("/bookings", {
      availabilitySlotId: input.availabilitySlotId,
      subjectId: input.subjectId,
      notes: input.notes,
    });
    return res.data.booking;
  } catch (err: any) {
    throw new Error(err?.response?.data?.error ?? "Failed to create booking");
  }
}