import { Request, Response } from "express";
import { prisma } from "../db";

// Create Booking (Student)
export const createBooking = async (req: Request, res: Response) => {
  try {
    const studentId = (req as any).user.userId;
    const { availabilitySlotId, subjectId, notes } = req.body;

    if (!availabilitySlotId || !subjectId) {
      return res
        .status(400)
        .json({ error: "availabilitySlotId and subjectId are required." });
    }

    const slot = await prisma.availabilitySlot.findUnique({
      where: { id: availabilitySlotId },
      include: {
        tutor: { include: { tutorProfile: true } },
        booking: true,
      },
    });

    if (!slot || slot.isBooked || (slot.booking && slot.booking.status !== "CANCELLED")) {
      return res.status(400).json({ error: "This slot is no longer available." });
    }
    if (new Date(slot.startTime).getTime() <= Date.now()) {
      return res.status(400).json({ error: "This slot is in the past." });
    }
    if (slot.tutorId === studentId) {
      return res.status(400).json({ error: "You cannot book your own availability." });
    }

    const teachesSubject = await prisma.tutorSubject.findUnique({
      where: { tutorId_subjectId: { tutorId: slot.tutorId, subjectId } },
    });
    if (!teachesSubject) {
      return res
        .status(400)
        .json({ error: "This tutor does not teach the selected subject." });
    }

    const booking = await prisma.$transaction(async (tx) => {
      if (slot.booking?.status === "CANCELLED") {
        await tx.booking.update({
          where: { id: slot.booking.id },
          data: { availabilitySlotId: null },
        });
      }

      // Atomic lock: fails if another request booked the slot milliseconds ago
      const locked = await tx.availabilitySlot.updateMany({
        where: { id: slot.id, isBooked: false },
        data: { isBooked: true },
      });
      if (locked.count === 0) throw new Error("SLOT_TAKEN");

      const rate = slot.tutor.tutorProfile?.hourlyRate || 0;
      const hours =
        (new Date(slot.endTime).getTime() - new Date(slot.startTime).getTime()) / 3_600_000;

      return tx.booking.create({
        data: {
          studentId,
          tutorId: slot.tutorId,
          subjectId,
          availabilitySlotId: slot.id,
          startTime: slot.startTime,
          endTime: slot.endTime,
          notes,
          totalPrice: Math.round(rate * hours * 100) / 100, // <- duration-aware price
          status: "PENDING",
        },
      });
    });

    return res.status(201).json({
      message: "Booking requested successfully",
      data: booking,   // ApiResponse shape used by the frontend client
      booking,         // kept for backward compatibility
    });
  } catch (error: any) {
    if (error?.message === "SLOT_TAKEN") {
      return res
        .status(409)
        .json({ error: "This slot was just booked by someone else." });
    }
    if (error?.code === "P2002" && error?.meta?.target?.includes("availabilitySlotId")) {
      return res
        .status(409)
        .json({ error: "This slot is no longer available." });
    }
    console.error("DEBUG - Create Booking Error:", error);
    return res.status(500).json({
      error: "Failed to create booking.",
      details: error?.message || error,
    });
  }
};

// Get Current User's Bookings (Student & Tutor)
export const getUserBookings = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;

    const bookings = await prisma.booking.findMany({
      where: {
        OR: [{ studentId: userId }, { tutorId: userId }],
      },
      include: {
        student: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        tutor: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        subject: true,
        review: true,
      },
      orderBy: { startTime: "desc" },
    });

    return res.status(200).json(bookings);
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch bookings." });
  }
};

// Get Bookings for a Specific Tutor (For the Tutor View)
export const getTutorBookings = async (req: Request, res: Response) => {
  try {
    const tutorId = (req as any).user.userId;

    const bookings = await prisma.booking.findMany({
      where: { tutorId },
      include: {
        student: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        tutor: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        subject: true,
        review: true,
      },
      orderBy: { startTime: "desc" },
    });

    return res.status(200).json(bookings);
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch tutor bookings." });
  }
};


// Update Booking Status (Confirm / Cancel / Complete)
export const updateBookingStatus = async (
  req: Request<{ bookingId: string }>,
  res: Response,
) => {
  try {
    const userId = (req as any).user.userId;
    const { bookingId } = req.params;
    const { status } = req.body;

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) return res.status(404).json({ error: "Booking not found." });
    if (booking.studentId !== userId && booking.tutorId !== userId) {
      return res.status(403).json({ error: "Unauthorized." });
    }

    let updated;
    if (status === "CANCELLED" && booking.availabilitySlotId) {
      [updated] = await prisma.$transaction([
        prisma.booking.update({
          where: { id: bookingId },
          data: { status: "CANCELLED", availabilitySlotId: null },
        }),
        prisma.availabilitySlot.update({ where: { id: booking.availabilitySlotId }, data: { isBooked: false } }),
      ]);
    } else {
      updated = await prisma.booking.update({ where: { id: bookingId }, data: { status } });
    } 
    return res
      .status(200)
      .json({ message: `Booking status updated to ${status}` });
  } catch (error) {
    return res.status(500).json({ error: "Failed to update booking status." });
  }
};

// Delete/Cancel Booking
export const deleteBooking = async (
  req: Request<{ bookingId: string }>,
  res: Response,
) => {
  try {
    const userId = (req as any).user.userId;
    const { bookingId } = req.params;

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) return res.status(404).json({ error: "Booking not found." });
    if (booking.studentId !== userId && booking.tutorId !== userId) {
      return res.status(403).json({ error: "Unauthorized." });
    }

    await prisma.$transaction([
      prisma.booking.delete({ where: { id: bookingId } }),
      ...(booking.availabilitySlotId
        ? [
            prisma.availabilitySlot.update({
              where: { id: booking.availabilitySlotId },
              data: { isBooked: false },
            }),
          ]
        : []),
    ]);

    return res
      .status(200)
      .json({ message: "Booking cancelled and slot released." });
  } catch (error) {
    return res.status(500).json({ error: "Failed to delete booking." });
  }
};
