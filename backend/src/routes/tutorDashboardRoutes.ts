import { Router } from "express";
import { getTutorDashboard } from "../controllers/tutorDashboardController";
import { authenticateToken } from "../middlewares/auth";

const router = Router();

router.get("/dashboard", authenticateToken, getTutorDashboard);

export default router;