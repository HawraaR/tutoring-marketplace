import { Request, Response } from "express";
import { prisma } from "../db";

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
      subjectIds,
      education,
      languages,
      certificates,
      experience,
    } = req.body;

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

    // Link the taught subjects (real Subject catalog, not freeform text)
    if (Array.isArray(subjectIds) && subjectIds.length > 0) {
      await prisma.tutorSubject.createMany({
        data: subjectIds.map((subjectId: string) => ({ tutorId: userId!, subjectId })),
        skipDuplicates: true,
      });
    }

    return res.status(201).json({
      message: "Tutor application submitted successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Apply Tutor Error:", error);
    return res.status(500).json({ error: "Failed to create tutor profile" });
  }
};

// GET /api/tutors/me — the logged-in user's own tutor profile + selected subjects
export const getMyTutorProfile = async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        tutorProfile: true,
        tutorSubjects: { include: { subject: true } },
      },
    });

    if (!user?.tutorProfile) {
      return res.status(404).json({ error: "No tutor profile found" });
    }

    return res.status(200).json({
      profile: user.tutorProfile,
      subjects: user.tutorSubjects.map((ts) => ts.subject),
    });
  } catch (error) {
    console.error("Get My Tutor Profile Error:", error);
    return res.status(500).json({ error: "Failed to fetch tutor profile" });
  }
};

// PATCH /api/tutors/me — only an APPROVED tutor may edit their own profile
export const updateMyTutorProfile = async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);

    const existing = await prisma.tutorProfile.findUnique({ where: { userId } });
    if (!existing) {
      return res.status(404).json({ error: "No tutor profile found. Apply as a tutor first." });
    }
    if (existing.verificationStatus !== "APPROVED") {
      return res.status(403).json({ error: "Your profile is not approved yet, so it cannot be edited." });
    }

    const {
      headline,
      bio,
      education,
      hourlyRate,
      subjectIds,
      languages,
      certificates,
      experience,
    } = req.body;

    const data: Record<string, unknown> = {};
    if (headline !== undefined) data.headline = headline;
    if (bio !== undefined) data.bio = bio;
    if (education !== undefined) data.education = education;
    if (hourlyRate !== undefined) data.hourlyRate = parseFloat(hourlyRate) || 0;
    if (languages !== undefined) data.languages = languages;
    if (certificates !== undefined) data.certificates = certificates;
    if (experience !== undefined) data.experience = experience;

    const [profile] = await prisma.$transaction([
      prisma.tutorProfile.update({ where: { userId }, data }),
      ...(Array.isArray(subjectIds)
        ? [
            prisma.tutorSubject.deleteMany({ where: { tutorId: userId } }),
            prisma.tutorSubject.createMany({
              data: subjectIds.map((subjectId: string) => ({ tutorId: userId!, subjectId })),
              skipDuplicates: true,
            }),
          ]
        : []),
    ]);

    return res.status(200).json({ message: "Tutor profile updated", profile });
  } catch (error) {
    console.error("Update Tutor Profile Error:", error);
    return res.status(500).json({ error: "Failed to update tutor profile" });
  }
};

// GET /api/tutors/applications?status=PENDING|APPROVED|REJECTED — admin only
export const listTutorApplications = async (req: Request, res: Response) => {
  try {
    const status = (req.query.status as string)?.toUpperCase() || "PENDING";

    const applications = await prisma.tutorProfile.findMany({
      where: { verificationStatus: status as "PENDING" | "APPROVED" | "REJECTED" },
      include: {
        user: { select: { id: true, email: true, firstName: true, lastName: true } },
      },
      orderBy: { createdAt: "asc" },
    });

    return res.status(200).json({ applications });
  } catch (error) {
    console.error("List Tutor Applications Error:", error);
    return res.status(500).json({ error: "Failed to fetch tutor applications" });
  }
};

// PATCH /api/tutors/applications/:id — admin only
export const reviewTutorApplication = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { action, rejectionReason } = req.body;

    const existing = await prisma.tutorProfile.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: "Tutor application not found" });
    }

    const profile = await prisma.tutorProfile.update({
      where: { id },
      data: {
        verificationStatus: action === "approve" ? "APPROVED" : "REJECTED",
        rejectionReason: action === "approve" ? null : rejectionReason,
      },
    });

    return res.status(200).json({ message: `Application ${action}d`, profile });
  } catch (error) {
    console.error("Review Tutor Application Error:", error);
    return res.status(500).json({ error: "Failed to review tutor application" });
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
