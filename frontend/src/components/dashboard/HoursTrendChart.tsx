import type { WeeklyHours } from "../../types/dashboard";

const WIDTH = 260;
const HEIGHT = 92;
const PAD_L = 24;
const PAD_R = 8;
const PAD_T = 8;
const PAD_B = 16;

interface Props {
  data: WeeklyHours[];
  target?: number;
  currentWeek: number;
}

export function HoursTrendChart({ data, target, currentWeek }: Props) {
  const peak = Math.max(...data.map((d) => d.hours), target ?? 0);
  const max = peak * 1.15 || 1;
  const innerW = WIDTH - PAD_L - PAD_R;
  const innerH = HEIGHT - PAD_T - PAD_B;

  const x = (i: number) => PAD_L + (i / Math.max(1, data.length - 1)) * innerW;
  const y = (h: number) => PAD_T + innerH - (h / max) * innerH;

  const pts = data.map((d, i) => ({ ...d, cx: x(i), cy: y(d.hours) }));
  const line = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.cx.toFixed(1)} ${p.cy.toFixed(1)}`).join(" ");
  const baseY = PAD_T + innerH;
  const area = `${line} L ${pts[pts.length - 1].cx.toFixed(1)} ${baseY.toFixed(1)} L ${pts[0].cx.toFixed(1)} ${baseY.toFixed(1)} Z`;

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      className="h-24 w-full text-muted"
      role="img"
      aria-label={`Completed tutoring hours per week, weeks 1 to ${data.length}`}
    >
      {[0, 0.5, 1].map((t) => (
        <line key={t} x1={PAD_L} x2={WIDTH - PAD_R} y1={PAD_T + innerH * (1 - t)} y2={PAD_T + innerH * (1 - t)} stroke="#e4e6ea" strokeWidth="1" />
      ))}
      <text x="0" y={PAD_T + 6} fill="#5b6270" fontSize="8">{max.toFixed(1)}</text>
      <text x="4" y={baseY + 3} fill="#5b6270" fontSize="8">0</text>

      {target != null && (
        <>
          <line x1={PAD_L} x2={WIDTH - PAD_R} y1={y(target)} y2={y(target)} stroke="#4f7a28" strokeWidth="1" strokeDasharray="3 3" />
          <text x={WIDTH - PAD_R} y={y(target) - 3} textAnchor="end" fill="#4f7a28" fontSize="7">target {target}h</text>
        </>
      )}

      <path d={area} fill="#2f6aa0" opacity="0.08" />
      <path d={line} fill="none" stroke="#2f6aa0" strokeWidth="1.75" strokeLinejoin="round" />

      {pts.map((p) => (
        <circle
          key={p.week}
          cx={p.cx}
          cy={p.cy}
          r={p.week === currentWeek ? 3 : 2}
          fill={p.week === currentWeek ? "#1e3a5f" : "#2f6aa0"}
          stroke={p.week === currentWeek ? "#ffffff" : "none"}
          strokeWidth="1"
        >
          <title>{`Week ${p.week}: ${p.hours}h`}</title>
        </circle>
      ))}

      {pts.map((p) => (
        <text key={`l${p.week}`} x={p.cx} y={HEIGHT - 2} textAnchor="middle" fill="#5b6270" fontSize="8">
          {p.week}
        </text>
      ))}
    </svg>
  );
}