/* eslint-disable no-useless-assignment */
import { CourseLabel } from "../components/dashboard/CourseLabel";
import { HoursTrendChart } from "../components/dashboard/HoursTrendChart";
import {
  daysUntil,
  fmtDate,
  fmtDay,
  fmtHours,
  fmtRange,
  minutesBetween,
} from "../components/dashboard/format";
import type { DashboardData, SessionRow } from "../types/dashboard";
import { createConversation } from "../api/messageAPI";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const barFill: Record<string, string> = {
  burgundy: "bg-burgundy",
  olive: "bg-olive",
  slate: "bg-slate-blue",
  charcoal: "bg-charcoal",
};

// Data is now strictly required. The Page component will handle the loading state.
export function Dashboard({ data }: { data: DashboardData }) {
  const navigate = useNavigate();
  // Add this temporarily to verify the exact JSON shape coming from your backend!
  console.log("Backend Dashboard Data:", data);

  const joinState = (s: SessionRow) => {
    const opensAt = new Date(s.start).getTime() - 15 * 60000;
    const closesAt = new Date(s.end).getTime();
    const now = new Date(data.now).getTime();
    if (!s.meetingUrl) return { enabled: false, hint: "In-person session" };
    if (now < opensAt)
      return { enabled: false, hint: "Opens 15 min before start" };
    if (now > closesAt) return { enabled: false, hint: "Session ended" };
    return { enabled: true, hint: "Join meeting" };
  };

  const weekDone =
    data.weeklyHours?.find((w) => w.week === data.weekIndex)?.hours ?? 0;

  // Prevent divide-by-zero crash if backend sends 0
  const targetHours = data.weeklyTargetHours || 1;

  const weekBooked = (data.upcoming || [])
    .filter((s) => s.status === "UPCOMING")
    .reduce((sum, s) => sum + minutesBetween(s.start, s.end) / 60, 0);

  const exportSessionLog = () => {
    const rows = data.sessions ?? data.upcoming ?? [];
    const headers = [
      "Date",
      "Course",
      "Tutor",
      "Status",
      "Duration (minutes)",
      "Format",
      "Notes",
    ];
    const escapeCsv = (value: string) => `"${value.replace(/"/g, '""')}"`;
    const csv = [
      headers,
      ...rows.map((session) => [
        new Date(session.start).toLocaleString(),
        `${session.course.code} ${session.course.title}`.trim(),
        session.tutorName,
        session.status,
        String(minutesBetween(session.start, session.end)),
        session.location ?? "",
        session.note ?? "",
      ]),
    ]
      .map((row) => row.map(escapeCsv).join(","))
      .join("\n");
    const url = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = "tutorium-session-log.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const messageTutor = async (tutorId: string) => {
    try {
      const conversation = await createConversation(tutorId);
      navigate(`/messages?conversationId=${conversation.id}`);
    } catch {
      toast.error("Could not open a conversation with this tutor.");
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* ── Header ─────────────────────────────────────── */}
      <header className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="text-sm text-muted">
            {data.termLabel} · Week {data.weekIndex} ·{" "}
            {(data.kpis?.upcomingCount ?? 0) > 0
              ? `${data.kpis.upcomingCount} upcoming sessions`
              : "no upcoming sessions"}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={exportSessionLog}
            className="rounded-sm border border-border-subtle bg-surface-card px-3 py-1.5 text-sm text-ink hover:border-muted"
          >
            Export session log
          </button>
        </div>
      </header>
      {/* ── Needs-your-attention strip ─────────────────── */}
      {data.attention && (
        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-2">
          {data.attention.map((a) => (
            <Link
              key={a.kind}
              to={a.href}
              className="flex items-start gap-3 rounded-sm border border-border-subtle bg-surface-card p-3 hover:border-muted"
            >
              <span className="mt-0.5 rounded-sm bg-warning-bg px-1.5 py-0.5 text-xs font-semibold tabular-nums text-warning">
                {a.count}
              </span>
              <span>
                <span className="block text-sm font-medium text-ink">
                  {a.title}
                </span>
                <span className="block text-xs text-muted">{a.detail}</span>
              </span>
            </Link>
          ))}
        </section>
      )}
      {/* ── KPI row ────────────────────────────────────── */}
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {[
          {
            label: "Hours completed",
            value: fmtHours(data.kpis?.hoursCompleted ?? 0),
            caption: `+${(data.kpis?.hoursDeltaVsLastWeek ?? 0).toFixed(1)}h vs last week`,
          },
          {
            label: "Sessions completed",
            value: String(data.kpis?.sessionsCompleted ?? 0),
            caption: `${data.termRecord?.sessionsCancelled ?? 0} cancelled this term`,
          },
          {
            label: "Upcoming sessions",
            value: String(data.kpis?.upcomingCount ?? 0),
            caption: data.nextSession
              ? `next in ${daysUntil(data.nextSession.start, data.now)} days`
              : "nothing booked",
          },
        ].map((k) => (
          <article
            key={k.label}
            className="rounded-sm border border-border-subtle bg-surface-card p-4 shadow-warm-sm"
          >
            <p className="text-[11px] font-medium tracking-wide text-muted uppercase">
              {k.label}
            </p>
            <p className="font-serif mt-1 text-2xl font-semibold tabular-nums text-ink">
              {k.value}
            </p>
            <p className="mt-0.5 text-xs text-muted">{k.caption}</p>
          </article>
        ))}
      </section>

      {/* ── Next session hero ──────────────────────────── */}
      {data.nextSession && (
        <section className="rounded-sm border border-border-subtle bg-surface-card p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex min-w-0 items-start gap-4">
              <div className="w-16 shrink-0 border-r border-border-subtle pr-3 text-center">
                <p className="text-[11px] tracking-wide text-muted uppercase">
                  {fmtDay(data.nextSession.start)}
                </p>
                <p className="font-serif text-lg font-semibold text-ink">
                  {fmtDate(data.nextSession.start)}
                </p>
                <p className="text-[11px] text-muted">
                  in {daysUntil(data.nextSession.start, data.now)}d
                </p>
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <CourseLabel
                    code={data.nextSession.course.code}
                    title={data.nextSession.course.title}
                    tone={data.nextSession.course.tone}
                  />
                  <StatusBadge status={data.nextSession.status} />
                </div>
                <p className="mt-1.5 text-sm text-ink">
                  {fmtRange(data.nextSession.start, data.nextSession.end)}
                  <span className="text-muted">
                    {" "}
                    ·{" "}
                    {minutesBetween(
                      data.nextSession.start,
                      data.nextSession.end,
                    )}{" "}
                    min ·{" "}
                  </span>
                  <span className="text-muted">
                    {data.nextSession.location}
                  </span>
                </p>
                <p className="mt-0.5 text-sm text-muted">
                  with {data.nextSession.tutorName},{" "}
                  {data.nextSession.tutorCredentials}
                </p>
                {data.nextSession.note && (
                  <p className="mt-2 border-l-2 border-border-subtle pl-2 text-xs text-muted italic">
                    {data.nextSession.note}
                  </p>
                )}
              </div>
            </div>
            <div className="flex flex-col shrink-0 items-center gap-2">
              {(() => {
                // const j = joinState(data.nextSession!);
                return (
                  <a
                    href={data.nextSession?.meetingUrl || undefined}
                    target="_blank"
                    rel="noopener noreferrer"
                    // aria-disabled={!j.enabled || !data.nextSession?.meetingUrl}
                    className={`w-32 text-center`}
                  >
                    <button
                      type="button"
                      // title={j.hint}
                      // disabled={!j.enabled}
                      className="w-full rounded-sm bg-brand-primary px-4 py-1.5 text-sm font-medium text-white hover:bg-brand-primary-hover disabled:cursor-not-allowed disabled:opacity-45"
                    >
                      Join
                    </button>
                  </a>
                );
              })()}
              <button
                type="button"
                onClick={() => messageTutor(data.nextSession!.tutorId)}
                className="w-32 rounded-sm border border-border-subtle px-3 py-1.5 text-center text-sm text-ink hover:border-muted"
              >
                Message
              </button>
            </div>
          </div>
        </section>
      )}

      {/* ── Main grid ──────────────────────────────────── */}
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="flex min-w-0 flex-col gap-4">
          <section className="grid gap-4 lg:grid-cols-2">
            {/* Hours by course */}
            <article className="rounded-sm border border-border-subtle bg-surface-card p-4">
              <div className="mb-2 flex items-baseline justify-between gap-2">
                <h2 className="font-serif text-base font-semibold text-ink">
                  Hours by course
                </h2>
                <p className="text-[11px] text-muted">
                  {data.termLabel} ·{" "}
                  {fmtHours(data.termRecord?.hoursCompleted ?? 0)} completed
                </p>
              </div>
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border-subtle text-left text-muted">
                    <th className="py-1.5 font-medium">Course</th>
                    <th className="py-1.5 font-medium">Sessions</th>
                    <th className="w-[26%] py-1.5 font-medium"></th>
                    <th className="py-1.5 text-right font-medium">Hours</th>
                    <th className="py-1.5 pl-2 text-right font-medium">
                      Share
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {/* Added Empty State */}
                  {(!data.hoursByCourse || data.hoursByCourse.length === 0) && (
                    <tr>
                      <td
                        colSpan={5}
                        className="py-6 text-center text-sm text-muted"
                      >
                        No completed sessions yet this term.
                      </td>
                    </tr>
                  )}
                  {data.hoursByCourse?.map((row) => (
                    <tr
                      key={row.subjectId}
                      className="border-b border-border-subtle last:border-0"
                    >
                      <td className="py-2 pr-2">
                        <CourseLabel
                          code={row.code}
                          title={row.title}
                          tone={row.tone}
                        />
                      </td>
                      <td className="tabular-nums text-muted">
                        {row.sessions}
                      </td>
                      <td className="py-2">
                        <div className="h-1.5 bg-border-subtle">
                          <div
                            className={`h-1.5 ${barFill[row.tone]}`}
                            style={{ width: `${row.sharePct}%` }}
                          />
                        </div>
                      </td>
                      <td className="tabular-nums text-right text-ink">
                        {row.hours.toFixed(1)}
                      </td>
                      <td className="pl-2 text-right tabular-nums text-muted">
                        {row.sharePct}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </article>

            {/* Hours per week + goal meter */}
            <article className="rounded-sm border border-border-subtle bg-surface-card p-4">
              <div className="mb-1 flex items-baseline justify-between gap-2">
                <h2 className="font-serif text-base font-semibold text-ink">
                  Hours per week
                </h2>
                <p className="text-[11px] text-muted">
                  Weeks 1–{data.weeklyHours?.length ?? 0} · completed
                </p>
              </div>
              <HoursTrendChart
                data={data.weeklyHours || []}
                target={targetHours}
                currentWeek={data.weekIndex}
              />
              <div className="mt-2 border-t border-border-subtle pt-2">
                <div className="flex justify-between text-[11px] text-muted">
                  <span>
                    Weekly goal · {fmtHours(weekDone)} of{" "}
                    {fmtHours(targetHours)}
                  </span>
                  <span>+{weekBooked.toFixed(1)}h booked ahead</span>
                </div>
                <div className="mt-1 h-1.5 bg-border-subtle">
                  {/* Safe division using targetHours fallback */}
                  <div
                    className="h-1.5 bg-olive"
                    style={{
                      width: `${Math.min(100, (weekDone / targetHours) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            </article>
          </section>

          {/* Upcoming sessions */}
          <section className="rounded-sm border border-border-subtle bg-surface-card p-4">
            <div className="mb-3 flex items-end justify-between gap-2">
              <h2 className="font-serif text-lg font-semibold text-ink">
                Upcoming sessions
              </h2>
              <a
                href="/sessions?scope=upcoming"
                className="text-sm text-brand-primary hover:underline"
              >
                View all
              </a>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead>
                  <tr className="border-b border-border-subtle text-[11px] font-medium tracking-wide text-muted uppercase">
                    <th className="py-2 pr-3">Date</th>
                    <th className="py-2 pr-3">Course</th>
                    <th className="py-2 pr-3">Tutor</th>
                    <th className="py-2 pr-3">Time</th>
                    <th className="py-2 pr-3">Format</th>
                    <th className="py-2 pr-3">Status</th>
                    <th className="py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {(!data.upcoming || data.upcoming.length === 0) && (
                    <tr>
                      <td
                        colSpan={7}
                        className="py-6 text-center text-sm text-muted"
                      >
                        Nothing booked yet — browse the tutor directory to
                        schedule your first session.
                      </td>
                    </tr>
                  )}
                  {data.upcoming?.map((s) => {
                    const j = joinState(s);
                    return (
                      <tr
                        key={s.id}
                        className="border-b border-border-subtle align-top last:border-0"
                      >
                        <td className="py-3 pr-3 whitespace-nowrap">
                          <p className="font-medium text-ink">
                            {fmtDate(s.start)}
                          </p>
                          <p className="text-xs text-muted">
                            {fmtDay(s.start)}
                          </p>
                        </td>
                        <td className="py-3 pr-3">
                          <CourseLabel
                            code={s.course.code}
                            title={s.course.title}
                            tone={s.course.tone}
                          />
                        </td>
                        <td className="py-3 pr-3 text-ink">{s.tutorName}</td>
                        <td className="py-3 pr-3 whitespace-nowrap tabular-nums text-muted">
                          {fmtRange(s.start, s.end)}
                          <span className="block text-xs">
                            {minutesBetween(s.start, s.end)} min
                          </span>
                        </td>
                        <td className="py-3 pr-3 text-xs text-muted">
                          {s.location}
                        </td>
                        <td className="py-3 pr-3">
                          <StatusBadge status={s.status} />
                        </td>
                        <td className="py-3 whitespace-nowrap text-right">
                          <div className="flex justify-end gap-3">
                            {s.status === "UPCOMING" && (
                              <button
                                type="button"
                                title={j.hint}
                                disabled={!j.enabled}
                                className="text-sm font-medium text-brand-primary hover:underline disabled:cursor-not-allowed disabled:text-muted disabled:no-underline"
                              >
                                Join
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => messageTutor(s.tutorId)}
                              className="text-sm font-medium text-brand-primary hover:underline"
                            >
                              Message
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

          {/* Recent tutors */}
          <section className="rounded-sm border border-border-subtle bg-surface-card p-4">
            <div className="mb-3 flex items-end justify-between gap-2">
              <h2 className="font-serif text-lg font-semibold text-ink">
                Recent tutors
              </h2>
              <Link
                to="/directory"
                className="text-sm text-brand-primary hover:underline"
              >
                View all
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-left text-sm">
                <thead>
                  <tr className="border-b border-border-subtle text-[11px] font-medium tracking-wide text-muted uppercase">
                    <th className="py-2 pr-3">Tutor</th>
                    <th className="py-2 pr-3">Rating</th>
                    <th className="py-2 pr-3">Price</th>
                    <th className="py-2 pr-3">Sessions</th>
                    <th className="py-2 pr-3">Last session</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Added Empty State */}
                  {(!data.tutors || data.tutors.length === 0) && (
                    <tr>
                      <td
                        colSpan={5}
                        className="py-6 text-center text-sm text-muted"
                      >
                        No recent tutors found.
                      </td>
                    </tr>
                  )}
                  {data.tutors?.map((t) => (
                    <tr
                      key={t.tutorId}
                      className="border-b border-border-subtle last:border-0"
                    >
                      <td className="py-2.5 pr-3">
                        <span className="font-medium text-ink">{t.name}</span>
                        <span className="ml-1.5 text-xs text-muted">
                          {t.credentials}
                        </span>
                      </td>
                      <td className="py-2.5 pr-3 tabular-nums text-ink">
                        ★ {(t.averageRating ?? 0).toFixed(1)}
                        <span className="ml-1 text-xs text-muted">
                          ({t.reviewCount ?? 0})
                        </span>
                      </td>
                      <td className="py-2.5 pr-3 tabular-nums text-ink">
                        ${(t.hourlyRate ?? 0).toFixed(0)}/hr
                      </td>
                      <td className="py-2.5 pr-3 tabular-nums text-muted">
                        {t.sessionsCompleted ?? 0}
                      </td>
                      <td className="py-2.5 pr-3 text-muted">
                        {t.lastSessionOn ? fmtDate(t.lastSessionOn) : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* ── Right rail ───────────────────────────────── */}
        <aside className="flex flex-col gap-4">
          <section className="rounded-sm border border-border-subtle bg-surface-card p-4">
            <h2 className="font-serif text-base font-semibold text-ink">
              Term record
            </h2>
            <p className="mt-0.5 text-[11px] text-muted">
              {data.termRecord?.label || data.termLabel}
            </p>
            <dl className="mt-2 divide-y divide-border-subtle text-xs">
              {[
                [
                  "Sessions completed",
                  String(data.termRecord?.sessionsCompleted ?? 0),
                ],
                [
                  "Sessions scheduled",
                  String(data.termRecord?.sessionsScheduled ?? 0),
                ],
                [
                  "Sessions cancelled",
                  String(data.termRecord?.sessionsCancelled ?? 0),
                ],
                [
                  "Hours completed",
                  fmtHours(data.termRecord?.hoursCompleted ?? 0),
                ],
                ["Tutors engaged", String(data.termRecord?.tutorsEngaged ?? 0)],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between gap-2 py-1.5">
                  <dt className="text-muted">{label}</dt>
                  <dd className="tabular-nums text-ink">{value}</dd>
                </div>
              ))}
            </dl>
          </section>
        </aside>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: SessionRow["status"] }) {
  let label = "";
  let styles = "";

  if (status === "UPCOMING") {
    label = "Upcoming";
    styles = "bg-slate-blue/10 text-slate-blue";
  } else if (status === "PAST") {
    label = "Past";
    styles = "bg-muted/10 text-muted";
  } else if (status === "CANCELED") {
    label = "Canceled";
    styles = "bg-error/10 text-error";
  } else {
    label = String(status);
    styles = "bg-muted/10 text-muted";
  }

  return (
    <span
      className={`inline-block rounded-sm px-1.5 py-0.5 text-[11px] font-medium ${styles}`}
    >
      {label}
    </span>
  );
}
