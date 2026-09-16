// app/admin/actions.ts
'use server';

import {prisma} from '../db'; // Adjust this import path to match your project structure

// Utility to convert JSON arrays to proper CSV strings
function convertToCSV(headers: string[], rows: any[][]) {
  const escapeCSV = (field: any) => {
    if (field === null || field === undefined) return '';
    let str = String(field);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const csvRows = [];
  csvRows.push(headers.map(escapeCSV).join(','));
  for (const row of rows) {
    csvRows.push(row.map(escapeCSV).join(','));
  }
  return csvRows.join('\n');
}

export async function getDashboardData() {
  // 1. Overview Stats
  const [totalUsers, activeTutors, activeStudents, pendingVerification, studentsCount, tutorsCount, multiRoleCount] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { isTutor: true, tutorProfile: { verificationStatus: 'APPROVED' } } }),
    prisma.user.count({ where: { isStudent: true } }),
    prisma.user.count({ where: { isTutor: true, tutorProfile: { verificationStatus: 'PENDING' } } }),
    prisma.user.count({ where: { isStudent: true } }),
    prisma.user.count({ where: { isTutor: true } }),
    prisma.user.count({ where: { isStudent: true, isTutor: true } }),
  ]);

  // 2. User Management Stats
  const totalUsersCalc = studentsCount + tutorsCount - multiRoleCount;

  // 3. Pending Tutors
  const pendingTutorsPromise = prisma.user.findMany({
    where: { isTutor: true, tutorProfile: { verificationStatus: 'PENDING' } },
    include: { tutorProfile: true },
    take: 5,
    orderBy: { createdAt: 'desc' }
  });

  // 4. Session & Booking Oversight
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

  const todaysSessionsPromise = prisma.booking.findMany({
    where: { startTime: { gte: startOfDay, lt: endOfDay } },
    include: { student: true, tutor: true, subject: true },
    orderBy: { startTime: 'asc' }
  });

  const upcomingCountPromise = prisma.booking.count({
    where: { startTime: { gt: now }, status: { in: ['PENDING', 'CONFIRMED'] } }
  });
  const completedCountPromise = prisma.booking.count({ where: { status: 'COMPLETED' } });
  const cancelledCountPromise = prisma.booking.count({ where: { status: 'CANCELLED' } });

  const [pendingTutors, todaysSessions, upcomingCount, completedCount, cancelledCount] = await Promise.all([
    pendingTutorsPromise,
    todaysSessionsPromise,
    upcomingCountPromise,
    completedCountPromise,
    cancelledCountPromise,
  ]);

  // 5. Subject Demand
  const subjectsPromise = prisma.subject.findMany({
    include: { _count: { select: { bookings: true } } },
    orderBy: { bookings: { _count: 'desc' } },
    take: 5
  });

  // 6. Top Tutors (Performance)
  const topTutorsDataPromise = prisma.user.findMany({
    where: { isTutor: true, tutorProfile: { verificationStatus: 'APPROVED' } },
    include: {
      tutorProfile: true,
      tutorSubjects: { include: { subject: true } },
      _count: { select: { tutorBookings: { where: { status: 'COMPLETED' } } } }
    },
    orderBy: { tutorProfile: { averageRating: 'desc' } },
    take: 5
  });

  // 7. Recent Platform Activity
  const recentUsersPromise = prisma.user.findMany({
    orderBy: { createdAt: 'desc' }, take: 3,
    select: { id: true, firstName: true, lastName: true, email: true, createdAt: true, isTutor: true }
  });
  const recentBookingsPromise = prisma.booking.findMany({
    orderBy: { createdAt: 'desc' }, take: 3,
    include: { student: true }
  });
  const recentReviewsPromise = prisma.review.findMany({
    orderBy: { createdAt: 'desc' }, take: 3,
    include: { student: true }
  });

  const [subjects, topTutorsData, recentUsers, recentBookings, recentReviews] = await Promise.all([
    subjectsPromise,
    topTutorsDataPromise,
    recentUsersPromise,
    recentBookingsPromise,
    recentReviewsPromise,
  ]);

  const topTutors = topTutorsData.map((tutor) => ({
    id: tutor.id,
    name: `${tutor.firstName || ''} ${tutor.lastName || ''}`.trim() || tutor.email,
    subject: tutor.tutorSubjects[0]?.subject.name || 'General',
    rating: tutor.tutorProfile?.averageRating ?? 0,
    sessions: tutor._count.tutorBookings,
  }));

  let activities: any[] = [];
  recentUsers.forEach(u => activities.push({
    id: `user-${u.id}`, action: u.isTutor ? "New tutor registration" : "New student registered",
    user: `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email, time: u.createdAt, type: "user"
  }));
  recentBookings.forEach(b => activities.push({
    id: `booking-${b.id}`, action: b.status === "COMPLETED" ? "Booking completed" : b.status === "CANCELLED" ? "Booking cancelled" : "New booking created",
    user: `${b.student.firstName || ''} ${b.student.lastName || ''}`.trim() || b.student.email, time: b.createdAt, type: b.status === "CANCELLED" ? "warning" : "booking"
  }));
  recentReviews.forEach(r => activities.push({
    id: `review-${r.id}`, action: "New review submitted",
    user: `${r.student.firstName || ''} ${r.student.lastName || ''}`.trim() || r.student.email, time: r.createdAt, type: "verification"
  }));

  activities.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

  return {
    overviewStats: [
      { label: "Total users", value: totalUsers.toLocaleString(), detail: "All registered accounts", change: "+8.4%", positive: true },
      { label: "Active tutors", value: activeTutors.toLocaleString(), detail: "Approved tutor accounts", change: "+5.2%", positive: true },
      { label: "Active students", value: activeStudents.toLocaleString(), detail: "Registered students", change: "+9.1%", positive: true },
      { label: "Pending verification", value: pendingVerification.toLocaleString(), detail: "Tutors awaiting review", change: "Needs attention", positive: false },
    ],
    userStats: {
      students: studentsCount, studentPct: totalUsersCalc > 0 ? Math.round((studentsCount / totalUsersCalc) * 100) : 0,
      tutors: tutorsCount, tutorPct: totalUsersCalc > 0 ? Math.round((tutorsCount / totalUsersCalc) * 100) : 0,
      multiRole: multiRoleCount, multiPct: totalUsersCalc > 0 ? Math.round((multiRoleCount / totalUsersCalc) * 100) : 0,
    },
    pendingTutors: pendingTutors.map(t => ({
      id: t.id, name: `${t.firstName || ''} ${t.lastName || ''}`.trim() || t.email, headline: t.tutorProfile?.headline || 'No headline provided'
    })),
    bookingStats: [
      { label: "Today's sessions", value: todaysSessions.length.toString() },
      { label: "Upcoming", value: upcomingCount.toLocaleString() },
      { label: "Completed", value: completedCount.toLocaleString() },
      { label: "Cancelled", value: cancelledCount.toLocaleString() },
    ],
    todaysSessions: todaysSessions.map(s => ({
      id: s.id, time: new Date(s.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      student: `${s.student.firstName || ''} ${s.student.lastName || ''}`.trim() || s.student.email,
      tutor: `${s.tutor.firstName || ''} ${s.tutor.lastName || ''}`.trim() || s.tutor.email,
      subject: s.subject.name,
      status: s.status === 'CANCELLED'
        ? 'CANCELLED'
        : s.endTime < now
          ? 'PAST'
          : 'UPCOMING'
    })),
    subjectDemand: subjects.map(s => ({
      subject: s.name, bookings: s._count.bookings,
      percentage: subjects.length > 0 ? Math.round((s._count.bookings / subjects[0]._count.bookings) * 100) : 0
    })),
    topTutors,
    recentActivity: activities.slice(0, 5).map(a => ({ ...a, time: a.time.toISOString() }))
  };
}

export async function exportReport(type: string) {
  let headers: string[] = [];
  let rows: any[][] = [];

  if (type === 'ALL_USERS') {
    headers = ['ID', 'Name', 'Email', 'Is Student', 'Is Tutor', 'Is Admin', 'Created At'];
    const users = await prisma.user.findMany({ orderBy: { createdAt: 'desc' } });
    rows = users.map(u => [u.id, `${u.firstName || ''} ${u.lastName || ''}`.trim() || 'N/A', u.email, u.isStudent ? 'Yes' : 'No', u.isTutor ? 'Yes' : 'No', u.isAdmin ? 'Yes' : 'No', u.createdAt.toISOString()]);
  } 
  else if (type === 'SUBJECT_DEMAND') {
    headers = ['Subject', 'Category', 'Total Bookings'];
    const subjects = await prisma.subject.findMany({ include: { _count: { select: { bookings: true } } }, orderBy: { bookings: { _count: 'desc' } } });
    rows = subjects.map(s => [s.name, s.category || 'N/A', s._count.bookings]);
  } 
  else if (type === 'TUTOR_PERFORMANCE') {
    headers = ['Name', 'Subject', 'Rating', 'Completed Sessions'];
    const tutors = await prisma.user.findMany({ where: { isTutor: true, tutorProfile: { verificationStatus: 'APPROVED' } }, include: { tutorProfile: true, tutorSubjects: { include: { subject: true } } } });
    for (const t of tutors) {
      const sessionCount = await prisma.booking.count({ where: { tutorId: t.id, status: 'COMPLETED' } });
      rows.push([`${t.firstName || ''} ${t.lastName || ''}`.trim() || t.email, t.tutorSubjects[0]?.subject.name || 'General', t.tutorProfile?.averageRating ?? 0, sessionCount]);
    }
  } 
  else if (type === 'RECENT_ACTIVITY') {
    headers = ['Action', 'User', 'Type', 'Timestamp'];
    const recentUsers = await prisma.user.findMany({ orderBy: { createdAt: 'desc' }, take: 20 });
    const recentBookings = await prisma.booking.findMany({ orderBy: { createdAt: 'desc' }, take: 20, include: { student: true } });
    let acts: any[] = [];
    recentUsers.forEach(u => acts.push({ action: u.isTutor ? "New tutor registration" : "New student registered", user: `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email, type: "user", time: u.createdAt }));
    recentBookings.forEach(b => acts.push({ action: b.status === "COMPLETED" ? "Booking completed" : b.status === "CANCELLED" ? "Booking cancelled" : "New booking created", user: `${b.student.firstName || ''} ${b.student.lastName || ''}`.trim() || b.student.email, type: b.status === "CANCELLED" ? "warning" : "booking", time: b.createdAt }));
    acts.sort((a,b) => new Date(b.time).getTime() - new Date(a.time).getTime());
    rows = acts.slice(0, 50).map(a => [a.action, a.user, a.type, a.time.toISOString()]);
  } 
  else if (type === 'TUTOR_APPROVALS') {
    headers = ['Name', 'Email', 'Headline', 'Submitted At', 'Status'];
    const pending = await prisma.user.findMany({ where: { isTutor: true, tutorProfile: { verificationStatus: 'PENDING' } }, include: { tutorProfile: true }, orderBy: { createdAt: 'desc' } });
    rows = pending.map(p => [`${p.firstName || ''} ${p.lastName || ''}`.trim() || 'N/A', p.email, p.tutorProfile?.headline || 'N/A', p.createdAt.toISOString(), p.tutorProfile?.verificationStatus || 'N/A']);
  }

  return convertToCSV(headers, rows);
}