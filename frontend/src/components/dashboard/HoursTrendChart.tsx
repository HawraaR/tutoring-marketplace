const WEEKLY_HOURS = [1, 1.5, 2, 0.5, 2.5, 1.5, 2, 0.5];
const LABELS = ["1", "2", "3", "4", "5", "6", "7", "8"];

const WIDTH = 240;
const HEIGHT = 72;
const PAD_L = 22;
const PAD_B = 16;
const PAD_T = 6;
const PAD_R = 4;

export function HoursTrendChart() {
  const max = Math.max(...WEEKLY_HOURS);
  const innerW = WIDTH - PAD_L - PAD_R;
  const innerH = HEIGHT - PAD_T - PAD_B;

  const points = WEEKLY_HOURS.map((h, i) => {
    const x = PAD_L + (i / (WEEKLY_HOURS.length - 1)) * innerW;
    const y = PAD_T + innerH - (h / max) * innerH;
    return { x, y, h };
  });

  const d = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
  const gridYs = [0, 0.5, 1];

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      className="h-20 w-full text-muted"
      role="img"
      aria-label="Hours of tutoring per week for the current term, weeks 1 through 8"
    >
      {gridYs.map((t) => {
        const y = PAD_T + innerH * (1 - t);
        return (
          <line
            key={t}
            x1={PAD_L}
            x2={WIDTH - PAD_R}
            y1={y}
            y2={y}
            stroke="#e4e6ea"
            strokeWidth="1"
          />
        );
      })}
      <text x="0" y={PAD_T + 7} fill="#5b6270" fontSize="8">
        {max}
      </text>
      <text x="4" y={PAD_T + innerH + 3} fill="#5b6270" fontSize="8">
        0
      </text>
      <path d={d} fill="none" stroke="#2f6aa0" strokeWidth="1.75" strokeLinejoin="round" />
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="2" fill="#1e3a5f" />
      ))}
      {LABELS.map((label, i) => (
        <text
          key={label}
          x={points[i].x}
          y={HEIGHT - 2}
          textAnchor="middle"
          fill="#5b6270"
          fontSize="8"
        >
          {label}
        </text>
      ))}
    </svg>
  );
}
