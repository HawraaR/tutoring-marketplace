import { Request, Response } from "express";
import { prisma } from "../../prisma/db";

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