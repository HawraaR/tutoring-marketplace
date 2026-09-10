import { Request, Response } from "express";
import { prisma } from "../db";

export const applyAsTutor = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId || (req as any).user?.id;
    const { headline, bio, hourlyRate, subjects, education, languages, certificates, experience } = req.body;

    // Check if user already has a tutor profile
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      include: { tutorProfile: true },
    });

    if (existingUser?.tutorProfile) {
      return res.status(400).json({ error: "Tutor profile already exists for this user" });
    }

    // Update User role flag and create TutorProfile
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        isTutor: true,
        tutorProfile: {
          create: {
            headline,
            bio,
            hourlyRate: parseFloat(hourlyRate) || 0,
            subjects: subjects || [],
            education,
            languages: languages || ["English"],
            certificates: certificates || [],
            experience: experience || [],
            verificationStatus: "PENDING", // Requires Admin Approval
          },
        },
      },
      select: {
        id: true,
        email: true,
        isStudent: true,
        isTutor: true,
        isAdmin: true,
        tutorProfile: true,
      },
    });

    return res.status(201).json({
      message: "Tutor application submitted successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Apply Tutor Error:", error);
    return res.status(500).json({ error: "Failed to create tutor profile" });
  }
};

// GET /api/tutors  — public, no auth middleware
export const getTutors = async (_req: Request, res: Response) => {
  try {
    const tutors = await prisma.user.findMany({
      where: {
        isTutor: true,
        tutorProfile: { verificationStatus: "APPROVED" },
      },
      include: {
        tutorProfile: true,
        tutorSubjects: { include: { subject: true } },
        availability: {
          where: { isBooked: false, startTime: { gte: new Date() } },
          orderBy: { startTime: "asc" },
        },
      },
    });
    res.json(tutors); // Date fields auto-serialize to ISO strings → matches TutorListItem
  } catch (error) {
    console.error("GET /api/tutors failed:", error);
    res.status(500).json({ message: "Failed to fetch tutors" });
  }
};