// TutorReviews.tsx
import { ReviewCard } from "./reviewCard";
import { Stars } from "./stars";
import type { TutorReview } from "../../types/tutor";

interface TutorReviewsProps {
  reviews: TutorReview[];
  averageRating: number;
  reviewCount: number;
}

export function TutorReviews({ reviews, averageRating, reviewCount }: TutorReviewsProps) {
  const distribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => Math.round(r.rating) === star).length,
  }));
  const distTotal = reviews.length || 1;

  return (
    <section className="space-y-4">
      <div className="flex items-end justify-between">
        <h2 className="font-serif text-xl font-semibold text-ink">Reviews</h2>
        <span className="text-sm text-muted">
          {reviewCount} verified review{reviewCount === 1 ? "" : "s"}
        </span>
      </div>

      {reviewCount === 0 ? (
        <div className="rounded-sm border border-border-subtle bg-surface-card px-5 py-10 text-center">
          <p className="font-serif text-base font-semibold text-ink">No reviews yet</p>
          <p className="mt-1 text-sm text-muted">Reviews from completed sessions will appear here.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-sm border border-border-subtle bg-surface-card">
          <div className="flex flex-col gap-6 border-b border-border-subtle bg-surface-bg px-5 py-5 sm:flex-row sm:items-center">
            <div className="flex items-center gap-4">
              <span className="font-serif text-4xl font-semibold text-ink tabular-nums">
                {averageRating.toFixed(1)}
              </span>
              <div>
                <Stars value={averageRating} size={18} />
                <p className="mt-1 text-xs text-muted">
                  Average of {reviewCount} session review{reviewCount === 1 ? "" : "s"}
                </p>
              </div>
            </div>
            <div className="flex-1 space-y-1.5">
              {distribution.map(({ star, count }) => (
                <div key={star} className="flex items-center gap-3">
                  <span className="w-8 text-xs font-medium text-muted tabular-nums">{star} ★</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-border-subtle">
                    <div
                      className="h-full rounded-full bg-amber-400"
                      style={{ width: `${(count / distTotal) * 100}%` }}
                    />
                  </div>
                  <span className="w-6 text-right text-xs text-muted tabular-nums">{count}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="divide-y divide-border-subtle">
            {reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}