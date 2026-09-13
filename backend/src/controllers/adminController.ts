import { Request, Response } from "express";
import { prisma } from "../db";

// Fetch all tutors awaiting review
export const getPendingTutors = async (_req: Request, res: Response) => {
  try {
    const pendingTutors = await prisma.tutorProfile.findMany({
      where: {
        verificationStatus: { in: ["PENDING", "REJECTED"] },
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return res.json(pendingTutors);
  } catch (error) {
    console.error("Error fetching pending tutors:", error);
    return res.status(500).json({ error: "Failed to fetch pending tutor requests." });
  }
};

// Approve or Reject Tutor Application
export const reviewTutorApplication = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  try {
    const { id } = req.params; // Profile ID or User ID
    const { verificationStatus, rejectionReason } = req.body;

    if (!["APPROVED", "REJECTED", "PENDING"].includes(verificationStatus)) {
      return res.status(400).json({ error: "Invalid verification status." });
    }

    const updatedProfile = await prisma.tutorProfile.update({
      where: { id },
      data: {
        verificationStatus,
        rejectionReason: verificationStatus === "REJECTED" ? rejectionReason : null,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    return res.json(updatedProfile);
  } catch (error) {
    console.error("Error reviewing tutor application:", error);
    return res.status(500).json({ error: "Failed to update tutor verification status." });
  }
};