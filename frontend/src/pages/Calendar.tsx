import { useMemo, useState, type FormEvent } from "react";
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
import {
  initialCalendarEvents,
  type CalendarEvent,
  type CalendarEventTone,
} from "../data/calendar";

type CalendarMode = "student" | "tutor";
type AvailabilityForm = {
  title: string;
  course: string;
  date: string;
  start: string;
  end: string;
  mode: string;
  note: string;
};

const toneClasses: Record<CalendarEventTone, string> = {
  burgundy: "border-l-burgundy bg-burgundy/10 text-burgundy",
  olive: "border-l-olive bg-olive/10 text-olive",
  slate: "border-l-slate-blue bg-slate-blue/10 text-slate-blue",
};
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

function dateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function calendarDays(month: Date) {
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
      className={`w-full truncate border-l-2 px-1.5 py-1 text-left text-[11px] leading-tight ${toneClasses[event.tone]} ${event.status === "booked" ? "opacity-65" : "hover:brightness-95"}`}
    >
      <span className="font-medium">{event.start}</span> {event.title}
    </button>
  );
}

export function Calendar() {
  const [events, setEvents] = useState(initialCalendarEvents);
  const [mode, setMode] = useState<CalendarMode>("student");
  const [month, setMonth] = useState(new Date(2026, 7, 1));
  const [selectedDate, setSelectedDate] = useState("2026-08-22");
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null,
  );
  const [notice, setNotice] = useState("");
  const [form, setForm] = useState<AvailabilityForm>({
    title: "",
    course: "MATH 201",
    date: "2026-08-22",
    start: "10:00",
    end: "11:00",
    mode: "Remote",
    note: "",
  });
  const days = useMemo(() => calendarDays(month), [month]);
  const eventsByDate = useMemo(
    () =>
      events.reduce<Record<string, CalendarEvent[]>>((groups, event) => {
        groups[event.date] = [...(groups[event.date] ?? []), event];
        return groups;
      }, {}),
    [events],
  );
  const changeMonth = (offset: number) =>
    setMonth(
      (current) =>
        new Date(current.getFullYear(), current.getMonth() + offset, 1),
    );
  const updateForm = (field: keyof AvailabilityForm, value: string) =>
    setForm((current) => ({ ...current, [field]: value }));
  const openCreateForm = (date = selectedDate) => {
    setSelectedDate(date);
    setSelectedEvent(null);
    setForm((current) => ({ ...current, date }));
  };
  const createEvent = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.title.trim()) return;
    setEvents((current) => [
      ...current,
      {
        id: `event-${Date.now()}`,
        ...form,
        title: form.title.trim(),
        tutor: "You",
        tone: "burgundy",
        status: "available",
      },
    ]);
    setNotice("Availability slot published.");
    setForm((current) => ({ ...current, title: "", note: "" }));
  };
  const bookEvent = () => {
    if (!selectedEvent) return;
    setEvents((current) =>
      current.map((event) =>
        event.id === selectedEvent.id ? { ...event, status: "booked" } : event,
      ),
    );
    setSelectedEvent({ ...selectedEvent, status: "booked" });
    setNotice(`${selectedEvent.title} is now on your sessions list.`);
  };

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-medium tracking-[0.16em] text-burgundy uppercase">
            Tutorium schedule
          </p>
          <h1 className="font-serif text-2xl font-semibold text-ink">
            Calendar
          </h1>
          <p className="mt-1 text-sm text-muted">
            Browse open tutoring slots or publish your own availability.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start rounded-sm border border-border-subtle bg-surface-card p-1 sm:self-auto">
          <button
            type="button"
            onClick={() => {
              setMode("student");
              setSelectedEvent(null);
            }}
            className={`rounded-sm px-3 py-1.5 text-xs font-medium ${mode === "student" ? "bg-brand-primary text-white" : "text-muted hover:text-ink"}`}
          >
            Find a session
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("tutor");
              setSelectedEvent(null);
            }}
            className={`rounded-sm px-3 py-1.5 text-xs font-medium ${mode === "tutor" ? "bg-brand-primary text-white" : "text-muted hover:text-ink"}`}
          >
            Tutor availability
          </button>
        </div>
      </div>
      {notice && (
        <div className="border-l-2 border-olive bg-olive/10 px-3 py-2 text-sm text-ink">
          {notice}
        </div>
      )}
      <div className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
        <section className="min-w-0 overflow-hidden rounded-sm border border-border-subtle bg-surface-card">
          <header className="flex items-center justify-between border-b border-border-subtle px-4 py-3 md:px-5">
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label="Previous month"
                onClick={() => changeMonth(-1)}
                className="rounded-sm p-1.5 text-muted hover:bg-surface-bg hover:text-ink"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <h2 className="min-w-36 text-center font-serif text-lg font-semibold text-ink">
                {monthNames[month.getMonth()]} {month.getFullYear()}
              </h2>
              <button
                type="button"
                aria-label="Next month"
                onClick={() => changeMonth(1)}
                className="rounded-sm p-1.5 text-muted hover:bg-surface-bg hover:text-ink"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            {mode === "tutor" && (
              <button
                type="button"
                onClick={() => openCreateForm()}
                className="inline-flex items-center gap-1.5 rounded-sm bg-brand-primary px-3 py-2 text-xs font-medium text-white hover:bg-brand-primary-hover"
              >
                <Plus className="h-3.5 w-3.5" />
                Create slot
              </button>
            )}
          </header>
          <div className="grid grid-cols-7 border-b border-border-subtle bg-surface-bg">
            {weekDays.map((day) => (
              <div
                key={day}
                className="px-1 py-2 text-center text-[10px] font-medium tracking-wide text-muted uppercase md:text-[11px]"
              >
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {days.map((day) => {
              const key = dateKey(day);
              const isCurrentMonth = day.getMonth() === month.getMonth();
              const isSelected = key === selectedDate;
              const dayEvents = eventsByDate[key] ?? [];
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    setSelectedDate(key);
                    setSelectedEvent(null);
                    if (mode === "tutor") openCreateForm(key);
                  }}
                  className={`min-h-24 overflow-hidden border-b border-r border-border-subtle p-1.5 text-left transition last:border-r-0 md:min-h-28 md:p-2 ${isCurrentMonth ? "bg-surface-card" : "bg-surface-bg/60"} ${isSelected ? "ring-2 ring-inset ring-brand-primary" : "hover:bg-brand-primary/5"}`}
                >
                  <span
                    className={`mb-1 flex h-6 w-6 items-center justify-center rounded-full text-xs ${key === "2026-08-21" ? "bg-brand-primary font-semibold text-white" : isCurrentMonth ? "text-ink" : "text-muted"}`}
                  >
                    {day.getDate()}
                  </span>
                  <span className="flex flex-col gap-1">
                    {dayEvents.slice(0, 3).map((event) => (
                      <EventPill
                        key={event.id}
                        event={event}
                        onClick={() => setSelectedEvent(event)}
                      />
                    ))}
                  </span>
                  {dayEvents.length > 3 && (
                    <span className="mt-1 block text-[10px] text-muted">
                      +{dayEvents.length - 3} more
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </section>
        <aside className="flex flex-col gap-4">
          {mode === "tutor" ? (
            <form
              onSubmit={createEvent}
              className="rounded-sm border border-border-subtle bg-surface-card p-4"
            >
              <div className="flex items-center justify-between">
                <h2 className="font-serif text-lg font-semibold text-ink">
                  New availability
                </h2>
                <CalendarPlus className="h-5 w-5 text-burgundy" />
              </div>
              <p className="mt-1 text-xs text-muted">
                Publish a slot students can book.
              </p>
              <div className="mt-4 flex flex-col gap-3">
                <label className="text-xs font-medium text-ink">
                  What can you help with?
                  <input
                    value={form.title}
                    onChange={(event) =>
                      updateForm("title", event.target.value)
                    }
                    placeholder="e.g. Integration practice"
                    className="mt-1 w-full rounded-sm border border-border-subtle bg-surface-bg px-3 py-2 text-sm outline-none focus:border-brand-primary"
                  />
                </label>
                <label className="text-xs font-medium text-ink">
                  Course
                  <input
                    value={form.course}
                    onChange={(event) =>
                      updateForm("course", event.target.value)
                    }
                    className="mt-1 w-full rounded-sm border border-border-subtle bg-surface-bg px-3 py-2 text-sm outline-none focus:border-brand-primary"
                  />
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <label className="text-xs font-medium text-ink">
                    Date
                    <input
                      type="date"
                      value={form.date}
                      onChange={(event) =>
                        updateForm("date", event.target.value)
                      }
                      className="mt-1 w-full rounded-sm border border-border-subtle bg-surface-bg px-2 py-2 text-sm outline-none focus:border-brand-primary"
                    />
                  </label>
                  <label className="text-xs font-medium text-ink">
                    Start
                    <input
                      type="time"
                      value={form.start}
                      onChange={(event) =>
                        updateForm("start", event.target.value)
                      }
                      className="mt-1 w-full rounded-sm border border-border-subtle bg-surface-bg px-2 py-2 text-sm outline-none focus:border-brand-primary"
                    />
                  </label>
                </div>
                <label className="text-xs font-medium text-ink">
                  End time
                  <input
                    type="time"
                    value={form.end}
                    onChange={(event) => updateForm("end", event.target.value)}
                    className="mt-1 w-full rounded-sm border border-border-subtle bg-surface-bg px-3 py-2 text-sm outline-none focus:border-brand-primary"
                  />
                </label>
                <label className="text-xs font-medium text-ink">
                  Format
                  <input
                    value={form.mode}
                    onChange={(event) => updateForm("mode", event.target.value)}
                    className="mt-1 w-full rounded-sm border border-border-subtle bg-surface-bg px-3 py-2 text-sm outline-none focus:border-brand-primary"
                  />
                </label>
                <label className="text-xs font-medium text-ink">
                  Note{" "}
                  <span className="font-normal text-muted">(optional)</span>
                  <textarea
                    value={form.note}
                    onChange={(event) => updateForm("note", event.target.value)}
                    rows={2}
                    className="mt-1 w-full resize-none rounded-sm border border-border-subtle bg-surface-bg px-3 py-2 text-sm outline-none focus:border-brand-primary"
                  />
                </label>
                <button
                  type="submit"
                  className="mt-1 inline-flex items-center justify-center gap-2 rounded-sm bg-brand-primary px-3 py-2.5 text-sm font-medium text-white hover:bg-brand-primary-hover"
                >
                  <Plus className="h-4 w-4" />
                  Publish availability
                </button>
              </div>
            </form>
          ) : (
            <section className="rounded-sm border border-border-subtle bg-surface-card p-4">
              <h2 className="font-serif text-lg font-semibold text-ink">
                How booking works
              </h2>
              <ol className="mt-3 space-y-3 text-sm text-muted">
                <li className="flex gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-primary text-[10px] text-white">
                    1
                  </span>
                  Choose an open slot on the calendar.
                </li>
                <li className="flex gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-primary text-[10px] text-white">
                    2
                  </span>
                  Review the tutor, format, and note.
                </li>
                <li className="flex gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-primary text-[10px] text-white">
                    3
                  </span>
                  Book it and find it in Sessions.
                </li>
              </ol>
            </section>
          )}
          <section className="rounded-sm border border-border-subtle bg-surface-card p-4">
            <h2 className="font-serif text-base font-semibold text-ink">
              Legend
            </h2>
            <div className="mt-3 space-y-2 text-xs text-muted">
              <p>
                <span className="mr-2 inline-block h-2.5 w-2.5 rounded-full bg-olive" />
                Available to book
              </p>
              <p>
                <span className="mr-2 inline-block h-2.5 w-2.5 rounded-full bg-brand-primary" />
                Booked session
              </p>
              <p>
                <span className="mr-2 inline-block h-2.5 w-2.5 rounded-full bg-burgundy" />
                Your availability
              </p>
            </div>
          </section>
        </aside>
      </div>
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/25 p-4">
          <div className="w-full max-w-md rounded-sm border border-border-subtle bg-surface-card p-5 shadow-warm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p
                  className={`text-xs font-medium uppercase ${toneClasses[selectedEvent.tone].split(" ").pop()}`}
                >
                  {selectedEvent.course}
                </p>
                <h2 className="mt-1 font-serif text-xl font-semibold text-ink">
                  {selectedEvent.title}
                </h2>
              </div>
              <button
                type="button"
                aria-label="Close event details"
                onClick={() => setSelectedEvent(null)}
                className="rounded-sm p-1 text-muted hover:bg-surface-bg hover:text-ink"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-4 space-y-3 border-t border-border-subtle pt-4 text-sm text-muted">
              <p className="flex items-center gap-2">
                <Clock3 className="h-4 w-4" />
                {selectedEvent.date} · {selectedEvent.start}–{selectedEvent.end}
              </p>
              <p className="flex items-center gap-2">
                <UserRound className="h-4 w-4" />
                {selectedEvent.tutor}
              </p>
              <p className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                {selectedEvent.mode}
              </p>
              <p className="text-ink">{selectedEvent.note}</p>
            </div>
            {mode === "student" && selectedEvent.status === "available" && (
              <button
                type="button"
                onClick={bookEvent}
                className="mt-5 w-full rounded-sm bg-brand-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-primary-hover"
              >
                Book this slot
              </button>
            )}
            {selectedEvent.status === "booked" && (
              <p className="mt-5 border-l-2 border-brand-primary bg-brand-primary/10 px-3 py-2 text-sm text-ink">
                This slot is already booked.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
