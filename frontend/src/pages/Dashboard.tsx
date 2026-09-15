import { HoursTrendChart } from "../components/dashboard/HoursTrendChart";
import { CourseLabel } from "../components/dashboard/CourseLabel";
// import { useEffect, useState } from "react";
// import { getMyStudentProfile } from "../api/studentProfileAPI";
// import { CompleteProfileBanner } from "../components/CompleteProfileBanner";

const hoursBySubject = [
  {
    code: "MATH 201",
    title: "Calculus II",
    hours: 6,
    tone: "burgundy" as const,
    sessions: 5,
  },
  {
    code: "CHEM 240",
    title: "Organic Chemistry",
    hours: 3.5,
    tone: "olive" as const,
    sessions: 3,
  },
  {
    code: "SPAN 310",
    title: "Conversation",
    hours: 2,
    tone: "slate" as const,
    sessions: 2,
  },
];

const hoursTotal = hoursBySubject.reduce((sum, row) => sum + row.hours, 0);

const barFill: Record<(typeof hoursBySubject)[number]["tone"], string> = {
  burgundy: "bg-burgundy",
  olive: "bg-olive",
  slate: "bg-slate-blue",
};

const activity = [
  { label: "Sessions completed", value: "8" },
  { label: "Sessions scheduled", value: "3" },
  { label: "Sessions cancelled", value: "1" },
  { label: "Average length", value: "68 min" },
  { label: "Hours this term", value: "11.5" },
  { label: "Tutors engaged", value: "4" },
  { label: "Amount paid (term)", value: "$287.50" },
];

const sessions = [
  {
    id: "1",
    day: "Thu",
    date: "21 Aug",
    time: "16:00–17:00",
    duration: "60 min",
    mode: "Remote",
    code: "MATH 201",
    title: "Calculus II",
    tone: "burgundy" as const,
    tutor: "Layla Hassan, MSc",
    note: "Bring Q3 from the problem set.",
  },
  {
    id: "2",
    day: "Sat",
    date: "23 Aug",
    time: "11:00–12:30",
    duration: "90 min",
    mode: "Campus · Sci 2.14",
    code: "CHEM 240",
    title: "Organic Chemistry",
    tone: "olive" as const,
    tutor: "Omar Reid, PhD candidate",
    note: "Lab report outline.",
  },
  {
    id: "3",
    day: "Mon",
    date: "25 Aug",
    time: "18:30–19:30",
    duration: "60 min",
    mode: "Remote",
    code: "SPAN 310",
    title: "Conversation",
    tone: "slate" as const,
    tutor: "Sofia Alvarez, MA",
    note: "Assigned reading: Unidad 4.",
  },
];

const tutors = [
  {
    name: "Layla Hassan",
    credentials: "MSc",
    dept: "Mathematics",
    rate: "$32/hr",
    last: "14 Aug",
    sessions: 5,
  },
  {
    name: "Omar Reid",
    credentials: "PhD cand.",
    dept: "Chemistry",
    rate: "$38/hr",
    last: "9 Aug",
    sessions: 3,
  },
  {
    name: "Sofia Alvarez",
    credentials: "MA",
    dept: "Modern Languages",
    rate: "$28/hr",
    last: "2 Aug",
    sessions: 2,
  },
  {
    name: "Kenji Ito",
    credentials: "MEng",
    dept: "Computer Science",
    rate: "$35/hr",
    last: "28 Jul",
    sessions: 1,
  },
];

export function Dashboard() {
  // const [profile, setProfile] = useState(null);

  // useEffect(() => {
  //   getMyStudentProfile()
  //     .then(({ profile }) => setProfile(profile))
  //     .catch(() => setProfile(null));
  // }, []);

  return (
    <div className="mx-auto grid max-w-7xl gap-2 lg:grid-cols-[minmax(0,1fr)_300px]">
      <div className="flex min-w-0 flex-col gap-2">
        <section className="grid gap-2 lg:grid-cols-2">
          

            {/* <div >
              <CompleteProfileBanner profile={profile} />
            </div> */}
            
            
          

          
          <article className="rounded-sm border border-border-subtle bg-surface-card p-4">
            <div className="mb-2 flex items-baseline justify-between gap-2">
              <h2 className="font-serif text-base font-semibold text-ink">
                Hours by course
              </h2>
              <p className="text-[11px] text-muted">
                Autumn 2026 · {hoursTotal.toFixed(1)} hrs
              </p>
            </div>

            

            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border-subtle text-left text-muted">
                  <th className="py-1.5 font-medium">Course</th>
                  <th className="py-1.5 font-medium">Sessions</th>
                  <th className="w-[28%] py-1.5 font-medium"></th>
                  <th className="py-1.5 text-right font-medium">Hours</th>
                  <th className="py-1.5 pl-2 text-right font-medium">Share</th>
                </tr>
              </thead>
              <tbody>
                {hoursBySubject.map((row) => (
                  <tr
                    key={row.code}
                    className="border-b border-border-subtle last:border-0"
                  >
                    <td className="py-2 pr-2">
                      <CourseLabel
                        code={row.code}
                        title={row.title}
                        tone={row.tone}
                      />
                    </td>
                    <td className="tabular-nums text-muted">{row.sessions}</td>
                    <td className="py-2">
                      <div className="h-1.5 bg-border-subtle">
                        <div
                          className={`h-1.5 ${barFill[row.tone]}`}
                          style={{
                            width: `${(row.hours / hoursTotal) * 100}%`,
                          }}
                        />
                      </div>
                    </td>
                    <td className="tabular-nums text-right text-ink">
                      {row.hours.toFixed(1)}
                    </td>
                    <td className="pl-2 text-right tabular-nums text-muted">
                      {Math.round((row.hours / hoursTotal) * 100)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </article>

          <article className="rounded-sm border border-border-subtle bg-surface-card pt-0 p-4">
            <div className="mb-1 flex items-baseline justify-between gap-2">
              <h2 className="font-serif text-base font-semibold text-ink">
                Hours per week
              </h2>
              <p className="text-[11px] text-muted">Weeks 1–8 · Autumn 2026</p>
            </div>
            <HoursTrendChart />
          </article>

          
        </section>

        <section className="rounded-sm border border-border-subtle bg-surface-card p-4">
          <div className="mb-3 flex items-end justify-between gap-2">
            <h2 className="font-serif text-lg font-semibold text-ink">
              Upcoming sessions
            </h2>
            <button
              type="button"
              className="text-sm text-brand-primary hover:underline"
            >
              View all
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-border-subtle text-[11px] font-medium tracking-wide text-muted uppercase">
                  <th className="py-2 pr-3">Date</th>
                  <th className="py-2 pr-3">Course</th>
                  <th className="py-2 pr-3">Tutor</th>
                  <th className="py-2 pr-3">Time</th>
                  <th className="py-2 pr-3">Format</th>
                  <th className="py-2"></th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((session) => (
                  <tr
                    key={session.id}
                    className="border-b border-border-subtle last:border-0 align-top"
                  >
                    <td className="py-3 pr-3 whitespace-nowrap">
                      <p className="font-medium text-ink">{session.date}</p>
                      <p className="text-xs text-muted">{session.day}</p>
                    </td>
                    <td className="py-3 pr-3">
                      <CourseLabel
                        code={session.code}
                        title={session.title}
                        tone={session.tone}
                      />
                    </td>
                    <td className="py-3 pr-3 text-ink">{session.tutor}</td>
                    <td className="py-3 pr-3 whitespace-nowrap tabular-nums text-muted">
                      {session.time}
                      <span className="block text-xs">{session.duration}</span>
                    </td>
                    <td className="py-3 pr-3 text-xs text-muted">
                      {session.mode}
                    </td>
                    <td className="py-3 whitespace-nowrap text-right">
                      <button
                        type="button"
                        className="text-sm font-medium text-brand-primary hover:underline"
                      >
                        Join
                      </button>
                      <span className="mx-1.5 text-border-subtle">|</span>
                      <button
                        type="button"
                        className="text-sm text-muted hover:text-ink hover:underline"
                      >
                        Reschedule
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-sm border border-border-subtle bg-surface-card p-4">
          <h2 className="font-serif mb-3 text-lg font-semibold text-ink">
            Recent tutors
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead>
                <tr className="border-b border-border-subtle text-[11px] font-medium tracking-wide text-muted uppercase">
                  <th className="py-2 pr-3">Tutor</th>
                  <th className="py-2 pr-3">Department</th>
                  <th className="py-2 pr-3">Rate</th>
                  <th className="py-2 pr-3">Sessions</th>
                  <th className="py-2 pr-3">Last session</th>
                  <th className="py-2"></th>
                </tr>
              </thead>
              <tbody>
                {tutors.map((tutor) => (
                  <tr
                    key={tutor.name}
                    className="border-b border-border-subtle last:border-0"
                  >
                    <td className="py-2.5 pr-3">
                      <span className="font-medium text-ink">{tutor.name}</span>
                      <span className="ml-1.5 text-xs text-muted">
                        {tutor.credentials}
                      </span>
                    </td>
                    <td className="py-2.5 pr-3 text-muted">{tutor.dept}</td>
                    <td className="py-2.5 pr-3 tabular-nums text-ink">
                      {tutor.rate}
                    </td>
                    <td className="py-2.5 pr-3 tabular-nums text-muted">
                      {tutor.sessions}
                    </td>
                    <td className="py-2.5 pr-3 text-muted">{tutor.last}</td>
                    <td className="py-2.5 text-right">
                      <button
                        type="button"
                        className="text-sm text-brand-primary hover:underline"
                      >
                        Book
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <aside className="flex flex-col gap-2">
        <section className="rounded-sm border border-border-subtle bg-surface-card p-4">
          <h2 className="font-serif text-base font-semibold text-ink">
            Shortcuts
          </h2>
          <ul className="mt-2 divide-y divide-border-subtle text-sm">
            <li>
              <button
                type="button"
                className="w-full py-2 text-left text-brand-primary hover:underline"
              >
                Browse tutor directory
              </button>
            </li>
            <li>
              <button
                type="button"
                className="w-full py-2 text-left text-brand-primary hover:underline"
              >
                Message L. Hassan
              </button>
            </li>
            <li>
              <button
                type="button"
                className="w-full py-2 text-left text-brand-primary hover:underline"
              >
                Register a course
              </button>
            </li>
          </ul>
        </section>

        <section className="rounded-sm border border-border-subtle bg-surface-card p-4">
          <h2 className="font-serif text-base font-semibold text-ink">
            Term record
          </h2>
          <p className="mt-0.5 text-[11px] text-muted">Autumn 2026</p>
          <dl className="mt-2 divide-y divide-border-subtle text-xs">
            {activity.map((row) => (
              <div
                key={row.label}
                className="flex justify-between gap-2 py-1.5"
              >
                <dt className="text-muted">{row.label}</dt>
                <dd className="tabular-nums text-ink">{row.value}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="rounded-sm bg-brand-primary p-4 text-white">
          <h2 className="font-serif text-base font-semibold">Become a tutor</h2>
          <p className="mt-2 text-sm leading-relaxed text-white/70">
            Applicants must be currently enrolled and have completed the listed
            course with a mark of B or higher. Hourly rates and payouts are set
            in your tutor profile.
          </p>
          <button
            type="button"
            className="mt-4 w-full rounded-sm bg-white py-2 text-sm font-medium text-brand-primary hover:bg-surface-bg"
          >
            View requirements
          </button>
        </section>
      </aside>
    </div>
  );
}
