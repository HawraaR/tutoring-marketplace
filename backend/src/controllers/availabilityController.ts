import { Request, Response } from "express";
import { prisma } from "../../prisma/db";

// Create Availability Slot (Tutor)
export const createAvailabilitySlot = async (req: Request, res: Response) => {
  try {
    const tutorId = (req as any).user.userId;
    const { startTime, endTime } = req.body;

    const slot = await prisma.availabilitySlot.create({
      data: {
        tutorId,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
      },
    });

    return res.status(201).json({ message: "Availability slot created successfully", slot });
  } catch (error) {
    return res.status(500).json({ error: "Failed to create availability slot." });
  }
};

// Get Tutor Schedule (Public/Authenticated)
export const getTutorSchedule = async (req: Request<{ tutorId: string }>, res: Response) => {
  try {
    const { tutorId } = req.params;

    const availability = await prisma.availabilitySlot.findMany({
      where: { tutorId },
      include: { 
        booking: {
          include: {
            student: { select: { id: true, firstName: true, lastName: true, email: true } },
            subject: true
          }
        } 
      },
      orderBy: { startTime: "asc" }
    });

    return res.status(200).json(availability);
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch schedule." });
  }
};

// Update Availability Slot (Tutor)
export const updateAvailabilitySlot = async (req: Request<{ slotId: string }>, res: Response) => {
  try {
    const tutorId = (req as any).user.userId;
    const { slotId } = req.params;
    const { startTime, endTime } = req.body;

    const slot = await prisma.availabilitySlot.findUnique({ where: { id: slotId } });

    if (!slot) return res.status(404).json({ error: "Slot not found." });
    if (slot.tutorId !== tutorId) return res.status(403).json({ error: "Unauthorized." });
    if (slot.isBooked) return res.status(400).json({ error: "Cannot edit a booked slot." });

    const updatedSlot = await prisma.availabilitySlot.update({
      where: { id: slotId },
      data: {
        startTime: startTime ? new Date(startTime) : undefined,
        endTime: endTime ? new Date(endTime) : undefined,
      },
    });

    return res.status(200).json({ message: "Slot updated", updatedSlot });
  } catch (error) {
    return res.status(500).json({ error: "Failed to update slot." });
  }
};

// Delete Availability Slot (Tutor)
export const deleteAvailabilitySlot = async (req: Request<{ slotId: string }>, res: Response) => {
  try {
    const tutorId = (req as any).user.userId;
    const { slotId } = req.params;

    const slot = await prisma.availabilitySlot.findUnique({ where: { id: slotId } });

    if (!slot) return res.status(404).json({ error: "Slot not found." });
    if (slot.tutorId !== tutorId) return res.status(403).json({ error: "Unauthorized." });
    if (slot.isBooked) return res.status(400).json({ error: "Cannot delete a booked slot." });

    await prisma.availabilitySlot.delete({ where: { id: slotId } });

    return res.status(200).json({ message: "Slot deleted successfully." });
  } catch (error) {
    return res.status(500).json({ error: "Failed to delete slot." });
  }
};