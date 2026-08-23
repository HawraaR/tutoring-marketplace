export type CalendarEventStatus = "available" | "booked" | "cancelled";
export type CalendarEventTone = "burgundy" | "olive" | "slate";

export type CalendarEvent = {
  id: string;
  date: string;
  start: string;
  end: string;
  title: string;
  tutor: string;
  course: string;
  mode: string;
  tone: CalendarEventTone;
  status: CalendarEventStatus;
  note: string;
};

export const initialCalendarEvents: CalendarEvent[] = [
  {
    id: "event-1",
    date: "2026-08-21",
    start: "16:00",
    end: "17:00",
    title: "Calculus II help",
    tutor: "Layla Hassan",
    course: "MATH 201",
    mode: "Remote",
    tone: "burgundy",
    status: "booked",
    note: "Bring Q3 from the problem set.",
  },
  {
    id: "event-2",
    date: "2026-08-22",
    start: "10:00",
    end: "11:00",
    title: "Integration practice",
    tutor: "Layla Hassan",
    course: "MATH 201",
    mode: "Remote",
    tone: "burgundy",
    status: "available",
    note: "Bring questions from this week's problem set.",
  },
  {
    id: "event-3",
    date: "2026-08-23",
    start: "11:00",
    end: "12:30",
    title: "Organic chemistry review",
    tutor: "Omar Reid",
    course: "CHEM 240",
    mode: "Campus · Sci 2.14",
    tone: "olive",
    status: "booked",
    note: "Lab report outline.",
  },
  {
    id: "event-4",
    date: "2026-08-25",
    start: "18:30",
    end: "19:30",
    title: "Spanish conversation",
    tutor: "Sofia Alvarez",
    course: "SPAN 310",
    mode: "Remote",
    tone: "slate",
    status: "available",
    note: "Assigned reading: Unidad 4.",
  },
  {
    id: "event-5",
    date: "2026-08-27",
    start: "15:00",
    end: "16:00",
    title: "Data structures office hour",
    tutor: "Kenji Ito",
    course: "CS 220",
    mode: "Remote",
    tone: "slate",
    status: "available",
    note: "Bring your tree traversal questions.",
  },
  {
    id: "event-6",
    date: "2026-08-29",
    start: "09:00",
    end: "10:00",
    title: "Microeconomics fundamentals",
    tutor: "Priya Nair",
    course: "ECON 205",
    mode: "Remote",
    tone: "olive",
    status: "available",
    note: "Elasticity and demand curves.",
  },
];
