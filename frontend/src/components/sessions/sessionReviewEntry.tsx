import { useState } from "react";
import { PenLine } from "lucide-react";
import { ReviewModal, type ReviewableSession } from "../review/reviewModal";

interface SessionReviewEntryProps {
  session: ReviewableSession;
  onReviewed?: () => void;
}

export function SessionReviewEntry({ session, onReviewed }: SessionReviewEntryProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-blue hover:text-brand-primary hover:underline"
      >
        <PenLine className="h-3.5 w-3.5" /> Leave a review
      </button>
      <ReviewModal open={open} session={session} onClose={() => setOpen(false)} onSubmitted={onReviewed} />
    </>
  );
}