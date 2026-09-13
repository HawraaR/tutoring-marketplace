import { Menu, Search } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
// import { firstNameFromEmail } from "../../lib/displayName";

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { user } = useAuth();
  // const name = firstNameFromEmail(user?.email);

  return (
    <header className="flex shrink-0 items-center justify-between gap-4 border-b border-border-subtle bg-surface-card px-4 py-3 md:px-8">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          aria-label="Open menu"
          className="rounded-sm p-2 text-ink hover:bg-surface-bg md:hidden"
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="min-w-0">
          <h1 className="font-serif truncate text-xl font-semibold text-ink">
            Welcome back, {user?.firstName} {user?.lastName}
          </h1>
          {/* <p className="hidden text-sm text-muted sm:block">
            Autumn 2026 · 3 sessions this week · 11.5 hours logged
          </p> */}
        </div>
      </div>

      <label className="relative hidden max-w-xs flex-1 md:block">
        <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted" />
        <input
          type="search"
          placeholder="Search courses or tutors"
          className="w-full rounded-sm border border-border-subtle bg-surface-bg py-2 pr-3 pl-9 text-sm text-ink outline-none placeholder:text-muted focus:border-brand-primary"
        />
      </label>
    </header>
  );
}
