import { Request, Response } from "express";
import { prisma } from "../db";

// Helper: Deterministic color tone based on Subject ID
const TONES = ["burgundy", "olive", "slate", "charcoal"] as const;
const getTone = (id: string) => TONES[id.charCodeAt(0) % TONES.length];

// Helper: Split "MATH 201: Calculus II" or "MATH 201 Calculus II"
const parseCourseName = (name: string) => {
  const match = name.match(/^([A-Z0-9\s-]+?)[\s:-]+(.*)$/i);
  if (match && match[1].trim().match(/^[A-Z]+\s*\d*$/i)) {
    return { code: match[1].trim(), title: match[2].trim() };
  }
  const words = name.split(" ");
  if (words[0].match(/^[A-Z]+\d*$/i)) {
    return { code: words[0], title: words.slice(1).join(" ") };
  }
  return { code: "", title: name };
};

export const getStudentDashboard = async (req: Request, res: Response) => {
  try {
    // Assuming your auth middleware attaches the user ID to req.user
    const studentId = (req as any).user.userId;
    const now = new Date();

    // 1. Define Current Term (Adjust dates dynamically in production)
    // For Autumn 2026, let's assume Sept 1 to Dec 31
    const termStart = new Date("2026-09-01T00:00:00Z");
    const termEnd = new Date("2026-12-31T23:59:59Z");
    const termLabel = "Autumn 2026";
    const MS_PER_WEEK = 7 * 24 * 60 * 60 * 1000;

    // 2. Fetch Raw Data in Parallel
    const [user, bookings, conversations] = await Promise.all([
      prisma.user.findUnique({ where: { id: studentId } }),
      prisma.booking.findMany({
        where: { studentId, startTime: { gte: termStart, lte: termEnd } },
        include: {
          subject: true,
          tutor: { include: { tutorProfile: true } },
          review: true,
        },
        orderBy: { startTime: "asc" },
      }),
      prisma.conversationParticipant.findMany({
        where: { userId: studentId },
        include: {
          conversation: {
            include: { messages: { orderBy: { createdAt: "desc" }, take: 1 } },
          },
        },
      }),
    ]);

    if (!user) return res.status(404).json({ error: "Student not found" });

    // 3. Process Sessions & Map Statuses (UPCOMING, PAST, CANCELED)
    const processedSessions = bookings.map((b) => {
      let status: "UPCOMING" | "PAST" | "CANCELED" = "PAST";
      if (b.status === "CANCELLED") status = "CANCELED";
      else if (new Date(b.endTime) >= now) status = "UPCOMING";

      const durationMs = new Date(b.endTime).getTime() - new Date(b.startTime).getTime();
      const hours = durationMs / (1000 * 60 * 60);
      const week = Math.max(1, Math.floor((new Date(b.startTime).getTime() - termStart.getTime()) / MS_PER_WEEK) + 1);

      const parsed = parseCourseName(b.subject.name);

      return {
        id: b.id,
        course: {
          subjectId: b.subject.id,
          code: parsed.code,
          title: parsed.title,
          tone: getTone(b.subject.id),
        },
        tutorId: b.tutor.id,
        tutorName: `${b.tutor.firstName || ""} ${b.tutor.lastName || ""}`.trim(),
        tutorCredentials: b.tutor.tutorProfile?.education?.split(",")[0] || "",
        start: b.startTime.toISOString(),
        end: b.endTime.toISOString(),
        location: b.tutor.tutorProfile?.meetingUrl ? "Remote" : "Campus",
        meetingUrl: b.tutor.tutorProfile?.meetingUrl,
        status,
        note: b.notes,
        hours,
        week,
      };
    });

    // 4. Aggregate KPIs & Charts
    const pastSessions = processedSessions.filter((s) => s.status === "PAST");
    const upcomingSessions = processedSessions.filter((s) => s.status === "UPCOMING").sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
    
    const hoursCompleted = pastSessions.reduce((sum, s) => sum + s.hours, 0);

    // Group by Course
    const courseMap = new Map();
    processedSessions.filter(s => s.status !== "CANCELED").forEach((s) => {
      if (!courseMap.has(s.course.subjectId)) {
        courseMap.set(s.course.subjectId, { ...s.course, sessions: 0, hours: 0 });
      }
      const c = courseMap.get(s.course.subjectId);
      c.sessions += 1;
      c.hours += s.hours;
    });
    
    const totalHours = Array.from(courseMap.values()).reduce((sum, c) => sum + c.hours, 0);
    const hoursByCourse = Array.from(courseMap.values()).map((c) => ({
      ...c,
      hours: Number(c.hours.toFixed(1)),
      sharePct: totalHours > 0 ? Math.round((c.hours / totalHours) * 100) : 0,
    })).sort((a, b) => b.hours - a.hours);

    // Group by Week
    const weekMap = new Map();
    processedSessions.filter(s => s.status !== "CANCELED").forEach(s => {
      weekMap.set(s.week, (weekMap.get(s.week) || 0) + s.hours);
    });
    const weeklyHours = Array.from({ length: 12 }, (_, i) => i + 1).map((week) => ({
      week,
      hours: Number((weekMap.get(week) || 0).toFixed(1)),
    }));

    // Current Week Index
    const currentWeekIndex = Math.max(1, Math.min(12, Math.floor((now.getTime() - termStart.getTime()) / MS_PER_WEEK) + 1));
    const weekDone = weeklyHours.find(w => w.week === currentWeekIndex)?.hours || 0;
    
    // Calculate previous week hours for delta
    const prevWeekHours = weeklyHours.find(w => w.week === currentWeekIndex - 1)?.hours || 0;
    const hoursDelta = weekDone - prevWeekHours;

    // Recent Tutors
    const tutorMap = new Map();
    const bookingByTutorId = new Map(
      bookings.map((booking) => [booking.tutorId, booking]),
    );
    pastSessions.forEach((s) => {
      if (!tutorMap.has(s.tutorId)) {
        const tutorBooking = bookingByTutorId.get(s.tutorId);
        const tutorProfile = tutorBooking?.tutor.tutorProfile;
        tutorMap.set(s.tutorId, {
          tutorId: s.tutorId,
          name: s.tutorName,
          credentials: s.tutorCredentials,
          hourlyRate: tutorProfile?.hourlyRate ?? 0,
          averageRating: tutorProfile?.averageRating ?? 0,
          reviewCount: tutorProfile?.reviewCount ?? 0,
          sessionsCompleted: 0,
          lastSessionOn: s.start,
        });
      }
      const t = tutorMap.get(s.tutorId);
      t.sessionsCompleted += 1;
      if (new Date(s.start) > new Date(t.lastSessionOn)) t.lastSessionOn = s.start;
    });

    const recentTutors = Array.from(tutorMap.values())
      .sort((a, b) => new Date(b.lastSessionOn).getTime() - new Date(a.lastSessionOn).getTime())
      .slice(0, 5);

    // 5. Attention Items
    const attention = [];
    if (upcomingSessions.some(s => s.status === "UPCOMING" && !s.meetingUrl /* logic for pending */)) {
       // Add logic for pending confirmations if needed
    }
    
    let unreadMsgCount = 0;
    conversations.forEach((cp) => {
      const lastMsg = cp.conversation.messages[0];
      if (lastMsg && lastMsg.senderId !== studentId) {
        if (!cp.lastReadAt || new Date(lastMsg.createdAt) > new Date(cp.lastReadAt)) {
          unreadMsgCount++;
        }
      }
    });
    attention.push({ kind: "message", count: unreadMsgCount, title: "Unread messages", detail: "You have new messages from tutors", href: "/messages" });

    const reviewCount = pastSessions.filter((session) => {
      const booking = bookings.find((item) => item.id === session.id);
      return booking && !booking.review;
    }).length;
    attention.push({ kind: "review", count: reviewCount, title: "Reviews to complete", detail: "Share feedback on your completed sessions", href: "/sessions?scope=past" });

    // 6. Construct Final DTO
    const dashboardData = {
      now: now.toISOString(),
      studentName: user.firstName || "Student",
      termLabel,
      weekIndex: currentWeekIndex,
      weeklyTargetHours: 2, // Configurable
      kpis: {
        hoursCompleted: Number(hoursCompleted.toFixed(1)),
        hoursDeltaVsLastWeek: Number(hoursDelta.toFixed(1)),
        sessionsCompleted: pastSessions.length,
        upcomingCount: upcomingSessions.length,
        pendingCount: 0,
      },
      hoursByCourse,
      weeklyHours,
      nextSession: upcomingSessions[0] || null,
      upcoming: upcomingSessions,
      sessions: processedSessions,
      tutors: recentTutors,
      termRecord: {
        label: termLabel,
        sessionsCompleted: pastSessions.length,
        sessionsScheduled: upcomingSessions.length,
        sessionsCancelled: bookings.filter(b => b.status === "CANCELLED").length,
        avgLengthMin: pastSessions.length > 0 ? Math.round((pastSessions.reduce((sum, s) => sum + (new Date(s.end).getTime() - new Date(s.start).getTime()), 0) / pastSessions.length) / 60000) : 0,
        hoursCompleted: Number(hoursCompleted.toFixed(1)),
        hoursScheduled: Number(upcomingSessions.reduce((sum, s) => sum + s.hours, 0).toFixed(1)),
        tutorsEngaged: tutorMap.size,
      },
      attention,
    };

    res.json(dashboardData);
  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).json({ error: "Failed to load dashboard data" });
  }
};