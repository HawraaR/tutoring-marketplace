/* eslint-disable @typescript-eslint/no-unused-vars */
import { Clock3, MessageCircle, MoreHorizontal, Star, Video } from "lucide-react";
import { CourseLabel } from "../../components/dashboard/CourseLabel";
import { STATUS_STYLES } from "../../lib/utils/sessionHelpers";
import type { Booking, UnifiedSession } from "../../types";
import { useState } from "react";
import { ReviewModal } from "./ReviewModel";

interface SessionRowProps {
  session: UnifiedSession;
  isTutorMode: boolean;
  onAction: (
    id: string,
    action: "join" | "message" | "reschedule" | "cancel" | "details",
  ) => void;
  onReviewSubmitted?: () => void; 
}

export function SessionRow({
  session,
  isTutorMode,
  onAction,
  onReviewSubmitted,
}: SessionRowProps) {
  const dayNumber = new Date(session.sortDate).getDate();
  const[reviewTarget, setReviewTarget] = useState<UnifiedSession|null>(null);

  const handleReviewSubmitted = () => {
    setReviewTarget(null);
    onReviewSubmitted?.();
  };

  return (
      <>
        <article className="border-b border-border-subtle px-4 py-4 last:border-0 md:px-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          <div className="flex items-center gap-3 lg:w-44 lg:shrink-0">
            <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-sm bg-brand-primary text-white">
              <span className="text-[10px] font-medium uppercase">
                {session.day}
              </span>
              <span className="font-serif text-lg leading-none">{dayNumber}</span>
            </div>
            <div className="lg:hidden">
              <p className="text-sm font-medium text-ink">{session.date}</p>
              <p className="text-xs text-muted">{session.time}</p>
            </div>
            <div
              className={`hidden rounded-full px-2 py-1 text-[10px] font-medium uppercase lg:block ${STATUS_STYLES[session.status]}`}
            >
              {session.status}
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <CourseLabel title={session.title} tone={session.tone ?? "olive"} />
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
              <span className="inline-flex items-center gap-1">
                <Clock3 className="h-3.5 w-3.5" />
                {session.time} · {session.duration}
              </span>
              <span>{session.mode}</span>
            </div>

            <p className="mt-2 text-sm text-ink">
              <span className="mr-1.5 text-xs text-muted uppercase tracking-wider">
                {session.counterpartRole}:
              </span>
              <span className="font-medium">{session.counterpartName}</span>
              {session.credentials && (
                <span className="ml-1.5 text-xs text-muted">
                  {session.credentials}
                </span>
              )}
            </p>

            {session.note && (
              <p className="mt-1 rounded-sm border border-border-subtle bg-surface-bg p-2 text-xs text-muted">
                <span className="font-medium text-ink">Note: </span>
                {session.note}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between gap-2 border-t border-border-subtle pt-3 lg:w-52 lg:shrink-0 lg:justify-end lg:border-0 lg:pt-0">
            {session.status === "upcoming" ? (
              <>
                <button
                  type="button"
                  onClick={() => onAction(session.id, "join")}
                  className="inline-flex items-center gap-1.5 rounded-sm bg-brand-primary px-3 py-2 text-xs font-medium text-white hover:bg-brand-primary-hover"
                >
                  <Video className="h-3.5 w-3.5" />
                  Join
                </button>

                {isTutorMode && (
                  <button
                    type="button"
                    onClick={() => onAction(session.id, "details")}
                    className="text-xs font-medium text-brand-primary hover:underline"
                  >
                    Details
                  </button>
                )}

                <button
                  type="button"
                  aria-label={`More actions for ${session.title}`}
                  title="More actions"
                  className="rounded-sm p-2 text-muted hover:bg-surface-bg hover:text-ink"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={() => onAction(session.id, "cancel")}
                  className="hidden text-xs text-muted hover:text-error sm:block"
                >
                  Cancel
                </button>
              </>
            ) : session.status === "past" ? (
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                {/* Show Rate & Review button only for students who haven't reviewed */}
                {!isTutorMode && !session.review && (
                  <button
                    type="button"
                    onClick={() => setReviewTarget(session)}
                    className="inline-flex items-center gap-1.5 rounded-sm bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-600 hover:bg-amber-500/20"
                  >
                    <Star className="h-3.5 w-3.5" fill="currentColor" />
                    Rate & Review
                  </button>
                )}

                {/* Show "Reviewed" badge if they already did */}
                {!isTutorMode && session.review && (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-olive">
                    <Star className="h-3.5 w-3.5" fill="currentColor" />
                    Reviewed ({session.review.rating}★)
                  </span>
                )}

                <button
                  type="button"
                  onClick={() => onAction(session.id, "message")}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-brand-primary hover:underline"
                >
                  <MessageCircle className="h-3.5 w-3.5" />
                  Message {session.counterpartRole.toLowerCase()}
                </button>
              </div>
            ) : (
              <span className="text-xs text-error">Session cancelled</span>
            )}
          </div>
        </div>
      </article>
      {reviewTarget && (
        <ReviewModal
          session={reviewTarget}
          onClose={() => setReviewTarget(null)}
          onSubmitted={handleReviewSubmitted}
        />
      )}
    </>
    
  );
}
