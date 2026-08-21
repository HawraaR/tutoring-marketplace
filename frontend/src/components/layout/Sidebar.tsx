import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Calendar,
  MessageSquare,
  Compass,
  X,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { firstNameFromEmail, initialsFromEmail } from "../../lib/displayName";

const navItems = [
  { to: "/dashboard", label: "Overview", icon: LayoutDashboard, ready: true },
  { to: "#", label: "Sessions", icon: Calendar, ready: false },
  { to: "#", label: "Messages", icon: MessageSquare, ready: false },
  { to: "#", label: "Directory", icon: Compass, ready: false },
] as const;

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { user, logout } = useAuth();
  const name = firstNameFromEmail(user?.email);

  return (
    <>
      {isOpen && (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-30 bg-charcoal/25 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-60 flex-col border-r border-border-subtle bg-surface-card transition-transform duration-200 ease-out md:static md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-border-subtle px-4 py-4">
          <div>
            <p className="font-serif text-lg font-semibold tracking-tight text-ink">Tutorium</p>
            <p className="text-[11px] text-muted">University tutoring</p>
          </div>
          <button
            type="button"
            aria-label="Close sidebar"
            className="text-muted hover:text-ink md:hidden"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="px-4 pt-4 pb-1 text-[11px] font-medium tracking-wide text-muted uppercase">
          Navigation
        </p>

        <nav className="flex flex-col px-2">
          {navItems.map(({ to, label, icon: Icon, ready }) =>
            ready ? (
              <NavLink
                key={label}
                to={to}
                end
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-2 py-2 text-sm ${
                    isActive
                      ? "border-l-[3px] border-brand-primary bg-brand-primary/10 font-medium text-brand-primary"
                      : "border-l-2 border-transparent text-ink hover:bg-surface-bg"
                  }`
                }
              >
                <Icon className="h-4 w-4 shrink-0" strokeWidth={1.5} />
                {label}
              </NavLink>
            ) : (
              <span
                key={label}
                className="flex cursor-default items-center gap-2.5 border-l-2 border-transparent px-2 py-2 text-sm text-muted"
              >
                <Icon className="h-4 w-4 shrink-0" strokeWidth={1.5} />
                {label}
              </span>
            ),
          )}
        </nav>

        <div className="mt-auto border-t border-border-subtle p-4">
          <p className="font-serif text-sm font-semibold text-ink">Offer tutoring</p>
          <p className="mt-1 text-xs leading-relaxed text-muted">
            List courses you can teach. Set an hourly rate. Payouts are processed by Tutorium.
          </p>
          <button
            type="button"
            className="mt-2 text-xs font-medium text-brand-primary hover:underline"
          >
            Application requirements
          </button>
        </div>

        <div className="flex items-center gap-3 border-t border-border-subtle px-4 py-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-sm border border-border-subtle bg-brand-primary  text-[11px] font-medium text-white">
            {initialsFromEmail(user?.email)}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-ink">{name}</p>
            <p className="truncate text-xs text-muted">{user?.email}</p>
          </div>
          <button
            type="button"
            onClick={logout}
            className="cursor-pointer text-xs font-medium text-muted hover:text-ink"
          >
            Sign out
          </button>
        </div>
      </aside>
    </>
  );
}
