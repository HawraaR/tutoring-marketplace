import { Router } from "express";
import {
  getAllAvailability,
  createAvailabilitySlot,
  getTutorSchedule,
  updateAvailabilitySlot,
  deleteAvailabilitySlot,
  getTutorAvailability,
  getOpenSlots,
} from "../controllers/availabilityController";
import { authenticateToken } from "../middlewares/auth";

const router = Router();
router.get("/open", authenticateToken, getOpenSlots);
router.get("/", getAllAvailability);
router.get("/tutor/:tutorId",getTutorAvailability)
router.post("/", authenticateToken, createAvailabilitySlot);
router.get("/tutors/:tutorId", getTutorSchedule);
router.put("/:slotId", authenticateToken, updateAvailabilitySlot);
router.delete("/:slotId", authenticateToken, deleteAvailabilitySlot);

export default router;