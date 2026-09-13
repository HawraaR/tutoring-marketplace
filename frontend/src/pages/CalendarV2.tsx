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
  EventTone,
  Subject,
} from "../types";

const toneClasses: Record<EventTone, string> = {
  burgundy: "border-l-burgundy bg-burgundy/10 text-burgundy",
  olive: "border-l-olive bg-olive/10 text-olive",
  slate: "border-l-slate-blue bg-slate-blue/10 text-slate-blue",
};

const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
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
  return (
    <button
      type="button"
      onClick={(clickEvent) => {
        clickEvent.stopPropagation();
        onClick();
      }}
      className={`w-full truncate border-l-2 px-1.5 py-1 text-left text-[11px] leading-tight transition ${toneClasses[event.tone]} ${
        event.status === "booked" ? "opacity-65 cursor-not-allowed" : "hover:brightness-95"
      }`}
    >
      <span className="font-medium">{event.start}</span> {event.title}
    </button>
  );
}

const getAvailabilityData = async (): Promise<CalendarEvent[]> => {
  const slots: AvailabilitySlot[] = await availabilityAPI.getAvailableSlots();
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
      course: "General",
      mode: "Remote",
      note: "",
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
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
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
    note: "",
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
              ? err.response?.data?.message || err.response?.data?.error || "Operation failed"
              : "Operation failed",
          );
        }
      });

    return () => {
      isSubscribed = false;
    };
  }, [month, user?.id]);

  useEffect(() => {
    api.get<Subject[]>("/subjects")
      .then((response) => setSubjects(response.data))
      .catch((err: unknown) => {
        console.error("Failed to load subjects:", err);
        toast.error(
          axios.isAxiosError<{ message?: string; error?: string }>(err)
            ? err.response?.data?.message || err.response?.data?.error || "Operation failed"
            : "Operation failed",
        );
      });
  }, []);

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
    setMonth((current) => new Date(current.getFullYear(), current.getMonth() + offset, 1));

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
      await refreshSchedule();
    } catch (err: unknown) {
      if (axios.isAxiosError<{ message?: string; error?: string }>(err)) {
        toast.error(err.response?.data?.message || err.response?.data?.error || "Operation failed");
      } else {
        toast.error("Operation failed");
      }
    }
  };

  const bookEvent = async (): Promise<void> => {
    if (!selectedEvent || isBooking) return;

    if (selectedEvent.tutorId && user?.id && selectedEvent.tutorId === user.id) {
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
        : toLocalISOString(selectedEvent.date, convert12to24(selectedEvent.start));
      const endTime = selectedEvent.endTime
        ? new Date(selectedEvent.endTime).toISOString()
        : toLocalISOString(selectedEvent.date, convert12to24(selectedEvent.end));

      const payload: CreateBookingPayload = {
        subjectId: selectedSubjectId,
        startTime,
        endTime,
        availabilitySlotId: selectedEvent.id,
        notes: selectedEvent.note,
      };

      await api.post("/bookings", payload);
      toast.success("Booking created!");
      setSelectedEvent(null);
      setSelectedSubjectId("");
      await refreshSchedule();
    } catch (err: unknown) {
      if (axios.isAxiosError<{ message?: string; error?: string }>(err)) {
        toast.error(err.response?.data?.message || err.response?.data?.error || "Operation failed");
      } else {
        toast.error("Operation failed");
      }
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-4 p-4">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            {monthNames[month.getMonth()]} {month.getFullYear()}
          </h1>
          <p className="text-sm text-gray-500">
            {loading ? "Syncing schedule..." : "Manage and view availability slots"}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="inline-flex items-center rounded-sm border border-border-subtle bg-surface-card px-2.5 py-1.5 text-xs font-medium capitalize text-brand-primary">
            {activeRole} mode
          </span>

          <div className="flex items-center gap-1 border-l border-gray-200 pl-3">
            <button
              type="button"
              onClick={() => changeMonth(-1)}
              className="rounded-md p-1.5 text-gray-600 hover:bg-gray-100"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => changeMonth(1)}
              className="rounded-md p-1.5 text-gray-600 hover:bg-gray-100"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        <div className="lg:col-span-3">
          <div className="grid grid-cols-7 border-b border-gray-200 text-center text-xs font-semibold leading-6 text-gray-600">
            {weekDays.map((day) => (
              <div key={day} className="py-2">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 border-l border-t border-gray-200 bg-white">
            {days.map((day) => {
              const key = dateKey(day);
              const dayEvents = eventsByDate[key] ?? [];
              const isCurrentMonth = day.getMonth() === month.getMonth();

              return (
                <div
                  key={key}
                  onClick={() => openCreateForm(key)}
                  className={`min-h-[110px] cursor-pointer border-b border-r border-gray-200 p-1.5 transition ${
                    isCurrentMonth ? "bg-white" : "bg-gray-50 text-gray-400"
                  } ${selectedDate === key ? "ring-2 ring-inset ring-indigo-600" : ""}`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-semibold ${
                        isCurrentMonth ? "text-gray-900" : "text-gray-400"
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
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="mt-1 flex flex-col gap-1">
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

        <div className="flex flex-col gap-4 rounded-lg border border-gray-200 bg-white p-4">
          {selectedEvent ? (
            <div>
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="font-semibold text-gray-900">Slot Details</h3>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedEvent(null);
                    setSelectedSubjectId("");
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-4 flex flex-col gap-3 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <UserRound className="h-4 w-4" />
                  <span>{selectedEvent.tutor}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock3 className="h-4 w-4" />
                  <span>
                    {selectedEvent.start} - {selectedEvent.end}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="h-4 w-4" />
                  <span>{selectedEvent.mode}</span>
                </div>
                {selectedEvent.note && (
                  <p className="mt-2 rounded-md bg-gray-50 p-2 text-xs text-gray-500">
                    {selectedEvent.note}
                  </p>
                )}

                {mode === "student" && selectedEvent.status === "available" && (
                  selectedEvent.tutorId && user?.id && selectedEvent.tutorId === user.id ? (
                    <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
                      You cannot book your own availability slot.
                    </div>
                  ) : (
                    <>
                      <label className="mt-3 text-xs font-medium text-gray-700">
                        Subject
                        <select
                          disabled={isBooking}
                          value={selectedSubjectId}
                          onChange={(event) => setSelectedSubjectId(event.target.value)}
                          className="mt-1 w-full rounded-md border border-gray-300 bg-white px-2.5 py-2 text-xs shadow-sm focus:border-indigo-500 focus:outline-none disabled:bg-gray-100 disabled:opacity-60"
                        >
                          <option value="">Select a subject</option>
                          {subjects.map((subject) => (
                            <option key={subject.id} value={subject.id}>{subject.name}</option>
                          ))}
                        </select>
                      </label>
                      <button
                        type="button"
                        disabled={isBooking}
                        onClick={bookEvent}
                        className="mt-4 flex w-full items-center justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-indigo-400"
                      >
                        {isBooking ? (
                          <span className="inline-flex items-center gap-2">
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            Booking...
                          </span>
                        ) : (
                          "Book this slot"
                        )}
                      </button>
                    </>
                  )
                )}
              </div>
            </div>
          ) : mode === "tutor" ? (
            <form onSubmit={createEvent} className="flex flex-col gap-3">
              <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
                <CalendarPlus className="h-4 w-4 text-indigo-600" />
                <h3 className="font-semibold text-gray-900">
                  Add Availability
                </h3>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-700">
                  Date
                </label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => updateForm("date", e.target.value)}
                  className="mt-1 w-full rounded-md border border-gray-300 px-2.5 py-1.5 text-xs shadow-sm focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-medium text-gray-700">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={form.start}
                    onChange={(e) => updateForm("start", e.target.value)}
                    className="mt-1 w-full rounded-md border border-gray-300 px-2 py-1.5 text-xs shadow-sm focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-700">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={form.end}
                    onChange={(e) => updateForm("end", e.target.value)}
                    className="mt-1 w-full rounded-md border border-gray-300 px-2 py-1.5 text-xs shadow-sm focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-700">
                  Notes
                </label>
                <textarea
                  rows={2}
                  value={form.note}
                  onChange={(e) => updateForm("note", e.target.value)}
                  placeholder="Optional details..."
                  className="mt-1 w-full rounded-md border border-gray-300 p-2 text-xs shadow-sm focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="mt-2 w-full rounded-md bg-indigo-600 px-3 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500"
              >
                Publish Slot
              </button>
            </form>
          ) : (
            <div className="py-8 text-center text-xs text-gray-500">
              Select an available slot on the calendar to view details and book
              a session.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}