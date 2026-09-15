/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useMemo, useState } from "react";
import { api } from "../api/axios";
import { Link } from "react-router-dom";

/* =========================================================
   TYPES  (mirror the backend DTO exactly)
========================================================= */

type BookingStatus = "UPCOMING" | "PAST" | "CANCELLED";

type Tone = "brand" | "slate" | "burgundy" | "olive";

type SessionItem = {
  id: string;
  startTime: string;
  endTime: string;
  subject: string;
  student: string;
  status: BookingStatus;
};

type StudentRow = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  educationLevel: string | null;
  major: string | null;
  sessions: number;
  lastSession: string | null;
};

type SubjectStat = {
  name: string;
  sessions: number;
  percentage: number;
};

type ReviewItem = {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  student: string;
  subject: string;
  sessionDate: string;
};

type DashboardData = {
  stats: {
    unreadMessages: number;
    completedSessions: number;
    averageRating: number;
    reviewCount: number;
    upcomingSessions: number;
    todaySessions: number;
  };
  weeklySchedule: SessionItem[];
  todaySessions: SessionItem[];
  students: StudentRow[];
  teachingOverview: SubjectStat[];
  recentActivity: SessionItem[];
  reviews: ReviewItem[];
};


async function fetchTutorDashboard(weekOffset: number): Promise<DashboardData> {
  const response = await api.get<DashboardData>(
    `/tutor/dashboard?weekOffset=${weekOffset}`,
  );
  const normalizeSessions = (sessions: SessionItem[]): SessionItem[] =>
    sessions.map((session) => ({
      ...session,
      status: (session.status === "CANCELLED"
        ? "CANCELLED"
        : new Date(session.endTime).getTime() < Date.now()
          ? "PAST"
          : "UPCOMING") as BookingStatus,
    }));

  return {
    ...response.data,
    weeklySchedule: normalizeSessions(response.data.weeklySchedule),
    todaySessions: normalizeSessions(response.data.todaySessions),
    recentActivity: normalizeSessions(response.data.recentActivity),
  };
}

function getStartOfWeek(date: Date) {
  const result = new Date(date);
  const day = result.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  result.setDate(result.getDate() + diff);
  result.setHours(0, 0, 0, 0);
  return result;
}

function getWeekDates(offset: number) {
  const monday = getStartOfWeek(new Date());
  monday.setDate(monday.getDate() + offset * 7);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

function formatDateRange(dates: Date[]) {
  const first = dates[0];
  const last = dates[dates.length - 1];
  if (first.getMonth() === last.getMonth()) {
    return `${first.toLocaleDateString("en-US", { month: "short" })} ${first.getDate()} – ${last.getDate()}, ${first.getFullYear()}`;
  }
  return `${first.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${last.toLocaleDateString("en-US", { month: "short", day: "numeric" })}, ${last.getFullYear()}`;
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatDuration(start: string, end: string) {
  const mins = Math.round(
    (new Date(end).getTime() - new Date(start).getTime()) / 60000
  );
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h && m) return `${h} hr ${m} min`;
  if (h) return `${h} hr${h > 1 ? "s" : ""}`;
  return `${m} min`;
}

function formatRelative(iso: string) {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 30)
    return `${Math.floor(days / 7)} week${Math.floor(days / 7) > 1 ? "s" : ""} ago`;
  return formatDate(iso);
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}


type CsvColumn<T> = { header: string; value: (row: T) => string | number };

function buildCsv<T>(rows: T[], columns: CsvColumn<T>[]) {
  const escape = (v: string | number) => {
    const s = String(v ?? "");
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [columns.map((c) => escape(c.header)).join(",")];
  for (const row of rows)
    lines.push(columns.map((c) => escape(c.value(row))).join(","));
  return lines.join("\n");
}

function downloadCsv(filename: string, csv: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function StatIcon({
  type,
}: {
  type: "mail" | "sessions" | "rating" | "calendar";
}) {
  const className = "h-5 w-5 stroke-[1.7]";
  if (type === "mail")
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m3 7 9 6 9-6" />
      </svg>
    );
  if (type === "sessions")
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <rect x="4" y="4" width="16" height="16" rx="2" />
        <path d="M8 9h8M8 13h5M8 17h3" />
      </svg>
    );
  if (type === "rating")
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9L12 3Z" />
      </svg>
    );
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <rect x="4" y="5" width="16" height="15" rx="2" />
      <path d="M8 3v4M16 3v4M4 9h16" />
    </svg>
  );
}

function ToneIcon({
  tone,
  type,
  alert = false,
}: {
  tone: Tone;
  type: "mail" | "sessions" | "rating" | "calendar";
  alert?: boolean;
}) {
  const styles: Record<Tone, string> = {
    brand: "bg-brand-primary/10 text-brand-primary",
    slate: "bg-slate-blue/10 text-slate-blue",
    burgundy: "bg-burgundy/10 text-burgundy",
    olive: "bg-olive/10 text-olive",
  };
  return (
    <div className="relative">
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-md ${styles[tone]}`}
      >
        <StatIcon type={type} />
      </div>
      {alert && (
        <span className="absolute -right-1 -top-1 h-2.5 w-2.5 animate-pulse rounded-full bg-burgundy" />
      )}
    </div>
  );
}

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg
          key={i}
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className={`h-3.5 w-3.5 ${
            i <= Math.round(rating)
              ? "fill-current text-yellow-400"
              : "fill-none text-yellow-200"
          }`}
        >
          <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9L12 3Z" />
        </svg>
      ))}
    </div>
  );
}

function StatusBadge({ status }: { status: BookingStatus }) {
  const styles: Record<BookingStatus, string> = {
    UPCOMING: "bg-brand-primary/10 text-brand-primary",
    PAST: "bg-slate-blue/10 text-slate-blue",
    CANCELLED: "bg-surface-bg text-muted",
  };
  return (
    <span
      className={`rounded-sm px-2 py-1 text-[9px] font-semibold uppercase tracking-wide ${styles[status]}`}
    >
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  );
}

function ExportButton({
  label,
  onClick,
  disabled,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex items-center gap-1.5 rounded-sm border border-border-subtle bg-surface-card px-2.5 py-1.5 text-[10px] font-semibold text-muted hover:bg-surface-bg hover:text-ink disabled:cursor-not-allowed disabled:opacity-50"
    >
      <svg className="h-3.5 w-3.5 stroke-[1.7]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path d="M12 3v12m0 0 4-4m-4 4-4-4M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
      </svg>
      {label}
    </button>
  );
}


export function TutorD() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const [weekOffset, setWeekOffset] = useState(0);
  const [studentsExpanded, setStudentsExpanded] = useState(false);
  const [activityExpanded, setActivityExpanded] = useState(false);
  const [reviewsExpanded, setReviewsExpanded] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [expandedSubjects, setExpandedSubjects] = useState<Set<string>>(new Set());

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetchTutorDashboard(weekOffset)
      .then((d) => {
        if (!active) return;
        setData(d);
        setError(null);
      })
      .catch((requestError: unknown) => {
        if (!active) return;
        if (requestError && typeof requestError === "object" && "response" in requestError) {
          const response = (requestError as { response?: { data?: { message?: string } } }).response;
          setError(response?.data?.message ?? "Could not load dashboard data. Please try again.");
          return;
        }
        setError("Could not load dashboard data. Please try again.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [weekOffset, reloadKey]);

  const weekDates = useMemo(() => getWeekDates(weekOffset), [weekOffset]);
  const today = new Date();

  const sessionsByDay = useMemo(() => {
    const map: Record<number, SessionItem[]> = {
      0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [],
    };
    for (const s of data?.weeklySchedule ?? [])
      map[new Date(s.startTime).getDay()].push(s);
    return map;
  }, [data]);

  // Stable color per subject name (schedule chips + donut)
  const subjectTones = useMemo(() => {
    const palette: Tone[] = ["slate", "burgundy", "olive", "brand"];
    const names: string[] = [];
    for (const s of data?.weeklySchedule ?? [])
      if (!names.includes(s.subject)) names.push(s.subject);
    const map = new Map<string, Tone>();
    names.forEach((n, i) => map.set(n, palette[i % palette.length]));
    return map;
  }, [data]);

  const reviewDistribution = useMemo(() => {
    const reviews = data?.reviews ?? [];
    return [5, 4, 3, 2, 1].map((star) => ({
      star,
      count: reviews.filter((r) => r.rating === star).length,
    }));
  }, [data]);

  const stamp = new Date().toISOString().slice(0, 10);

  const exportStudents = () => {
    if (!data) return;
    downloadCsv(
      `my-students-${stamp}.csv`,
      buildCsv(data.students, [
        { header: "First name", value: (r) => r.firstName },
        { header: "Last name", value: (r) => r.lastName },
        { header: "Email", value: (r) => r.email },
        { header: "Education level", value: (r) => r.educationLevel ?? "" },
        { header: "Major", value: (r) => r.major ?? "" },
        { header: "Sessions", value: (r) => r.sessions },
        { header: "Last session", value: (r) => (r.lastSession ? formatDate(r.lastSession) : "") },
      ])
    );
  };

  const exportActivity = () => {
    if (!data) return;
    downloadCsv(
      `recent-activity-${stamp}.csv`,
      buildCsv(data.recentActivity, [
        { header: "Student", value: (r) => r.student },
        { header: "Subject", value: (r) => r.subject },
        { header: "Date", value: (r) => formatDate(r.startTime) },
        { header: "Start", value: (r) => formatTime(r.startTime) },
        { header: "End", value: (r) => formatTime(r.endTime) },
        { header: "Duration", value: (r) => formatDuration(r.startTime, r.endTime) },
        { header: "Status", value: (r) => r.status },
      ])
    );
  };

  const exportReviews = () => {
    if (!data) return;
    downloadCsv(
      `reviews-${stamp}.csv`,
      buildCsv(data.reviews, [
        { header: "Date", value: (r) => formatDate(r.createdAt) },
        { header: "Student", value: (r) => r.student },
        { header: "Subject", value: (r) => r.subject },
        { header: "Rating", value: (r) => r.rating },
        { header: "Comment", value: (r) => r.comment },
      ])
    );
  };

  const exportSchedule = () => {
    if (!data) return;
    downloadCsv(
      `weekly-schedule-${stamp}.csv`,
      buildCsv(data.weeklySchedule, [
        {
          header: "Day",
          value: (r) =>
            new Date(r.startTime).toLocaleDateString("en-US", { weekday: "long" }),
        },
        { header: "Date", value: (r) => formatDate(r.startTime) },
        { header: "Start", value: (r) => formatTime(r.startTime) },
        { header: "End", value: (r) => formatTime(r.endTime) },
        { header: "Subject", value: (r) => r.subject },
        { header: "Student", value: (r) => r.student },
        { header: "Status", value: (r) => r.status },
      ])
    );
  };

  if (loading && !data) {
    return (
      <div className="mx-auto w-full max-w-7xl space-y-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-28 animate-pulse rounded-sm border border-border-subtle bg-surface-card" />
        ))}
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="mx-auto w-full max-w-7xl">
        <div className="rounded-sm border border-border-subtle bg-surface-card p-8 text-center shadow-warm-sm">
          <p className="text-sm font-semibold text-ink">{error}</p>
          <button
            type="button"
            onClick={() => setReloadKey((k) => k + 1)}
            className="mt-4 rounded-sm bg-brand-primary px-4 py-2 text-xs font-semibold text-white hover:bg-brand-primary-hover"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const unread = data.stats.unreadMessages;

  const statCards: Array<{
    label: string;
    value: string;
    detail: string;
    badge: string;
    accent: Tone;
    type: "mail" | "sessions" | "rating" | "calendar";
    alert?: boolean;
  }> = [
    {
      label: "Unread messages",
      value: String(unread),
      detail: unread > 0 ? "Messages waiting for your reply" : "You are all caught up",
      badge: unread > 0 ? "Needs attention" : "Inbox zero",
      accent: unread > 0 ? "burgundy" : "olive",
      type: "mail",
      alert: unread > 0,
    },
    {
      label: "Sessions completed",
      value: String(data.stats.completedSessions),
      detail: "Across your subjects",
      badge: "All time",
      accent: "slate",
      type: "sessions",
    },
    {
      label: "Average rating",
      value: data.stats.averageRating.toFixed(1),
      detail: `From ${data.stats.reviewCount} review${data.stats.reviewCount !== 1 ? "s" : ""}`,
      badge: data.stats.averageRating >= 4.5 ? "Excellent" : "Good",
      accent: "brand",
      type: "rating",
    },
    {
      label: "Upcoming sessions",
      value: String(data.stats.upcomingSessions),
      detail: "Next 7 days",
      badge: `${data.stats.todaySessions} today`,
      accent: "olive",
      type: "calendar",
    },
  ];

  const visibleStudents = studentsExpanded
    ? data.students
    : data.students.slice(0, 5);
  const visibleActivity = activityExpanded
    ? data.recentActivity
    : data.recentActivity.slice(0, 5);
  const visibleReviews = reviewsExpanded
    ? data.reviews
    : data.reviews.slice(0, 3);
    
  const donutColors = ["#2f6aa0", "#9b2d45", "#4f7a28", "#1e3a5f", "#b7791f", "#6d4ea0"];
  const totalCompleted = data.teachingOverview.reduce((s, r) => s + r.sessions, 0);
  let acc = 0;
  const donutGradient =
    totalCompleted > 0
      ? `conic-gradient(${data.teachingOverview
          .map((row, i) => {
            const from = (acc / totalCompleted) * 100;
            acc += row.sessions;
            const to = (acc / totalCompleted) * 100;
            return `${donutColors[i % donutColors.length]} ${from}% ${to}%`;
          })
          .join(", ")})`
      : undefined;

  const toneStyles: Record<Tone, string> = {
    slate: "border-slate-blue bg-slate-blue/5",
    burgundy: "border-burgundy bg-burgundy/5",
    olive: "border-olive bg-olive/5",
    brand: "border-brand-primary bg-brand-primary/5",
  };
  const textStyles: Record<Tone, string> = {
    slate: "text-slate-blue",
    burgundy: "text-burgundy",
    olive: "text-olive",
    brand: "text-brand-primary",
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-3">
      <section className="flex flex-wrap items-center justify-between gap-3 rounded-sm border border-border-subtle bg-surface-card p-3 shadow-warm-sm">
        <div>
          <p className="mt-0.5 text-xs text-muted">
            {today.toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 text-[10px] font-semibold uppercase tracking-wide text-muted">
            Export
          </span>
          <ExportButton label="My students" onClick={exportStudents} disabled={!data.students.length} />
          <ExportButton label="Recent activity" onClick={exportActivity} disabled={!data.recentActivity.length} />
          <ExportButton label="Reviews" onClick={exportReviews} disabled={!data.reviews.length} />
          <ExportButton label="Weekly schedule" onClick={exportSchedule} disabled={!data.weeklySchedule.length} />
        </div>
      </section>

      <section className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((stat) => (
          stat.label === "Unread messages" ? (
            <Link
              key={stat.label}
              to="/messages"
              className={`block rounded-sm border bg-surface-card p-4 shadow-warm-sm transition-colors hover:border-brand-primary/50 ${
                stat.alert ? "border-burgundy/40" : "border-border-subtle"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <ToneIcon tone={stat.accent} type={stat.type} alert={stat.alert} />
                <span className={`text-[11px] font-semibold ${stat.alert ? "text-burgundy" : "text-success"}`}>{stat.badge}</span>
              </div>
              <div className="mt-5">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">{stat.label}</p>
                <p className="mt-1 text-2xl font-semibold tabular-nums text-ink">{stat.value}</p>
                <p className="mt-1 text-xs text-muted">{stat.detail}</p>
              </div>
            </Link>
          ) : (
            <article
              key={stat.label}
              className={`rounded-sm border bg-surface-card p-4 shadow-warm-sm ${stat.alert ? "border-burgundy/40" : "border-border-subtle"}`}
            >
            <div className="flex items-start justify-between gap-3">
              <ToneIcon tone={stat.accent} type={stat.type} alert={stat.alert} />
              <span
                className={`text-[11px] font-semibold ${
                  stat.alert ? "text-burgundy" : "text-success"
                }`}
              >
                {stat.badge}
              </span>
            </div>

            <div className="mt-5">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">
                {stat.label}
              </p>
              <p className="mt-1 text-2xl font-semibold tabular-nums text-ink">
                {stat.value}
              </p>
              <p className="mt-1 text-xs text-muted">{stat.detail}</p>
            </div>
            </article>
          )))}
      </section>

      
      <section className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_300px]">

        {/* Weekly schedule (tutor only) */}
        <article className="min-w-0 rounded-sm border border-border-subtle bg-surface-card shadow-warm-sm">
          <div className="flex items-end justify-between gap-3 border-b border-border-subtle p-4">
            <div>
              <h2 className="font-serif text-lg font-semibold text-ink">
                Weekly schedule
              </h2>
              <p className="mt-0.5 text-xs text-muted">
                {formatDateRange(weekDates)}
              </p>
            </div>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => setWeekOffset((w) => w - 1)}
                className="flex h-8 w-8 items-center justify-center rounded-sm border border-border-subtle text-muted hover:bg-surface-bg"
                aria-label="Previous week"
              >
                ←
              </button>
              <button
                type="button"
                onClick={() => setWeekOffset((w) => w + 1)}
                className="flex h-8 w-8 items-center justify-center rounded-sm border border-border-subtle text-muted hover:bg-surface-bg"
                aria-label="Next week"
              >
                →
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <div className="min-w-[700px]">
              {/* Days */}
              <div className="grid grid-cols-7 border-b border-border-subtle">
                {weekDates.map((date) => {
                  const isToday = date.toDateString() === today.toDateString();
                  return (
                    <div
                      key={date.toISOString()}
                      className={`border-r border-border-subtle px-2 py-3 text-center last:border-r-0 ${
                        isToday ? "bg-brand-primary/5" : ""
                      }`}
                    >
                      <p
                        className={`text-[9px] font-semibold tracking-[0.12em] ${
                          isToday ? "text-brand-primary" : "text-muted"
                        }`}
                      >
                        {date
                          .toLocaleDateString("en-US", { weekday: "short" })
                          .toUpperCase()}
                      </p>
                      <p
                        className={`mt-1 font-serif text-lg font-semibold ${
                          isToday ? "text-brand-primary" : "text-ink"
                        }`}
                      >
                        {date.getDate()}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Sessions */}
              <div className="grid min-h-[330px] grid-cols-7 divide-x divide-border-subtle">
                {weekDates.map((date) => {
                  const daySessions = sessionsByDay[date.getDay()] ?? [];
                  return (
                    <div key={date.toISOString()} className="p-2">
                      {daySessions.length === 0 ? (
                        <div className="flex h-full items-center justify-center">
                          <p className="text-[10px] text-muted">No sessions</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {daySessions.map((session) => {
                            const tone = subjectTones.get(session.subject) ?? "brand";
                            const selected = selectedSessionId === session.id;
                            return (
                              <button
                                type="button"
                                key={session.id}
                                aria-pressed={selected}
                                onClick={() => setSelectedSessionId(selected ? null : session.id)}
                                className={`w-full rounded-sm border-l-[3px] p-2 text-left transition-all hover:-translate-y-0.5 hover:shadow-warm-sm ${toneStyles[tone]} ${selected ? "ring-2 ring-brand-primary/30" : ""}`}
                              >
                                <p className={`text-[9px] font-semibold ${textStyles[tone]}`}>
                                  {formatTime(session.startTime)}
                                </p>
                                <p className="mt-1.5 text-[10px] font-semibold text-ink">
                                  {session.subject}
                                </p>
                                <p className="text-[9px] text-muted">{session.student}</p>
                                {session.status !== "UPCOMING" && (
                                  <p className="mt-1 text-[8px] font-semibold uppercase tracking-wide text-muted">
                                    {session.status.charAt(0) + session.status.slice(1).toLowerCase()}
                                  </p>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          {selectedSessionId && (() => {
            const selected = data.weeklySchedule.find((session) => session.id === selectedSessionId);
            if (!selected) return null;
            return (
              <div className="border-t border-border-subtle bg-surface-bg px-4 py-3 text-xs">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-semibold text-ink">{selected.subject}</p>
                    <p className="mt-0.5 text-muted">{selected.student} · {formatTime(selected.startTime)}–{formatTime(selected.endTime)}</p>
                  </div>
                  <StatusBadge status={selected.status} />
                </div>
              </div>
            );
          })()}
        </article>

        {/* Daily sessions (today) */}
        <article className="rounded-sm border border-border-subtle bg-surface-card shadow-warm-sm">
          <div className="border-b border-border-subtle p-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-brand-primary">
              Today
            </p>
            <h2 className="mt-1 font-serif text-lg font-semibold text-ink">
              Daily sessions
            </h2>
            <p className="mt-0.5 text-xs text-muted">
              {data.todaySessions.length} session
              {data.todaySessions.length !== 1 ? "s" : ""} scheduled
            </p>
          </div>

          <div className="divide-y divide-border-subtle">
            {data.todaySessions.length === 0 ? (
              <div className="p-6 text-center">
                <p className="text-sm font-medium text-ink">No lessons today</p>
                <p className="mt-1 text-xs text-muted">Enjoy your free time.</p>
              </div>
            ) : (
              data.todaySessions.map((session) => (
                <div key={session.id} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold text-brand-primary">
                        {formatTime(session.startTime)} – {formatTime(session.endTime)}
                      </p>
                      <p className="mt-2 text-sm font-semibold text-ink">
                        {session.subject}
                      </p>
                      <p className="mt-0.5 text-xs text-muted">{session.student}</p>
                    </div>
                    <StatusBadge status={session.status} />
                  </div>
                </div>
              ))
            )}
          </div>
        </article>
      </section>

      
      <section className="rounded-sm border border-border-subtle bg-surface-card shadow-warm-sm">
        <div className="flex items-end justify-between border-b border-border-subtle p-4">
          <div>
            <h2 className="font-serif text-lg font-semibold text-ink">My students</h2>
            <p className="mt-0.5 text-xs text-muted">
              Students with previous or recent sessions with you
            </p>
          </div>
          {data.students.length > 5 && (
            <button
              type="button"
              onClick={() => setStudentsExpanded((v) => !v)}
              className="text-xs font-semibold text-brand-primary hover:underline"
            >
              {studentsExpanded ? "Show less" : "View all"}
            </button>
          )}
        </div>

        {data.students.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm font-medium text-ink">No students yet</p>
            <p className="mt-1 text-xs text-muted">
              Students appear here once they book a session with you.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left">
              <thead>
                <tr className="border-b border-border-subtle bg-surface-bg">
                  <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-wide text-muted">Student</th>
                  <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-wide text-muted">Education</th>
                  <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-wide text-muted">Major</th>
                  <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-wide text-muted">Sessions</th>
                  <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-wide text-muted">Last session</th>
                </tr>
              </thead>
              <tbody>
                {visibleStudents.map((student) => (
                  <tr
                    key={student.id}
                    className="border-b border-border-subtle last:border-0 hover:bg-surface-bg"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-primary/10 text-[9px] font-semibold text-brand-primary">
                          {initials(`${student.firstName} ${student.lastName}`)}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-ink">
                            {student.firstName} {student.lastName}
                          </p>
                          <p className="text-[10px] text-muted">{student.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted">
                      {student.educationLevel ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted">
                      {student.major ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-semibold text-ink">
                        {student.sessions}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted">
                      {student.lastSession ? formatDate(student.lastSession) : "Upcoming only"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* =====================================================
          TEACHING OVERVIEW (completed sessions per subject)
      ====================================================== */}
      <section className="rounded-sm border border-border-subtle bg-surface-card p-4 shadow-warm-sm">
        <div>
          <h2 className="font-serif text-lg font-semibold text-ink">
            Teaching overview
          </h2>
          <p className="mt-0.5 text-xs text-muted">
            Completed sessions in each subject
          </p>
        </div>

        {totalCompleted === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm font-medium text-ink">No completed sessions yet</p>
            <p className="mt-1 text-xs text-muted">
              Your subject breakdown will appear once sessions are completed.
            </p>
          </div>
        ) : (
          <div className="mt-6 grid gap-8 sm:grid-cols-[170px_minmax(0,1fr)] sm:items-center">
            <div className="relative mx-auto h-36 w-36">
              <div
                className="h-full w-full rounded-full"
                style={{ background: donutGradient }}
              />
              <div className="absolute inset-[18px] flex flex-col items-center justify-center rounded-full bg-surface-card">
                <span className="font-serif text-2xl font-semibold text-ink">
                  {totalCompleted}
                </span>
                <span className="text-[9px] uppercase tracking-wide text-muted">
                  sessions
                </span>
              </div>
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              {data.teachingOverview.map((subject, i) => (
                <button
                  type="button"
                  key={subject.name}
                  onClick={() => {
                    setExpandedSubjects((current) => {
                      const next = new Set(current);
                      if (next.has(subject.name)) next.delete(subject.name);
                      else next.add(subject.name);
                      return next;
                    });
                  }}
                  aria-expanded={expandedSubjects.has(subject.name)}
                  className="rounded-sm border border-border-subtle p-3 text-left transition-colors hover:border-brand-primary/50"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="flex min-w-0 items-center gap-2">
                      <span
                        className="h-2 w-2 shrink-0 rounded-full"
                        style={{ background: donutColors[i % donutColors.length] }}
                      />
                      <span className="truncate text-xs text-muted">{subject.name}</span>
                    </span>
                    <span className="text-xs text-muted" aria-hidden="true">
                      {expandedSubjects.has(subject.name) ? "−" : "+"}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs">
                    <span className="font-semibold tabular-nums text-ink">
                      {subject.sessions} session{subject.sessions === 1 ? "" : "s"}
                    </span>
                    <span className="tabular-nums text-muted">{subject.percentage}%</span>
                  </div>
                  {expandedSubjects.has(subject.name) && (
                    <p className="mt-2 border-t border-border-subtle pt-2 text-[11px] text-muted">
                      {subject.percentage}% of your completed teaching sessions.
                    </p>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* =====================================================
          REVIEWS RECEIVED
      ====================================================== */}
      <section className="rounded-sm border border-border-subtle bg-surface-card shadow-warm-sm">
        <div className="flex items-end justify-between border-b border-border-subtle p-4">
          <div>
            <h2 className="font-serif text-lg font-semibold text-ink">
              Student reviews
            </h2>
            <p className="mt-0.5 text-xs text-muted">
              Feedback left by students after your sessions
            </p>
          </div>
          {data.reviews.length > 3 && (
            <button
              type="button"
              onClick={() => setReviewsExpanded((v) => !v)}
              className="text-xs font-semibold text-brand-primary hover:underline"
            >
              {reviewsExpanded ? "Show less" : `View all (${data.reviews.length})`}
            </button>
          )}
        </div>

        {data.reviews.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm font-medium text-ink">No reviews yet</p>
            <p className="mt-1 text-xs text-muted">
              Reviews appear here after students rate your completed sessions.
            </p>
          </div>
        ) : (
          <div className="grid gap-0 lg:grid-cols-[260px_minmax(0,1fr)]">
            {/* Summary + distribution */}
            <div className="border-b border-border-subtle p-5 lg:border-b-0 lg:border-r">
              <div className="flex items-end gap-3">
                <span className="font-serif text-4xl font-semibold text-ink">
                  {data.stats.averageRating.toFixed(1)}
                </span>
                <div className="pb-1">
                  <Stars rating={data.stats.averageRating} />
                  <p className="mt-1 text-[10px] text-muted">
                    {data.stats.reviewCount} review
                    {data.stats.reviewCount !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-2">
                {reviewDistribution.map((row) => {
                  const pct = data.reviews.length
                    ? (row.count / data.reviews.length) * 100
                    : 0;
                  return (
                    <div key={row.star} className="flex items-center gap-2">
                      <span className="w-6 text-[10px] font-semibold tabular-nums text-muted">
                        {row.star}★
                      </span>
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-bg">
                        <div
                          className="h-full rounded-full bg-burgundy"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="w-5 text-right text-[10px] tabular-nums text-muted">
                        {row.count}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Review list */}
            <div className="divide-y divide-border-subtle">
              {visibleReviews.map((review) => (
                <div key={review.id} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-blue/10 text-[10px] font-semibold text-slate-blue">
                        {initials(review.student)}
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-xs font-semibold text-ink">
                            {review.student}
                          </p>
                          <span className="rounded-sm bg-surface-bg px-2 py-0.5 text-[9px] font-semibold text-muted">
                            {review.subject}
                          </span>
                        </div>
                        <p className="mt-0.5 text-[10px] text-muted">
                          Session on {formatDate(review.sessionDate)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Stars rating={review.rating} />
                      <p className="mt-1 text-[10px] text-muted">
                        {formatRelative(review.createdAt)}
                      </p>
                    </div>
                  </div>
                  <p className="mt-3 text-xs leading-relaxed text-muted">
                    “{review.comment}”
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      
      <section className="overflow-hidden rounded-sm border border-border-subtle bg-surface-card shadow-warm-sm">
        <div className="flex items-end justify-between border-b border-border-subtle p-4">
          <div>
            <h2 className="font-serif text-lg font-semibold text-ink">
              Recent tutoring activity
            </h2>
            <p className="mt-0.5 text-xs text-muted">
              Your latest completed and scheduled bookings
            </p>
          </div>
          {data.recentActivity.length > 5 && (
            <button
              type="button"
              onClick={() => setActivityExpanded((v) => !v)}
              className="text-xs font-semibold text-brand-primary hover:underline"
            >
              {activityExpanded ? "Show less" : "View all activity"}
            </button>
          )}
        </div>

        {data.recentActivity.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm font-medium text-ink">No activity yet</p>
            <p className="mt-1 text-xs text-muted">
              Bookings will show up here as soon as they are created.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left">
              <thead>
                <tr className="border-b border-border-subtle bg-surface-bg">
                  <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-wide text-muted">Student</th>
                  <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-wide text-muted">Subject</th>
                  <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-wide text-muted">Date & time</th>
                  <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-wide text-muted">Duration</th>
                  <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-wide text-muted">Status</th>
                </tr>
              </thead>
              <tbody>
                {visibleActivity.map((session) => (
                  <tr
                    key={session.id}
                    className="border-b border-border-subtle last:border-0 hover:bg-surface-bg"
                  >
                    <td className="px-4 py-3">
                      <p className="text-xs font-semibold text-ink">{session.student}</p>
                      <p className="mt-0.5 text-[10px] text-muted">
                        Booking #{session.id.slice(0, 8)}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-sm bg-surface-bg px-2 py-1 text-[9px] font-semibold text-muted">
                        {session.subject}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-xs text-ink">{formatDate(session.startTime)}</p>
                      <p className="text-[10px] text-muted">
                        {formatTime(session.startTime)} – {formatTime(session.endTime)}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted">
                      {formatDuration(session.startTime, session.endTime)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={session.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

export default TutorD;