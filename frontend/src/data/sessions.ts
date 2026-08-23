export type SessionStatus = "upcoming" | "past" | "cancelled";
export type SessionTone = "burgundy" | "olive" | "slate";

export type Session = {
  id: string;
  date: string;
  day: string;
  sortDate: string;
  time: string;
  duration: string;
  mode: string;
  code: string;
  title: string;
  tone: SessionTone;
  tutor: string;
  credentials: string;
  note: string;
  status: SessionStatus;
};

export const initialSessions: Session[] = [
  {
    id: "session-1",
    date: "21 Aug",
    day: "Thu",
    sortDate: "2026-08-21",
    time: "16:00–17:00",
    duration: "60 min",
    mode: "Remote",
    code: "MATH 201",
    title: "Calculus II",
    tone: "burgundy",
    tutor: "Layla Hassan",
    credentials: "MSc",
    note: "Bring Q3 from the problem set.",
    status: "upcoming",
  },
  {
    id: "session-2",
    date: "23 Aug",
    day: "Sat",
    sortDate: "2026-08-23",
    time: "11:00–12:30",
    duration: "90 min",
    mode: "Campus · Sci 2.14",
    code: "CHEM 240",
    title: "Organic Chemistry",
    tone: "olive",
    tutor: "Omar Reid",
    credentials: "PhD candidate",
    note: "Lab report outline.",
    status: "upcoming",
  },
  {
    id: "session-3",
    date: "25 Aug",
    day: "Mon",
    sortDate: "2026-08-25",
    time: "18:30–19:30",
    duration: "60 min",
    mode: "Remote",
    code: "SPAN 310",
    title: "Conversation",
    tone: "slate",
    tutor: "Sofia Alvarez",
    credentials: "MA",
    note: "Assigned reading: Unidad 4.",
    status: "upcoming",
  },
  {
    id: "session-4",
    date: "14 Aug",
    day: "Thu",
    sortDate: "2026-08-14",
    time: "15:00–16:00",
    duration: "60 min",
    mode: "Remote",
    code: "MATH 201",
    title: "Calculus II",
    tone: "burgundy",
    tutor: "Layla Hassan",
    credentials: "MSc",
    note: "Reviewed integration by parts.",
    status: "past",
  },
  {
    id: "session-5",
    date: "9 Aug",
    day: "Sat",
    sortDate: "2026-08-09",
    time: "10:00–11:00",
    duration: "60 min",
    mode: "Campus · Sci 2.14",
    code: "CHEM 240",
    title: "Organic Chemistry",
    tone: "olive",
    tutor: "Omar Reid",
    credentials: "PhD candidate",
    note: "Prepared for the spectroscopy lab.",
    status: "past",
  },
  {
    id: "session-6",
    date: "2 Aug",
    day: "Sat",
    sortDate: "2026-08-02",
    time: "13:00–14:00",
    duration: "60 min",
    mode: "Remote",
    code: "SPAN 310",
    title: "Conversation",
    tone: "slate",
    tutor: "Sofia Alvarez",
    credentials: "MA",
    note: "Practised past tense conversation.",
    status: "cancelled",
  },
];
