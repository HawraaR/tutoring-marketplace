import { Router } from "express";
import {
  createAvailabilitySlot,
  getTutorSchedule,
  updateAvailabilitySlot,
  deleteAvailabilitySlot,
} from "../controllers/availabilityController";
import { authenticateToken } from "../middlewares/auth";

const router = Router();

router.post("/", authenticateToken, createAvailabilitySlot);
router.get("/tutors/:tutorId", getTutorSchedule);
router.put("/:slotId", authenticateToken, updateAvailabilitySlot);
router.delete("/:slotId", authenticateToken, deleteAvailabilitySlot);

export default router;