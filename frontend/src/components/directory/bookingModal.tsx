/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
import { useCallback, useEffect, useMemo, useState } from "react";
import type { TutorListItem } from "../../types/tutor";
import type { AvailabilitySlot } from "../../types/availabilitySlot";
import { getTutorAvailability } from "../../api/availabilityAPI";
import { createBooking } from "../../api/bookingAPI";
import {
  addDays,
  dayKey,
  formatDuration,
  formatTime,
  groupSlotsByDay,
  startOfWeek,
  weekRangeLabel,
} from "../../lib/booking/schedule";

/* ---------- inline icons ---------- */
const IconChevronLeft = () => (
  <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden="true">
    <path d="M12.5 15 7.5 10l5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const IconChevronRight = () => (
  <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden="true">
    <path d="m7.5 15 5-5-5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const IconClose = () => (
  <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden="true">
    <path d="m5 5 10 10M15 5 5 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);
const IconCheck = () => (
  <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7" aria-hidden="true">
    <path d="m5 13 4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

interface BookingModalProps {
  tutor: TutorListItem;
  onClose: () => void;
}

export function BookingModal({ tutor, onClose }: BookingModalProps) {
  const profile = tutor.tutorProfile!;
  const currentWeekStart = useMemo(() => startOfWeek(new Date()), []);

  const [weekStart, setWeekStart] = useState<Date>(currentWeekStart);
  const weekEnd = useMemo(() => addDays(weekStart, 7), [weekStart]);

  const [slots, setSlots] = useState<AvailabilitySlot[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<AvailabilitySlot | null>(null);
  const [subjectId, setSubjectId] = useState<string>(
    tutor.tutorSubjects[0]?.subjectId ?? ""
  );
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  /* ----- load slots whenever the visible week changes ----- */
  const loadSlots = useCallback(async () => {
    setSlots(null);
    setLoadError(null);
    const now = Date.now();
    try {
      const data = await getTutorAvailability(
        tutor.id,
        weekStart.toISOString(),
        weekEnd.toISOString()
      );
      setSlots(
        data.filter((s) => !s.isBooked && new Date(s.startTime).getTime() > now)
      );
    } catch {
      // Fallback: the directory payload may already embed availability slots
      const embedded =
        (tutor as { availability?: AvailabilitySlot[] }).availability ?? [];
      const inWeek = embedded.filter(
        (s) =>
          !s.isBooked &&
          new Date(s.startTime) >= weekStart &&
          new Date(s.startTime) < weekEnd &&
          new Date(s.startTime).getTime() > now
      );
      if (inWeek.length) setSlots(inWeek);
      else setLoadError("We couldn't load this tutor's availability. Please try again.");
    }
  }, [tutor, weekStart, weekEnd]);

  useEffect(() => {
    loadSlots();
  }, [loadSlots]);

  // Reset selection when navigating weeks
  useEffect(() => {
    setSelectedSlot(null);
    setSubmitError(null);
  }, [weekStart]);

  // Esc to close + lock body scroll
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const days = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart]
  );
  const slotsByDay = useMemo(() => groupSlotsByDay(slots ?? []), [slots]);
  const subjectName = tutor.tutorSubjects.find(
    (ts) => ts.subjectId === subjectId
  )?.subject.name;
  const canBook = !!selectedSlot && !!subjectId && !submitting;

  const changeWeek = (dir: 1 | -1) => setWeekStart((w) => addDays(w, dir * 7));

  /* ----- book the selected slot ----- */
  const handleBook = async () => {
    if (!canBook || !selectedSlot) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      await createBooking({
        subjectId,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        availabilitySlotId: selectedSlot.id,
        totalPrice: profile.hourlyRate,
        notes: notes.trim() ? notes.trim() : undefined,
      });
      setConfirmed(true);
    } catch (err: any) {
      const status = err?.response?.status;
      const serverMsg = err?.response?.data?.error;
      if (status === 401 || status === 403) {
        setSubmitError("You must be signed in as a student to book a session.");
      } else {
        setSubmitError(serverMsg || "Something went wrong while booking this slot.");
      }
      setSelectedSlot(null);
      loadSlots(); // refresh: the slot may have been taken by someone else
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label="Select a time"
    >
      <div
        className="absolute inset-0 bg-ink/40 backdrop-blur-[2px]"
        onClick={onClose}
      />

      <div className="relative flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-border-subtle bg-surface-card shadow-warm">
        {confirmed ? (
          /* ---------- SUCCESS VIEW ---------- */
          <div className="flex flex-col items-center gap-4 px-8 py-14 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-olive/10 text-olive">
              <IconCheck />
            </span>
            <h2 className="font-serif text-2xl font-semibold text-ink">
              Session requested!
            </h2>
            <p className="max-w-md text-sm leading-relaxed text-muted">
              Your {subjectName ? `${subjectName} ` : ""}session with{" "}
              {tutor.firstName} {tutor.lastName} on{" "}
              <span className="font-semibold text-ink">
                {selectedSlot &&
                  new Date(selectedSlot.startTime).toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                  })}
              </span>{" "}
              {selectedSlot &&
                `(${formatTime(selectedSlot.startTime)} – ${formatTime(selectedSlot.endTime)})`}{" "}
              is now pending confirmation. Track it from your Sessions page.
            </p>
            <div className="mt-2 flex flex-wrap justify-center gap-3">
              <button
                onClick={onClose}
                className="rounded-lg bg-brand-primary px-5 py-2.5 text-sm font-semibold text-white shadow-warm-sm transition-colors hover:bg-brand-primary-hover"
              >
                Done
              </button>
              <button
                onClick={() => {
                  setConfirmed(false);
                  loadSlots();
                }}
                className="rounded-lg px-5 py-2.5 text-sm font-semibold text-brand-primary transition-colors hover:bg-brand-primary/5"
              >
                Book another time
              </button>
            </div>
          </div>
        ) : (
          /* ---------- MAIN VIEW (the sketch) ---------- */
          <>
            <header className="flex flex-wrap items-center justify-between gap-4 px-6 pb-5 pt-6 sm:px-8">
              <div>
                <h2 className="font-serif text-2xl font-semibold text-ink">
                  Select a Time
                </h2>
                <p className="mt-1 text-sm text-muted">
                  {tutor.firstName} {tutor.lastName} · ${profile.hourlyRate}/hr
                </p>
              </div>

              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  type="button"
                  onClick={() => changeWeek(-1)}
                  disabled={weekStart.getTime() <= currentWeekStart.getTime()}
                  aria-label="Previous week"
                  className="flex h-11 w-11 items-center justify-center rounded-lg border border-border-subtle bg-surface-card text-ink transition-colors hover:bg-surface-bg disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <IconChevronLeft />
                </button>
                <span className="min-w-[9rem] text-center text-sm font-bold text-ink sm:min-w-[10rem]">
                  {weekRangeLabel(weekStart)}
                </span>
                <button
                  type="button"
                  onClick={() => changeWeek(1)}
                  aria-label="Next week"
                  className="flex h-11 w-11 items-center justify-center rounded-lg border border-border-subtle bg-surface-card text-ink transition-colors hover:bg-surface-bg"
                >
                  <IconChevronRight />
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close"
                  className="ml-1 flex h-11 w-11 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface-bg hover:text-ink"
                >
                  <IconClose />
                </button>
              </div>
            </header>

            <div className="border-t border-border-subtle" />

            {/* ----- week grid ----- */}
            <div className="overflow-y-auto px-6 py-6 sm:px-8">
              {loadError ? (
                <div className="flex flex-col items-center gap-3 py-10 text-center">
                  <p className="text-sm text-muted">{loadError}</p>
                  <button
                    onClick={loadSlots}
                    className="rounded-lg border border-border-subtle px-4 py-2 text-sm font-semibold text-ink hover:bg-surface-bg"
                  >
                    Retry
                  </button>
                </div>
              ) : slots === null ? (
                <p className="py-16 text-center text-sm text-muted">
                  Loading availability…
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <div className="grid min-w-[640px] grid-cols-7 gap-2 sm:gap-3">
                    {days.map((day) => {
                      const daySlots = slotsByDay.get(dayKey(day)) ?? [];
                      return (
                        <div key={dayKey(day)} className="flex flex-col gap-2">
                          <div className="mb-1 text-center">
                            <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                              {day.toLocaleDateString("en-US", { weekday: "short" })}
                            </p>
                            <p className="text-sm font-bold text-ink">
                              {day.getDate()}
                            </p>
                          </div>

                          {daySlots.length === 0 ? (
                            <p className="py-2.5 text-center text-xs text-muted/60">
                              Unavailable
                            </p>
                          ) : (
                            daySlots.map((slot) => {
                              const isSelected = selectedSlot?.id === slot.id;
                              return (
                                <button
                                  key={slot.id}
                                  type="button"
                                  onClick={() =>
                                    setSelectedSlot(isSelected ? null : slot)
                                  }
                                  aria-pressed={isSelected}
                                  className={
                                    isSelected
                                      ? "rounded-lg border border-brand-primary bg-brand-primary px-1 py-2.5 text-xs font-bold text-white shadow-warm-sm"
                                      : "rounded-lg border border-border-subtle bg-surface-bg px-1 py-2.5 text-xs font-semibold text-ink transition-colors hover:border-brand-primary hover:text-brand-primary"
                                  }
                                >
                                  {formatTime(slot.startTime)}
                                </button>
                              );
                            })
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* ----- summary bar + book button ----- */}
            <footer className="border-t border-border-subtle px-6 pb-6 pt-4 sm:px-8">
              <div className="flex flex-col gap-3 rounded-xl bg-slate-blue/10 px-4 py-4 sm:px-5">
                <input
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={`Add a note for ${tutor.firstName} (optional)`}
                  className="w-full rounded-lg border border-border-subtle bg-surface-card px-3 py-2 text-sm text-ink placeholder:text-muted/70 focus:outline-none focus:ring-1 focus:ring-brand-primary"
                />

                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="min-w-0">
                    {selectedSlot ? (
                      <>
                        <p className="text-sm font-bold text-ink">
                          Selected:{" "}
                          {new Date(selectedSlot.startTime).toLocaleDateString(
                            "en-US",
                            { weekday: "short", month: "short", day: "2-digit" }
                          )}
                        </p>
                        <p className="text-sm font-medium text-slate-blue">
                          {formatTime(selectedSlot.startTime)} -{" "}
                          {formatTime(selectedSlot.endTime)} (
                          {formatDuration(selectedSlot.startTime, selectedSlot.endTime)})
                        </p>
                      </>
                    ) : (
                      <p className="text-sm text-muted">
                        Select an available slot above to continue.
                      </p>
                    )}
                    {submitError && (
                      <p className="mt-1.5 text-xs font-semibold text-burgundy">
                        {submitError}{" "}
                        {submitError.includes("signed in") && (
                          <a href="/login" className="underline underline-offset-2">
                            Sign in
                          </a>
                        )}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    {tutor.tutorSubjects.length > 1 && (
                      <select
                        value={subjectId}
                        onChange={(e) => setSubjectId(e.target.value)}
                        aria-label="Subject"
                        className="rounded-lg border border-border-subtle bg-surface-card px-3 py-2.5 text-sm font-semibold text-ink focus:outline-none focus:ring-1 focus:ring-brand-primary"
                      >
                        {tutor.tutorSubjects.map((ts) => (
                          <option key={ts.subjectId} value={ts.subjectId}>
                            {ts.subject.name}
                          </option>
                        ))}
                      </select>
                    )}
                    <button
                      type="button"
                      onClick={handleBook}
                      disabled={!canBook}
                      className="rounded-lg bg-brand-primary px-6 py-2.5 text-sm font-bold text-white shadow-warm-sm transition-colors hover:bg-brand-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {submitting ? "Booking…" : `Book Now • $${profile.hourlyRate}`}
                    </button>
                  </div>
                </div>
              </div>
            </footer>
          </>
        )}
      </div>
    </div>
  );
}