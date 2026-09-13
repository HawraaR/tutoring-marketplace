import { useState } from "react";
import { createReview } from "../../api/reviewAPI";
import { Star, X } from "lucide-react";
import type { UnifiedSession } from "../../types";

interface ReviewModalProps {
  session: UnifiedSession;
  onClose: () => void;
  onSubmitted: () => void;
}

export function ReviewModal({ session, onClose, onSubmitted }: ReviewModalProps) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      // Use bookingId or session.id depending on how your UnifiedSession maps to the DB Booking
      const bookingId = session.bookingId || session.id; 
      await createReview({ bookingId, rating, comment: comment.trim() });
      onSubmitted();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/40 p-4" 
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-xl border border-border-subtle bg-surface-card p-6 shadow-warm"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-lg font-semibold text-ink">Rate your session</h3>
          <button onClick={onClose} className="text-muted hover:text-ink">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <p className="mt-1 text-sm text-muted">
          {session.title} · {session.date} at {session.time}
        </p>

        <div className="mt-4 flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setRating(n)}
              aria-label={`${n} star${n === 1 ? "" : "s"}`}
              className={`text-2xl leading-none ${n <= rating ? "text-amber-500" : "text-border-subtle"}`}
            >
              <Star className="h-6 w-6" fill={n <= rating ? "currentColor" : "none"} />
            </button>
          ))}
        </div>

        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          placeholder="How was the session? What did the tutor help you with?"
          className="mt-4 w-full resize-none rounded-lg border border-border-subtle bg-surface-card px-3 py-2 text-sm text-ink focus:border-slate-blue focus:outline-none"
        />

        {error && <p role="alert" className="mt-2 text-xs font-semibold text-error">{error}</p>}

        <div className="mt-4 flex justify-end gap-2">
          <button 
            onClick={onClose} 
            className="rounded-lg px-4 py-2 text-sm font-semibold text-muted hover:text-ink"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={!comment.trim() || submitting}
            className="rounded-lg bg-brand-primary px-4 py-2 text-sm font-semibold text-white hover:bg-brand-primary-hover disabled:opacity-50"
          >
            {submitting ? "Submitting…" : "Submit review"}
          </button>
        </div>
      </div>
    </div>
  );
}