import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Calendar,
  MessageSquare,
  Compass,
  PanelLeftClose,
  PanelLeftOpen,
  X,
  DollarSign,
  GraduationCap,
  UserRound,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { firstNameFromEmail, initialsFromEmail } from "../../lib/displayName";
import { getConversations } from "../../api/messageAPI";

const studentNavItems = [
  { to: "/dashboard", label: "Overview", icon: LayoutDashboard, ready: true },
  { to: "/sessions", label: "Sessions", icon: Calendar, ready: true },
  { to: "/messages", label: "Messages", icon: MessageSquare, ready: true },
  { to: "/calendar", label: "Calendar", icon: Calendar, ready: true },
  { to: "#", label: "Directory", icon: Compass, ready: false },
] as const;

const tutorNavItems = [
  { to: "/dashboard", label: "Overview", icon: LayoutDashboard, ready: true },
  { to: "/sessions", label: "My sessions", icon: Calendar, ready: true },
  { to: "#", label: "Students", icon: UserRound, ready: false },
  { to: "/calendar", label: "Availability", icon: Calendar, ready: true },
  { to: "#", label: "Earnings", icon: DollarSign, ready: false },
  { to: "/messages", label: "Messages", icon: MessageSquare, ready: true },
] as const;

interface SidebarProps {
  isOpen: boolean;
  isCollapsed: boolean;
  onClose: () => void;
  onToggle: () => void;
}

export function Sidebar({
  isOpen,
  isCollapsed,
  onClose,
  onToggle,
}: SidebarProps) {
  const { user, logout, activeRole, setActiveRole } = useAuth();
  const [unreadMessages, setUnreadMessages] = useState(0);
  const name = firstNameFromEmail(user?.email);
  const hasBothRoles = Boolean(user?.isStudent && user?.isTutor);
  const navItems = activeRole === "tutor" ? tutorNavItems : studentNavItems;

  useEffect(() => {
    let isMounted = true;

    const refreshUnreadMessages = async () => {
      if (!user?.id) return;
      try {
        const conversations = await getConversations();
        if (isMounted) {
          setUnreadMessages(
            conversations.reduce((total, conversation) => total + conversation.unreadCount, 0),
          );
        }
      } catch {
        // The Messages page displays request errors; keep the sidebar quiet.
      }
    };

    void refreshUnreadMessages();
    const interval = window.setInterval(() => void refreshUnreadMessages(), 5000);

    return () => {
      isMounted = false;
      window.clearInterval(interval);
    };
  }, [user?.id]);

  const switchRole = (role: "student" | "tutor") => {
    setActiveRole(role);
  };

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
        className={`fixed inset-y-0 left-0 z-40 flex w-60 flex-col overflow-hidden border-r border-border-subtle bg-surface-card transition-all duration-200 ease-out md:static ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } ${isCollapsed ? "md:w-16 md:translate-x-0" : "md:translate-x-0"}`}
      >
        <div
          className={`flex items-center border-b border-border-subtle py-4 ${isCollapsed ? "justify-center px-2" : "justify-between px-4"}`}
        >
          <div className={isCollapsed ? "hidden" : ""}>
            <p className="font-serif text-lg font-semibold tracking-tight text-ink">
              Tutorium
            </p>
          </div>
          <button
            type="button"
            aria-label={isCollapsed ? "Open sidebar" : "Collapse sidebar"}
            title={isCollapsed ? "Open sidebar" : "Collapse sidebar"}
            className="hidden rounded-sm p-1 text-muted hover:bg-surface-bg hover:text-ink md:block"
            onClick={onToggle}
          >
            {isCollapsed ? (
              <PanelLeftOpen className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
          </button>
          <button
            type="button"
            aria-label="Close sidebar"
            className="rounded-sm p-1 text-muted hover:bg-surface-bg hover:text-ink md:hidden"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {!isCollapsed && hasBothRoles && (
          <div className="mx-2 mt-3 flex rounded-sm border border-border-subtle bg-surface-bg p-1">
            <button
              type="button"
              onClick={() => switchRole("student")}
              className={`flex-1 rounded-sm px-2 py-1.5 text-[11px] font-medium ${activeRole === "student" ? "bg-surface-card text-brand-primary shadow-sm" : "text-muted hover:text-ink"}`}
            >
              <GraduationCap className="mr-1 inline h-3.5 w-3.5" />
              Student
            </button>
            <button
              type="button"
              onClick={() => switchRole("tutor")}
              className={`flex-1 rounded-sm px-2 py-1.5 text-[11px] font-medium ${activeRole === "tutor" ? "bg-surface-card text-brand-primary shadow-sm" : "text-muted hover:text-ink"}`}
            >
              <UserRound className="mr-1 inline h-3.5 w-3.5" />
              Tutor
            </button>
          </div>
        )}

        <nav className={`flex flex-col ${isCollapsed ? "px-1" : "px-2"}`}>
          {navItems.map(({ to, label, icon: Icon, ready }) =>
            ready ? (
              <NavLink
                key={label}
                to={to}
                end
                onClick={onClose}
                title={isCollapsed ? label : undefined}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 py-2 text-sm ${isCollapsed ? "justify-center px-2" : "px-2"} ${
                    isActive
                      ? "border-l-[3px] border-brand-primary bg-brand-primary/10 font-medium text-brand-primary"
                      : "border-l-2 border-transparent text-ink hover:bg-surface-bg"
                  }`
                }
              >
                <Icon className="h-4 w-4 shrink-0" strokeWidth={1.5} />
                {!isCollapsed && <span className="flex min-w-0 flex-1 items-center justify-between gap-2"><span>{label}</span>{label === "Messages" && unreadMessages > 0 && <span className="min-w-5 rounded-full bg-burgundy px-1.5 py-0.5 text-center text-[10px] font-semibold leading-none text-white">{unreadMessages}</span>}</span>}
              </NavLink>
            ) : (
              <span
                key={label}
                title={isCollapsed ? label : undefined}
                className={`flex cursor-default items-center gap-2.5 border-l-2 border-transparent py-2 text-sm text-muted ${isCollapsed ? "justify-center px-2" : "px-2"}`}
              >
                <Icon className="h-4 w-4 shrink-0" strokeWidth={1.5} />
                {!isCollapsed && label}
              </span>
            ),
          )}
        </nav>

        <div
          className={`mt-auto border-t border-border-subtle p-4 ${isCollapsed ? "hidden" : ""}`}
        >
          <p className="font-serif text-sm font-semibold text-ink">
            Offer tutoring
          </p>
          <p className="mt-1 text-xs leading-relaxed text-muted">
            List courses you can teach. Set an hourly rate.
          </p>
          <button
            type="button"
            className="mt-2 text-xs font-medium text-brand-primary hover:underline"
          >
            Application requirements
          </button>
        </div>

        <div
          className={`flex items-center border-t border-border-subtle py-3 ${isCollapsed ? "mt-auto justify-center px-2" : "gap-3 px-4"}`}
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-sm border border-border-subtle bg-brand-primary  text-[11px] font-medium text-white">
            {initialsFromEmail(user?.email)}
          </span>
          <div className={`min-w-0 flex-1 ${isCollapsed ? "hidden" : ""}`}>
            <p className="truncate text-sm font-medium text-ink">{name}</p>
            <p className="truncate text-xs text-muted">{user?.email}</p>
          </div>
          <button
            type="button"
            onClick={logout}
            className={`cursor-pointer text-xs font-medium text-muted hover:text-ink ${isCollapsed ? "hidden" : ""}`}
          >
            Sign out
          </button>
        </div>
      </aside>
    </>
  );
}
