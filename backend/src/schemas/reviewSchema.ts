import { z } from "zod";

const categoryRating = z
  .number()
  .int("Rating must be a whole number of stars.")
  .min(1, "Rate between 1 and 5 stars.")
  .max(5, "Rate between 1 and 5 stars.");

export const createReviewSchema = z.object({
  bookingId: z.string().min(1, "bookingId is required."),
  ratings: z.object({
    knowledge: categoryRating,
    teachingStyle: categoryRating,
    punctuality: categoryRating,
  }),
  comment: z
    .string()
    .trim()
    .max(500, "Review text must be 500 characters or fewer.")
    .default(""),
});

export type CreateReviewBody = z.infer<typeof createReviewSchema>;