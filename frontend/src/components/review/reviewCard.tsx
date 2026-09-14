// ReviewCard.tsx
import { Stars } from "./stars";
import { formatReviewDate } from "./reviewCriteria";
import type { TutorReview } from "../../types/tutor";

export function ReviewCard({ review }: { review: TutorReview }) {
  const studentName = review.student.firstName
    ? `${review.student.firstName} ${review.student.lastName ? `${review.student.lastName.charAt(0)}.` : ""}`
    : "Verified Student";

  return (
    <article className="px-5 py-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-secondary/15 font-serif text-sm font-semibold text-brand-secondary">
            {(review.student.firstName ?? "V").charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-semibold text-ink">{studentName}</p>
            <p className="mt-0.5 text-xs text-muted">
              {review.subject.name} • Session on {formatReviewDate(review.sessionDate)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 pt-1">
          <Stars value={review.rating} size={15} />
          <span className="text-xs font-semibold text-ink tabular-nums">{review.rating.toFixed(1)}</span>
        </div>
      </div>
      {review.comment ? (
        <p className="mt-3 text-sm leading-relaxed whitespace-pre-line text-ink/90">{review.comment}</p>
      ) : (
        <p className="mt-3 text-sm text-muted italic">This student left a rating without a written comment.</p>
      )}
      <p className="mt-2 text-[11px] tracking-wide text-muted uppercase">
        Posted {formatReviewDate(review.createdAt)}
      </p>
    </article>
  );
}