import { useState, useEffect } from "react";
import {
  Search,
  ShieldAlert,
  GraduationCap,
  UserCheck,
  MoreVertical,
  RefreshCw,
} from "lucide-react";
import { usersAPI } from "../api/usersAPI";
import type { User } from "../types";

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<
    "all" | "student" | "tutor" | "admin"
  >("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await usersAPI.getUsers();
      setUsers(data);
    } catch (err: any) {
      const message =
        err.response?.data?.error ||
        "Failed to load user records. Ensure your backend endpoint exists.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchUsers();
  }, []);

const toggleUserRole = async (
  userId: string,
  roleKey: "isStudent" | "isTutor" | "isAdmin",
  currentValue: boolean
) => {
  try {
    const updatedUser = await usersAPI.updateUserRoles(userId, {
      [roleKey]: !currentValue,
    });

    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, ...updatedUser } : u))
    );
  } catch (err: unknown) {
    console.error("Failed to update user roles:", err);
    alert("Failed to update user role permissions.");
  }
};
  // Format full name or derive from email if name fields are missing
  const getUserDisplayName = (u: User) => {
    const fullName = [u.firstName, u.lastName].filter(Boolean).join(" ");
    if (fullName.trim()) return fullName;

    // Derived fallback name from email (e.g., john.doe@email.com -> John Doe)
    return u.email
      .split("@")[0]
      .split(/[._-]+/)
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");
  };

  // Filter logic
  const filteredUsers = users.filter((u) => {
    const displayName = getUserDisplayName(u).toLowerCase();
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      u.email.toLowerCase().includes(query) || displayName.includes(query);

    if (!matchesSearch) return false;

    if (roleFilter === "admin") return u.isAdmin;
    if (roleFilter === "tutor") return u.isTutor;
    if (roleFilter === "student") return u.isStudent;
    return true;
  });

  return (
    <div className="space-y-6 p-6">
      {/* HEADER SECTION */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-2xl font-semibold tracking-tight text-ink">
            User Management
          </h1>
          <p className="mt-1 text-sm text-muted">
            Manage student registrations, tutor accreditations, and
            administrator access.
          </p>
        </div>
        <button
          type="button"
          onClick={fetchUsers}
          className="inline-flex items-center gap-2 rounded-sm border border-border-subtle bg-surface-card px-3 py-1.5 text-xs font-medium text-ink shadow-sm transition hover:bg-surface-bg"
        >
          <RefreshCw
            className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`}
          />
          Refresh Directory
        </button>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="flex flex-col gap-3 rounded-sm border border-border-subtle bg-surface-card p-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-sm border border-border-subtle bg-surface-bg pl-9 pr-3 py-1.5 text-sm text-ink placeholder-muted focus:border-brand-primary focus:outline-none"
          />
        </div>

        {/* Role Filter Tabs */}
        <div className="flex items-center gap-1 rounded-sm border border-border-subtle bg-surface-bg p-1">
          {(["all", "student", "tutor", "admin"] as const).map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setRoleFilter(filter)}
              className={`rounded-sm px-3 py-1 text-xs font-medium capitalize transition ${
                roleFilter === filter
                  ? "bg-surface-card text-brand-primary shadow-sm"
                  : "text-muted hover:text-ink"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* USER TABLE */}
      <div className="overflow-hidden rounded-sm border border-border-subtle bg-surface-card">
        {loading ? (
          <div className="py-12 text-center text-sm text-muted">
            Loading user registry...
          </div>
        ) : error ? (
          <div className="py-12 text-center text-sm text-burgundy">{error}</div>
        ) : filteredUsers.length === 0 ? (
          <div className="py-12 text-center text-sm text-muted">
            No users matched the criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border-subtle bg-surface-bg text-xs font-semibold text-muted">
                <tr>
                  <th className="px-4 py-3">User Details</th>
                  <th className="px-4 py-3">Student</th>
                  <th className="px-4 py-3">Tutor</th>
                  <th className="px-4 py-3">Administrator</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {filteredUsers.map((u) => {
                  const displayName = getUserDisplayName(u);
                  return (
                    <tr
                      key={u.id}
                      className="hover:bg-surface-bg/50 transition"
                    >
                      {/* User Info: Name Primary, Email Secondary */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm border border-border-subtle bg-brand-primary/10 font-medium text-brand-primary text-xs">
                            {displayName.substring(0, 2).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-ink truncate">
                              {displayName}
                            </p>
                            <p className="text-xs text-muted truncate">
                              {u.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Student Flag */}
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() =>
                            toggleUserRole(
                              u.id,
                              "isStudent",
                              Boolean(u.isStudent),
                            )
                          }
                          className={`inline-flex items-center gap-1.5 rounded-sm px-2 py-1 text-xs font-medium transition ${
                            u.isStudent
                              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                              : "bg-surface-bg text-muted border border-border-subtle hover:text-ink"
                          }`}
                        >
                          <GraduationCap className="h-3.5 w-3.5" />
                          {u.isStudent ? "Active" : "Disabled"}
                        </button>
                      </td>

                      {/* Tutor Flag */}
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() =>
                            toggleUserRole(u.id, "isTutor", Boolean(u.isTutor))
                          }
                          className={`inline-flex items-center gap-1.5 rounded-sm px-2 py-1 text-xs font-medium transition ${
                            u.isTutor
                              ? "bg-blue-50 text-blue-800 border border-blue-200"
                              : "bg-surface-bg text-muted border border-border-subtle hover:text-ink"
                          }`}
                        >
                          <UserCheck className="h-3.5 w-3.5" />
                          {u.isTutor ? "Accredited" : "Disabled"}
                        </button>
                      </td>

                      {/* Admin Flag */}
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() =>
                            toggleUserRole(u.id, "isAdmin", Boolean(u.isAdmin))
                          }
                          className={`inline-flex items-center gap-1.5 rounded-sm px-2 py-1 text-xs font-medium transition ${
                            u.isAdmin
                              ? "bg-amber-50 text-amber-900 border border-amber-300"
                              : "bg-surface-bg text-muted border border-border-subtle hover:text-ink"
                          }`}
                        >
                          <ShieldAlert className="h-3.5 w-3.5 text-amber-700" />
                          {u.isAdmin ? "Supervisor" : "User"}
                        </button>
                      </td>

                      {/* Actions Menu */}
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          title="User details"
                          className="rounded-sm p-1 text-muted hover:bg-surface-bg hover:text-ink"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
