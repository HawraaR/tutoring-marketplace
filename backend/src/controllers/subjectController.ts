import { Request, Response } from "express";
import { prisma } from "../db";

// Get all subjects (For dropdowns in UI)
export const getSubjects = async (_req: Request, res: Response) => {
  try {
    const subjects = await prisma.subject.findMany({
      orderBy: { name: "asc" },
    });
    return res.status(200).json(subjects);
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch subjects." });
  }
};

export const getSubjectById = async (req: Request<{ id: string }>, res: Response) => {
  try {
    const { id } = req.params;

    const subject = await prisma.subject.findUnique({
      where: { id },
    });

    if (!subject) {
      return res.status(404).json({ message: "Subject not found" });
    }

    return res.status(200).json(subject);
  } catch (error) {
    console.error("Error fetching subject:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Seed/Create a subject (Admin or initial setup)
export const createSubject = async (req: Request, res: Response) => {
  try {
    const { name, category, description } = req.body;
    const subject = await prisma.subject.create({
      data: { name, category, description },
    });
    return res.status(201).json(subject);
  } catch (error) {
    return res.status(400).json({ error: "Subject already exists or invalid data." });
  }
};