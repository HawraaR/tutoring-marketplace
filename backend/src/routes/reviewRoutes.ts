import { Router } from "express";
import { createReview } from "../controllers/reviewController";
import { authenticateToken } from "../middlewares/auth";
import { validateBody } from "../middlewares/validate";
import { createReviewSchema } from "../schemas/reviewSchema";

const router = Router();
router.post("/", authenticateToken, validateBody(createReviewSchema), createReview);
export default router;