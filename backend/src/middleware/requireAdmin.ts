import { Request, Response, NextFunction } from "express";
import { prisma } from "../../prisma/db";

export const requireAdmin = async (req: Request, res: Response, next: NextFunction) => {
  const userId = (req as any).user?.userId || (req as any).user?.id;
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user?.isAdmin) return res.status(403).json({ error: "Admin access required" });
  next();
};
