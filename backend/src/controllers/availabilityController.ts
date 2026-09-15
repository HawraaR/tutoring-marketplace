import { Request, Response } from "express";
import { prisma } from "../db";

// Get all available slots
export const getAllAvailability = async (req: Request, res: Response) => {
  try {
    const slots = await prisma.availabilitySlot.findMany({
      where: {
        isBooked: false, // Only return slots that haven't been booked yet
      },
      include: {
        tutor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            tutorProfile: true
          },
        },
      },
      orderBy: {
        startTime: "asc",
      },
    });

    // Wrap in data property to match frontend expectations
    console.log("The available slots are: ", slots);
    return res.status(200).json({ success: true, data: slots });
  } catch (error) {
    console.error("Error fetching all availability:", error);
    return res
      .status(500)
      .json({ success: false, error: "Failed to fetch availability slots" });
  }
};

// Create Availability Slot (Tutor)
export const createAvailabilitySlot = async (req: Request, res: Response) => {
  try {
    const tutorId = (req as any).user.userId;
    const { startTime, endTime } = req.body;
    const start = new Date(startTime);
    const end = new Date(endTime);

    if (isNaN(start.getTime()) || isNaN(end.getTime()) || end <= start) {
      return res.status(400).json({ success: false, error: "End time must be after start time." });
    }

    const slot = await prisma.availabilitySlot.create({
      data: {
        tutorId,
        startTime: start,
        endTime: end,
      },
    });

    return res
      .status(201)
      .json({
        success: true,
        data: slot,
        message: "Availability slot created successfully",
      });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, error: "Failed to create availability slot." });
  }
};

// Get Tutor Schedule (Public/Authenticated)
export const getTutorSchedule = async (
  req: Request<{ tutorId: string }>,
  res: Response,
) => {
  try {
    const { tutorId } = req.params;

    const availability = await prisma.availabilitySlot.findMany({
      where: { tutorId },
      include: {
        booking: {
          include: {
            student: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
            subject: true,
          },
        },
      },
      orderBy: { startTime: "asc" },
    });

    return res.status(200).json({ success: true, data: availability });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, error: "Failed to fetch schedule." });
  }
};

// GET /availability/tutor/:tutorId?from=<ISO>&to=<ISO>  (public: no auth needed to view slots)
export const getTutorAvailability = async (
  req: Request<{ tutorId: string }>,
  res: Response
) => {
  try {
    const { tutorId } = req.params;
    const from = req.query.from
      ? new Date(String(req.query.from))
      : new Date();
    const to = req.query.to
      ? new Date(String(req.query.to))
      : new Date(from.getTime() + 7 * 24 * 60 * 60 * 1000);

    if (isNaN(from.getTime()) || isNaN(to.getTime()) || to <= from) {
      return res.status(400).json({ error: "Invalid date range." });
    }

    const slots = await prisma.availabilitySlot.findMany({
      where: { tutorId, startTime: { gte: from, lt: to } },
      orderBy: { startTime: "asc" },
      select: {
        id: true,
        tutorId: true,
        startTime: true,
        endTime: true,
        isBooked: true,
      },
    });

    return res.status(200).json(slots); // array directly, like GET /bookings/user
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch availability." });
  }
};

// Update Availability Slot (Tutor)
export const updateAvailabilitySlot = async (
  req: Request<{ slotId: string }>,
  res: Response,
) => {
  try {
    const tutorId = (req as any).user.userId;
    const { slotId } = req.params;
    const { startTime, endTime } = req.body;

    const slot = await prisma.availabilitySlot.findUnique({
      where: { id: slotId },
    });

    if (!slot)
      return res.status(404).json({ success: false, error: "Slot not found." });
    if (slot.tutorId !== tutorId)
      return res.status(403).json({ success: false, error: "Unauthorized." });
    if (slot.isBooked)
      return res
        .status(400)
        .json({ success: false, error: "Cannot edit a booked slot." });

    const nextStart = startTime ? new Date(startTime) : slot.startTime;
    const nextEnd = endTime ? new Date(endTime) : slot.endTime;
    if (isNaN(nextStart.getTime()) || isNaN(nextEnd.getTime()) || nextEnd <= nextStart) {
      return res.status(400).json({ success: false, error: "End time must be after start time." });
    }

    const updatedSlot = await prisma.availabilitySlot.update({
      where: { id: slotId },
      data: {
        startTime: nextStart,
        endTime: nextEnd,
      },
    });

    return res
      .status(200)
      .json({ success: true, data: updatedSlot, message: "Slot updated" });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, error: "Failed to update slot." });
  }
};

// Delete Availability Slot (Tutor)
export const deleteAvailabilitySlot = async (
  req: Request<{ slotId: string }>,
  res: Response,
) => {
  try {
    const tutorId = (req as any).user.userId;
    const { slotId } = req.params;

    const slot = await prisma.availabilitySlot.findUnique({
      where: { id: slotId },
    });

    if (!slot)
      return res.status(404).json({ success: false, error: "Slot not found." });
    if (slot.tutorId !== tutorId)
      return res.status(403).json({ success: false, error: "Unauthorized." });
    if (slot.isBooked)
      return res
        .status(400)
        .json({ success: false, error: "Cannot delete a booked slot." });

    await prisma.availabilitySlot.delete({ where: { id: slotId } });

    return res
      .status(200)
      .json({
        success: true,
        data: null,
        message: "Slot deleted successfully.",
      });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, error: "Failed to delete slot." });
  }
};

// GET /availability/open?from=<ISO>&to=<ISO>
// Powers the student booking modal: future, unbooked slots of APPROVED tutors,
// enriched with hourly rate + taught subjects (for price & subject dropdown).
export const getOpenSlots = async (req: Request, res: Response) => {
  try {
    const now = new Date();
    const from = req.query.from ? new Date(String(req.query.from)) : now;
    const to = req.query.to
      ? new Date(String(req.query.to))
      : new Date(from.getTime() + 7 * 24 * 60 * 60 * 1000);

    if (isNaN(from.getTime()) || isNaN(to.getTime()) || to <= from) {
      return res.status(400).json({ success: false, error: "Invalid date range." });
    }

    const slots = await prisma.availabilitySlot.findMany({
      where: {
        isBooked: false,
        OR: [
          { booking: { is: null } },
          { booking: { is: { status: "CANCELLED" } } },
        ],
        endTime: { gt: now },                 // never surface past slots
        startTime: { gte: from, lt: to },     // the week window the modal is viewing
        tutor: { tutorProfile: { verificationStatus: "APPROVED" } }, // only bookable tutors
      },
      include: {
        tutor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            tutorProfile: {
              select: {
                hourlyRate: true,
                averageRating: true,
                reviewCount: true,
                headline: true,
              },
            },
            tutorSubjects: {
              select: { subject: { select: { id: true, name: true } } },
            },
          },
        },
      },
      orderBy: { startTime: "asc" },
    });

    return res.status(200).json({
      success: true,
      data: slots.filter((slot) => slot.endTime > slot.startTime),
    });
  } catch (error) {
    console.error("Error fetching open slots:", error);
    return res.status(500).json({ success: false, error: "Failed to fetch open slots." });
  }
};