// backend/src/controllers/authController.ts
import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { RegisterInput, LoginInput } from "../schemas/authSchema";
import { prisma } from "../db";

const SALT_ROUNDS = 10;

// REGISTER USER
export const register = async (req: Request, res: Response) => {
  try {
    // Log req.body to terminal to see EXACTLY what express receives
    console.log("📥 REGISTER REQ.BODY:", req.body);

    const { email, password, firstName, lastName } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName: firstName || null,
        lastName: lastName || null,
        isStudent: true,
        studentProfile: {
          create: {},
        },
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        isStudent: true,
        isTutor: true,
        isAdmin: true,
        studentProfile: true,
      },
    });

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || "fallback_secret",
      { expiresIn: "7d" }
    );

    return res.status(201).json({ user, token });
  } catch (error: any) {
    console.error("Register Error:", error);
    return res.status(500).json({ error: "Internal server error", details: error.message });
  }
};

// LOGIN HANDLER
export const login = async (
  req: Request<{}, {}, LoginInput>,
  res: Response,
) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const secret = process.env.JWT_SECRET || "fallback_secret";
    const token = jwt.sign({ userId: user.id, email: user.email }, secret, {
      expiresIn: "7d",
    });

    return res.status(200).json({
      message: "Login successful.",
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isStudent: user.isStudent,
        isTutor: user.isTutor,
        isAdmin: user.isAdmin,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
};

export const getMe = async (req: Request, res: Response) => {
  try {
    const authUser = (req as any).user;

    // Safely extract userId regardless of whether token payload had userId or id
    const userId = authUser?.userId || authUser?.id;

    if (!userId) {
      console.error("❌ TOKEN PAYLOAD MISSING USER ID:", authUser);
      return res.status(401).json({ error: "Invalid token payload: missing user ID" });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        isStudent: true,
        isTutor: true,
        isAdmin: true,
        createdAt: true,
        studentProfile: true, // Included cleanly as optional relation
        tutorProfile: true,   // Will be null for new students without crashing
      },
    });

    if (!user) {
      console.error("❌ USER NOT FOUND IN DB FOR ID:", userId);
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json({ user });
  } catch (error: any) {
    // THIS LOG WILL SHOW EXACTLY WHAT PRISMA IS COMPLAINING ABOUT
    console.error("🔥 GET ME PRISMA EXCEPTION:", error);
    return res.status(500).json({ 
      error: "Internal server error", 
      details: error.message 
    });
  }
};
