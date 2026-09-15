import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Calendar,
  MessageSquare,
  Compass,
  PanelLeftClose,
  PanelLeftOpen,
  X,
  GraduationCap,
  UserRound,
  ShieldAlert,
  Users,
  Sparkles,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { getConversations } from "../../api/messageAPI";

// // Helper to generate clean initials
// const getInitials = (name?: string, email?: string) => {
//   if (name) return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
//   if (email) return email.split("@")[0].slice(0, 2).toUpperCase();
//   return "U";
// };

const studentNavItems = [
  { to: "/dashboard", label: "Overview", icon: LayoutDashboard, ready: true },
  { to: "/sessions", label: "Sessions", icon: Calendar, ready: true },
  { to: "/messages", label: "Messages", icon: MessageSquare, ready: true },
  { to: "/calendar", label: "Calendar", icon: Calendar, ready: true },
  { to: "/directory", label: "Directory", icon: Compass, ready: true },
  { to: "/become-a-tutor", label: "Become a tutor", icon: GraduationCap, ready: true },
] as const;

const tutorNavItems = [
  { to: "/dashboard", label: "Overview", icon: LayoutDashboard, ready: true },
  { to: "/sessions", label: "My sessions", icon: Calendar, ready: true },
  { to: "/calendar", label: "Availability", icon: Calendar, ready: true },
  { to: "/messages", label: "Messages", icon: MessageSquare, ready: true },
] as const;

const adminNavItems = [
  { to: "/admin/dashboard", label: "Overview", icon: LayoutDashboard, ready: true },
  { to: "/admin/users", label: "User Management", icon: Users, ready: true },
  { to: "/admin/tutor-approvals", label: "Tutor Approvals", icon: ShieldAlert, ready: true },
] as const;

interface SidebarProps {
  isOpen: boolean;
  isCollapsed: boolean;
  onClose: () => void;
  onToggle: () => void;
  onLogout?: () => void; // Added for the footer logout button
}

export function Sidebar({
  isOpen,
  isCollapsed,
  onClose,
  onToggle,
}: SidebarProps) {
  const { user, activeRole, setActiveRole } = useAuth();
  const [unreadMessages, setUnreadMessages] = useState(0);
  
  const hasBothRoles = Boolean(user?.isStudent && user?.isTutor);
  const hasAppliedAsTutor = Boolean(user?.tutorProfile);

  const navItems = [
    ...(activeRole === "admin"
      ? adminNavItems
      : activeRole === "tutor"
        ? tutorNavItems
        : studentNavItems
    ).filter((item) => {
      if (item.to === "/become-a-tutor") return !hasAppliedAsTutor;
      return true;
    }),
  ];

  useEffect(() => {
    let isMounted = true;

    const refreshUnreadMessages = async () => {
      if (!user?.id || activeRole === "admin") return;
      try {
        const conversations = await getConversations();
        if (isMounted) {
          setUnreadMessages(
            conversations.reduce(
              (total, conversation) => total + (conversation.unreadCount || 0),
              0
            )
          );
        }
      } catch {
        // Quiet failure for sidebar polling
      }
    };

    void refreshUnreadMessages();
    // const interval = window.setInterval(() => void refreshUnreadMessages(), 30000);

    return () => {
      isMounted = false;
      // window.clearInterval(interval);
    };
  }, [user?.id, activeRole]);

  const switchRole = (role: "student" | "tutor") => {
    setActiveRole(role);
  };

  return (
    <>
      {/* Mobile Overlay with Backdrop Blur */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/20 backdrop-blur-sm transition-opacity md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex flex-col overflow-hidden border-r border-border-subtle bg-surface-card transition-all duration-300 ease-in-out md:static ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        } ${isCollapsed ? "md:w-20" : "md:w-64"}`}
      >
        {/* HEADER */}
        <div className={`flex items-center border-b border-border-subtle px-4 py-4 ${isCollapsed ? "justify-center px-2" : "justify-between"}`}>
          <div className={`flex items-center gap-2 overflow-hidden transition-all duration-300 ${isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100"}`}>
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-primary text-white">
              <GraduationCap className="h-5 w-5" />
            </div>
            <span className="font-serif text-lg font-bold tracking-tight text-ink whitespace-nowrap">
              Tutorium
            </span>
          </div>
          
          <button
            type="button"
            aria-label={isCollapsed ? "Open sidebar" : "Collapse sidebar"}
            className="hidden rounded-lg p-1.5 text-muted transition-colors hover:bg-surface-bg hover:text-ink md:block"
            onClick={onToggle}
          >
            {isCollapsed ? (
              <PanelLeftOpen className="h-5 w-5" />
            ) : (
              <PanelLeftClose className="h-5 w-5" />
            )}
          </button>
          
          <button
            type="button"
            aria-label="Close sidebar"
            className="rounded-lg p-1.5 text-muted transition-colors hover:bg-surface-bg hover:text-ink md:hidden"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* ROLE SWITCHER / ADMIN PORTAL BADGE */}
        {!isCollapsed && activeRole === "admin" && (
          <div className="mx-3 mt-4 flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-amber-900 dark:border-amber-900/50 dark:bg-amber-900/20 dark:text-amber-200">
            <ShieldAlert className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
            <span className="text-xs font-semibold">Admin Portal</span>
          </div>
        )}

        {!isCollapsed && hasBothRoles && activeRole !== "admin" && (
          <div className="mx-3 mt-4 flex rounded-lg border border-border-subtle bg-surface-bg p-1">
            <button
              type="button"
              onClick={() => switchRole("student")}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-semibold transition-all duration-200 ${
                activeRole === "student"
                  ? "bg-surface-card text-ink shadow-sm ring-1 ring-border-subtle"
                  : "text-muted hover:text-ink"
              }`}
            >
              <GraduationCap className="h-3.5 w-3.5" />
              Student
            </button>
            <button
              type="button"
              onClick={() => switchRole("tutor")}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-semibold transition-all duration-200 ${
                activeRole === "tutor"
                  ? "bg-surface-card text-ink shadow-sm ring-1 ring-border-subtle"
                  : "text-muted hover:text-ink"
              }`}
            >
              <UserRound className="h-3.5 w-3.5" />
              Tutor
            </button>
          </div>
        )}

        {/* NAVIGATION LINKS */}
        <nav className="flex flex-1 flex-col overflow-y-auto px-3 py-4 scrollbar-thin scrollbar-thumb-border-subtle">
          {navItems.map(({ to, label, icon: Icon, ready }) =>
            ready ? (
              <NavLink
                key={to}
                to={to}
                end
                onClick={onClose}
                title={isCollapsed ? label : undefined}
              >
                {({ isActive }) => (
                  <div
                    className={`group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? "bg-brand-primary/10 text-brand-primary"
                        : "text-muted hover:bg-surface-bg hover:text-ink"
                    } ${isCollapsed ? "justify-center px-2" : ""}`}
                  >
                    <Icon className={`h-5 w-5 shrink-0 transition-colors ${isActive ? "text-brand-primary" : "text-muted group-hover:text-ink"}`} strokeWidth={1.5} />
                    {!isCollapsed && (
                      <span className="flex min-w-0 flex-1 items-center justify-between gap-2">
                        <span className="truncate">{label}</span>
                        {to === "/messages" && unreadMessages > 0 && (
                          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold leading-none text-white shadow-sm">
                            {unreadMessages > 99 ? "99+" : unreadMessages}
                          </span>
                        )}
                      </span>
                    )}
                  </div>
                )}
              </NavLink>
            ) : (
              <div
                key={to}
                title={isCollapsed ? label : undefined}
                className={`group relative flex cursor-not-allowed items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted/50 ${isCollapsed ? "justify-center px-2" : ""}`}
              >
                <Icon className="h-5 w-5 shrink-0" strokeWidth={1.5} />
                {!isCollapsed && (
                  <span className="flex min-w-0 flex-1 items-center justify-between gap-2">
                    <span className="truncate">{label}</span>
                    <span className="rounded bg-surface-bg px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted">Soon</span>
                  </span>
                )}
              </div>
            )
          )}
        </nav>

        {/* BOTTOM FIXED SECTION CONTAINER */}
        <div className="mt-auto">
          {/* OFFER TUTORING PROMO BOX (Students only) */}
          {!isCollapsed && activeRole === "student" && user?.isStudent && !user?.isTutor && (
            <div className="mx-3 mb-9 rounded-xl border border-brand-primary/20 bg-brand-primary/5 p-4 transition-colors hover:bg-brand-primary/10">
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-brand-primary/10 p-2 text-brand-primary">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-ink">Offer tutoring</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted">
                    Share your knowledge. Set your rate and help others learn.
                  </p>
                  <Link
                    to="/tutoring-requirements"
                    className="mt-3 inline-flex items-center text-xs font-semibold text-brand-primary hover:underline"
                    onClick={onClose}
                  >
                    View requirements
                    <svg className="ml-1 h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* USER PROFILE & LOGOUT
          <div className="border-t border-border-subtle p-3">
            <div className={`group flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-surface-bg ${isCollapsed ? "justify-center" : ""}`}>
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-primary/10 text-sm font-semibold text-brand-primary ring-1 ring-brand-primary/20">
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt="" className="h-9 w-9 rounded-full object-cover" />
                ) : (
                  <span>{getInitials(user?.firstName, user?.email)}</span>
                )}
              </div>
              
              {!isCollapsed && (
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-ink">
                    {user?.firstName || user?.email?.split("@")[0] || "User"}
                  </p>
                  <p className="truncate text-xs text-muted">
                    {user?.email || "user@example.com"}
                  </p>
                </div>
              )}

              {!isCollapsed && onLogout && (
                <button
                  type="button"
                  onClick={onLogout}
                  className="shrink-0 rounded-md p-1.5 text-muted opacity-0 transition-all group-hover:opacity-100 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
                  title="Sign out"
                  aria-label="Sign out"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              )}
            </div>
          </div> */}
        </div>
      </aside>
    </>
  );
}