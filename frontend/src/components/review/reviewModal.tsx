/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
import axios from "axios";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { BadgeCheck, Send, ShieldCheck } from "lucide-react";
import { createReview } from "../../api/reviewAPI";
import type { CategoryRatings } from "../../types/tutor";
import {
  EMPTY_RATINGS,
  REVIEW_CRITERIA,
  REVIEW_MAX_LENGTH,
  formatReviewDate,
} from "./reviewCriteria";
import { StarRatingInput } from "./starRatingInput";

export interface ReviewableSession {
  id: string;
  status: string;
  startTime: string;
  endTime: string;
  subject: { id: string; name: string };
  tutor: { id: string; firstName: string | null; lastName: string | null; email: string };
  review: { id: string; rating: number; comment: string } | null;
}

interface ReviewModalProps {
  open: boolean;
  session: ReviewableSession | null;
  onClose: () => void;
  onSubmitted?: () => void;
}

export function ReviewModal({ open, session, onClose, onSubmitted }: ReviewModalProps) {
  const [ratings, setRatings] = useState<CategoryRatings>(EMPTY_RATINGS);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setRatings(EMPTY_RATINGS);
      setComment("");
    }
  }, [open, session?.id]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open || !session) return null;

  const allRated = REVIEW_CRITERIA.every((c) => ratings[c.key] > 0);
  const firstName = session.tutor.firstName ?? "";
  const lastName = session.tutor.lastName ?? "";
  const tutorName = `${firstName} ${lastName ? `${lastName.charAt(0)}.` : ""}`.trim();
  const initials = `${(firstName || "T").charAt(0)}${lastName.charAt(0)}`.toUpperCase();

  const handleSubmit = async () => {
    if (!allRated || submitting) return;
    setSubmitting(true);
    try {
      await createReview({ bookingId: session.id, ratings, comment: comment.trim() });
      toast.success("Review submitted — thank you for the feedback!");
      onSubmitted?.();
      onClose();
    } catch (err: unknown) {
      if (axios.isAxiosError<{ error?: string; message?: string }>(err)) {
        toast.error(
          err.response?.data?.error ||
            err.response?.data?.message ||
            "Failed to submit review.",
        );
      } else {
        toast.error("Failed to submit review.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`Review ${tutorName}`}
      onClick={onClose}
    >
      <div
        className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-sm border border-border-subtle bg-surface-card shadow-warm"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-border-subtle px-6 py-5">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-primary font-serif text-base font-semibold text-white">
                {initials}
              </div>
              <span className="absolute -right-0.5 -bottom-0.5 h-3 w-3 rounded-full border-2 border-surface-card bg-olive" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-semibold text-ink">Review {tutorName}</h2>
              <p className="mt-0.5 text-sm text-muted">
                {session.subject.name} • {formatReviewDate(session.startTime)}
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-blue/25 bg-slate-blue/10 px-3 py-1.5 text-[11px] font-semibold tracking-[0.08em] text-slate-blue uppercase">
            <BadgeCheck className="h-3.5 w-3.5" /> Verified Session
          </span>
        </div>

        {/* Body */}
        <div className="space-y-6 px-6 py-6">
          <div className="space-y-5">
            {REVIEW_CRITERIA.map((c) => (
              <div key={c.key} className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-[15px] font-semibold text-ink">{c.label}</p>
                  <p className="mt-0.5 text-sm text-muted">{c.question}</p>
                </div>
                <StarRatingInput
                  label={c.label}
                  value={ratings[c.key]}
                  onChange={(v) => setRatings((prev) => ({ ...prev, [c.key]: v }))}
                />
              </div>
            ))}
          </div>

          <div>
            <div className="flex items-end justify-between gap-4">
              <h3 className="text-[15px] font-semibold text-ink">Share your experience</h3>
              <span className="text-[11px] font-medium tracking-[0.08em] text-muted uppercase tabular-nums">
                {comment.length} / {REVIEW_MAX_LENGTH} characters
              </span>
            </div>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value.slice(0, REVIEW_MAX_LENGTH))}
              maxLength={REVIEW_MAX_LENGTH}
              rows={5}
              placeholder="Describe how the tutor helped you. Any specific strengths or areas for improvement?"
              className="mt-3 w-full resize-none rounded-sm border border-border-subtle bg-surface-card px-4 py-3 text-sm text-ink placeholder:text-muted/70 focus:border-slate-blue focus:ring-2 focus:ring-slate-blue/20 focus:outline-none"
            />
          </div>

          <div className="flex flex-col gap-4 border-t border-border-subtle pt-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs leading-relaxed text-muted">
              Your overall score is the average of the three categories above. Reviews are
              published once the session is verified as completed.
            </p>
            <div className="flex shrink-0 items-center gap-3 rounded-sm bg-slate-blue/10 px-4 py-3">
              <ShieldCheck className="h-5 w-5 text-slate-blue" />
              <div>
                <p className="text-[11px] font-bold tracking-[0.08em] text-ink uppercase">Trust Badge</p>
                <p className="text-xs text-muted">Verified through AcademiConnect system</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 border-t border-border-subtle bg-surface-bg px-6 py-4">
          {!allRated && (
            <span className="mr-auto text-xs text-muted">
              Please rate all three categories before submitting.
            </span>
          )}
          <button
            type="button"
            onClick={onClose}
            className="rounded-sm px-4 py-2 text-sm font-medium text-muted hover:text-ink"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!allRated || submitting}
            className="inline-flex items-center gap-2 rounded-sm bg-brand-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? "Submitting…" : "Submit Review"}
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}