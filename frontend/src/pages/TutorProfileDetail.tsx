import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { createBooking, fetchTutorDetail } from "../api/tutorDetailAPI";
import type {
  AvailabilitySlot,
  SessionType,
  TutorDetailResponse,
  TutorReview,
} from "../types/tutor";
import { IconVerified } from "../components/directory/icons";
import { createConversation } from "../api/messageAPI";

/* ── Local icons (stroke = currentColor) ─────────────────────────── */
type IconProps = { className?: string };
const svg = (props: IconProps, children: React.ReactNode, filled = false) => (
  <svg
    viewBox="0 0 24 24"
    className={props.className}
    fill={filled ? "currentColor" : "none"}
    stroke={filled ? "none" : "currentColor"}
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {children}
  </svg>
);
const IconStarSolid = (p: IconProps) =>
  svg(
    p,
    <path d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.6 7-6.2-3.7-6.2 3.7 1.6-7L2.4 9.2l7.1-.6z" />,
    true,
  );
const IconCheckCircle = (p: IconProps) =>
  svg(
    p,
    <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm-1.2 14.4l-3.5-3.5 1.4-1.4 2.1 2.1 4.9-4.9 1.4 1.4-6.3 6.3z" />,
    true,
  );
const IconCap = (p: IconProps) =>
  svg(
    p,
    <>
      <path d="M22 10L12 5 2 10l10 5 10-5z" />
      <path d="M6 12v5c0 1.7 2.7 3 6 3s6-1.3 6-3v-5" />
    </>,
  );
const IconDoc = (p: IconProps) =>
  svg(
    p,
    <>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
      <path d="M9 13h6M9 17h6" />
    </>,
  );
const IconShield = (p: IconProps) =>
  svg(p, <path d="M12 22s8-3.6 8-10V5l-8-3-8 3v7c0 6.4 8 10 8 10z" />);
const IconSessions = (p: IconProps) =>
  svg(
    p,
    <>
      <path d="M3 3v18h18" />
      <path d="M7 14v4M12 10v8M17 6v12" />
    </>,
  );
const IconChevL = (p: IconProps) => svg(p, <path d="M15 18l-6-6 6-6" />);
const IconChevR = (p: IconProps) => svg(p, <path d="M9 18l6-6-6-6" />);
const IconPlay = (p: IconProps) =>
  svg(
    p,
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M10 8.5l6 3.5-6 3.5z" />
    </>,
  );

/* ── Helpers ─────────────────────────────────────────────────────── */
const AVATAR_COLORS = [
  "bg-slate-blue",
  "bg-burgundy",
  "bg-olive",
  "bg-brand-secondary",
  "bg-brand-primary",
];
const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

function displayName(t: TutorDetailResponse) {
  return `${t.firstName ?? ""} ${t.lastName ?? ""}`.trim() || "Tutor";
}
function personName(f: string | null, l: string | null) {
  return `${f ?? ""} ${l ?? ""}`.trim() || "User";
}
function initialsOf(f: string | null, l: string | null) {
  return `${f?.[0] ?? ""}${l?.[0] ?? ""}`.toUpperCase() || "?";
}
function avatarColor(t: TutorDetailResponse) {
  const key = `${t.firstName}${t.lastName}`;
  let sum = 0;
  for (let i = 0; i < key.length; i++) sum += key.charCodeAt(i);
  return AVATAR_COLORS[sum % AVATAR_COLORS.length];
}
const dayKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
const sameDay = (a: Date, b: Date) => dayKey(a) === dayKey(b);
const fmtTime = (isoStr: string) =>
  new Date(isoStr).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
function timeAgo(isoStr: string) {
  const s = Math.floor((Date.now() - new Date(isoStr).getTime()) / 1000);
  if (s < 3600) return "just now";
  const h = Math.floor(s / 3600);
  if (h < 24) return `${h} hour${h === 1 ? "" : "s"} ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d} day${d === 1 ? "" : "s"} ago`;
  const w = Math.floor(d / 7);
  if (w < 5) return `${w} week${w === 1 ? "" : "s"} ago`;
  const mo = Math.floor(d / 30);
  return `${mo} month${mo === 1 ? "" : "s"} ago`;
}

/* ── Small presentational pieces ─────────────────────────────────── */
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <span className="h-px w-8 bg-border-subtle" />
      <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-muted">
        {children}
      </h2>
    </div>
  );
}

function Stars({ rating }: { rating: number }) {
  return (
    <span
      className="flex shrink-0 items-center gap-0.5"
      aria-label={`${rating} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map((i) => {
        const fill = Math.min(Math.max(rating - (i - 1), 0), 1);
        return (
          <span key={i} className="relative inline-block h-4 w-4">
            <IconStarSolid className="h-4 w-4 text-border-subtle" />
            <span
              className="absolute inset-0 overflow-hidden"
              style={{ width: `${fill * 100}%` }}
            >
              <IconStarSolid className="h-4 w-4 text-amber-500" />
            </span>
          </span>
        );
      })}
    </span>
  );
}

function ReviewRow({ review }: { review: TutorReview }) {
  return (
    <li className="py-5 first:pt-0 last:pb-0">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-charcoal text-sm font-bold text-white">
            {initialsOf(review.student.firstName, review.student.lastName)}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-ink">
              {personName(review.student.firstName, review.student.lastName)}
            </p>
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted">
              {/* Updated to show Subject + Session Date */}
              {review.subject?.name ?? "Session"}
              {review.sessionDate && (
                <>
                  {" • "}
                  <span className="text-slate-blue">
                    Session on{" "}
                    {new Date(review.sessionDate).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </>
              )}
              {" • "}
              {timeAgo(review.createdAt)}
            </p>
          </div>
        </div>
        <Stars rating={review.rating} />
      </div>
      <p className="mt-3 text-sm leading-6 text-muted">{`"${review.comment}"`}</p>
    </li>
  );
}

/* ── Page ────────────────────────────────────────────────────────── */
export function TutorProfilePage() {
  const { id = "" } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate(); // 👈 Add this
  const [isMessaging, setIsMessaging] = useState(false); // 👈 Add this
  const [tutor, setTutor] = useState<TutorDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const now = useMemo(() => new Date(), []);
  const [monthCursor, setMonthCursor] = useState({
    y: now.getFullYear(),
    m: now.getMonth(),
  });
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [subjectId, setSubjectId] = useState("");
  const [sessionType, setSessionType] = useState<SessionType>("ONLINE");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [bookResult, setBookResult] = useState<{
    ok: boolean;
    message: string;
  } | null>(null);
  const [showAllReviews, setShowAllReviews] = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setNotFound(false);
    fetchTutorDetail(id)
      .then((data) => {
        if (!mounted) return;
        setTutor(data);
        console.log("tutor is ", data);
        // defaults: first open slot's day + first subject
        const open = data.availability
          .filter((s) => !s.isBooked && new Date(s.startTime) >= new Date())
          .sort((a, b) => a.startTime.localeCompare(b.startTime));
        if (open[0]) {
          const d = new Date(open[0].startTime);
          setSelectedDay(new Date(d.getFullYear(), d.getMonth(), d.getDate()));
          setMonthCursor({ y: d.getFullYear(), m: d.getMonth() });
          setSelectedSlotId(open[0].id);
        }
        if (data.tutorSubjects[0])
          setSubjectId(data.tutorSubjects[0].subjectId);
      })
      .catch((err) => {
        if (mounted) setNotFound(err?.message === "NOT_FOUND");
      })
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, [id]);

  const openSlots = useMemo<AvailabilitySlot[]>(
    () =>
      (tutor?.availability ?? [])
        .filter((s) => !s.isBooked && new Date(s.startTime) >= now)
        .sort((a, b) => a.startTime.localeCompare(b.startTime)),
    [tutor, now],
  );

  const slotsByDay = useMemo(() => {
    const map = new Map<string, AvailabilitySlot[]>();
    openSlots.forEach((s) => {
      const k = dayKey(new Date(s.startTime));
      map.set(k, [...(map.get(k) ?? []), s]);
    });
    map.forEach((v) =>
      v.sort((a, b) => a.startTime.localeCompare(b.startTime)),
    );
    return map;
  }, [openSlots]);

  const daySlots = selectedDay
    ? (slotsByDay.get(dayKey(selectedDay)) ?? [])
    : [];
  const selectedSlot = daySlots.find((s) => s.id === selectedSlotId) ?? null;

  const calendarCells = useMemo(() => {
    const { y, m } = monthCursor;
    const lead = (new Date(y, m, 1).getDay() + 6) % 7; // Monday-first
    const count = new Date(y, m + 1, 0).getDate();
    const cells: (Date | null)[] = Array(lead).fill(null);
    for (let d = 1; d <= count; d++) cells.push(new Date(y, m, d));
    return cells;
  }, [monthCursor]);

  const curYM = { y: now.getFullYear(), m: now.getMonth() };
  const monthDiff = (monthCursor.y - curYM.y) * 12 + (monthCursor.m - curYM.m);
  const canPrev = monthDiff > 0;
  const canNext = monthDiff < 3;
  const shiftMonth = (delta: number) =>
    setMonthCursor(({ y, m }) => {
      const d = new Date(y, m + delta, 1);
      return { y: d.getFullYear(), m: d.getMonth() };
    });

  const pickDay = (d: Date) => {
    setSelectedDay(d);
    const slots = slotsByDay.get(dayKey(d)) ?? [];
    setSelectedSlotId(slots[0]?.id ?? null);
  };

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-6">
            <div className="flex gap-5">
              <div className="h-24 w-24 animate-pulse rounded-xl bg-border-subtle" />
              <div className="flex-1 space-y-3 py-2">
                <div className="h-6 w-1/2 animate-pulse rounded bg-border-subtle" />
                <div className="h-4 w-2/3 animate-pulse rounded bg-border-subtle" />
                <div className="h-4 w-1/3 animate-pulse rounded bg-border-subtle" />
              </div>
            </div>
            <div className="h-40 animate-pulse rounded-xl bg-border-subtle" />
            <div className="h-64 animate-pulse rounded-xl bg-border-subtle" />
          </div>
          <div className="h-96 animate-pulse rounded-xl bg-border-subtle" />
        </div>
      </div>
    );
  }

  if (notFound || !tutor) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-xl border border-border-subtle bg-surface-card p-12 text-center">
          <p className="font-serif text-lg font-semibold text-ink">
            Tutor not found
          </p>
          <p className="mt-1 text-sm text-muted">
            This profile may have been removed or is not approved yet.
          </p>
          <Link
            to="/directory"
            className="mt-4 inline-block rounded-lg bg-brand-primary px-4 py-2 text-sm font-semibold text-white hover:bg-brand-primary-hover"
          >
            Back to directory
          </Link>
        </div>
      </div>
    );
  }

  const p = tutor.tutorProfile;
  const approved = p.verificationStatus === "APPROVED";
  const isOwn = user?.id === tutor.id;
  const topRated = p.averageRating >= 4.8 && p.reviewCount >= 100;
  const firstName = tutor.firstName ?? "The tutor";
  const reviews = tutor.reviews ?? [];
  const visibleReviews = showAllReviews ? reviews : reviews.slice(0, 2);

  const credentials: {
    icon: (pr: IconProps) => React.ReactNode;
    title: string;
    sub: string | null;
    verified: string;
  }[] = [];
  if (p.education)
    credentials.push({
      icon: IconCap,
      title: p.education,
      sub: "Degree / Program",
      verified: "Verified by registrar",
    });
  p.certificates.forEach((c) =>
    credentials.push({
      icon: IconDoc,
      title: c,
      sub: null,
      verified: "Verified badge",
    }),
  );

  async function handleBook() {
    if (!selectedSlot || !subjectId || submitting) return;
    setSubmitting(true);
    setBookResult(null);
    try {
      await createBooking({
        tutorId: tutor!.id,
        subjectId,
        availabilitySlotId: selectedSlot.id,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        sessionType,
        notes: notes.trim() || undefined,
      });
      setBookResult({
        ok: true,
        message: `Your request is PENDING until ${firstName} confirms. Track it under Sessions.`,
      });
    } catch (e) {
      setBookResult({
        ok: false,
        message: e instanceof Error ? e.message : "Failed to create booking",
      });
    } finally {
      setSubmitting(false);
    }
  }
  const handleMessageClick = async () => {
    if (isMessaging || !tutor) return;
    setIsMessaging(true);

    try {
      // Calls POST /conversations with { participantId: tutor.id }
      // The backend automatically returns the existing conversation or creates a new one.
      const conversation = await createConversation(tutor.id);

      // Navigate to the Messages page and pass the conversationId in the URL
      navigate(`/messages?conversationId=${conversation.id}`);
    } catch (error) {
      console.error("Failed to start conversation:", error);
      // Fallback: just go to the messages inbox if the API call fails
      navigate("/messages");
    } finally {
      setIsMessaging(false);
    }
  };
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
        {/* ══ LEFT COLUMN ══ */}
        <div className="min-w-0">
          {/* Header */}
          <header className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex flex-wrap items-start gap-5">
              <div className="relative shrink-0">
                <div
                  className={`flex h-18 w-18 items-center justify-center rounded-xl text-3xl font-bold text-white ${avatarColor(tutor)}`}
                >
                  {initialsOf(tutor.firstName, tutor.lastName)}
                </div>
                {approved && (
                  <span className="absolute -bottom-2 -right-2 flex h-7 w-7 items-center justify-center rounded-lg bg-charcoal shadow-warm">
                    <IconCheckCircle className="h-4 w-4 text-white" />
                  </span>
                )}
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="font-serif text-3xl font-bold text-ink sm:text-4xl">
                    {displayName(tutor)}
                  </h1>
                  {approved && (
                    <IconVerified className="h-5 w-5 shrink-0 text-slate-blue" />
                  )}
                  {topRated && (
                    <span className="shrink-0 rounded-full border border-slate-blue px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-slate-blue">
                      Top Rated
                    </span>
                  )}
                  {p.isFeatured && (
                    <span className="shrink-0 rounded-md bg-burgundy/10 px-2 py-0.5 text-[11px] font-semibold text-burgundy">
                      Featured
                    </span>
                  )}
                </div>
                {p.headline && (
                  <p className="mt-1 text-lg text-muted">{p.headline}</p>
                )}
                <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted">
                  <span className="flex items-center gap-1.5">
                    <IconStarSolid className="h-4 w-4 text-amber-500" />
                    <span className="font-semibold text-ink">
                      {p.averageRating.toFixed(1)}
                    </span>
                    ({p.reviewCount} review{p.reviewCount === 1 ? "" : "s"})
                  </span>
                  <span className="flex items-center gap-1.5">
                    <IconSessions className="h-4 w-4" />
                    {tutor.stats?.completedSessions ?? 0} Sessions Done
                  </span>
                </div>
              </div>
            </div>
            {!isOwn && (
              <button
                type="button"
                onClick={handleMessageClick}
                disabled={isMessaging}
                className="rounded-lg bg-brand-primary px-6 py-3 text-xs font-bold uppercase tracking-[0.2em] text-white shadow-warm-sm transition-colors hover:bg-brand-primary-hover disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isMessaging ? "Starting chat..." : "Message"}
              </button>
            )}
          </header>

          <div className="mt-6 h-px bg-border-subtle" />

          <div className="mt-8 space-y-10">
            {/* Bio & Expertise */}
            <section>
              <SectionLabel>Bio &amp; Expertise</SectionLabel>
              <p className="mt-4 whitespace-pre-line text-[15px] leading-7 text-ink">
                {p.bio ?? "This tutor hasn't written a bio yet."}
              </p>
              {tutor.tutorSubjects.length > 0 && (
                <ul className="mt-4 flex flex-wrap gap-1.5">
                  {tutor.tutorSubjects.map((ts) => (
                    <li
                      key={ts.subjectId}
                      className="rounded-md border border-border-subtle bg-surface-bg px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-muted"
                    >
                      {ts.subject.name}
                    </li>
                  ))}
                </ul>
              )}
              {p.experience.length > 0 && (
                <ul className="mt-4 space-y-1.5">
                  {p.experience.map((exp) => (
                    <li
                      key={exp}
                      className="flex items-start gap-2 text-sm text-muted"
                    >
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-olive" />
                      {exp}
                    </li>
                  ))}
                </ul>
              )}
              {p.videoIntroUrl && (
                <a
                  href={p.videoIntroUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-flex items-center gap-2 rounded-lg border border-border-subtle bg-surface-card px-3 py-2 text-sm font-semibold text-brand-primary hover:bg-brand-primary/5"
                >
                  <IconPlay className="h-4 w-4" /> Watch intro video
                </a>
              )}
            </section>

            {/* Languages */}
            {p.languages.length > 0 && (
              <section>
                <SectionLabel>Languages</SectionLabel>
                <ul className="mt-4 space-y-1">
                  {p.languages.map((lang) => (
                    <li
                      key={lang}
                      className="text-sm font-bold uppercase tracking-wide text-ink"
                    >
                      {lang}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Verified credentials */}
            {/* {credentials.length > 0 && (
              <section>
                <SectionLabel>Verified Credentials</SectionLabel>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  {credentials.map((c) => (
                    <div
                      key={c.title}
                      className="flex gap-3 rounded-xl border border-border-subtle bg-surface-card p-4 shadow-warm-sm"
                    >
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border-subtle bg-surface-bg text-ink">
                        <c.icon className="h-5 w-5" />
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-ink">
                          {c.title}
                        </p>
                        {c.sub && (
                          <p className="mt-0.5 text-xs text-muted">{c.sub}</p>
                        )}
                        {approved && (
                          <p className="mt-2 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-olive">
                            <IconCheckCircle className="h-3.5 w-3.5" />{" "}
                            {c.verified}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )} */}

            {tutor.tutorProfile.certificates.length > 0 && (
              <section>
                <SectionLabel>Verified Credentials</SectionLabel>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  {tutor.tutorProfile.certificates.map((c, index) => (
                    <a
                      key={index}
                      href={c}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-start gap-3.5 rounded-xl border border-border-subtle bg-surface-card p-4 shadow-warm-sm transition-all hover:border-brand-primary/40 hover:shadow-md"
                    >
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-border-subtle bg-surface-bg text-brand-primary transition-colors group-hover:bg-brand-primary/5">
                        <IconDoc className="h-5 w-5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-semibold text-ink transition-colors group-hover:text-brand-primary">
                            Certificate #{index + 1}
                          </p>
                          {/* External link icon instead of text */}
                          <span className="text-muted transition-colors group-hover:text-brand-primary">
                            <svg
                              className="h-4 w-4"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth={2}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                              <polyline points="15 3 21 3 21 9" />
                              <line x1="10" y1="14" x2="21" y2="3" />
                            </svg>
                          </span>
                        </div>
                        <div className="mt-2 flex items-center gap-1.5">
                          <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-olive/10 text-olive">
                            <svg
                              className="h-3 w-3"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth={3}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          </span>
                          <p className="text-[11px] font-bold uppercase tracking-wider text-olive">
                            Verified by admin
                          </p>
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              </section>
            )}

            {/* Reviews */}
            <section>
              <div className="flex items-center justify-between gap-4">
                <SectionLabel>Student Reviews</SectionLabel>
                {reviews.length > 2 && (
                  <button
                    onClick={() => setShowAllReviews((v) => !v)}
                    className="text-xs font-bold uppercase tracking-wider text-slate-blue hover:underline"
                  >
                    {showAllReviews ? "Show less" : "View all"}
                  </button>
                )}
              </div>
              {reviews.length === 0 ? (
                <div className="mt-4 rounded-xl border border-border-subtle bg-surface-card p-8 text-center">
                  <p className="text-sm text-muted">
                    No reviews yet — be the first to book a session and leave
                    one.
                  </p>
                </div>
              ) : (
                <ul className="mt-4 divide-y divide-border-subtle">
                  {visibleReviews.map((r) => (
                    <ReviewRow key={r.id} review={r} />
                  ))}
                </ul>
              )}
            </section>
          </div>
        </div>

        {/* ══ RIGHT COLUMN: BOOKING WIDGET ══ */}
        <aside className="space-y-4 lg:sticky lg:top-6">
          {isOwn ? (
            <div className="rounded-xl border border-border-subtle bg-surface-card p-6 text-center shadow-warm-sm">
              <p className="text-sm text-muted">
                You're viewing your own public profile.
              </p>
              <Link
                to="/tutor-profile"
                className="mt-4 inline-block rounded-lg bg-brand-primary px-4 py-2 text-sm font-semibold text-white hover:bg-brand-primary-hover"
              >
                Edit profile
              </Link>
            </div>
          ) : bookResult?.ok ? (
            <div className="rounded-xl border border-border-subtle bg-surface-card p-6 text-center shadow-warm-sm">
              <IconCheckCircle className="mx-auto h-10 w-10 text-olive" />
              <h3 className="mt-3 font-serif text-lg font-semibold text-ink">
                Request sent!
              </h3>
              <p className="mt-1 text-sm text-muted">{bookResult.message}</p>
              <div className="mt-4 flex flex-col gap-2">
                <Link
                  to="/sessions"
                  className="rounded-lg bg-brand-primary px-4 py-2 text-sm font-semibold text-white hover:bg-brand-primary-hover"
                >
                  View my sessions
                </Link>
                <button
                  onClick={() => setBookResult(null)}
                  className="rounded-lg px-4 py-2 text-sm font-semibold text-brand-primary hover:bg-brand-primary/5"
                >
                  Book another slot
                </button>
              </div>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-border-subtle bg-surface-card shadow-warm-sm">
              <div className="p-5">
                {/* Price */}
                <div className="flex items-baseline justify-between gap-2">
                  <p className="text-3xl font-bold text-ink">${p.hourlyRate}</p>
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted">
                    / hour
                  </span>
                </div>
                <div className="mt-3 flex items-center gap-2 border-b border-border-subtle pb-4">
                  <span className="h-3.5 w-1 bg-slate-blue" />
                  <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-ink">
                    Schedule appointment
                  </span>
                </div>

                {/* Calendar */}
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-sm font-bold uppercase tracking-wider text-ink">
                    {new Date(
                      monthCursor.y,
                      monthCursor.m,
                      1,
                    ).toLocaleDateString("en-US", {
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                  <div className="flex gap-1">
                    <button
                      onClick={() => shiftMonth(-1)}
                      disabled={!canPrev}
                      aria-label="Previous month"
                      className="flex h-7 w-7 items-center justify-center rounded-md border border-border-subtle text-muted hover:text-ink disabled:opacity-40"
                    >
                      <IconChevL className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => shiftMonth(1)}
                      disabled={!canNext}
                      aria-label="Next month"
                      className="flex h-7 w-7 items-center justify-center rounded-md border border-border-subtle text-muted hover:text-ink disabled:opacity-40"
                    >
                      <IconChevR className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-7 gap-1 text-center">
                  {WEEKDAYS.map((d) => (
                    <span
                      key={d}
                      className="text-[10px] font-bold uppercase tracking-wider text-muted"
                    >
                      {d}
                    </span>
                  ))}
                  {calendarCells.map((d, i) =>
                    d === null ? (
                      <span key={`b-${i}`} />
                    ) : (
                      <button
                        key={dayKey(d)}
                        disabled={
                          d <
                            new Date(
                              now.getFullYear(),
                              now.getMonth(),
                              now.getDate(),
                            ) || !slotsByDay.has(dayKey(d))
                        }
                        onClick={() => pickDay(d)}
                        className={`relative mx-auto flex h-9 w-9 items-center justify-center rounded-lg text-sm font-semibold disabled:cursor-not-allowed disabled:text-muted/40 ${
                          selectedDay && sameDay(d, selectedDay)
                            ? "bg-brand-primary text-white shadow-warm-sm"
                            : "text-ink hover:bg-brand-primary/10 disabled:hover:bg-transparent"
                        }`}
                      >
                        {d.getDate()}
                        {slotsByDay.has(dayKey(d)) && (
                          <span
                            className={`absolute bottom-1 h-1 w-1 rounded-full ${
                              selectedDay && sameDay(d, selectedDay)
                                ? "bg-white"
                                : "bg-olive"
                            }`}
                          />
                        )}
                      </button>
                    ),
                  )}
                </div>

                {/* Slots */}
                <p className="mt-5 text-[11px] font-bold uppercase tracking-wider text-muted">
                  {selectedDay
                    ? `Available slots for ${selectedDay.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
                    : "Available slots"}
                </p>
                {daySlots.length === 0 ? (
                  <p className="mt-2 rounded-lg border border-dashed border-border-subtle p-3 text-xs italic text-muted">
                    No open slots on this day — pick another date.
                  </p>
                ) : (
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    {daySlots.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => setSelectedSlotId(s.id)}
                        aria-pressed={s.id === selectedSlotId}
                        className={`rounded-lg border px-3 py-2.5 text-xs font-bold tracking-wider transition-colors ${
                          s.id === selectedSlotId
                            ? "border-brand-primary bg-brand-primary/5 text-brand-primary"
                            : "border-border-subtle bg-surface-card text-ink hover:border-brand-primary/40"
                        }`}
                      >
                        {fmtTime(s.startTime)}
                      </button>
                    ))}
                  </div>
                )}

                {/* Session type */}
                <label className="mt-5 block text-[11px] font-bold uppercase tracking-wider text-muted">
                  Session type
                  <select
                    value={sessionType}
                    onChange={(e) =>
                      setSessionType(e.target.value as SessionType)
                    }
                    className="mt-1.5 w-full rounded-lg border border-border-subtle bg-surface-card px-3 py-2.5 text-xs font-bold uppercase tracking-wide text-ink focus:border-slate-blue focus:outline-none"
                  >
                    <option value="ONLINE">Online (Google Meet)</option>
                    <option value="IN_PERSON">In-person (study hub)</option>
                  </select>
                </label>

                {/* Subject */}
                <label className="mt-4 block text-[11px] font-bold uppercase tracking-wider text-muted">
                  Subject
                  <select
                    value={subjectId}
                    onChange={(e) => setSubjectId(e.target.value)}
                    className="mt-1.5 w-full rounded-lg border border-border-subtle bg-surface-card px-3 py-2.5 text-xs font-bold uppercase tracking-wide text-ink focus:border-slate-blue focus:outline-none"
                  >
                    {tutor.tutorSubjects.map((ts) => (
                      <option key={ts.subjectId} value={ts.subjectId}>
                        {ts.subject.name}
                      </option>
                    ))}
                  </select>
                </label>

                {/* Notes → Booking.notes */}
                <label className="mt-4 block text-[11px] font-bold uppercase tracking-wider text-muted">
                  Note to tutor (optional)
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                    placeholder="What do you want to work on?"
                    className="mt-1.5 w-full resize-none rounded-lg border border-border-subtle bg-surface-card px-3 py-2.5 text-sm font-normal normal-case tracking-normal text-ink focus:border-slate-blue focus:outline-none"
                  />
                </label>
              </div>

              {/* Book CTA */}
              <div className="border-t border-border-subtle bg-surface-bg p-5">
                <button
                  onClick={handleBook}
                  disabled={!selectedSlot || !subjectId || submitting}
                  className="w-full rounded-lg bg-brand-primary px-4 py-3 text-xs font-bold uppercase tracking-[0.2em] text-white shadow-warm transition-colors hover:bg-brand-primary-hover disabled:opacity-50"
                >
                  {submitting ? "Sending request…" : "Book now"}
                </button>
                {bookResult && !bookResult.ok && (
                  <p
                    role="alert"
                    className="mt-2 text-center text-xs font-semibold text-error"
                  >
                    {bookResult.message}
                  </p>
                )}
                <p className="mt-3 text-center text-[10px] font-bold uppercase tracking-widest text-muted">
                  No payment required yet
                </p>
              </div>
            </div>
          )}

          {/* Safety guarantee */}
          {!isOwn && (
            <div className="flex gap-3 rounded-xl border border-border-subtle bg-surface-card p-4 shadow-warm-sm">
              <IconShield className="h-5 w-5 shrink-0 text-slate-blue" />
              <p className="text-xs leading-5 text-muted">
                <span className="font-bold uppercase tracking-wider text-ink">
                  Safety guarantee:
                </span>{" "}
                Your funds are held securely and only released to {firstName}{" "}
                after you confirm the session was completed.
              </p>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

export default TutorProfilePage;
