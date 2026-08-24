import { Router } from "express";
import {
  createBooking,
  getUserBookings,
  updateBookingStatus,
  deleteBooking,
} from "../controllers/bookingController";
import { authenticateToken } from "../middlewares/auth";

const router = Router();

router.post("/", authenticateToken, createBooking);
router.get("/user", authenticateToken, getUserBookings);
router.patch("/:bookingId/status", authenticateToken, updateBookingStatus);
router.delete("/:bookingId", authenticateToken, deleteBooking);

export default router;