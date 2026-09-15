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

export const changePassword = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: "Both current and new passwords are required." });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: "New password must be at least 6 characters long." });
    }

    // 1. Fetch user to verify old password
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    // 2. Validate current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ error: "Incorrect current password." });
    }

    // 3. Hash and save new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword },
    });

    return res.status(200).json({ message: "Password updated successfully." });
  } catch (error: any) {
    console.error("Change Password Error:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
};

export const getUserById = async (req: Request<{id: string}>, res: Response) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        isStudent: true,
        isTutor: true,
        isAdmin: true,
        createdAt: true,
        studentProfile: {
          select: {
            id: true,
            educationLevel: true,
            major: true,
            learningGoals: true,
            preferredLanguage: true,
            maxHourlyRate: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json({ user });
  } catch (error: any) {
    console.error("Get User By ID Error:", error);
    return res.status(500).json({
      error: "Internal server error",
      details: error.message,
    });
  }
};


export const getMe = async (req: Request, res: Response) => {
  try {

    console.log("🔍 REQ.USER FROM MIDDLEWARE:", (req as any).user);
    const userId = (req as any).user?.userId || (req as any).user?.id;;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized access" });
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
        studentProfile: true,
      },
    });

    if (!user) {
      console.log("❌ USER NOT FOUND IN DB FOR ID:", userId);
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json({ user });
  } catch (error: any) {
    console.error("GetMe Error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// PUT /api/users/me
export const updateMe = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId || (req as any).user?.id;;
    const { firstName, lastName, email } = req.body;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized access" });
    }

    // Check if email is being updated and if it's already taken by another user
    if (email) {
      const existingUser = await prisma.user.findFirst({
        where: {
          email,
          NOT: { id: userId },
        },
      });

      if (existingUser) {
        return res.status(400).json({ error: "Email is already in use by another account" });
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(firstName !== undefined && { firstName }),
        ...(lastName !== undefined && { lastName }),
        ...(email !== undefined && { email }),
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

    return res.status(200).json({ user: updatedUser, message: "Profile updated successfully" });
  } catch (error: any) {
    console.error("UpdateMe Error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};