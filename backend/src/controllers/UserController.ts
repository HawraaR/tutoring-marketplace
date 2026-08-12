import { Request, Response } from "express";
import { prisma } from "../db";
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
