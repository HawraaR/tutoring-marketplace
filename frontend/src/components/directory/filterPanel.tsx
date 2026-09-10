// src/components/tutors/filterPanel.tsx
import type { Subject } from "../../types/tutor";
import {
  DAY_OPTIONS,
  PRICE_BOUNDS,
  type TutorFilters,
} from "../../lib/directory/tutorFilters";
import { IconSearch } from "./icons";

interface Props {
  filters: TutorFilters;
  onChange: (f: TutorFilters) => void;
  onClear: () => void;
  subjects: Subject[];
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">
      {children}
    </p>
  );
}

export function FilterPanel({ filters, onChange, onClear, subjects }: Props) {
  const span = PRICE_BOUNDS.max - PRICE_BOUNDS.min;
  const minPct = ((filters.priceMin - PRICE_BOUNDS.min) / span) * 100;
  const maxPct = ((filters.priceMax - PRICE_BOUNDS.min) / span) * 100;

  const toggleDay = (d: number) =>
    onChange({
      ...filters,
      days: filters.days.includes(d)
        ? filters.days.filter((x) => x !== d)
        : [...filters.days, d],
    });

  return (
    <div className="flex flex-wrap items-start gap-6 rounded-xl border border-border-subtle bg-surface-card p-4 shadow-warm-sm">
      {/* ── Name ──────────────────────────────────────── */}
      <div className="min-w-[14rem] flex-1 sm:max-w-xs">
        <SectionLabel>Search by name</SectionLabel>
        <div className="relative">
          <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            type="search"
            value={filters.search}
            onChange={(e) => onChange({ ...filters, search: e.target.value })}
            placeholder="Tutor name…"
            className="w-full rounded-lg border border-border-subtle bg-surface-card py-2 pl-9 pr-3 text-sm text-ink placeholder:text-muted focus:border-slate-blue focus:outline-none"
          />
        </div>
      </div>

      {/* ── Subject ───────────────────────────────────── */}
      <div className="min-w-[12rem] sm:w-56">
        <SectionLabel>Subject</SectionLabel>
        <select
          value={filters.subjectId}
          onChange={(e) => onChange({ ...filters, subjectId: e.target.value })}
          className="w-full rounded-lg border border-border-subtle bg-surface-card px-3 py-2 text-sm text-ink focus:border-slate-blue focus:outline-none"
        >
          <option value="all">All subjects</option>
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      {/* ── Price (range slider kept) ─────────────────── */}
      <div className="min-w-[15rem] sm:w-64">
        <SectionLabel>Price range (hourly)</SectionLabel>
        <div className="relative h-5">
          <div className="absolute top-1/2 h-1.5 w-full -translate-y-1/2 rounded-full bg-border-subtle" />
          <div
            className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-slate-blue"
            style={{ left: `${minPct}%`, right: `${100 - maxPct}%` }}
          />
          <input
            type="range"
            min={PRICE_BOUNDS.min}
            max={PRICE_BOUNDS.max}
            step={1}
            value={filters.priceMin}
            onChange={(e) =>
              onChange({
                ...filters,
                priceMin: Math.min(Number(e.target.value), filters.priceMax),
              })
            }
            className="range-input"
            style={{
              zIndex: filters.priceMin > PRICE_BOUNDS.max - span / 10 ? 30 : 20,
            }}
            aria-label="Minimum hourly rate"
          />
          <input
            type="range"
            min={PRICE_BOUNDS.min}
            max={PRICE_BOUNDS.max}
            step={1}
            value={filters.priceMax}
            onChange={(e) =>
              onChange({
                ...filters,
                priceMax: Math.max(Number(e.target.value), filters.priceMin),
              })
            }
            className="range-input"
            style={{ zIndex: 25 }}
            aria-label="Maximum hourly rate"
          />
        </div>
        <div className="mt-2 flex items-center gap-2">
          <span className="flex-1 rounded-md border border-border-subtle bg-surface-bg px-2 py-1 text-center text-xs font-semibold text-ink">
            ${filters.priceMin}
          </span>
          <span className="text-xs text-muted">to</span>
          <span className="flex-1 rounded-md border border-border-subtle bg-surface-bg px-2 py-1 text-center text-xs font-semibold text-ink">
            ${filters.priceMax}
          </span>
        </div>
      </div>

      {/* ── Availability (flex-wrapped days) ──────────── */}
      <div className="min-w-[16rem] flex-1">
        <SectionLabel>Availability</SectionLabel>
        <div className="flex flex-wrap gap-1.5">
          {DAY_OPTIONS.map((d) => {
            const active = filters.days.includes(d.value);
            return (
              <button
                key={d.value}
                onClick={() => toggleDay(d.value)}
                aria-pressed={active}
                className={`rounded-md border px-3 py-1.5 text-xs font-semibold transition-colors ${
                  active
                    ? "border-slate-blue bg-slate-blue/10 text-slate-blue"
                    : "border-border-subtle bg-surface-card text-muted hover:border-slate-blue/50 hover:text-ink"
                }`}
              >
                {d.label}
              </button>
            );
          })}
        </div>
        <p className="mt-1.5 text-[11px] text-muted">
          Shows tutors with an open slot on the selected days.
        </p>
      </div>

      {/* ── Clear button ─────────────────────────────── */}
      <div className="flex w-full items-center justify-end sm:w-auto sm:pt-6">
        <button
          onClick={onClear}
          className="text-sm font-semibold text-slate-blue hover:underline"
        >
          Clear All
        </button>
      </div>
    </div>
  );
}
