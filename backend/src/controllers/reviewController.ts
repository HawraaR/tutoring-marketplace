import { Request, Response } from "express";
import { prisma } from "../db";

// POST /api/reviews — the student of a COMPLETED session rates it (once)
export const createReview = async (req: Request, res: Response) => {
  try {
    const studentId = (req as any).user.userId;
    const { bookingId, rating, comment } = req.body;

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { review: true },
    });

    if (!booking) return res.status(404).json({ error: "Booking not found." });
    if (booking.studentId !== studentId)
      return res.status(403).json({ error: "Only the student of this session can review it." });
    if (booking.status !== "COMPLETED")
      return res.status(400).json({ error: "You can only review a completed session." });
    if (booking.review)
      return res.status(400).json({ error: "This session has already been reviewed." });

    const review = await prisma.$transaction(async (tx) => {
      const created = await tx.review.create({
        data: { bookingId: booking.id, tutorId: booking.tutorId, studentId, rating, comment },
      });

      // keep TutorProfile.averageRating / reviewCount in sync
      const agg = await tx.review.aggregate({
        where: { tutorId: booking.tutorId },
        _avg: { rating: true },
        _count: { _all: true },
      });
      await tx.tutorProfile.update({
        where: { userId: booking.tutorId },
        data: {
          averageRating: Math.round((agg._avg.rating ?? 0) * 10) / 10,
          reviewCount: agg._count._all,
        },
      });

      return created;
    });

    return res.status(201).json({ message: "Review submitted", review });
  } catch (error) {
    console.error("Create Review Error:", error);
    return res.status(500).json({ error: "Failed to submit review." });
  }
};