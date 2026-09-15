import { useEffect, useMemo, useState, type FormEvent } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
  CalendarPlus,
  ChevronLeft,
  ChevronRight,
  Clock3,
  MapPin,
  Plus,
  UserRound,
  X,
  Award,
  BookOpen,
  Info,
} from "lucide-react";
import { api } from "../api/axios";
import * as availabilityAPI from "../api/availabilityAPI";
import { useAuth } from "../context/AuthContext";
import type {
  CalendarMode,
  CalendarEvent,
  AvailabilityForm,
  AvailabilitySlot,
  CreateAvailabilityPayload,
  CreateBookingPayload,
  Subject,
} from "../types";

// const toneClasses: Record<EventTone, string> = {
//   burgundy: "border-l-burgundy bg-burgundy/10 text-burgundy",
//   olive: "border-l-olive bg-olive/10 text-olive",
//   slate: "border-l-slate-blue bg-slate-blue/10 text-slate-blue",
// };

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function dateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function calendarDays(month: Date): Date[] {
  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
  const start = new Date(
    month.getFullYear(),
    month.getMonth(),
    1 - firstDay.getDay(),
  );
  return Array.from({ length: 42 }, (_, index) => {
    const day = new Date(start);
    day.setDate(start.getDate() + index);
    return day;
  });
}

function convert12to24(time12h: string): string {
  if (!time12h || !time12h.includes(" ")) return time12h;
  const [time, modifier] = time12h.split(" ");
  const [rawHours, minutes] = time.split(":");
  let hours = parseInt(rawHours, 10);

  if (modifier?.toUpperCase() === "PM" && hours < 12) {
    hours += 12;
  }
  if (modifier?.toUpperCase() === "AM" && hours === 12) {
    hours = 0;
  }

  return `${String(hours).padStart(2, "0")}:${minutes}`;
}

function toLocalISOString(dateStr: string, timeStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  const [hours, minutes] = timeStr.split(":").map(Number);
  const date = new Date(year, month - 1, day, hours, minutes);
  return date.toISOString();
}

function EventPill({
  event,
  onClick,
}: {
  event: CalendarEvent;
  onClick: () => void;
}) {
  const isBooked = event.status === "booked";

  return (
    <button
      type="button"
      onClick={(clickEvent) => {
        clickEvent.stopPropagation();
        onClick();
      }}
      className={`group w-full rounded-md border text-left text-xs transition-all shadow-warm-sm ${
        isBooked
          ? "border-border-subtle bg-surface-bg text-muted opacity-75"
          : "border-olive/30 bg-olive/10 text-olive hover:bg-olive/15 hover:border-olive/50"
      } p-1.5`}
    >
      <div className="flex items-center justify-between gap-1">
        <span className="flex items-center gap-1 font-semibold truncate">
          <Clock3 className="h-3 w-3 shrink-0 opacity-70" />
          {event.start}
        </span>
        {/* <span
          className={`rounded-xs px-1.5 py-0.2 text-[10px] font-bold uppercase tracking-wide ${
            isBooked
              ? "bg-border-subtle text-muted"
              : "bg-olive/20 text-olive"
          }`}
        >
          {isBooked ? "Booked" : "Open"}
        </span> */}
      </div>
      <div className="mt-1 flex items-center gap-1 truncate font-medium text-ink">
        <UserRound className="h-3 w-3 shrink-0 opacity-70" />
        <span className="truncate">{event.tutor}</span>
      </div>
    </button>
  );
}

const getAvailabilityData = async (): Promise<CalendarEvent[]> => {
  const slots: AvailabilitySlot[] = await availabilityAPI.getAvailableSlots();
  console.log("The available slots are", slots);
  const rawData = Array.isArray(slots) ? slots : [];

  return rawData.map((slot) => {
    const startObj = new Date(slot.startTime);
    const endObj = new Date(slot.endTime);

    const localYear = startObj.getFullYear();
    const localMonth = String(startObj.getMonth() + 1).padStart(2, "0");
    const localDay = String(startObj.getDate()).padStart(2, "0");
    const localDateStr = `${localYear}-${localMonth}-${localDay}`;

    const tutorObj = slot.tutor;
    const fullName =
      tutorObj?.firstName || tutorObj?.lastName
        ? [tutorObj.firstName, tutorObj.lastName].filter(Boolean).join(" ")
        : "";
    const tutorName = fullName || "Tutor";
    const tutorPrf = tutorObj?.tutorProfile;

    return {
      id: slot.id,
      tutorId: slot.tutorId || tutorObj?.id || "",
      startTime: slot.startTime,
      endTime: slot.endTime,
      date: localDateStr,
      start: startObj.toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }),
      end: endObj.toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }),
      title: tutorName !== "Tutor" ? tutorName : "Tutoring Session",
      tutor: tutorName,
      tutorProfile: tutorPrf,
      course: "General",
      mode: "Remote",
      tone: slot.isBooked ? "slate" : "olive",
      status: slot.isBooked ? "booked" : "available",
    };
  });
};

export function CalendarV2() {
  const { user, activeRole } = useAuth();
  const mode: CalendarMode = activeRole;

  const todayStr = useMemo(() => dateKey(new Date()), []);

  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isBooking, setIsBooking] = useState<boolean>(false);
  const [month, setMonth] = useState<Date>(() => new Date());
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null,
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState("");

  const [form, setForm] = useState<AvailabilityForm>({
    title: "",
    course: "",
    date: todayStr,
    start: "10:00",
    end: "11:00",
    mode: "Remote",
    // note: "",
  });

  const refreshSchedule = async (): Promise<void> => {
    setLoading(true);
    try {
      if (!user?.id) return;
      const mappedEvents = await getAvailabilityData();
      setEvents(mappedEvents);
    } catch (err: unknown) {
      console.error("Failed to refresh schedule:", err);
      toast.error(
        axios.isAxiosError<{ message?: string }>(err)
          ? err.response?.data?.message || "Operation failed"
          : "Operation failed",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isSubscribed = true;
    if (!user?.id) return;

    getAvailabilityData()
      .then((mappedEvents) => {
        if (isSubscribed) setEvents(mappedEvents);
      })
      .catch((err) => {
        if (isSubscribed) {
          console.error("Failed to load schedule:", err);
          toast.error(
            axios.isAxiosError<{ message?: string; error?: string }>(err)
              ? err.response?.data?.message ||
                  err.response?.data?.error ||
                  "Operation failed"
              : "Operation failed",
          );
        }
      });

    return () => {
      isSubscribed = false;
    };
  }, [month, user?.id]);

  // useEffect(() => {
  //   api.get<Subject[]>("/subjects")
  //     .then((response) => setSubjects(response.data))
  //     .catch((err: unknown) => {
  //       console.error("Failed to load subjects:", err);
  //       toast.error(
  //         axios.isAxiosError<{ message?: string; error?: string }>(err)
  //           ? err.response?.data?.message || err.response?.data?.error || "Operation failed"
  //           : "Operation failed",
  //       );
  //     });
  // }, []);

  useEffect(() => {
    if (!selectedEvent?.tutorId) {
      setSubjects([]); // Clear subjects if no slot is selected
      return;
    }

    // This automatically sends the tutorId as a query parameter to your /subjects route
    api
      .get<Subject[]>(`/subjects?tutorId=${selectedEvent.tutorId}`)
      .then((response) => {
        setSubjects(response.data);
      })
      .catch((err: unknown) => {
        console.error("Failed to load tutor subjects:", err);
        toast.error("Could not load subjects for this tutor.");
      });
  }, [selectedEvent?.tutorId]);

  const days = useMemo(() => calendarDays(month), [month]);

  const eventsByDate = useMemo(
    () =>
      events.reduce<Record<string, CalendarEvent[]>>((groups, event) => {
        groups[event.date] = [...(groups[event.date] ?? []), event];
        return groups;
      }, {}),
    [events],
  );

  const changeMonth = (offset: number): void =>
    setMonth(
      (current) =>
        new Date(current.getFullYear(), current.getMonth() + offset, 1),
    );

  const updateForm = (field: keyof AvailabilityForm, value: string): void =>
    setForm((current) => ({ ...current, [field]: value }));

  const openCreateForm = (date = selectedDate): void => {
    setSelectedDate(date);
    setSelectedEvent(null);
    setSelectedSubjectId("");
    setForm((current) => ({ ...current, date }));
  };

  const handleSelectEvent = (event: CalendarEvent): void => {
    setSelectedEvent(event);
    setSelectedSubjectId("");
  };

  const createEvent = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!form.date || !form.start || !form.end) return;

    try {
      const payload: CreateAvailabilityPayload = {
        startTime: toLocalISOString(form.date, form.start),
        endTime: toLocalISOString(form.date, form.end),
      };

      await api.post<AvailabilitySlot>("/availability", payload);
      toast.success("Slot published successfully!");
      setForm((current) => ({ ...current, title: "", note: "" }));
      toast.success("Availability slot created successfully!");
      await refreshSchedule();
    } catch (err: unknown) {
      if (axios.isAxiosError<{ message?: string; error?: string }>(err)) {
        toast.error(
          err.response?.data?.message ||
            err.response?.data?.error ||
            "Operation failed",
        );
      } else {
        toast.error("Operation failed");
      }
      toast.error("Failed to create availability slot.");
    }
  };

  const bookEvent = async (): Promise<void> => {
    if (!selectedEvent || isBooking) return;

    if (
      selectedEvent.tutorId &&
      user?.id &&
      selectedEvent.tutorId === user.id
    ) {
      toast.error("You cannot book your own availability slot.");
      return;
    }

    if (!selectedSubjectId) {
      toast.error("Select a subject before booking.");
      return;
    }

    setIsBooking(true);
    try {
      const startTime = selectedEvent.startTime
        ? new Date(selectedEvent.startTime).toISOString()
        : toLocalISOString(
            selectedEvent.date,
            convert12to24(selectedEvent.start),
          );
      const endTime = selectedEvent.endTime
        ? new Date(selectedEvent.endTime).toISOString()
        : toLocalISOString(
            selectedEvent.date,
            convert12to24(selectedEvent.end),
          );

      const payload: CreateBookingPayload = {
        subjectId: selectedSubjectId,
        startTime,
        endTime,
        availabilitySlotId: selectedEvent.id,
      };

      await api.post("/bookings", payload);
      toast.success("Booking confirmed successfully!");
      setSelectedEvent(null);
      setSelectedSubjectId("");
      await refreshSchedule();
    } catch (err: unknown) {
      if (axios.isAxiosError<{ message?: string; error?: string }>(err)) {
        toast.error(
          err.response?.data?.message ||
            err.response?.data?.error ||
            "Operation failed",
        );
      } else {
        toast.error("Operation failed");
      }
      toast.error("Failed to confirm booking. Please try again.");
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <div className="flex flex-col   gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border-subtle pb-4">
        <div>
          <h1 className="text-2xl font-semibold font-serif">
            {monthNames[month.getMonth()]} {month.getFullYear()}
          </h1>
          <p className="text-sm text-muted">
            {loading
              ? "Syncing schedule..."
              : "Manage and view availability slots"}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="inline-flex items-center rounded-md border border-border-subtle bg-surface-card px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand-secondary shadow-warm-sm">
            {activeRole} mode
          </span>

          <div className="flex items-center gap-1 border-l border-border-subtle pl-3">
            <button
              type="button"
              onClick={() => changeMonth(-1)}
              className="rounded-md p-2 text-muted hover:bg-border-subtle/50 hover:text-ink transition"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => changeMonth(1)}
              className="rounded-md p-2 text-muted hover:bg-border-subtle/50 hover:text-ink transition"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        <div className="lg:col-span-3">
          <div className="grid grid-cols-7 border-b border-border-subtle text-center text-xs font-semibold tracking-wide text-muted uppercase pb-2">
            {weekDays.map((day) => (
              <div key={day} className="py-1">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 border-l border-t border-border-subtle bg-surface-card shadow-warm rounded-lg overflow-hidden mt-2">
            {days.map((day) => {
              const key = dateKey(day);
              const dayEvents = eventsByDate[key] ?? [];
              const isCurrentMonth = day.getMonth() === month.getMonth();

              return (
                <div
                  key={key}
                  onClick={() => openCreateForm(key)}
                  className={`min-h-[120px] cursor-pointer border-b border-r border-border-subtle p-2 transition ${
                    isCurrentMonth
                      ? "bg-surface-card"
                      : "bg-surface-bg text-muted/60"
                  } ${selectedDate === key ? "ring-2 ring-inset ring-slate-blue bg-slate-blue/5" : "hover:bg-border-subtle/20"}`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold ${
                        isCurrentMonth ? "text-ink" : "text-muted/50"
                      }`}
                    >
                      {day.getDate()}
                    </span>
                    {mode === "tutor" && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openCreateForm(key);
                        }}
                        className="text-muted hover:text-brand-primary transition"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="mt-2 flex flex-col gap-1.5">
                    {dayEvents.map((event) => (
                      <EventPill
                        key={event.id}
                        event={event}
                        onClick={() => handleSelectEvent(event)}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col gap-4 rounded-xl border border-border-subtle bg-surface-card p-5 shadow-warm">
          {selectedEvent ? (
            <div>
              <div className="flex items-center justify-between border-b border-border-subtle pb-3">
                <h3 className="font-semibold font-serif text-brand-primary">
                  Tutor & Slot Overview
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedEvent(null);
                    setSelectedSubjectId("");
                  }}
                  className="text-muted hover:text-ink transition"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-4 flex flex-col gap-4 text-sm">
                {/* Tutor Credibility & Bio Card */}
                <div className="rounded-lg border border-border-subtle bg-surface-bg p-3.5 flex flex-col gap-3">
                  {/* Line 1: Profile circle + Name and Verified Educator */}
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-primary/10 text-brand-primary font-bold text-sm">
                      {selectedEvent.tutor?.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-semibold text-ink text-sm leading-tight">
                        {selectedEvent.tutor}
                      </h4>
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-olive mt-0.5">
                        <Award className="h-3 w-3" /> Verified Educator
                      </span>
                    </div>
                  </div>

                  {/* Credibility Details Stack */}
                  <div className="flex flex-col gap-1.5 border-t border-border-subtle/60 pt-2.5 text-xs text-brand-secondary">
                    {selectedEvent.tutorProfile?.averageRating && (
                      <div className="flex items-center gap-1.5 font-medium">
                        <span>⭐</span>
                        <span>
                          {selectedEvent.tutorProfile.averageRating.toFixed(1)}{" "}
                          Instructor Rating
                        </span>
                      </div>
                    )}
                    {selectedEvent.tutorProfile?.experience && (
                      <div className="flex items-center gap-1.5 font-medium text-slate-blue">
                        <span>💼</span>
                        <span>
                          {selectedEvent.tutorProfile.experience} Experience
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Subjects Taught Badges (Dynamically loaded via junction table fetch) */}
                  {subjects.length > 0 && (
                    <div className="border-t border-border-subtle/60 pt-2.5">
                      <p className="flex items-center gap-1.5 font-medium text-brand-secondary mb-1.5 text-xs">
                        <BookOpen className="h-3.5 w-3.5 text-slate-blue" />{" "}
                        Subjects Taught
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {subjects.map((subject) => (
                          <span
                            key={subject.id}
                            className="inline-flex items-center rounded-md bg-slate-blue/10 px-2 py-0.5 text-[11px] font-medium text-slate-blue border border-slate-blue/20"
                          >
                            {subject.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Bio Section */}
                  <div className="border-t border-border-subtle/85 pt-2.5 text-xs text-muted leading-relaxed">
                    <p className="flex items-center gap-1.5 font-medium text-brand-secondary mb-1">
                      <Info className="h-3.5 w-3.5 text-slate-blue" /> Tutor Bio
                      & Expertise
                    </p>
                    {selectedEvent.tutorProfile?.bio ? (
                      <p>{selectedEvent.tutorProfile.bio}</p>
                    ) : (
                      <p className="italic text-muted/70">
                        Specialized instructor dedicated to targeted concept
                        reinforcement, structured problem-solving, and clear
                        academic mentoring.
                      </p>
                    )}
                  </div>
                </div>

                {/* Session Timing & Format */}
                <div className="flex flex-col gap-2 border-b border-border-subtle pb-3 text-xs text-muted">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-brand-secondary font-medium">
                      <Clock3 className="h-4 w-4 text-slate-blue" /> Schedule:
                    </span>
                    <span className="font-semibold text-ink">
                      {selectedEvent.start} - {selectedEvent.end}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-brand-secondary font-medium">
                      <MapPin className="h-4 w-4 text-slate-blue" /> Delivery
                      Mode:
                    </span>
                    <span className="font-semibold text-ink">
                      {selectedEvent.mode} Session
                    </span>
                  </div>
                </div>

                {mode === "student" &&
                  selectedEvent.status === "available" &&
                  (selectedEvent.tutorId &&
                  user?.id &&
                  selectedEvent.tutorId === user.id ? (
                    <div className="rounded-lg border border-warning/30 bg-warning-bg p-3 text-xs text-warning">
                      You cannot book your own availability slot.
                    </div>
                  ) : (
                    <>
                      <div>
                        <label className="flex items-center gap-1.5 text-xs font-semibold text-brand-secondary mb-1.5">
                          <BookOpen className="h-3.5 w-3.5 text-slate-blue" />{" "}
                          Choose Subject to Study
                        </label>
                        <select
                          disabled={isBooking}
                          value={selectedSubjectId}
                          onChange={(event) =>
                            setSelectedSubjectId(event.target.value)
                          }
                          className="w-full rounded-lg border border-border-subtle bg-surface-bg px-3 py-2 text-xs text-ink shadow-warm-sm focus:border-slate-blue focus:outline-none disabled:bg-border-subtle/50 disabled:opacity-60"
                        >
                          <option value="">Select a specific subject</option>
                          {subjects.map((subject) => (
                            <option key={subject.id} value={subject.id}>
                              {subject.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <button
                        type="button"
                        disabled={isBooking}
                        onClick={bookEvent}
                        className="mt-2 flex w-full items-center justify-center rounded-lg bg-brand-primary px-3 py-2.5 text-sm font-semibold text-white shadow-warm hover:bg-brand-primary-hover transition disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isBooking ? (
                          <span className="inline-flex items-center gap-2">
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            Confirming Booking...
                          </span>
                        ) : (
                          "Confirm Booking with Tutor"
                        )}
                      </button>
                    </>
                  ))}
              </div>
            </div>
          ) : mode === "tutor" ? (
            <form onSubmit={createEvent} className="flex flex-col gap-3.5">
              <div className="flex items-center gap-2 border-b border-border-subtle pb-3">
                <CalendarPlus className="h-4 w-4 text-slate-blue" />
                <h3 className="font-semibold font-serif text-brand-primary">
                  Add Availability
                </h3>
              </div>

              <div>
                <label className="text-xs font-semibold text-brand-secondary">
                  Date
                </label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => updateForm("date", e.target.value)}
                  className="mt-1 w-full rounded-lg border border-border-subtle bg-surface-bg px-3 py-2 text-xs text-ink shadow-warm-sm focus:border-slate-blue focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-xs font-semibold text-brand-secondary">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={form.start}
                    onChange={(e) => updateForm("start", e.target.value)}
                    className="mt-1 w-full rounded-lg border border-border-subtle bg-surface-bg px-3 py-2 text-xs text-ink shadow-warm-sm focus:border-slate-blue focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-brand-secondary">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={form.end}
                    onChange={(e) => updateForm("end", e.target.value)}
                    className="mt-1 w-full rounded-lg border border-border-subtle bg-surface-bg px-3 py-2 text-xs text-ink shadow-warm-sm focus:border-slate-blue focus:outline-none"
                  />
                </div>
              </div>

              {/* <div>
                <label className="text-xs font-semibold text-brand-secondary">
                  Notes
                </label>
                <textarea
                  rows={2}
                  value={form.note}
                  onChange={(e) => updateForm("note", e.target.value)}
                  placeholder="Optional details..."
                  className="mt-1 w-full rounded-lg border border-border-subtle bg-surface-bg p-2.5 text-xs text-ink shadow-warm-sm focus:border-slate-blue focus:outline-none"
                />
              </div> */}

              <button
                type="submit"
                className="mt-2 w-full rounded-lg bg-brand-primary px-3 py-2.5 text-xs font-semibold text-white shadow-warm hover:bg-brand-primary-hover transition"
              >
                Publish Slot
              </button>
            </form>
          ) : (
            <div className="py-12 text-center text-xs text-muted leading-relaxed">
              Select an available slot on the calendar to view tutor
              credentials, professional background, and book a session.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
