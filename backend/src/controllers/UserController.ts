import { Request, Response } from "express";
import { prisma } from "../db";
import bcrypt from "bcryptjs";

// Create a new user
export const createUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ error: "Email and password are required." });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ error: "User already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        isStudent: true,
        isTutor: true,
        isAdmin: true,
        createdAt: true,
      },
    });

    return res.status(201).json({ user });
  } catch (error) {
    console.error("Error creating user:", error);
    return res.status(500).json({
      error: "Failed to create user.",
      details: error instanceof Error ? error.message : error,
    });
  }
};

// Fetches all user records (Excludes sensitive password field)
export const getUsers = async (_req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        isStudent: true,
        isTutor: true,
        isAdmin: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return res.json(users);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

// Toggle or update multi-role flags (isStudent, isTutor, isAdmin)
export const updateUserRoles = async (
  req: Request<{ id: string }>,
  res: Response,
) => {
  try {
    const { id } = req.params;
    const { isStudent, isTutor, isAdmin } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { id } });
    if (!existingUser) {
      return res.status(404).json({ error: "User not found." });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        ...(typeof isStudent === "boolean" && { isStudent }),
        ...(typeof isTutor === "boolean" && { isTutor }),
        ...(typeof isAdmin === "boolean" && { isAdmin }),
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        isStudent: true,
        isTutor: true,
        isAdmin: true,
      },
    });

    return res.json({ user: updatedUser });
  } catch (error) {
    console.error("Error updating user roles:", error);
    return res.status(500).json({ error: "Failed to update user roles." });
  }
};

export const getMessageContacts = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const users = await prisma.user.findMany({
      where: { id: { not: userId } },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        isStudent: true,
        isTutor: true,
      },
      orderBy: [{ firstName: "asc" }, { lastName: "asc" }, { email: "asc" }],
    });
    return res.status(200).json(
      users.map((user) => ({
        ...user,
        displayName:
          [user.firstName, user.lastName].filter(Boolean).join(" ") ||
          user.email
            .split("@")[0]
            .split(/[._-]+/)
            .filter(Boolean)
            .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
            .join(" "),
      })),
    );
  } catch (error) {
    console.error("Error fetching message contacts:", error);
    return res.status(500).json({ error: "Failed to fetch message contacts." });
  }
};
