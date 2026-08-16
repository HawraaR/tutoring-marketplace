// backend/src/routes/auth.ts
import { Router } from "express";
import { register, login, getMe } from "../controllers/authController";
import { validateBody } from "../middleware/validate";
import { registerSchema, loginSchema } from "../schemas/authSchema";
import { authenticateToken } from "../middleware/auth";

const router = Router();

router.post("/register", validateBody(registerSchema), register);
router.post("/login", validateBody(loginSchema), login);

// Add Protected /me Route
router.get("/me", authenticateToken, getMe);

export default router;