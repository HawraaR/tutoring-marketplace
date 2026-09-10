import { Router } from "express";
import {
  applyAsTutor,
  getMyTutorProfile,
  updateMyTutorProfile,
} from "../controllers/tutorController";
import { authenticateToken } from "../middleware/auth";
import { validateBody } from "../middleware/validate";
import {
  tutorApplicationSchema,
  tutorProfileUpdateSchema,
} from "../schemas/tutorSchema";

const router = Router();

// POST /api/tutors/apply
router.post(
  "/apply",
  authenticateToken,
  validateBody(tutorApplicationSchema),
  applyAsTutor,
);

// GET /api/tutors/me
router.get("/me", authenticateToken, getMyTutorProfile);

// PATCH /api/tutors/me
router.patch(
  "/me",
  authenticateToken,
  validateBody(tutorProfileUpdateSchema),
  updateMyTutorProfile,
);

export default router;
