/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import { Link } from "react-router-dom";
import { adminAPI } from "../api/adminAPI";


function timeAgo(dateString: string) {
  const date = new Date(dateString);
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  let interval = seconds / 31536000; if (interval > 1) return Math.floor(interval) + " years ago";
  interval = seconds / 2592000; if (interval > 1) return Math.floor(interval) + " months ago";
  interval = seconds / 86400; if (interval > 1) return Math.floor(interval) + " days ago";
  interval = seconds / 3600; if (interval > 1) return Math.floor(interval) + " hours ago";
  interval = seconds / 60; if (interval > 1) return Math.floor(interval) + " minutes ago";
  return Math.floor(seconds) + " seconds ago";
}

function downloadCSV(csvString: string, filename: string) {
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}


function SectionHeader({ title, description, action, actionHref, exportType, exportFilename, onExport, isExporting }: any) {
  return (
    <div className="mb-5 flex items-start justify-between gap-4 flex-wrap">
      <div>
        <h2 className="text-lg font-semibold text-ink">{title}</h2>
        {description && <p className="mt-1 text-sm text-muted">{description}</p>}
      </div>
      <div className="flex items-center gap-3 shrink-0">
        {exportType && onExport && (
          <button
            onClick={() => onExport(exportType, exportFilename || `${title}.csv`)}
            disabled={isExporting === exportType}
            className="rounded-lg border border-border-subtle bg-white px-3 py-1.5 text-xs font-semibold text-ink shadow-sm hover:bg-surface-bg disabled:opacity-50 flex items-center gap-1.5"
          >
            {isExporting === exportType ? (
              <><svg className="animate-spin h-3 w-3" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Exporting...</>
            ) : (
              <><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg> Export CSV</>
            )}
          </button>
        )}
        {action && (
          actionHref ? (
            <Link to={actionHref} className="text-sm font-semibold text-brand-primary hover:text-brand-primary-hover">{action}</Link>
          ) : (
            <button className="text-sm font-semibold text-brand-primary hover:text-brand-primary-hover">{action}</button>
          )
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: "UPCOMING" | "PAST" | "CANCELLED" }) {
  const styles = {
    UPCOMING: "bg-success/10 text-success",
    PAST: "bg-slate-blue/10 text-slate-blue",
    CANCELLED: "bg-error/10 text-error",
  };
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${styles[status]}`}>{status.charAt(0) + status.slice(1).toLowerCase()}</span>;
}

/* =========================================================
   MAIN DASHBOARD CLIENT
========================================================= */

export default function AdminDashboardClient() {
  const [exporting, setExporting] = useState<string | null>(null);
  const [initialData, setInitialData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    adminAPI.getDashboard()
      .then((data) => {
        if (mounted) setInitialData(data);
      })
      .catch((requestError: any) => {
        if (mounted) {
          setError(requestError.response?.data?.error || "Failed to load admin dashboard data.");
        }
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) return <p className="p-6 text-muted">Loading admin dashboard...</p>;
  if (error) return <p className="p-6 text-red-600">{error}</p>;
  if (!initialData) return <p className="p-6 text-muted">Admin dashboard data is unavailable.</p>;

  const { overviewStats, userStats, pendingTutors, bookingStats, todaysSessions, subjectDemand, topTutors, recentActivity } = initialData;

  const handleExport = async (type: string, filename: string) => {
    setExporting(type);
    try {
      const csvData = await adminAPI.exportReport(type);
      downloadCSV(csvData, filename);
    } catch (err) {
      console.error("Export failed", err);
      alert("Failed to export report.");
    } finally {
      setExporting(null);
    }
  };

  return (
    <main className="min-h-screen bg-surface-bg px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        
        <section>
          <h1 className="mt-1 font-serif text-3xl font-bold text-ink sm:text-4xl">Administration</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted sm:text-base">Monitor users, tutoring sessions, platform activity, verification requests, and overall marketplace performance.</p>
        </section>

        {/* OVERVIEW STATS */}
        <section>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {overviewStats.map((stat: any) => (
              <div key={stat.label} className="rounded-xl border border-border-subtle bg-surface-card p-5 shadow-warm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted">{stat.label}</p>
                    <p className="mt-2 text-3xl font-bold text-ink">{stat.value}</p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-primary/10 text-sm font-bold text-brand-primary">
                    {stat.label === "Total users" && "U"}{stat.label === "Active tutors" && "T"}{stat.label === "Active students" && "S"}{stat.label === "Pending verification" && "!"}
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between gap-2">
                  <p className="text-xs text-muted">{stat.detail}</p>
                  <span className={`text-xs font-semibold ${stat.positive ? "text-success" : "text-error"}`}>{stat.change}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* USER MANAGEMENT + VERIFICATION */}
        <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="rounded-xl border border-border-subtle bg-surface-card p-5 shadow-warm xl:col-span-2">
            <SectionHeader title="User Management" description="Monitor students, tutors, and multi-role accounts." action="View all users" actionHref="/admin/users" exportType="ALL_USERS" exportFilename="all_users.csv" onExport={handleExport} isExporting={exporting} />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-lg border border-border-subtle bg-surface-bg p-4">
                <p className="text-sm text-muted">Students</p>
                <p className="mt-2 text-2xl font-bold text-ink">{userStats.students.toLocaleString()}</p>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-border-subtle"><div className="h-full rounded-full bg-slate-blue" style={{ width: `${userStats.studentPct}%` }} /></div>
                <p className="mt-2 text-xs text-muted">{userStats.studentPct}% of users</p>
              </div>
              <div className="rounded-lg border border-border-subtle bg-surface-bg p-4">
                <p className="text-sm text-muted">Tutors</p>
                <p className="mt-2 text-2xl font-bold text-ink">{userStats.tutors.toLocaleString()}</p>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-border-subtle"><div className="h-full rounded-full bg-brand-primary" style={{ width: `${userStats.tutorPct}%` }} /></div>
                <p className="mt-2 text-xs text-muted">{userStats.tutorPct}% of users</p>
              </div>
              <div className="rounded-lg border border-border-subtle bg-surface-bg p-4">
                <p className="text-sm text-muted">Multi-role users</p>
                <p className="mt-2 text-2xl font-bold text-ink">{userStats.multiRole.toLocaleString()}</p>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-border-subtle"><div className="h-full rounded-full bg-olive" style={{ width: `${userStats.multiPct}%` }} /></div>
                <p className="mt-2 text-xs text-muted">Tutor + student</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border-subtle bg-surface-card p-5 shadow-warm">
            <SectionHeader title="Tutor Verification" description="Tutors waiting for approval." action="Review all" actionHref="/admin/tutor-approvals" exportType="TUTOR_APPROVALS" exportFilename="tutor_approvals.csv" onExport={handleExport} isExporting={exporting} />
            <div className="space-y-4">
              {pendingTutors.length === 0 && <p className="text-sm text-muted text-center py-4">No pending verifications.</p>}
              {pendingTutors.map((tutor: any) => (
                <div key={tutor.id} className="flex items-center justify-between rounded-lg border border-border-subtle bg-surface-bg p-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-ink truncate">{tutor.name}</p>
                    <p className="text-xs text-muted truncate max-w-[200px]">{tutor.headline}</p>
                  </div>
                  <span className="inline-flex rounded-full bg-warning/10 px-2.5 py-1 text-xs font-semibold text-warning shrink-0 ml-2">Pending</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SESSION & BOOKING OVERSIGHT */}
        <section>
            <SectionHeader title="Session & Booking Oversight" description="Monitor the current tutoring marketplace activity." />
          <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {bookingStats.map((stat: any) => (
              <div key={stat.label} className="rounded-xl border border-border-subtle bg-surface-card p-4 shadow-warm">
                <p className="text-sm text-muted">{stat.label}</p>
                <p className="mt-2 text-2xl font-bold text-ink">{stat.value}</p>
              </div>
            ))}
          </div>
          <div className="overflow-hidden rounded-xl border border-border-subtle bg-surface-card shadow-warm">
            <div className="border-b border-border-subtle px-5 py-4"><h3 className="font-semibold text-ink">Today's Sessions</h3></div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-left">
                <thead className="bg-surface-bg">
                  <tr className="border-b border-border-subtle">
                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-muted">Time</th>
                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-muted">Student</th>
                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-muted">Tutor</th>
                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-muted">Subject</th>
                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-muted">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {todaysSessions.map((session: any) => (
                    <tr key={session.id} className="border-b border-border-subtle last:border-0">
                      <td className="px-5 py-4 text-sm font-semibold text-ink">{session.time}</td>
                      <td className="px-5 py-4 text-sm text-ink">{session.student}</td>
                      <td className="px-5 py-4 text-sm text-ink">{session.tutor}</td>
                      <td className="px-5 py-4 text-sm text-muted">{session.subject}</td>
                      <td className="px-5 py-4"><StatusBadge status={session.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* SUBJECT DEMAND */}
        <section>
          <div className="rounded-xl border border-border-subtle bg-surface-card p-5 shadow-warm">
            <SectionHeader title="Subject Demand" description="Most requested tutoring subjects." exportType="SUBJECT_DEMAND" exportFilename="subject_demand.csv" onExport={handleExport} isExporting={exporting} />
            <div className="space-y-5">
              {subjectDemand.map((subject: any) => (
                <div key={subject.subject}>
                  <div className="mb-2 flex items-center justify-between gap-4">
                    <span className="text-sm font-medium text-ink">{subject.subject}</span>
                    <span className="text-xs text-muted">{subject.bookings} bookings</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-border-subtle">
                    <div className="h-full rounded-full bg-brand-primary" style={{ width: `${subject.percentage}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* TUTOR PERFORMANCE */}
        <section>
          <SectionHeader title="Tutor Performance" description="Top tutors based on ratings and sessions." exportType="TUTOR_PERFORMANCE" exportFilename="tutor_performance.csv" onExport={handleExport} isExporting={exporting} />
          <div className="overflow-hidden rounded-xl border border-border-subtle bg-surface-card shadow-warm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-left">
                <thead className="bg-surface-bg">
                  <tr className="border-b border-border-subtle">
                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-muted">Rank</th>
                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-muted">Tutor</th>
                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-muted">Subject</th>
                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-muted">Rating</th>
                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-muted">Sessions</th>
                  </tr>
                </thead>
                <tbody>
                  {topTutors.map((tutor: any, index: number) => (
                    <tr key={tutor.id} className="border-b border-border-subtle last:border-0">
                      <td className="px-5 py-4"><span className="font-serif text-lg font-bold text-brand-primary">#{index + 1}</span></td>
                      <td className="px-5 py-4 text-sm font-semibold text-ink">{tutor.name}</td>
                      <td className="px-5 py-4 text-sm text-muted">{tutor.subject}</td>
                      <td className="px-5 py-4"><span className="font-semibold text-ink">★ {tutor.rating}</span></td>
                      <td className="px-5 py-4 text-sm text-ink">{tutor.sessions}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* RECENT ACTIVITY */}
        <section>
          <SectionHeader title="Recent Platform Activity" description="Latest actions across the marketplace." exportType="RECENT_ACTIVITY" exportFilename="recent_activity.csv" onExport={handleExport} isExporting={exporting} />
          <div className="rounded-xl border border-border-subtle bg-surface-card shadow-warm">
            <div className="divide-y divide-border-subtle">
              {recentActivity.map((activity: any) => (
                <div key={activity.id} className="flex items-center gap-4 px-5 py-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-primary/10 text-xs font-bold text-brand-primary">
                    {activity.type === "user" && "U"}{activity.type === "verification" && "V"}{activity.type === "booking" && "B"}{activity.type === "warning" && "!"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-ink">{activity.action}</p>
                    <p className="mt-0.5 text-xs text-muted">{activity.user}</p>
                  </div>
                  <span className="shrink-0 text-xs text-muted">{timeAgo(activity.time)}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

      </div>
    </main>
  );
}