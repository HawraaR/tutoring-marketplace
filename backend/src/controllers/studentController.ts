import { Request, Response } from "express";
import { prisma } from "../db";

const getUserId = (req: Request): string | undefined =>
  (req as any).user?.userId || (req as any).user?.id;

// GET /api/students/me — the logged-in user's own student profile
export const getMyStudentProfile = async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);

    const profile = await prisma.studentProfile.findUnique({ where: { userId } });
    if (!profile) {
      // Shouldn't normally happen — register() always creates one — but
      // guard against older accounts or manual DB edits.
      return res.status(404).json({ error: "No student profile found" });
    }

    return res.status(200).json({ profile });
  } catch (error) {
    console.error("Get My Student Profile Error:", error);
    return res.status(500).json({ error: "Failed to fetch student profile" });
  }
};

// PATCH /api/students/me — anyone can edit their own student profile
export const updateMyStudentProfile = async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);

    const existing = await prisma.studentProfile.findUnique({ where: { userId } });
    if (!existing) {
      return res.status(404).json({ error: "No student profile found" });
    }

    const {
      educationLevel,
      major,
      learningGoals,
      preferredSubjectIds,
      learningStyle,
      timezone,
      preferredLanguage,
      maxHourlyRate,
    } = req.body;

    const data: Record<string, unknown> = {};
    if (educationLevel !== undefined) data.educationLevel = educationLevel;
    if (major !== undefined) data.major = major;
    if (learningGoals !== undefined) data.learningGoals = learningGoals;
    if (preferredSubjectIds !== undefined) data.preferredSubjects = preferredSubjectIds;
    if (learningStyle !== undefined) data.learningStyle = learningStyle;
    if (timezone !== undefined) data.timezone = timezone;
    if (preferredLanguage !== undefined) data.preferredLanguage = preferredLanguage;
    if (maxHourlyRate !== undefined) data.maxHourlyRate = parseFloat(maxHourlyRate) || 0;

    const profile = await prisma.studentProfile.update({ where: { userId }, data });

    return res.status(200).json({ message: "Student profile updated", profile });
  } catch (error) {
    console.error("Update Student Profile Error:", error);
    return res.status(500).json({ error: "Failed to update student profile" });
  }
};
