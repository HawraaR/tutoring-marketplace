import { Router } from "express";
import { applyAsTutor } from "../controllers/tutorController";
import { authenticateToken } from "../middlewares/auth"; // Your JWT protection middleware

const router = Router();

// POST /api/tutors/apply (Protected)
router.post("/apply", authenticateToken, applyAsTutor);

export default router;