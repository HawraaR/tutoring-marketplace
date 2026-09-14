import type { AvailabilitySlot } from "../../types/availabilitySlot";

export function startOfWeek(d: Date): Date {
  const date = new Date(d);
  const day = (date.getDay() + 6) % 7; // Monday = 0
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - day);
  return date;
}

export function addDays(d: Date, n: number): Date {
  const date = new Date(d);
  date.setDate(date.getDate() + n);
  return date;
}

/** Local-timezone day key, e.g. "2026-10-26" */
export function dayKey(d: Date | string): string {
  const date = typeof d === "string" ? new Date(d) : d;
  const m = `${date.getMonth() + 1}`.padStart(2, "0");
  const dd = `${date.getDate()}`.padStart(2, "0");
  return `${date.getFullYear()}-${m}-${dd}`;
}

/** "01:00 PM" (matches the sketch) */
export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

/** "1 Hour" / "2 Hours" / "90 min" */
export function formatDuration(startIso: string, endIso: string): string {
  const mins = (new Date(endIso).getTime() - new Date(startIso).getTime()) / 60000;
  if (mins % 60 === 0) {
    const h = mins / 60;
    return `${h} Hour${h === 1 ? "" : "s"}`;
  }
  return `${mins} min`;
}

/** "October 24 - 30" (or "October 30 - November 5" across months) */
export function weekRangeLabel(weekStart: Date): string {
  const end = addDays(weekStart, 6);
  const startMonth = weekStart.toLocaleDateString("en-US", { month: "long" });
  if (weekStart.getMonth() === end.getMonth()) {
    return `${startMonth} ${weekStart.getDate()} - ${end.getDate()}`;
  }
  const endMonth = end.toLocaleDateString("en-US", { month: "long" });
  return `${startMonth} ${weekStart.getDate()} - ${endMonth} ${end.getDate()}`;
}

/** Groups slots by local day, sorted chronologically inside each day */
export function groupSlotsByDay(slots: AvailabilitySlot[]): Map<string, AvailabilitySlot[]> {
  const map = new Map<string, AvailabilitySlot[]>();
  for (const s of slots) {
    const k = dayKey(s.startTime);
    const arr = map.get(k) ?? [];
    arr.push(s);
    map.set(k, arr);
  }
  for (const arr of map.values()) {
    arr.sort((a, b) => +new Date(a.startTime) - +new Date(b.startTime));
  }
  return map;
}