import { useEffect, useState } from "react";
import {
  getTutorApplications,
  reviewTutorApplication,
  type TutorApplication,
} from "../../api/tutorProfileAPI";

function applicantName(app: TutorApplication): string {
  const { firstName, lastName, email } = app.user;
  const full = [firstName, lastName].filter(Boolean).join(" ");
  return full || email;
}

export function TutorApplications() {
  const [applications, setApplications] = useState<TutorApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    getTutorApplications("PENDING")
      .then(setApplications)
      .catch(() => setError("Failed to load tutor applications."))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleApprove = async (id: string) => {
    setBusyId(id);
    try {
      await reviewTutorApplication(id, "APPROVED");
      setApplications((prev) => prev.filter((app) => app.id !== id));
    } catch {
      setError("Failed to approve this application.");
    } finally {
      setBusyId(null);
    }
  };

  const handleReject = async (id: string) => {
    const rejectionReason = window.prompt("Reason for rejecting this application:");
    if (!rejectionReason) return; // Cancelled, or left blank — required by the backend

    setBusyId(id);
    try {
      await reviewTutorApplication(id, "REJECTED", rejectionReason);
      setApplications((prev) => prev.filter((app) => app.id !== id));
    } catch {
      setError("Failed to reject this application.");
    } finally {
      setBusyId(null);
    }
  };

  if (loading) {
    return <p className="text-sm text-muted">Loading applications…</p>;
  }

  if (error) {
    return <p className="text-sm text-error">{error}</p>;
  }

  if (applications.length === 0) {
    return <p className="text-sm text-muted">No pending applications.</p>;
  }

  return (
    <div className="space-y-4">
      {applications.map((app) => (
        <div
          key={app.id}
          className="border-b border-border-subtle pb-4 last:border-0 last:pb-0"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-ink">
                {applicantName(app)}
              </p>
              <p className="mt-1 truncate text-xs text-muted">
                {app.headline || app.user.email}
              </p>
              <p className="mt-1 text-xs text-muted">
                Rate: ${app.hourlyRate}/hr
              </p>
            </div>

            <div className="flex shrink-0 gap-2">
              <button
                type="button"
                disabled={busyId === app.id}
                onClick={() => handleApprove(app.id)}
                className="rounded-md bg-brand-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-primary-hover disabled:opacity-50"
              >
                Approve
              </button>
              <button
                type="button"
                disabled={busyId === app.id}
                onClick={() => handleReject(app.id)}
                className="rounded-md border border-border-subtle px-3 py-1.5 text-xs font-semibold text-ink hover:bg-surface-bg disabled:opacity-50"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
