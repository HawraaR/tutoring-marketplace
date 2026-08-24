import { Request, Response } from "express";
import { prisma } from "../../prisma/db";

// Create Booking (Student)
export const createBooking = async (req: Request, res: Response) => {
  try {
    const studentId = (req as any).user.userId;
    const { availabilitySlotId, subjectId, notes } = req.body;

    const slot = await prisma.availabilitySlot.findUnique({
      where: { id: availabilitySlotId },
      include: { tutor: { include: { tutorProfile: true } } },
    });

    if (!slot || slot.isBooked) {
      return res
        .status(400)
        .json({ error: "This slot is no longer available." });
    }

    const [booking] = await prisma.$transaction([
      prisma.booking.create({
        data: {
          studentId,
          tutorId: slot.tutorId,
          subjectId,
          availabilitySlotId: slot.id,
          startTime: slot.startTime,
          endTime: slot.endTime,
          notes,
          totalPrice: slot.tutor.tutorProfile?.hourlyRate || 0,
          status: "PENDING",
        },
      }),
      prisma.availabilitySlot.update({
        where: { id: slot.id },
        data: { isBooked: true },
      }),
    ]);

    return res
      .status(201)
      .json({ message: "Booking requested successfully", booking });
  } catch (error: any) {
    // 1. Print full stack trace in your backend terminal
    console.error("DEBUG - Create Booking Error:", error);

    // 2. Temporarily return the specific error message to REST Client
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
      },
      orderBy: { startTime: "desc" },
    });

    return res.status(200).json(bookings);
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch bookings." });
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

    if (status === "CANCELLED" && booking.availabilitySlotId) {
      await prisma.$transaction([
        prisma.booking.update({
          where: { id: bookingId },
          data: { status: "CANCELLED" },
        }),
        prisma.availabilitySlot.update({
          where: { id: booking.availabilitySlotId },
          data: { isBooked: false },
        }),
      ]);
    } else {
      await prisma.booking.update({
        where: { id: bookingId },
        data: { status },
      });
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
