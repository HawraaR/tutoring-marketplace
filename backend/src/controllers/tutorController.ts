import { Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { prisma } from "../../prisma/db";

// Token payload may be { userId } or { id } depending on where it was signed
const getUserId = (req: Request): string | undefined =>
  (req as any).user?.userId || (req as any).user?.id;

// POST /api/tutors/apply
export const applyAsTutor = async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    const {
      headline,
      bio,
      hourlyRate,
      subjects,
      education,
      languages,
      certificates,
      experience,
    } = req.body;

    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      include: { tutorProfile: true },
    });

    if (!existingUser) {
      return res.status(404).json({ error: "User not found" });
    }

    if (existingUser.tutorProfile) {
      return res
        .status(400)
        .json({ error: "Tutor profile already exists for this user" });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        isTutor: true,
        tutorProfile: {
          create: {
            headline,
            bio,
            hourlyRate,
            subjects,
            education,
            languages,
            certificates,
            experience,
            verificationStatus: "PENDING", // Requires admin approval
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

// GET /api/tutors/me
export const getMyTutorProfile = async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);

    const profile = await prisma.tutorProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      return res.status(404).json({ error: "No tutor profile found" });
    }

    return res.status(200).json({ profile });
  } catch (error) {
    console.error("Get Tutor Profile Error:", error);
    return res.status(500).json({ error: "Failed to fetch tutor profile" });
  }
};

// PATCH /api/tutors/me
export const updateMyTutorProfile = async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);

    const existing = await prisma.tutorProfile.findUnique({
      where: { userId },
    });

    if (!existing) {
      return res
        .status(404)
        .json({ error: "No tutor profile found. Apply as a tutor first." });
    }

    const {
      headline,
      bio,
      education,
      hourlyRate,
      subjects,
      languages,
      certificates,
      experience,
    } = req.body;

    // Build the update payload from only the keys that were actually sent
    const data: Prisma.TutorProfileUpdateInput = {};
    if (headline !== undefined) data.headline = headline;
    if (bio !== undefined) data.bio = bio;
    if (education !== undefined) data.education = education;
    if (hourlyRate !== undefined) data.hourlyRate = hourlyRate;
    if (subjects !== undefined) data.subjects = subjects;
    if (languages !== undefined) data.languages = languages;
    if (certificates !== undefined) data.certificates = certificates;
    if (experience !== undefined) data.experience = experience;

    const profile = await prisma.tutorProfile.update({
      where: { userId },
      data,
    });

    return res.status(200).json({ message: "Tutor profile updated", profile });
  } catch (error) {
    console.error("Update Tutor Profile Error:", error);
    return res.status(500).json({ error: "Failed to update tutor profile" });
  }
};
