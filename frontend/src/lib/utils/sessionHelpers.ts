import type { SessionStatus } from "../../types";

export type SessionTab = "upcoming" | "past" | "cancelled";

export const TABS: { id: SessionTab; label: string }[] = [
  { id: "upcoming", label: "Upcoming" },
  { id: "past", label: "Past" },
  { id: "cancelled", label: "Cancelled" },
];

export const STATUS_STYLES: Record<SessionStatus, string> = {
  upcoming: "bg-olive/10 text-olive",
  past: "bg-slate-blue/10 text-slate-blue",
  cancelled: "bg-error/10 text-error",
};

export function formatSessionDates(startStr: string, endStr: string) {
  const startObj = new Date(startStr);
  const endObj = new Date(endStr);
  const durationMin = Math.round((endObj.getTime() - startObj.getTime()) / 60000);

  const date = startObj.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
  const day = startObj.toLocaleDateString([], { weekday: "short" });
  const time = `${startObj.toLocaleTimeString([], { hour: "numeric", minute: "2-digit", hour12: true })} - ${endObj.toLocaleTimeString([], { hour: "numeric", minute: "2-digit", hour12: true })}`;
  const dayNumber = startObj.getDate();

  return { date, day, time, duration: `${durationMin} mins`, dayNumber, endObj };
}