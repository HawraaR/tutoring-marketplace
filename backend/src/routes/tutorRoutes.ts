import { Router } from "express";
import { applyAsTutor, getTutors} from "../controllers/tutorController";
import { authenticateToken } from "../middlewares/auth"; // Your JWT protection middleware

const router = Router();

// POST /api/tutors/apply (Protected)
router.post("/apply", authenticateToken, applyAsTutor);

router.get("/", getTutors); 
export default router;