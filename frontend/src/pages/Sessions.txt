import { useMemo, useState } from "react";
import {
  CalendarDays,
  Check,
  ChevronDown,
  Clock3,
  MessageCircle,
  MoreHorizontal,
  Video,
} from "lucide-react";
import { CourseLabel } from "../components/dashboard/CourseLabel";
import { initialSessions, type Session, type SessionStatus } from "../data/sessions";

type SessionTab = "upcoming" | "past" | "cancelled";

const tabs: { id: SessionTab; label: string }[] = [
  { id: "upcoming", label: "Upcoming" },
  { id: "past", label: "Past" },
  { id: "cancelled", label: "Cancelled" },
];

const statusStyles: Record<SessionStatus, string> = {
  upcoming: "bg-olive/10 text-olive",
  past: "bg-slate-blue/10 text-slate-blue",
  cancelled: "bg-error/10 text-error",
};

function SessionRow({
  session,
  onAction,
}: {
  session: Session;
  onAction: (id: string, action: "join" | "message" | "reschedule" | "cancel") => void;
}) {
  return (
    <article className="border-b border-border-subtle px-4 py-4 last:border-0 md:px-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
        <div className="flex items-center gap-3 lg:w-44 lg:shrink-0">
          <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-sm bg-brand-primary text-white">
            <span className="text-[10px] font-medium uppercase">{session.day}</span>
            <span className="font-serif text-lg leading-none">{session.date.split(" ")[0]}</span>
          </div>
          <div className="lg:hidden">
            <p className="text-sm font-medium text-ink">{session.date}</p>
            <p className="text-xs text-muted">{session.time}</p>
          </div>
          <div className={`hidden rounded-full px-2 py-1 text-[10px] font-medium uppercase lg:block ${statusStyles[session.status]}`}>
            {session.status}
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <CourseLabel code={session.code} title={session.title} tone={session.tone} />
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
            <span className="inline-flex items-center gap-1"><Clock3 className="h-3.5 w-3.5" />{session.time} · {session.duration}</span>
            <span>{session.mode}</span>
          </div>
          <p className="mt-2 text-sm text-ink"><span className="font-medium">{session.tutor}</span><span className="ml-1.5 text-xs text-muted">{session.credentials}</span></p>
          <p className="mt-1 text-xs text-muted">{session.note}</p>
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-border-subtle pt-3 lg:w-48 lg:shrink-0 lg:border-0 lg:pt-0 lg:justify-end">
          {session.status === "upcoming" ? (
            <>
              <button type="button" onClick={() => onAction(session.id, "join")} className="inline-flex items-center gap-1.5 rounded-sm bg-brand-primary px-3 py-2 text-xs font-medium text-white hover:bg-brand-primary-hover"><Video className="h-3.5 w-3.5" />Join</button>
              <button type="button" aria-label={`More actions for ${session.title}`} title="More actions" className="rounded-sm p-2 text-muted hover:bg-surface-bg hover:text-ink"><MoreHorizontal className="h-4 w-4" /></button>
              <button type="button" onClick={() => onAction(session.id, "cancel")} className="hidden text-xs text-muted hover:text-error sm:block">Cancel</button>
            </>
          ) : session.status === "past" ? (
            <button type="button" onClick={() => onAction(session.id, "message")} className="inline-flex items-center gap-1.5 text-xs font-medium text-brand-primary hover:underline"><MessageCircle className="h-3.5 w-3.5" />Message tutor</button>
          ) : (
            <span className="text-xs text-error">Session cancelled</span>
          )}
        </div>
      </div>
    </article>
  );
}

export function Sessions() {
  const [sessions, setSessions] = useState(initialSessions);
  const [activeTab, setActiveTab] = useState<SessionTab>("upcoming");
  const [courseFilter, setCourseFilter] = useState("all");
  const [notice, setNotice] = useState("");

  const courses = useMemo(() => [...new Set(sessions.map(({ code }) => code))], [sessions]);
  const visibleSessions = useMemo(
    () => sessions.filter(({ status, code }) => status === activeTab && (courseFilter === "all" || code === courseFilter)).sort((a, b) => b.sortDate.localeCompare(a.sortDate)),
    [activeTab, courseFilter, sessions],
  );

  const groupedSessions = useMemo(() => {
    return visibleSessions.reduce<Record<string, Session[]>>((groups, session) => {
      const key = `${session.day}, ${session.date}`;
      groups[key] = [...(groups[key] ?? []), session];
      return groups;
    }, {});
  }, [visibleSessions]);

  const handleAction = (id: string, action: "join" | "message" | "reschedule" | "cancel") => {
    const session = sessions.find((item) => item.id === id);
    if (!session) return;
    if (action === "cancel") {
      setSessions((items) => items.map((item) => item.id === id ? { ...item, status: "cancelled" } : item));
      setNotice(`${session.title} session cancelled.`);
      return;
    }
    setNotice(action === "join" ? `Opening your ${session.title} room...` : `Opening messages with ${session.tutor}...`);
  };

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-medium tracking-[0.16em] text-burgundy uppercase">Autumn 2026</p>
          <h1 className="font-serif text-2xl font-semibold text-ink">Sessions</h1>
          <p className="mt-1 text-sm text-muted">Keep track of your tutoring time and upcoming work.</p>
        </div>
        <button type="button" onClick={() => setNotice("Booking flow will open when the tutor directory is connected.")} className="inline-flex items-center justify-center gap-2 rounded-sm bg-brand-primary px-3 py-2 text-sm font-medium text-white hover:bg-brand-primary-hover"><CalendarDays className="h-4 w-4" />Book a session</button>
      </div>

      <section className="border-b border-border-subtle">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-5 overflow-x-auto">
            {tabs.map((tab) => (
              <button key={tab.id} type="button" onClick={() => { setActiveTab(tab.id); setNotice(""); }} className={`border-b-2 px-0.5 pb-2 text-sm font-medium whitespace-nowrap ${activeTab === tab.id ? "border-brand-primary text-brand-primary" : "border-transparent text-muted hover:text-ink"}`}>
                {tab.label}
                <span className="ml-1.5 text-xs tabular-nums">{sessions.filter(({ status }) => status === tab.id).length}</span>
              </button>
            ))}
          </div>
          <label className="relative mb-2 sm:mb-1">
            <span className="sr-only">Filter by course</span>
            <select value={courseFilter} onChange={(event) => setCourseFilter(event.target.value)} className="w-full appearance-none rounded-sm border border-border-subtle bg-surface-card py-2 pr-8 pl-3 text-sm text-ink outline-none focus:border-brand-primary sm:w-48">
              <option value="all">All courses</option>
              {courses.map((course) => <option key={course} value={course}>{course}</option>)}
            </select>
            <ChevronDown className="pointer-events-none absolute top-1/2 right-2.5 h-4 w-4 -translate-y-1/2 text-muted" />
          </label>
        </div>
      </section>

      {notice && <div className="flex items-center gap-2 border-l-2 border-olive bg-olive/10 px-3 py-2 text-sm text-ink"><Check className="h-4 w-4 text-olive" />{notice}</div>}

      <section className="overflow-hidden rounded-sm border border-border-subtle bg-surface-card">
        {visibleSessions.length > 0 ? Object.entries(groupedSessions).map(([date, dateSessions]) => (
          <div key={date}>
            <div className="border-b border-border-subtle bg-surface-bg px-4 py-2.5 text-[11px] font-medium tracking-wide text-muted uppercase md:px-5">{date}</div>
            {dateSessions.map((session) => <SessionRow key={session.id} session={session} onAction={handleAction} />)}
          </div>
        )) : (
          <div className="flex min-h-64 flex-col items-center justify-center px-5 text-center"><CalendarDays className="h-8 w-8 text-border-subtle" /><h2 className="mt-3 font-serif text-lg font-semibold text-ink">No {activeTab} sessions</h2><p className="mt-1 max-w-sm text-sm text-muted">Try another course filter or book a new tutoring session.</p></div>
        )}
      </section>
    </div>
  );
}
