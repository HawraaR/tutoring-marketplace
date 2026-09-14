/* eslint-disable @typescript-eslint/no-unused-expressions */
import { CalendarDays } from "lucide-react";
import { useSessions } from "../hooks/useSessions";
import { SessionControls } from "../components/sessions/SessionControls";
import { SessionRow } from "../components/sessions/SessionRow";
import { useState } from "react";
import { BookingModal } from "../components/sessions/sessionBookingModel";

export function SessionPage() {
  const [bookingOpen, setBookingOpen] = useState(false);
  const {
    loading,
    activeTab,
    setActiveTab,
    subjectFilter,
    setSubjectFilter,
    subjects,
    sessions,
    groupedSessions,
    visibleSessions,
    isTutorMode,
    handleAction,
    refreshSessions,
  } = useSessions();

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-medium tracking-[0.16em] text-burgundy uppercase">Autumn 2026</p>
          <h1 className="font-serif text-2xl font-semibold text-ink">
            {isTutorMode ? "Teaching Sessions" : "My Sessions"}
          </h1>
          <p className="mt-1 text-sm text-muted">
            {isTutorMode
              ? "Keep track of your upcoming teaching schedule and student requests."
              : "Keep track of your tutoring time and upcoming work."}
          </p>
        </div>

        {!isTutorMode && (
          <button
            type="button"
            onClick={() => setBookingOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-sm bg-brand-primary px-3 py-2 text-sm font-medium text-white hover:bg-brand-primary-hover"
          >
            <CalendarDays className="h-4 w-4" />
            Book a session
          </button>
        )}
      </div>

      <SessionControls
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        subjectFilter={subjectFilter}
        setSubjectFilter={setSubjectFilter}
        subjects={subjects}
        sessions={sessions}
      />

      <section className="overflow-hidden rounded-sm border border-border-subtle bg-surface-card">
        {loading ? (
          <div className="flex min-h-64 items-center justify-center text-sm text-muted">
            Loading sessions...
          </div>
        ) : visibleSessions.length > 0 ? (
          Object.entries(groupedSessions).map(([date, dateSessions]) => (
            <div key={date}>
              <div className="border-b border-border-subtle bg-surface-bg px-4 py-2.5 text-[11px] font-medium tracking-wide text-muted uppercase md:px-5">
                {date}
              </div>
              {dateSessions.map((session) => (
                <SessionRow
                  key={session.id}
                  session={session}
                  isTutorMode={isTutorMode}
                  onAction={handleAction}
                  onReviewSubmitted={refreshSessions}
                />
              ))}
            </div>
          ))
        ) : (
          <div className="flex min-h-64 flex-col items-center justify-center px-5 text-center">
            <CalendarDays className="h-8 w-8 text-border-subtle" />
            <h2 className="mt-3 font-serif text-lg font-semibold text-ink">No {activeTab} sessions</h2>
            <p className="mt-1 max-w-sm text-sm text-muted">
              {isTutorMode
                ? "You have no teaching sessions matching this view."
                : "Try another subject filter or book a new tutoring session."}
            </p>
          </div>
          
        )}
      </section>
      {bookingOpen && (
        <BookingModal
          onClose={() => setBookingOpen(false)}
          onBooked={refreshSessions}
        />
      )}
    </div>
  );
  
}