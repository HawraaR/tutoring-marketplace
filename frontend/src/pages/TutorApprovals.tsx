import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  Check,
  ExternalLink,
  FileText,
  PlayCircle,
  Search,
  ShieldAlert,
  X,
} from "lucide-react";
import { adminAPI } from "../api/adminAPI";

interface TutorApplication {
  id: string;
  userId: string;
  headline: string | null;
  bio: string | null;
  hourlyRate: number;
  education: string | null;
  languages: string[];
  verificationStatus: "PENDING" | "APPROVED" | "REJECTED";
  certificates: string[];
  experience: string[];
  videoIntroUrl: string | null;
  user: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
  };
}

function applicantName(req: TutorApplication) {
  return (
    [req.user.firstName, req.user.lastName].filter(Boolean).join(" ") ||
    req.user.email
  );
}

function Avatar({ name, size = "md" }: { name: string; size?: "md" | "lg" }) {
  const dims = size === "lg" ? "h-14 w-14 text-sm" : "h-10 w-10 text-xs";
  return (
    <span
      className={`relative flex shrink-0 items-center justify-center rounded-sm bg-surface-bg font-semibold text-ink ${dims}`}
    >
      <span className="absolute inset-0 rounded-sm bg-brand-primary opacity-15" />
      {name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0])
        .join("")}
    </span>
  );
}

export const TutorApprovals: React.FC = () => {
  const [requests, setRequests] = useState<TutorApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string>();
  const [showDetail, setShowDetail] = useState(false);
  const [search, setSearch] = useState("");
  const [rejectTarget, setRejectTarget] = useState<TutorApplication | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const reasonRef = useRef<HTMLTextAreaElement>(null);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const data = await adminAPI.getPendingTutors();
      setRequests(data);
      setSelectedId((current) =>
        current && data.some((item: TutorApplication) => item.id === current)
          ? current
          : data[0]?.id,
      );
    } catch (err: unknown) {
      console.error("Error loading approvals:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // Autofocus the reason field the moment the reject modal opens
  useEffect(() => {
    if (rejectTarget) {
      const timer = window.setTimeout(() => reasonRef.current?.focus(), 0);
      return () => window.clearTimeout(timer);
    }
  }, [rejectTarget]);

  // Close the modal on Escape
  useEffect(() => {
    if (!rejectTarget) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setRejectTarget(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [rejectTarget]);

  const filteredRequests = useMemo(
    () =>
      requests.filter((req) =>
        `${applicantName(req)} ${req.headline ?? ""}`
          .toLowerCase()
          .includes(search.toLowerCase()),
      ),
    [requests, search],
  );

  const selected = requests.find((req) => req.id === selectedId);

  const selectRequest = (id: string) => {
    setSelectedId(id);
    setShowDetail(true);
  };

  const handleReview = async (
    profileId: string,
    status: "APPROVED" | "REJECTED",
  ) => {
    setSubmitting(true);
    try {
      await adminAPI.reviewTutor(profileId, {
        verificationStatus: status,
        rejectionReason: status === "REJECTED" ? rejectionReason : undefined,
      });
      setRequests((prev) => {
        const next = prev.filter((item) => item.id !== profileId);
        setSelectedId(next[0]?.id);
        return next;
      });
      setRejectTarget(null);
      setRejectionReason("");
      setShowDetail(false);
    } catch (err: unknown) {
      console.error("Verification error:", err);
      alert("Failed to update verification status.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="font-serif text-xl font-semibold text-ink">
          Tutor Approvals
        </h1>
        <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
          {requests.length} Pending Application{requests.length !== 1 && "s"}
        </span>
      </div>

      <section className="flex max-h-[calc(100vh-11rem)] overflow-hidden rounded-sm border border-border-subtle bg-surface-card shadow-warm">
        {/* Queue list */}
        <aside
          className={`${showDetail ? "hidden md:flex" : "flex"} w-full shrink-0 flex-col border-r border-border-subtle md:w-[300px]`}
        >
          <div className="border-b border-border-subtle p-3">
            <label className="relative block">
              <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted" />
              <span className="sr-only">Search applicants</span>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search applicants"
                className="w-full rounded-sm border border-border-subtle bg-surface-bg py-2 pr-3 pl-9 text-sm text-ink outline-none placeholder:text-muted focus:border-brand-primary"
              />
            </label>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto">
            {loading ? (
              <p className="px-4 py-8 text-sm text-muted">Loading requests...</p>
            ) : filteredRequests.length === 0 ? (
              <div className="px-4 py-10 text-center text-sm text-muted">
                <ShieldAlert className="mx-auto mb-2 h-6 w-6 text-muted" />
                No pending applications.
              </div>
            ) : (
              filteredRequests.map((req) => (
                <button
                  key={req.id}
                  type="button"
                  onClick={() => selectRequest(req.id)}
                  className={`flex w-full gap-3 border-l-[3px] px-4 py-3 text-left transition hover:bg-surface-bg ${
                    req.id === selectedId
                      ? "border-brand-primary bg-brand-primary/5"
                      : "border-transparent"
                  }`}
                >
                  <Avatar name={applicantName(req)} />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-baseline justify-between gap-2">
                      <span className="truncate text-sm font-medium text-ink">
                        {applicantName(req)}
                      </span>
                      <span className="shrink-0 text-xs font-semibold text-brand-primary">
                        ${req.hourlyRate}/hr
                      </span>
                    </span>
                    <span className="mt-0.5 block truncate text-xs text-muted">
                      {req.headline || "No headline provided"}
                    </span>
                  </span>
                </button>
              ))
            )}
          </div>
        </aside>

        {/* Detail panel */}
        <div
          className={`${showDetail ? "flex" : "hidden md:flex"} min-w-0 flex-1 flex-col`}
        >
          {selected ? (
            <>
              <header className="flex items-center gap-3 border-b border-border-subtle px-5 py-4 md:px-6">
                <button
                  type="button"
                  aria-label="Back to queue"
                  onClick={() => setShowDetail(false)}
                  className="text-muted hover:text-ink md:hidden"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <Avatar name={applicantName(selected)} size="lg" />
                <div className="min-w-0 flex-1">
                  <h2 className="truncate font-serif text-lg font-semibold text-ink">
                    {applicantName(selected)}
                  </h2>
                  <p className="truncate text-xs text-muted">{selected.user.email}</p>
                  {selected.headline && (
                    <p className="mt-0.5 truncate text-sm text-ink">{selected.headline}</p>
                  )}
                </div>
                <div className="shrink-0 text-right">
                  <span className="text-lg font-bold text-brand-primary">
                    ${selected.hourlyRate}
                  </span>
                  <span className="text-xs text-muted">/hr</span>
                </div>
              </header>

              <div className="chat-scrollbar flex-1 overflow-y-auto px-5 py-5 md:px-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                  {/* Main column: bio + credentials */}
                  <div className="space-y-5 md:col-span-2">
                    <div>
                      <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted">
                        Bio
                      </h3>
                      <p className="whitespace-pre-line text-sm leading-relaxed text-ink">
                        {selected.bio || "No bio provided."}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 rounded-sm border border-border-subtle bg-surface-bg p-4">
                      <div>
                        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">
                          Education
                        </h3>
                        <p className="text-sm text-ink">{selected.education || "N/A"}</p>
                      </div>
                      <div>
                        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">
                          Languages
                        </h3>
                        <p className="text-sm text-ink">
                          {selected.languages.join(", ") || "N/A"}
                        </p>
                      </div>
                    </div>

                    {selected.experience.length > 0 && (
                      <div>
                        <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted">
                          Experience
                        </h3>
                        <ul className="list-inside list-disc space-y-1 text-sm text-ink">
                          {selected.experience.map((exp, i) => (
                            <li key={i}>{exp}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Side column: verification materials */}
                  <div className="space-y-5 md:border-l md:border-border-subtle md:pl-6">
                    {selected.videoIntroUrl && (
                      <div>
                        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
                          Video Intro
                        </h3>
                        <a
                          href={selected.videoIntroUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-2 rounded-sm border border-border-subtle bg-surface-bg px-3 py-2.5 text-xs font-medium text-ink transition hover:bg-brand-primary/10 hover:text-brand-primary"
                        >
                          <PlayCircle className="h-4 w-4" /> Watch intro
                          <ExternalLink className="ml-auto h-3 w-3" />
                        </a>
                      </div>
                    )}

                    <div>
                      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
                        Certificates & Proof
                      </h3>
                      {selected.certificates.length > 0 ? (
                        <div className="flex flex-col gap-2">
                          {selected.certificates.map((certUrl, idx) => (
                            <a
                              key={idx}
                              href={certUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center gap-2 rounded-sm border border-border-subtle bg-surface-bg px-3 py-2.5 text-xs font-medium text-ink transition hover:bg-brand-primary/10 hover:text-brand-primary"
                            >
                              <FileText className="h-3.5 w-3.5" /> Certificate {idx + 1}
                              <ExternalLink className="ml-auto h-3 w-3" />
                            </a>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs italic text-muted">No certificates attached.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Sticky action footer */}
              <div className="flex items-center justify-end gap-3 border-t border-border-subtle bg-surface-card px-5 py-3 md:px-6">
                <button
                  type="button"
                  onClick={() => {
                    setRejectionReason("");
                    setRejectTarget(selected);
                  }}
                  className="inline-flex items-center gap-1 rounded-sm border border-burgundy/20 bg-burgundy/10 px-4 py-2 text-xs font-semibold text-burgundy transition hover:bg-burgundy/20"
                >
                  <X className="h-4 w-4" /> Reject
                </button>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => handleReview(selected.id, "APPROVED")}
                  className="inline-flex items-center gap-1 rounded-sm bg-brand-primary px-4 py-2 text-xs font-semibold text-white shadow-warm transition hover:bg-brand-primary-hover disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Check className="h-4 w-4" /> Verify Tutor
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center py-16 text-sm text-muted">
              {loading ? "Loading..." : "Select an application to review."}
            </div>
          )}
        </div>
      </section>

      {/* Rejection modal — takes over focus entirely, nothing else competing for attention */}
      {rejectTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/30 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="reject-modal-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) setRejectTarget(null);
          }}
        >
          <div className="w-full max-w-md rounded-sm border border-border-subtle bg-surface-card p-5 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 id="reject-modal-title" className="font-serif text-lg font-semibold text-ink">
                Reject {applicantName(rejectTarget)}?
              </h2>
              <button
                type="button"
                aria-label="Cancel rejection"
                onClick={() => setRejectTarget(null)}
                className="rounded-sm p-2 text-muted hover:bg-surface-bg hover:text-ink"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-1 text-xs text-muted">
              This reason is shared with the applicant so they know what to fix before reapplying.
            </p>
            <label className="mt-4 block text-xs font-semibold text-ink">
              Reason for rejection
            </label>
            <textarea
              ref={reasonRef}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Provide detailed feedback on missing credentials..."
              rows={4}
              className="mt-1.5 w-full rounded-sm border border-border-subtle bg-surface-bg p-3 text-sm text-ink outline-none focus:border-burgundy"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setRejectTarget(null)}
                className="px-4 py-2 text-xs font-semibold text-muted hover:text-ink"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={submitting || !rejectionReason.trim()}
                onClick={() => handleReview(rejectTarget.id, "REJECTED")}
                className="rounded-sm bg-burgundy px-4 py-2 text-xs font-semibold text-white transition hover:bg-burgundy/90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};