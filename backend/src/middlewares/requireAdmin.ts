import { Request, Response, NextFunction } from "express";
import { prisma } from "../db";

// Must run after authenticateToken — relies on req.user being populated.
export const requireAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = (req as any).user?.userId || (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Access token missing or invalid" });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user?.isAdmin) {
      return res.status(403).json({ error: "Admin access required" });
    }

    next();
  } catch (error) {
    console.error("requireAdmin error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
