import { Request, Response } from "express";
import { prisma } from "../db";

/* =========================================================
   DATE HELPERS
========================================================= */

function getStartOfWeek(date: Date) {
  const result = new Date(date);
  const day = result.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  result.setDate(result.getDate() + diff);
  result.setHours(0, 0, 0, 0);
  return result;
}

function fullName(u: { firstName: string | null; lastName: string | null }) {
  return [u.firstName, u.lastName].filter(Boolean).join(" ") || "Unknown";
}


export async function getTutorDashboard(req: Request, res: Response) {
  try {
    const tutorId = (req as any)?.user?.userId;
    if (!tutorId) return res.status(401).json({ message: "Not authenticated" });

    const weekOffset = Number.parseInt(req.query.weekOffset as string, 10) || 0;

    const now = new Date();
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date(startOfToday);
    endOfToday.setDate(endOfToday.getDate() + 1);

    const startOfWeek = getStartOfWeek(now);
    startOfWeek.setDate(startOfWeek.getDate() + weekOffset * 7);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 7);

    const endOfNext7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const sessionInclude = {
      student: { select: { firstName: true, lastName: true } },
      subject: { select: { name: true } },
    };

    const [
      profile,
      completedSessions,
      upcomingSessions,
      todayBookings,
      weekBookings,
      participants,
      completedBySubject,
      activityBookings,
      reviews,
      studentUsers,
    ] = await Promise.all([
      // Rating stats (TutorProfile.averageRating / reviewCount)
      prisma.tutorProfile.findUnique({
        where: { userId: tutorId },
        select: { averageRating: true, reviewCount: true },
      }),

      // Total completed sessions
      prisma.booking.count({ where: { tutorId, status: "COMPLETED" } }),

      // Upcoming confirmed or pending sessions in the next 7 days.
      // This matches the statuses included in the weekly schedule.
      prisma.booking.count({
        where: {
          tutorId,
          status: { in: ["CONFIRMED", "PENDING"] },
          startTime: { gte: now, lt: endOfNext7Days },
        },
      }),

      // Daily sessions (today)
      prisma.booking.findMany({
        where: {
          tutorId,
          status: { in: ["CONFIRMED", "PENDING"] },
          startTime: { gte: now, lt: endOfToday },
        },
        include: sessionInclude,
        orderBy: { startTime: "asc" },
      }),

      // Weekly schedule (selected week, cancelled excluded)
      prisma.booking.findMany({
        where: {
          tutorId,
          status: { not: "CANCELLED" },
          startTime: { gte: startOfWeek, lt: endOfWeek },
        },
        include: sessionInclude,
        orderBy: { startTime: "asc" },
      }),

      // For unread message count
      prisma.conversationParticipant.findMany({
        where: { userId: tutorId },
        select: { conversationId: true, lastReadAt: true },
      }),

      // Teaching overview: completed sessions grouped by subject
      prisma.booking.groupBy({
        by: ["subjectId"],
        where: { tutorId, status: "COMPLETED" },
        _count: { _all: true },
      }),

      // Recent activity (latest bookings, any status)
      prisma.booking.findMany({
        where: { tutorId },
        include: sessionInclude,
        orderBy: { startTime: "desc" },
        take: 50,
      }),

      // Reviews received by this tutor
      prisma.review.findMany({
        where: { tutorId },
        include: {
          student: { select: { firstName: true, lastName: true } },
          booking: {
            select: { startTime: true, subject: { select: { name: true } } },
          },
        },
        orderBy: { createdAt: "desc" },
      }),

      // My students: every student with >= 1 booking with this tutor
      prisma.user.findMany({
        where: { studentBookings: { some: { tutorId } } },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          studentProfile: { select: { educationLevel: true, major: true } },
          studentBookings: {
            where: { tutorId },
            select: { startTime: true, status: true },
          },
        },
      }),
    ]);

  
    let unreadMessages = 0;
    if (participants.length >= 0) {
      unreadMessages = await prisma.message.count({
        where: {
          senderId: { not: tutorId },
          deletedAt: null,
          OR: participants.map((p) => ({
            conversationId: p.conversationId,
            createdAt: { gt: p.lastReadAt ?? new Date(0) },
          })),
        },
      });
    }

    const mapSession = (b: typeof weekBookings[number]) => ({
      id: b.id,
      startTime: b.startTime.toISOString(),
      endTime: b.endTime.toISOString(),
      subject: b.subject.name,
      student: fullName(b.student),
      status: b.status,
    });

    // Teaching overview
    const subjectRows = completedBySubject.length
      ? await prisma.subject.findMany({
          where: { id: { in: completedBySubject.map((g) => g.subjectId) } },
          select: { id: true, name: true },
        })
      : [];
    const nameById = new Map(subjectRows.map((s) => [s.id, s.name]));
    const totalCompleted = completedBySubject.reduce(
      (sum, g) => sum + g._count._all,
      0
    );
    const teachingOverview = completedBySubject
      .map((g) => ({
        name: nameById.get(g.subjectId) ?? "Other",
        sessions: g._count._all,
      }))
      .sort((a, b) => b.sessions - a.sessions)
      .map((row) => ({
        ...row,
        percentage: totalCompleted
          ? Math.round((row.sessions / totalCompleted) * 100)
          : 0,
      }));

    // My students (previous + recent), sorted by most recent session
    const students = studentUsers
      .map((u) => {
        const valid = u.studentBookings.filter(
          (b) => b.status !== "CANCELLED"
        );
        const past = valid
          .filter((b) => b.startTime <= now)
          .sort((a, b) => b.startTime.getTime() - a.startTime.getTime());
        return {
          id: u.id,
          firstName: u.firstName ?? "",
          lastName: u.lastName ?? "",
          email: u.email,
          educationLevel: u.studentProfile?.educationLevel ?? null,
          major: u.studentProfile?.major ?? null,
          sessions: valid.length,
          lastSession: past[0] ? past[0].startTime.toISOString() : null,
        };
      })
      .sort((a, b) => (b.lastSession ?? "").localeCompare(a.lastSession ?? ""));

    return res.json({
      stats: {
        unreadMessages,
        completedSessions,
        averageRating: profile?.averageRating ?? 0,
        reviewCount: profile?.reviewCount ?? 0,
        upcomingSessions,
        todaySessions: todayBookings.length,
      },
      weeklySchedule: weekBookings.map(mapSession),
      todaySessions: todayBookings.map(mapSession),
      students,
      teachingOverview,
      recentActivity: activityBookings.map(mapSession),
      reviews: reviews.map((r) => ({
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        createdAt: r.createdAt.toISOString(),
        student: fullName(r.student),
        subject: r.booking.subject.name,
        sessionDate: r.booking.startTime.toISOString(),
      })),
    });
  } catch (error) {
    console.error("tutorDashboard error:", error);
    return res.status(500).json({ message: "Could not load tutor dashboard" });
  }
}