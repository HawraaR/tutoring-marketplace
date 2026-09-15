import { Router } from "express";
import { getPendingTutors, reviewTutorApplication } from "../controllers/adminController";
import {
	exportAdminReport,
	getAdminDashboard,
} from "../controllers/adminDashboardController";
import { authenticateToken } from "../middlewares/auth";
import { requireAdmin } from "../middlewares/requireAdmin";

const router = Router();

router.get("/dashboard", authenticateToken, requireAdmin, getAdminDashboard);
router.get("/reports/export", authenticateToken, requireAdmin, exportAdminReport);
router.get("/tutors/pending", authenticateToken, requireAdmin, getPendingTutors);
router.patch("/tutors/:id/verify", authenticateToken, requireAdmin, reviewTutorApplication);

export default router;