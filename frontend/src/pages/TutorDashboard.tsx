type BookingStatus =
  | "PENDING"
  | "CONFIRMED"
  | "CANCELLED"
  | "COMPLETED";

type Tone = "brand" | "slate" | "burgundy" | "olive";

type Session = {
  id: string;
  startTime: string;
  endTime: string;
  subject: string;
  student: string;
  status: BookingStatus;
  totalPrice: number | null;
};

type Student = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  educationLevel: string | null;
  major: string | null;
  learningGoals: string | null;
  sessions: number;
  lastSession: string;
  totalSpent: number;
};

type BookingRequest = {
  id: string;
  student: string;
  email: string;
  subject: string;
  startTime: string;
  endTime: string;
  notes: string | null;
};

type CompletedSession = {
  id: string;
  student: string;
  subject: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: string;
  amount: number | null;
  status: BookingStatus;
};

/* =========================================================
   DATE HELPERS
========================================================= */

function getStartOfWeek(date: Date) {
  const result = new Date(date);
  const day = result.getDay();

  // Monday = 0
  const diff = day === 0 ? -6 : 1 - day;

  result.setDate(result.getDate() + diff);
  result.setHours(0, 0, 0, 0);

  return result;
}

function getWeekDates() {
  const today = new Date();
  const monday = getStartOfWeek(today);

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(monday);

    date.setDate(monday.getDate() + index);

    return date;
  });
}

function formatMonthDay(date: Date) {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function formatDateRange(dates: Date[]) {
  const first = dates[0];
  const last = dates[dates.length - 1];

  if (first.getMonth() === last.getMonth()) {
    return `${first.toLocaleDateString("en-US", {
      month: "short",
    })} ${first.getDate()} – ${last.getDate()}, ${first.getFullYear()}`;
  }

  return `${formatMonthDay(first)} – ${formatMonthDay(last)}, ${last.getFullYear()}`;
}

function formatTime(time: string) {
  return new Date(time).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

// function getDurationHours(start: string, end: string) {
//   const startDate = new Date(start).getTime();
//   const endDate = new Date(end).getTime();

//   return (endDate - startDate) / (1000 * 60 * 60);
// }

function formatCurrency(value: number | null) {
  if (value === null) return "—";

  return `$${value.toFixed(2)}`;
}

/* =========================================================
   MOCK DATA

   These represent fields that can later come directly
   from Prisma/API responses.

   IMPORTANT:
   No fields are used here that require a database model
   which doesn't currently exist.
========================================================= */

const stats = [
  {
    label: "Total earnings",
    value: "$1,240.00",
    detail: "Completed bookings",
    change: "+12.4%",
    accent: "brand" as Tone,
  },
  {
    label: "Sessions completed",
    value: "42",
    detail: "Across your subjects",
    change: "+8 this month",
    accent: "slate" as Tone,
  },
  {
    label: "Average rating",
    value: "4.9",
    detail: "From 38 reviews",
    change: "Excellent",
    accent: "burgundy" as Tone,
  },
  {
    label: "Upcoming sessions",
    value: "7",
    detail: "Next 7 days",
    change: "3 today",
    accent: "olive" as Tone,
  },
];

/*
  weekday: 0 = Sunday
  weekday: 1 = Monday
  ...
  weekday: 6 = Saturday

  These are deliberately stored by weekday instead of
  hardcoding calendar dates.

  Later, these will come from Booking.startTime.
*/

const weeklySessions: Record<number, Session[]> = {
  1: [
    {
      id: "booking-1",
      startTime: "2026-08-24T10:00:00",
      endTime: "2026-08-24T11:30:00",
      subject: "MATH 201",
      student: "Maya H.",
      status: "CONFIRMED",
      totalPrice: 45,
    },
    {
      id: "booking-2",
      startTime: "2026-08-24T15:00:00",
      endTime: "2026-08-24T16:00:00",
      subject: "PHYS 210",
      student: "Rami K.",
      status: "CONFIRMED",
      totalPrice: 30,
    },
  ],

  2: [
    {
      id: "booking-3",
      startTime: "2026-08-25T12:00:00",
      endTime: "2026-08-25T13:00:00",
      subject: "MATH 201",
      student: "Sara L.",
      status: "CONFIRMED",
      totalPrice: 30,
    },
  ],

  3: [],

  4: [
    {
      id: "booking-4",
      startTime: "2026-08-27T11:00:00",
      endTime: "2026-08-27T12:30:00",
      subject: "CHEM 240",
      student: "Lina Z.",
      status: "CONFIRMED",
      totalPrice: 45,
    },
  ],

  5: [
    {
      id: "booking-5",
      startTime: "2026-08-28T14:00:00",
      endTime: "2026-08-28T15:00:00",
      subject: "CS 201",
      student: "Hassan M.",
      status: "CONFIRMED",
      totalPrice: 30,
    },
  ],

  6: [],

  0: [],
};

/* =========================================================
   BOOKING REQUESTS

   These correspond to Booking.status = PENDING.

   Notice that "university" has been removed because
   StudentProfile does NOT contain a university field.
========================================================= */

const requests: BookingRequest[] = [
  {
    id: "request-1",
    student: "Maya Harb",
    email: "maya@example.com",
    subject: "ECON 211",
    startTime: "2026-08-26T14:00:00",
    endTime: "2026-08-26T15:00:00",
    notes:
      "I'm struggling with macroeconomics indicators and would like help preparing for the midterm.",
  },
  {
    id: "request-2",
    student: "Rami K.",
    email: "rami@example.com",
    subject: "MATH 201",
    startTime: "2026-08-27T16:00:00",
    endTime: "2026-08-27T17:00:00",
    notes:
      "I need help reviewing integration techniques before my upcoming exam.",
  },
];

/* =========================================================
   STUDENTS

   These represent information that can be obtained by:

   Booking
      ↓
   student User
      ↓
   StudentProfile
========================================================= */

const students: Student[] = [
  {
    id: "student-1",
    firstName: "Hassan",
    lastName: "Mansour",
    email: "hassan@example.com",
    educationLevel: "University",
    major: "Computer Science",
    learningGoals: "Improve programming and problem-solving skills.",
    sessions: 8,
    lastSession: "Aug 24, 2026",
    totalSpent: 240,
  },
  {
    id: "student-2",
    firstName: "Lina",
    lastName: "Zein",
    email: "lina@example.com",
    educationLevel: "University",
    major: "Biology",
    learningGoals: "Prepare for biology examinations.",
    sessions: 6,
    lastSession: "Aug 24, 2026",
    totalSpent: 210,
  },
  {
    id: "student-3",
    firstName: "Sara",
    lastName: "Khalil",
    email: "sara@example.com",
    educationLevel: "University",
    major: "Mathematics",
    learningGoals: "Strengthen calculus fundamentals.",
    sessions: 10,
    lastSession: "Aug 25, 2026",
    totalSpent: 300,
  },
];

/* =========================================================
   RECENT COMPLETED SESSIONS

   These correspond to Booking records where:

   status = COMPLETED
========================================================= */

const completedSessions: CompletedSession[] = [
  {
    id: "completed-1",
    student: "Hassan Mansour",
    subject: "CS 201",
    date: "Aug 24, 2026",
    startTime: "2026-08-24T16:00:00",
    endTime: "2026-08-24T17:30:00",
    duration: "1.5 hrs",
    amount: 30,
    status: "COMPLETED",
  },
  {
    id: "completed-2",
    student: "Lina Zein",
    subject: "BIOL 210",
    date: "Aug 24, 2026",
    startTime: "2026-08-24T11:30:00",
    endTime: "2026-08-24T13:30:00",
    duration: "2 hrs",
    amount: 40,
    status: "COMPLETED",
  },
  {
    id: "completed-3",
    student: "Sara Khalil",
    subject: "MATH 201",
    date: "Aug 23, 2026",
    startTime: "2026-08-23T15:00:00",
    endTime: "2026-08-23T16:00:00",
    duration: "1 hr",
    amount: 32,
    status: "COMPLETED",
  },
  {
    id: "completed-4",
    student: "Omar Saleh",
    subject: "PHYS 210",
    date: "Aug 22, 2026",
    startTime: "2026-08-22T17:00:00",
    endTime: "2026-08-22T18:30:00",
    duration: "1.5 hrs",
    amount: 45,
    status: "COMPLETED",
  },
];

/* =========================================================
   SUBJECT STATISTICS

   Can later be calculated from:
   TutorSubject + Booking
========================================================= */

const subjects = [
  {
    name: "Mathematics",
    sessions: 18,
    percentage: 43,
    tone: "slate" as Tone,
  },
  {
    name: "Computer Science",
    sessions: 12,
    percentage: 29,
    tone: "burgundy" as Tone,
  },
  {
    name: "Physics",
    sessions: 7,
    percentage: 17,
    tone: "olive" as Tone,
  },
  {
    name: "Chemistry",
    sessions: 5,
    percentage: 11,
    tone: "brand" as Tone,
  },
];

/* =========================================================
   EARNINGS

   Later calculated from Booking.totalPrice.
========================================================= */

const earningsData = [
  { day: "Mon", value: 65 },
  { day: "Tue", value: 85 },
  { day: "Wed", value: 50 },
  { day: "Thu", value: 100 },
  { day: "Fri", value: 75 },
  { day: "Sat", value: 40 },
  { day: "Sun", value: 20 },
];

/* =========================================================
   SMALL COMPONENTS
========================================================= */

function StatIcon({
  type,
}: {
  type: "money" | "sessions" | "rating" | "calendar";
}) {
  const className = "h-5 w-5 stroke-[1.7]";

  if (type === "money") {
    return (
      <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
      >
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="M7 12h10" />
        <circle cx="12" cy="12" r="2" />
      </svg>
    );
  }

  if (type === "sessions") {
    return (
      <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
      >
        <rect x="4" y="4" width="16" height="16" rx="2" />
        <path d="M8 9h8M8 13h5M8 17h3" />
      </svg>
    );
  }

  if (type === "rating") {
    return (
      <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
      >
        <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9L12 3Z" />
      </svg>
    );
  }

  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
    >
      <rect x="4" y="5" width="16" height="15" rx="2" />
      <path d="M8 3v4M16 3v4M4 9h16" />
    </svg>
  );
}

function ToneIcon({
  tone,
  type,
}: {
  tone: Tone;
  type: "money" | "sessions" | "rating" | "calendar";
}) {
  const styles: Record<Tone, string> = {
    brand: "bg-brand-primary/10 text-brand-primary",
    slate: "bg-slate-blue/10 text-slate-blue",
    burgundy: "bg-burgundy/10 text-burgundy",
    olive: "bg-olive/10 text-olive",
  };

  return (
    <div
      className={`flex h-10 w-10 items-center justify-center rounded-md ${styles[tone]}`}
    >
      <StatIcon type={type} />
    </div>
  );
}

/* =========================================================
   DASHBOARD
========================================================= */

export function TutorD() {
  const weekDates = getWeekDates();

  const today = new Date();

  const todaySessions =
    weeklySessions[today.getDay()] ?? [];

  return (
    <div className="mx-auto w-full max-w-7xl space-y-3">

      {/* =====================================================
          STATISTICS
      ====================================================== */}

      <section className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">

        {stats.map((stat, index) => {
          const types: Array<
            "money" | "sessions" | "rating" | "calendar"
          > = [
            "money",
            "sessions",
            "rating",
            "calendar",
          ];

          return (
            <article
              key={stat.label}
              className="rounded-sm border border-border-subtle bg-surface-card p-4 shadow-warm-sm"
            >
              <div className="flex items-start justify-between gap-3">

                <ToneIcon
                  tone={stat.accent}
                  type={types[index]}
                />

                <span className="text-[11px] font-semibold text-success">
                  {stat.change}
                </span>

              </div>

              <div className="mt-5">

                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">
                  {stat.label}
                </p>

                <p className="mt-1 text-2xl font-semibold tabular-nums text-ink">
                  {stat.value}
                </p>

                <p className="mt-1 text-xs text-muted">
                  {stat.detail}
                </p>

              </div>
            </article>
          );
        })}

      </section>


      {/* =====================================================
          TODAY + WEEKLY SCHEDULE
      ====================================================== */}

      <section className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_300px]">

        {/* ===================================================
            WEEKLY SCHEDULE
        ==================================================== */}

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
                className="flex h-8 w-8 items-center justify-center rounded-sm border border-border-subtle text-muted hover:bg-surface-bg"
                aria-label="Previous week"
              >
                ←
              </button>

              <button
                type="button"
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

                  const isToday =
                    date.toDateString() === today.toDateString();

                  return (
                    <div
                      key={date.toISOString()}
                      className={`border-r border-border-subtle px-2 py-3 text-center last:border-r-0 ${
                        isToday
                          ? "bg-brand-primary/5"
                          : ""
                      }`}
                    >

                      <p
                        className={`text-[9px] font-semibold tracking-[0.12em] ${
                          isToday
                            ? "text-brand-primary"
                            : "text-muted"
                        }`}
                      >
                        {date.toLocaleDateString("en-US", {
                          weekday: "short",
                        }).toUpperCase()}
                      </p>

                      <p
                        className={`mt-1 font-serif text-lg font-semibold ${
                          isToday
                            ? "text-brand-primary"
                            : "text-ink"
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

                  const daySessions =
                    weeklySessions[date.getDay()] ?? [];

                  return (
                    <div
                      key={date.toISOString()}
                      className="p-2"
                    >

                      {daySessions.length === 0 ? (

                        <div className="flex h-full items-center justify-center">
                          <p className="text-[10px] text-muted">
                            No sessions
                          </p>
                        </div>

                      ) : (

                        <div className="space-y-2">

                          {daySessions.map((session) => {

                            const tone: Tone =
                              session.subject.startsWith("MATH")
                                ? "slate"
                                : session.subject.startsWith("PHYS")
                                ? "burgundy"
                                : session.subject.startsWith("CHEM")
                                ? "olive"
                                : "brand";

                            const toneStyles: Record<
                              Tone,
                              string
                            > = {
                              slate:
                                "border-slate-blue bg-slate-blue/5",
                              burgundy:
                                "border-burgundy bg-burgundy/5",
                              olive:
                                "border-olive bg-olive/5",
                              brand:
                                "border-brand-primary bg-brand-primary/5",
                            };

                            const textStyles: Record<
                              Tone,
                              string
                            > = {
                              slate:
                                "text-slate-blue",
                              burgundy:
                                "text-burgundy",
                              olive:
                                "text-olive",
                              brand:
                                "text-brand-primary",
                            };

                            return (
                              <div
                                key={session.id}
                                className={`rounded-sm border-l-[3px] p-2 ${
                                  toneStyles[tone]
                                }`}
                              >

                                <p
                                  className={`text-[9px] font-semibold ${
                                    textStyles[tone]
                                  }`}
                                >
                                  {formatTime(
                                    session.startTime
                                  )}
                                </p>

                                <p className="mt-1.5 text-[10px] font-semibold text-ink">
                                  {session.subject}
                                </p>

                                <p className="text-[9px] text-muted">
                                  {session.student}
                                </p>

                              </div>
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

        </article>


        {/* ===================================================
            TODAY
        ==================================================== */}

        <article className="rounded-sm border border-border-subtle bg-surface-card shadow-warm-sm">

          <div className="border-b border-border-subtle p-4">

            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-brand-primary">
              Today
            </p>

            <h2 className="mt-1 font-serif text-lg font-semibold text-ink">
              Upcoming lessons
            </h2>

            <p className="mt-0.5 text-xs text-muted">
              {todaySessions.length} session
              {todaySessions.length !== 1 ? "s" : ""} scheduled
            </p>

          </div>


          <div className="divide-y divide-border-subtle">

            {todaySessions.length === 0 ? (

              <div className="p-6 text-center">

                <p className="text-sm font-medium text-ink">
                  No lessons today
                </p>

                <p className="mt-1 text-xs text-muted">
                  Enjoy your free time.
                </p>

              </div>

            ) : (

              todaySessions.map((session) => (

                <div
                  key={session.id}
                  className="p-4"
                >

                  <div className="flex items-start justify-between gap-3">

                    <div>

                      <p className="text-xs font-semibold text-brand-primary">
                        {formatTime(session.startTime)}
                        {" – "}
                        {formatTime(session.endTime)}
                      </p>

                      <p className="mt-2 text-sm font-semibold text-ink">
                        {session.subject}
                      </p>

                      <p className="mt-0.5 text-xs text-muted">
                        {session.student}
                      </p>

                    </div>

                    <span className="rounded-sm bg-success/10 px-2 py-1 text-[9px] font-semibold uppercase text-success">
                      {session.status}
                    </span>

                  </div>

                </div>

              ))

            )}

          </div>

        </article>

      </section>


      {/* =====================================================
          BOOKING REQUESTS
      ====================================================== */}

      <section className="rounded-sm border border-border-subtle bg-surface-card shadow-warm-sm">

        <div className="flex items-center justify-between border-b border-border-subtle p-4">

          <div>

            <h2 className="font-serif text-lg font-semibold text-ink">
              Booking requests
            </h2>

            <p className="mt-0.5 text-xs text-muted">
              Pending sessions waiting for your response
            </p>

          </div>

          <span className="rounded-sm bg-burgundy/10 px-2 py-1 text-[10px] font-semibold text-burgundy">
            {requests.length} pending
          </span>

        </div>


        <div className="divide-y divide-border-subtle">

          {requests.map((request) => (

            <div
              key={request.id}
              className="p-4"
            >

              <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">

                <div className="flex gap-3">

                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-blue/10 text-xs font-semibold text-slate-blue">
                    {request.student
                      .split(" ")
                      .map((name) => name[0])
                      .join("")
                      .slice(0, 2)}
                  </div>

                  <div className="min-w-0">

                    <div className="flex flex-wrap items-center gap-2">

                      <p className="text-sm font-semibold text-ink">
                        {request.student}
                      </p>

                      <span className="rounded-sm bg-surface-bg px-2 py-0.5 text-[9px] font-semibold text-muted">
                        {request.subject}
                      </span>

                    </div>

                    <p className="mt-1 text-[10px] text-muted">
                      {request.email}
                    </p>

                    <p className="mt-2 text-xs text-muted">

                      {new Date(
                        request.startTime
                      ).toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}

                      {" · "}

                      {formatTime(request.startTime)}
                      {" – "}
                      {formatTime(request.endTime)}

                    </p>

                    {request.notes && (
                      <p className="mt-2 max-w-2xl text-xs leading-relaxed text-muted">
                        {request.notes}
                      </p>
                    )}

                  </div>

                </div>


                <div className="flex gap-2 lg:min-w-[190px]">

                  <button
                    type="button"
                    className="flex-1 rounded-sm bg-brand-primary px-3 py-2 text-xs font-semibold text-white hover:bg-brand-primary-hover"
                  >
                    Accept
                  </button>

                  <button
                    type="button"
                    className="flex-1 rounded-sm border border-border-subtle px-3 py-2 text-xs font-semibold text-muted hover:bg-surface-bg"
                  >
                    Decline
                  </button>

                </div>

              </div>

            </div>

          ))}

        </div>

      </section>


      {/* =====================================================
          STUDENT MANAGEMENT
      ====================================================== */}

      <section className="rounded-sm border border-border-subtle bg-surface-card shadow-warm-sm">

        <div className="flex items-end justify-between border-b border-border-subtle p-4">

          <div>

            <h2 className="font-serif text-lg font-semibold text-ink">
              My students
            </h2>

            <p className="mt-0.5 text-xs text-muted">
              Students you have active or previous bookings with
            </p>

          </div>

          <button
            type="button"
            className="text-xs font-semibold text-brand-primary hover:underline"
          >
            View all
          </button>

        </div>


        <div className="overflow-x-auto">

          <table className="w-full min-w-[850px] text-left">

            <thead>

              <tr className="border-b border-border-subtle bg-surface-bg">

                <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-wide text-muted">
                  Student
                </th>

                <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-wide text-muted">
                  Education
                </th>

                <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-wide text-muted">
                  Major
                </th>

                <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-wide text-muted">
                  Sessions
                </th>

                <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-wide text-muted">
                  Last session
                </th>

                <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-wide text-muted">
                  Total earned
                </th>

              </tr>

            </thead>


            <tbody>

              {students.map((student) => (

                <tr
                  key={student.id}
                  className="border-b border-border-subtle last:border-0 hover:bg-surface-bg"
                >

                  <td className="px-4 py-3">

                    <div className="flex items-center gap-3">

                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-primary/10 text-[9px] font-semibold text-brand-primary">
                        {student.firstName[0]}
                        {student.lastName[0]}
                      </div>

                      <div>

                        <p className="text-xs font-semibold text-ink">
                          {student.firstName} {student.lastName}
                        </p>

                        <p className="text-[10px] text-muted">
                          {student.email}
                        </p>

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
                    {student.lastSession}
                  </td>


                  <td className="px-4 py-3 text-xs font-semibold text-ink">
                    {formatCurrency(student.totalSpent)}
                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </section>


      {/* =====================================================
          ANALYTICS
      ====================================================== */}

      <section className="grid gap-3 lg:grid-cols-2">

        {/* Earnings */}

        <article className="rounded-sm border border-border-subtle bg-surface-card p-4 shadow-warm-sm">

          <div className="flex items-end justify-between gap-3">

            <div>

              <h2 className="font-serif text-lg font-semibold text-ink">
                Earnings overview
              </h2>

              <p className="mt-0.5 text-xs text-muted">
                Revenue from completed bookings
              </p>

            </div>

            <select
              className="rounded-sm border border-border-subtle bg-surface-card px-2 py-1.5 text-xs text-muted outline-none"
              defaultValue="7"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
            </select>

          </div>


          <div className="mt-6 flex h-44 items-end gap-3 border-b border-border-subtle px-2">

            {earningsData.map((item) => (

              <div
                key={item.day}
                className="flex h-full flex-1 flex-col items-center justify-end gap-2"
              >

                <span className="text-[9px] tabular-nums text-muted">
                  ${item.value}
                </span>

                <div className="flex h-32 w-full items-end">

                  <div
                    className="w-full rounded-t-sm bg-slate-blue transition-opacity hover:opacity-75"
                    style={{
                      height: `${item.value}%`,
                    }}
                  />

                </div>

                <span className="text-[9px] font-medium text-muted">
                  {item.day}
                </span>

              </div>

            ))}

          </div>


          <div className="mt-4 flex justify-between">

            <div>

              <p className="text-[10px] uppercase tracking-wide text-muted">
                This week
              </p>

              <p className="mt-0.5 font-serif text-xl font-semibold text-ink">
                $435
              </p>

            </div>

            <div className="text-right">

              <p className="text-[10px] uppercase tracking-wide text-muted">
                Completed hours
              </p>

              <p className="mt-0.5 text-sm font-semibold text-success">
                12.5 hrs
              </p>

            </div>

          </div>

        </article>


        {/* Teaching overview */}

        <article className="rounded-sm border border-border-subtle bg-surface-card p-4 shadow-warm-sm">

          <div>

            <h2 className="font-serif text-lg font-semibold text-ink">
              Teaching overview
            </h2>

            <p className="mt-0.5 text-xs text-muted">
              Completed sessions by subject
            </p>

          </div>


          <div className="mt-6 grid gap-8 sm:grid-cols-[170px_1fr] sm:items-center">

            <div className="relative mx-auto h-36 w-36">

              <div
                className="h-full w-full rounded-full"
                style={{
                  background:
                    "conic-gradient(#2f6aa0 0% 43%, #9b2d45 43% 72%, #4f7a28 72% 89%, #1e3a5f 89% 100%)",
                }}
              />

              <div className="absolute inset-[18px] flex flex-col items-center justify-center rounded-full bg-surface-card">

                <span className="font-serif text-2xl font-semibold text-ink">
                  42
                </span>

                <span className="text-[9px] uppercase tracking-wide text-muted">
                  sessions
                </span>

              </div>

            </div>


            <div className="space-y-3">

              {subjects.map((subject) => {

                const dotStyles: Record<Tone, string> = {
                  slate: "bg-slate-blue",
                  burgundy: "bg-burgundy",
                  olive: "bg-olive",
                  brand: "bg-brand-primary",
                };

                return (
                  <div
                    key={subject.name}
                    className="flex items-center justify-between border-b border-border-subtle pb-2 last:border-0"
                  >

                    <div className="flex items-center gap-2">

                      <span
                        className={`h-2 w-2 rounded-full ${dotStyles[subject.tone]}`}
                      />

                      <span className="text-xs text-muted">
                        {subject.name}
                      </span>

                    </div>

                    <span className="text-xs font-semibold tabular-nums text-ink">
                      {subject.sessions}
                    </span>

                  </div>
                );
              })}

            </div>

          </div>

        </article>

      </section>


      {/* =====================================================
          RECENT ACTIVITY
      ====================================================== */}

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

          <button
            type="button"
            className="text-xs font-semibold text-brand-primary hover:underline"
          >
            View all activity
          </button>

        </div>


        <div className="overflow-x-auto">

          <table className="w-full min-w-[850px] text-left">

            <thead>

              <tr className="border-b border-border-subtle bg-surface-bg">

                <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-wide text-muted">
                  Student
                </th>

                <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-wide text-muted">
                  Subject
                </th>

                <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-wide text-muted">
                  Date & time
                </th>

                <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-wide text-muted">
                  Duration
                </th>

                <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-wide text-muted">
                  Amount
                </th>

                <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-wide text-muted">
                  Status
                </th>

                <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-wide text-muted">
                  Action
                </th>

              </tr>

            </thead>


            <tbody>

              {completedSessions.map((session) => (

                <tr
                  key={session.id}
                  className="border-b border-border-subtle last:border-0 hover:bg-surface-bg"
                >

                  <td className="px-4 py-3">

                    <p className="text-xs font-semibold text-ink">
                      {session.student}
                    </p>

                    <p className="mt-0.5 text-[10px] text-muted">
                      Booking #{session.id.replace("completed-", "")}
                    </p>

                  </td>


                  <td className="px-4 py-3">

                    <span className="rounded-sm bg-surface-bg px-2 py-1 text-[9px] font-semibold text-muted">
                      {session.subject}
                    </span>

                  </td>


                  <td className="px-4 py-3">

                    <p className="text-xs text-ink">
                      {session.date}
                    </p>

                    <p className="text-[10px] text-muted">
                      {formatTime(session.startTime)}
                      {" – "}
                      {formatTime(session.endTime)}
                    </p>

                  </td>


                  <td className="px-4 py-3 text-xs text-muted">
                    {session.duration}
                  </td>


                  <td className="px-4 py-3 text-xs font-semibold tabular-nums text-ink">
                    {formatCurrency(session.amount)}
                  </td>


                  <td className="px-4 py-3">

                    <span className="inline-flex items-center gap-1.5 text-[9px] font-semibold uppercase tracking-wide text-success">

                      <span className="h-1.5 w-1.5 rounded-full bg-success" />

                      {session.status}

                    </span>

                  </td>


                  <td className="px-4 py-3">

                    <button
                      type="button"
                      className="text-[10px] font-semibold text-brand-primary hover:underline"
                    >
                      View
                    </button>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </section>

    </div>
  );
}