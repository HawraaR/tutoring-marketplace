import { Router } from "express";
import { getMyStudentProfile, updateMyStudentProfile } from "../controllers/studentController";
import { authenticateToken } from "../middlewares/auth";
import { validateBody } from "../middlewares/validate";
import { studentProfileUpdateSchema } from "../schemas/studentSchema";
import { getStudentDashboard } from "../controllers/dashboardController";

const router = Router();

router.get("/me", authenticateToken, getMyStudentProfile);
router.patch("/me", authenticateToken, validateBody(studentProfileUpdateSchema), updateMyStudentProfile);
router.get("/dashboard", authenticateToken, getStudentDashboard);

export default router;
