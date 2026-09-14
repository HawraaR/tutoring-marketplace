import { Request, Response } from "express";
import { prisma } from "../db";

// POST /api/reviews — the student of an ended session rates it (once).
// The Prisma schema is frozen with a single `rating Int`, so we persist the
// OVERALL rating = average of every question in the review form (rounded).
// TutorProfile.averageRating then becomes the average of those overall ratings.
export const createReview = async (req: Request, res: Response) => {
  try {
    const studentId = (req as any).user.userId;
    const { bookingId, ratings, comment } = req.body as {
      bookingId: string;
      ratings: Record<string, number>;
      comment: string;
    };

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { review: true },
    });

    if (!booking) return res.status(404).json({ error: "Booking not found." });
    if (booking.studentId !== studentId)
      return res.status(403).json({ error: "Only the student of this session can review it." });
    const sessionHasEnded = booking.endTime <= new Date();
    const reviewable = booking.status !== "CANCELLED" && sessionHasEnded;
    if (!reviewable)
      return res.status(400).json({ error: "You can only review a completed session." });
    if (booking.review)
      return res.status(400).json({ error: "This session has already been reviewed." });

    // Overall rating for THIS review = avg of all question ratings in the form
    const values = Object.values(ratings);
    const overallRating = Math.round(values.reduce((sum, v) => sum + v, 0) / values.length);

    const review = await prisma.$transaction(async (tx) => {
      if (booking.status !== "COMPLETED") {
        await tx.booking.update({
          where: { id: booking.id },
          data: { status: "COMPLETED" },
        });
      }

      const created = await tx.review.create({
        data: {
          bookingId: booking.id,
          tutorId: booking.tutorId,
          studentId,
          rating: overallRating, // <- avg of the category ratings
          comment,
        },
      });

      // Keep TutorProfile.averageRating / reviewCount in sync
      // (average of ALL review ratings, each of which is itself an average)
      const agg = await tx.review.aggregate({
        where: { tutorId: booking.tutorId },
        _avg: { rating: true },
        _count: { _all: true },
      });
      await tx.tutorProfile.upsert({
        where: { userId: booking.tutorId },
        create: {
          userId: booking.tutorId,
          averageRating: Math.round((agg._avg.rating ?? 0) * 10) / 10,
          reviewCount: agg._count._all,
        },
        update: {
          averageRating: Math.round((agg._avg.rating ?? 0) * 10) / 10,
          reviewCount: agg._count._all,
        },
      });

      return created;
    });

    return res.status(201).json({
      message: "Review submitted",
      review,
      categoryRatings: ratings, // echoed for UI confirmation only (not persisted)
      overallRating,
    });
  } catch (error) {
    console.error("Create Review Error:", error);
    return res.status(500).json({ error: "Failed to submit review." });
  }
};