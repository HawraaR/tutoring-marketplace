import { Request, Response } from "express";
import { prisma } from "../../prisma/db";
import bcrypt from "bcryptjs";

//create a new user
export const createUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ error: "Email and password are required." });
    }

    // 1. Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ error: "User already exists." });
    }

    // 2. Hash password (10 salt rounds)
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Save user with hashed password
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
      select: {
        id: true,
        email: true,
        createdAt: true, // Omit returning password back to client
      },
    });

    return res.status(201).json({ user });
  } catch (error) {
    console.error("Error creating user:", error); // Check terminal output
    return res.status(500).json({
      error: "Failed to create user.",
      details: error instanceof Error ? error.message : error,
    });
  }
};

// Fetches all user records
export const getUsers = async (_req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany();
    return res.json(users);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
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
    return res.status(200).json(users.map((user) => ({
      ...user,
      displayName:
        [user.firstName, user.lastName].filter(Boolean).join(" ") ||
        user.email.split("@")[0].split(/[._-]+/).filter(Boolean).map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" "),
    })));
  } catch (error) {
    console.error("Error fetching message contacts:", error);
    return res.status(500).json({ error: "Failed to fetch message contacts." });
  }
};
