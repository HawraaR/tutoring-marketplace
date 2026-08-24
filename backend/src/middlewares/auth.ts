import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface TokenPayload {
  id: string; // or number, depending on your Prisma/DB User id type
  email: string;
}

export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.log("👉 1. AUTH MIDDLEWARE HIT");
  // 1. Extract Authorization header ("Bearer <token>")
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  // 2. Guard against missing, empty, or literal "undefined" token strings
  if (!token || token === "undefined" || token === "null") {
    return res.status(401).json({ error: "Access token missing or invalid" });
  }

  try {
    // 3. Verify JWT token signature against your secret
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "supersecretkey",
    ) as TokenPayload;

    // 4. Attach decoded payload to req.user for downstream handlers
    (req as any).user = decoded;
    console.log("👉 2. TOKEN DECODED SUCCESSFULLY:", decoded);

    // 5. Proceed to the controller (getMe)
    next();
  } catch (error) {
    return res.status(403).json({ error: "Invalid or expired token" });
  }
};
