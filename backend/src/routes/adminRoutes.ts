import { Router } from "express";
import { getPendingTutors, reviewTutorApplication } from "../controllers/adminController";

const router = Router();

router.get("/tutors/pending", getPendingTutors);
router.patch("/tutors/:id/verify", reviewTutorApplication);

export default router;