import { Router } from "express";
import {
  applyAsTutor,
  getTutors,
  getTutorById,
  getMyTutorProfile,
  updateMyTutorProfile,
  listTutorApplications,
  reviewTutorApplication,
  uploadCertificateMiddleware, // 1. Import the middleware
} from "../controllers/tutorController";
import { authenticateToken } from "../middlewares/auth";
import { requireAdmin } from "../middlewares/requireAdmin";
import { validateBody } from "../middlewares/validate";
import {
  tutorApplicationSchema,
  tutorProfileUpdateSchema,
  reviewApplicationSchema,
} from "../schemas/tutorSchema";

const router = Router();

// POST /api/tutors/apply (Protected)
// 2. Add uploadCertificateMiddleware BEFORE validateBody so req.body is parsed first
router.post(
  "/apply",
  authenticateToken,
  uploadCertificateMiddleware,
  validateBody(tutorApplicationSchema),
  applyAsTutor
);

// GET/PATCH /api/tutors/me — the logged-in user's own tutor profile (Protected)
router.get("/me", authenticateToken, getMyTutorProfile);

// 3. (Optional) Also add it to PATCH /me if tutors can upload new certificates later when editing their profile
router.patch(
  "/me",
  authenticateToken,
  uploadCertificateMiddleware,
  validateBody(tutorProfileUpdateSchema),
  updateMyTutorProfile
);

// Admin: review pending applications
router.get("/applications", authenticateToken, requireAdmin, listTutorApplications);

router.patch(
  "/applications/:id",
  authenticateToken,
  requireAdmin,
  validateBody(reviewApplicationSchema),
  reviewTutorApplication,
);

router.get("/", getTutors);
router.get("/:id", getTutorById);

export default router;




// import { Router } from "express";
// import {
//   applyAsTutor,
//   getTutors,
//   getMyTutorProfile,
//   updateMyTutorProfile,
//   listTutorApplications,
//   reviewTutorApplication,
// } from "../controllers/tutorController";
// import { authenticateToken } from "../middlewares/auth";
// import { requireAdmin } from "../middlewares/requireAdmin";
// import { validateBody } from "../middlewares/validate";
// import {
//   tutorApplicationSchema,
//   tutorProfileUpdateSchema,
//   reviewApplicationSchema,
// } from "../schemas/tutorSchema";

// const router = Router();

// // POST /api/tutors/apply (Protected)
// router.post("/apply", authenticateToken, validateBody(tutorApplicationSchema), applyAsTutor);

// // GET/PATCH /api/tutors/me — the logged-in user's own tutor profile (Protected)
// router.get("/me", authenticateToken, getMyTutorProfile);
// router.patch("/me", authenticateToken, validateBody(tutorProfileUpdateSchema), updateMyTutorProfile);

// // Admin: review pending applications
// router.get("/applications", authenticateToken, requireAdmin, listTutorApplications);
// router.patch(
//   "/applications/:id",
//   authenticateToken,
//   requireAdmin,
//   validateBody(reviewApplicationSchema),
//   reviewTutorApplication,
// );

// router.get("/", getTutors);
// export default router;
