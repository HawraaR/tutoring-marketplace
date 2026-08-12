import { Request, Response } from "express";
import { prisma } from "../db";

// Creates a new user record in Supabase
export const createUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const newUser = await prisma.user.create({
      data: { email, password },
    });

    return res.status(201).json({
      message: "User created successfully",
      user: newUser,
    });
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
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