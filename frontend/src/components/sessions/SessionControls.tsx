import { ChevronDown } from "lucide-react";
import { TABS, type SessionTab } from "../../lib/utils/sessionHelpers";
import type { UnifiedSession } from "../../types";

interface SessionControlsProps {
  activeTab: SessionTab;
  setActiveTab: (tab: SessionTab) => void;
  subjectFilter: string;
  setSubjectFilter: (filter: string) => void;
  subjects: string[];
  sessions: UnifiedSession[];
}

export function SessionControls({
  activeTab,
  setActiveTab,
  subjectFilter,
  setSubjectFilter,
  subjects,
  sessions,
}: SessionControlsProps) {
  return (
    <section className="border-b border-border-subtle">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-5 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap border-b-2 px-0.5 pb-2 text-sm font-medium ${
                activeTab === tab.id
                  ? "border-brand-primary text-brand-primary"
                  : "border-transparent text-muted hover:text-ink"
              }`}
            >
              {tab.label}
              <span className="ml-1.5 text-xs tabular-nums">
                {sessions.filter(({ status }) => status === tab.id).length}
              </span>
            </button>
          ))}
        </div>
        <label className="relative mb-2 sm:mb-1">
          <span className="sr-only">Filter by subject</span>
          <select
            value={subjectFilter}
            onChange={(event) => setSubjectFilter(event.target.value)}
            className="w-full appearance-none rounded-sm border border-border-subtle bg-surface-card py-2 pr-8 pl-3 text-sm text-ink outline-none focus:border-brand-primary sm:w-48"
          >
            <option value="all">All subjects</option>
            {subjects.map((subject) => (
              <option key={subject} value={subject}>
                {subject}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute top-1/2 right-2.5 h-4 w-4 -translate-y-1/2 text-muted" />
        </label>
      </div>
    </section>
  );
}