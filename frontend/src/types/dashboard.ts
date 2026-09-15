export type CourseTone = "burgundy" | "olive" | "slate" | "charcoal";
// Update your SessionStatus type
export type SessionStatus = "UPCOMING" | "PAST" | "CANCELED";

export interface CourseRef {
  subjectId: string;
  code: string;
  title: string;
  tone: CourseTone;
}

export interface SessionRow {
  id: string;
  course: CourseRef;
  tutorId: string;
  tutorName: string;
  tutorCredentials: string;
  start: string; // ISO
  end: string;   // ISO
  location: string | null;
  meetingUrl: string | null;
  status: SessionStatus;
  note: string | null;
}

export interface CourseHoursRow extends CourseRef {
  sessions: number;
  hours: number;
  sharePct: number;
}

export interface WeeklyHours { week: number; hours: number }

export interface TutorRow {
  tutorId: string;
  name: string;
  credentials: string;
  hourlyRate: number;
  averageRating: number;
  reviewCount: number;
  sessionsCompleted: number;
  lastSessionOn: string | null; // ISO
}

export interface TermRecord {
  label: string;
  sessionsCompleted: number;
  sessionsScheduled: number;
  sessionsCancelled: number;
  hoursCompleted: number;
  tutorsEngaged: number;
}

export interface AttentionItem {
  kind: "pending" | "review" | "message";
  count: number;
  title: string;
  detail: string;
  href: string;
}


export interface DashboardData {
  now: string; // server time, ISO
  studentName: string;
  termLabel: string;
  weekIndex: number;
  weeklyTargetHours: number;
  kpis: {
    hoursCompleted: number;
    hoursDeltaVsLastWeek: number;
    sessionsCompleted: number;
    upcomingCount: number;
    pendingCount: number;
  };
  hoursByCourse: CourseHoursRow[];
  weeklyHours: WeeklyHours[];
  nextSession: SessionRow | null;
  upcoming: SessionRow[]; // CONFIRMED, ascending
  sessions: SessionRow[];
  tutors: TutorRow[];
  termRecord: TermRecord;
  attention: AttentionItem[];
}