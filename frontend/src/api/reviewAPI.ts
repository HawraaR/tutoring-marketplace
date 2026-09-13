import { api } from "./axios";
import type { BookingReview, CreateReviewInput } from "../types/tutor";

export const createReview = async (input: CreateReviewInput): Promise<BookingReview> => {
  const res = await api.post<{ message: string; review: BookingReview }>("/reviews", input);
  return res.data.review;
};