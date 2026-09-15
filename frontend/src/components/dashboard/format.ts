const dt = (iso: string) => new Date(iso);

export const fmtMoney = (n: number) => `$${n.toFixed(2)}`;
export const fmtHours = (h: number) => `${h.toFixed(1)}h`;
export const fmtDate = (iso: string) =>
  dt(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
export const fmtDay = (iso: string) =>
  dt(iso).toLocaleDateString("en-GB", { weekday: "short" });
export const fmtTime = (iso: string) =>
  dt(iso).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
export const fmtRange = (s: string, e: string) => `${fmtTime(s)}–${fmtTime(e)}`;
export const minutesBetween = (s: string, e: string) =>
  Math.round((dt(e).getTime() - dt(s).getTime()) / 60000);
export const daysUntil = (iso: string, now: string) =>
  Math.max(0, Math.ceil((dt(iso).getTime() - dt(now).getTime()) / 86400000));