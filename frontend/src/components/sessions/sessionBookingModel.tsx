/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  MapPin,
  Star,
  X,
} from "lucide-react";
import * as availabilityAPI from "../../api/availabilityAPI";
import { createBooking } from "../../api/bookingAPI";
import type { CreateBookingPayload, OpenSlot } from "../../types";

/* ── date / format helpers ─────────────────────────────────────────────── */
const MONTHS = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"];
const MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]; // sketch 1 order

function startOfWeek(base: Date): Date {
  const d = new Date(base);
  const offset = (d.getDay() + 6) % 7; // Monday = 0
  d.setDate(d.getDate() - offset);
  d.setHours(0, 0, 0, 0);
  return d;
}
const addDays = (d: Date, n: number): Date => {
  const c = new Date(d);
  c.setDate(c.getDate() + n);
  return c;
};
const dateKey = (d: Date): string =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

const fmtTime = (iso: string): string =>
  new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true });

const slotHours = (s: OpenSlot): number =>
  Math.max((new Date(s.endTime).getTime() - new Date(s.startTime).getTime()) / 3_600_000, 0);

const slotPrice = (s: OpenSlot): number =>
  Math.round((s.tutor.tutorProfile?.hourlyRate ?? 0) * slotHours(s) * 100) / 100;

const durationLabel = (s: OpenSlot): string => {
  const h = slotHours(s);
  const label = Number.isInteger(h) ? `${h}` : h.toFixed(1);
  return `${label} ${h === 1 ? "Hour" : "Hours"}`;
};

const weekLabel = (weekStart: Date): string => {
  const end = addDays(weekStart, 6);
  return weekStart.getMonth() === end.getMonth()
    ? `${MONTHS[weekStart.getMonth()]} ${weekStart.getDate()} - ${end.getDate()}`
    : `${MONTHS_SHORT[weekStart.getMonth()]} ${weekStart.getDate()} - ${MONTHS_SHORT[end.getMonth()]} ${end.getDate()}`;
};

const tutorName = (s: OpenSlot): string =>
  [s.tutor.firstName, s.tutor.lastName].filter(Boolean).join(" ") || s.tutor.email;

const tutorInitials = (s: OpenSlot): string =>
  `${s.tutor.firstName?.[0] ?? ""}${s.tutor.lastName?.[0] ?? ""}`.toUpperCase() || "?";

const shortDate = (iso: string): string => {
  const d = new Date(iso);
  return `${WEEKDAYS[(d.getDay() + 6) % 7]}, ${MONTHS_SHORT[d.getMonth()]} ${d.getDate()}`;
};
const longDate = (iso: string): string =>
  new Date(iso).toLocaleDateString([], { weekday: "long", month: "long", day: "numeric", year: "numeric" });

/* ── component ─────────────────────────────────────────────────────────── */
type Step = "select" | "confirm" | "success";

interface BookingModalProps {
  onClose: () => void;
  onBooked: () => void; // refresh the sessions list behind the modal
}

export function BookingModal({ onClose, onBooked }: BookingModalProps) {
  const [step, setStep] = useState<Step>("select");
  const [weekStart, setWeekStart] = useState<Date>(() => startOfWeek(new Date()));
  const [slots, setSlots] = useState<OpenSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [tutorFilter, setTutorFilter] = useState<"all" | string>("all");
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [subjectId, setSubjectId] = useState("");
  const [notes, setNotes] = useState("");
  const [isBooking, setIsBooking] = useState(false);

  /* load the week's open slots */
  useEffect(() => {
    let alive = true;
    setLoading(true);
    setSelectedSlotId(null);
    setSubjectId("");

    availabilityAPI
      .getOpenSlots(weekStart.toISOString(), addDays(weekStart, 7).toISOString())
      .then((data) => alive && setSlots(data))
      .catch((err) => {
        if (!alive) return;
        if (axios.isAxiosError<{ error?: string; message?: string }>(err)) {
          toast.error(
            err.response?.data?.error ||
              err.response?.data?.message ||
              `Could not load available slots (${err.response?.status ?? "network error"})`,
          );
        } else {
          toast.error(err instanceof Error ? err.message : "Could not load available slots");
        }
      })
      .finally(() => alive && setLoading(false));

    return () => {
      alive = false;
    };
  }, [weekStart]);

  /* esc to close + scroll lock */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const tutorOptions = useMemo(() => {
    const map = new Map<string, string>();
    slots.forEach((s) => map.set(s.tutorId, tutorName(s)));
    return [...map.entries()].map(([id, name]) => ({ id, name }));
  }, [slots]);

  const filteredSlots = useMemo(
    () => (tutorFilter === "all" ? slots : slots.filter((s) => s.tutorId === tutorFilter)),
    [slots, tutorFilter],
  );

  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart]);

  const slotsByDay = useMemo(
    () =>
      filteredSlots.reduce<Record<string, OpenSlot[]>>((acc, slot) => {
        const key = dateKey(new Date(slot.startTime));
        acc[key] = [...(acc[key] ?? []), slot];
        return acc;
      }, {}),
    [filteredSlots],
  );

  const selectedSlot = useMemo(
    () => slots.find((s) => s.id === selectedSlotId) ?? null,
    [slots, selectedSlotId],
  );
  const tutorSubjects = selectedSlot?.tutor.tutorSubjects.map((ts) => ts.subject) ?? [];
  const price = selectedSlot ? slotPrice(selectedSlot) : 0;
  const canGoPrev = weekStart.getTime() > startOfWeek(new Date()).getTime();

  const selectSlot = (slot: OpenSlot) => {
    setSelectedSlotId(slot.id);
    setSubjectId(""); // subject list changes per tutor
  };

  const confirmBooking = async () => {
    if (!selectedSlot || !subjectId || isBooking) return;
    setIsBooking(true);
    try {
      const payload: CreateBookingPayload = {
        subjectId,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        availabilitySlotId: selectedSlot.id,
        notes: notes.trim() || undefined,
      };
      await createBooking(payload);
      setStep("success");
      onBooked();
    } catch (err) {
      if (axios.isAxiosError<{ error?: string }>(err) && err.response?.status === 409) {
        toast.error(err.response.data.error || "This slot was just booked by someone else.");
        setStep("select");
        setSelectedSlotId(null);
        // reload the week so the taken slot disappears
        availabilityAPI
          .getOpenSlots(weekStart.toISOString(), addDays(weekStart, 7).toISOString())
          .then(setSlots)
          .catch(() => undefined);
      } else {
        toast.error(
          axios.isAxiosError<{ error?: string }>(err)
            ? err.response?.data?.error || "Booking failed"
            : "Booking failed",
        );
      }
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-md border border-border-subtle bg-surface-card shadow-2xl">
        {/* header */}
        <div className="flex items-center justify-between border-b border-border-subtle px-6 py-4">
          <div>
            <h2 className="font-serif text-xl font-semibold text-ink">Book a Session</h2>
            <p className="mt-0.5 text-xs text-muted">
              {step === "select" && "Step 1 of 2 — choose an open slot, then review the details."}
              {step === "confirm" && "Step 2 of 2 — confirm your booking details."}
              {step === "success" && "All set."}
            </p>
          </div>
          <button type="button" onClick={onClose} className="rounded-sm p-1.5 text-muted hover:bg-surface-bg hover:text-ink">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* ── STEP: SELECT (sketch 1 week grid + sketch 2 details panel) ── */}
        {step === "select" && (
          <>
            <div className="flex min-h-0 flex-1">
              {/* week grid */}
              <div className="flex min-w-0 flex-1 flex-col gap-4 overflow-y-auto p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-medium text-muted" htmlFor="tutor-filter">Tutor</label>
                    <select
                      id="tutor-filter"
                      value={tutorFilter}
                      onChange={(e) => { setTutorFilter(e.target.value); setSelectedSlotId(null); setSubjectId(""); }}
                      className="rounded-sm border border-border-subtle bg-surface-card px-2 py-1.5 text-xs text-ink focus:border-ink focus:outline-none"
                    >
                      <option value="all">All tutors</option>
                      {tutorOptions.map((t) => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                    <span className="text-xs text-muted">
                      {loading ? "Loading…" : `${filteredSlots.length} open slot${filteredSlots.length === 1 ? "" : "s"} this week`}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={!canGoPrev}
                      onClick={() => setWeekStart((w) => addDays(w, -7))}
                      className="rounded-sm border border-border-subtle p-2 text-ink hover:bg-surface-bg disabled:opacity-40"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <span className="min-w-36 text-center text-sm font-semibold text-ink">
                      {weekLabel(weekStart)}
                    </span>
                    <button
                      type="button"
                      onClick={() => setWeekStart((w) => addDays(w, 7))}
                      className="rounded-sm border border-border-subtle p-2 text-ink hover:bg-surface-bg"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-7 gap-2">
                  {days.map((day, i) => {
                    const key = dateKey(day);
                    const daySlots = slotsByDay[key] ?? [];
                    return (
                      <div key={key} className="flex flex-col">
                        <div className="pb-2 text-center">
                          <div className="text-xs font-medium text-muted">{WEEKDAYS[i]}</div>
                          <div className="text-sm font-semibold text-ink">{day.getDate()}</div>
                        </div>
                        <div className="flex flex-col gap-2">
                          {daySlots.length === 0 ? (
                            <span className="py-2 text-center text-[11px] text-muted/60">Unavailable</span>
                          ) : (
                            daySlots.map((slot) => {
                              const selected = slot.id === selectedSlotId;
                              return (
                                <button
                                  key={slot.id}
                                  type="button"
                                  aria-pressed={selected}
                                  onClick={() => selectSlot(slot)}
                                  className={`rounded-sm border px-1.5 py-2 text-center transition ${
                                    selected
                                      ? "border-ink bg-ink text-white shadow-md"
                                      : "border-border-subtle bg-surface-card text-ink hover:border-ink/50 hover:shadow-sm"
                                  }`}
                                >
                                  <span className="block text-xs font-semibold">{fmtTime(slot.startTime)}</span>
                                  <span className={`block truncate text-[10px] ${selected ? "text-white/70" : "text-muted"}`}>
                                    {tutorName(slot).split(" ")[0]}
                                  </span>
                                </button>
                              );
                            })
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* details panel (sketch 2 sidebar) */}
              <aside className="flex w-80 shrink-0 flex-col gap-4 overflow-y-auto border-l border-border-subtle bg-surface-bg p-5">
                {selectedSlot ? (
                  <>
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ink text-sm font-semibold text-white">
                        {tutorInitials(selectedSlot)}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-ink">{tutorName(selectedSlot)}</p>
                        <p className="truncate text-xs text-muted">
                          {selectedSlot.tutor.tutorProfile?.headline || "Tutor"}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2.5 text-sm text-muted">
                      <div className="flex items-center gap-2">
                        <Clock3 className="h-4 w-4 shrink-0" />
                        <span>{fmtTime(selectedSlot.startTime)} - {fmtTime(selectedSlot.endTime)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CalendarDays className="h-4 w-4 shrink-0" />
                        <span>{longDate(selectedSlot.startTime)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 shrink-0" />
                        <span>Remote</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 shrink-0 text-burgundy" />
                        <span>
                          {selectedSlot.tutor.tutorProfile?.averageRating?.toFixed(1) ?? "New"}
                          {" "}({selectedSlot.tutor.tutorProfile?.reviewCount ?? 0} reviews)
                        </span>
                      </div>
                    </div>

                    <label className="text-xs font-medium text-ink">
                      Subject
                      <select
                        value={subjectId}
                        onChange={(e) => setSubjectId(e.target.value)}
                        className="mt-1 w-full rounded-sm border border-border-subtle bg-surface-card px-2.5 py-2 text-xs text-ink focus:border-ink focus:outline-none"
                      >
                        <option value="">Select a subject</option>
                        {tutorSubjects.map((sub) => (
                          <option key={sub.id} value={sub.id}>{sub.name}</option>
                        ))}
                      </select>
                    </label>

                    <label className="text-xs font-medium text-ink">
                      Notes <span className="font-normal text-muted">(optional)</span>
                      <textarea
                        rows={3}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="What would you like to work on?"
                        className="mt-1 w-full rounded-sm border border-border-subtle bg-surface-card p-2 text-xs text-ink focus:border-ink focus:outline-none"
                      />
                    </label>
                  </>
                ) : (
                  <div className="flex flex-1 items-center justify-center px-4 text-center text-xs text-muted">
                    Select an available time slot on the left to view its details and book it.
                  </div>
                )}
              </aside>
            </div>

            {/* summary / price bar (sketch 1 bottom bar) */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border-subtle bg-surface-bg px-6 py-4">
              <div>
                <p className="text-sm font-semibold text-ink">
                  {selectedSlot ? `Selected: ${shortDate(selectedSlot.startTime)}` : "No slot selected"}
                </p>
                <p className="text-sm text-muted">
                  {selectedSlot
                    ? `${fmtTime(selectedSlot.startTime)} - ${fmtTime(selectedSlot.endTime)} (${durationLabel(selectedSlot)})`
                    : "Pick a time from the week grid above."}
                </p>
              </div>
              <button
                type="button"
                disabled={!selectedSlot || !subjectId}
                onClick={() => setStep("confirm")}
                className="rounded-sm bg-ink px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-ink/90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Book Now • ${price.toFixed(0)}
              </button>
            </div>
          </>
        )}

        {/* ── STEP: CONFIRM ── */}
        {step === "confirm" && selectedSlot && (
          <div className="overflow-y-auto p-6">
            <div className="mx-auto flex max-w-lg flex-col gap-4 rounded-md border border-border-subtle bg-surface-bg p-6">
              <h3 className="font-serif text-lg font-semibold text-ink">Confirm your booking</h3>

              <dl className="flex flex-col gap-2.5 text-sm">
                {[
                  ["Tutor", tutorName(selectedSlot)],
                  ["Subject", tutorSubjects.find((s) => s.id === subjectId)?.name ?? "—"],
                  ["Date", longDate(selectedSlot.startTime)],
                  ["Time", `${fmtTime(selectedSlot.startTime)} - ${fmtTime(selectedSlot.endTime)} (${durationLabel(selectedSlot)})`],
                  ["Mode", "Remote"],
                  ["Rate", `$${selectedSlot.tutor.tutorProfile?.hourlyRate?.toFixed(0) ?? 0}/hr × ${slotHours(selectedSlot)} hr`],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between gap-4">
                    <dt className="text-muted">{label}</dt>
                    <dd className="text-right font-medium text-ink">{value}</dd>
                  </div>
                ))}
                {notes.trim() && (
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted">Notes</dt>
                    <dd className="max-w-[60%] text-right text-xs text-ink">{notes}</dd>
                  </div>
                )}
              </dl>

              <p className="text-xs text-muted">
                The tutor will be notified and must confirm. You won't be charged until the session is confirmed.
              </p>

              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  disabled={isBooking}
                  onClick={() => setStep("select")}
                  className="flex-1 rounded-sm border border-border-subtle bg-surface-card px-4 py-2.5 text-sm font-medium text-ink hover:bg-surface-bg disabled:opacity-50"
                >
                  Back
                </button>
                <button
                  type="button"
                  disabled={isBooking}
                  onClick={confirmBooking}
                  className="flex-1 rounded-sm bg-ink px-4 py-2.5 text-sm font-semibold text-white hover:bg-ink/90 disabled:opacity-60"
                >
                  {isBooking ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Booking…
                    </span>
                  ) : (
                    `Confirm Booking • $${price.toFixed(0)}`
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── STEP: SUCCESS ── */}
        {step === "success" && selectedSlot && (
          <div className="flex flex-col items-center gap-3 px-6 py-14 text-center">
            <CheckCircle2 className="h-10 w-10 text-olive" />
            <h3 className="font-serif text-lg font-semibold text-ink">Booking requested!</h3>
            <p className="max-w-sm text-sm text-muted">
              Your {tutorSubjects.find((s) => s.id === subjectId)?.name} session with {tutorName(selectedSlot)} on{" "}
              {shortDate(selectedSlot.startTime)} at {fmtTime(selectedSlot.startTime)} is pending confirmation.
              Track it under Upcoming sessions.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-2 rounded-sm bg-ink px-6 py-2.5 text-sm font-semibold text-white hover:bg-ink/90"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}