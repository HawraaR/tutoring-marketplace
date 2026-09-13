import { Router } from "express";
import { getMyStudentProfile, updateMyStudentProfile } from "../controllers/studentController";
import { authenticateToken } from "../middlewares/auth";
import { validateBody } from "../middlewares/validate";
import { studentProfileUpdateSchema } from "../schemas/studentSchema";

const router = Router();

router.get("/me", authenticateToken, getMyStudentProfile);
router.patch("/me", authenticateToken, validateBody(studentProfileUpdateSchema), updateMyStudentProfile);

export default router;
