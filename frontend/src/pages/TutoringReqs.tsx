import { Link, useNavigate } from "react-router-dom";

export default function TutoringReqs() {
  const navigate = useNavigate();

  return (
    <div className="w-full px-8 py-8">
      {/* Header */}
      <div className="border-b border-border-subtle pb-6">
        <span className="inline-block rounded-md bg-brand-primary/10 px-3 py-1 text-xs font-semibold text-brand-primary">
          Tutor Application Guidelines
        </span>
        <h1 className="mt-3 font-serif text-3xl font-bold text-ink">
          Application Requirements & Guidelines
        </h1>
        <p className="mt-2 text-base leading-relaxed text-muted">
          Before submitting your application to become a verified tutor on
          Tutorium, please review the required profile fields and verification
          standards below. Our administration team manually assesses every
          request to maintain high peer-tutoring quality.
        </p>
      </div>

      {/* Process Workflow Steps */}
      <div className="mt-8 grid gap-6 md:grid-cols-3">
        <div className="rounded-lg border border-border-subtle bg-surface p-6 shadow-sm">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-brand-primary text-sm font-bold text-white">
            1
          </div>
          <h3 className="mt-4 font-serif text-lg font-semibold text-ink">
            1. Review & Prepare
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Understand what information is required to establish your profile
            credibility.
          </p>
        </div>

        <div className="rounded-lg border border-border-subtle bg-surface p-6 shadow-sm">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-brand-primary text-sm font-bold text-white">
            2
          </div>
          <h3 className="mt-4 font-serif text-lg font-semibold text-ink">
            2. Submit Form
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Fill out your academic background, rate, bio, and subjects taught.
          </p>
        </div>

        <div className="rounded-lg border border-border-subtle bg-surface p-6 shadow-sm">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-brand-primary text-sm font-bold text-white">
            3
          </div>
          <h3 className="mt-4 font-serif text-lg font-semibold text-ink">
            3. Admin Review
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Administrators evaluate your request (
            <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-semibold text-amber-700">
              PENDING
            </code>{" "}
            state) before approving tutor status.
          </p>
        </div>
      </div>

      {/* Field Explanations Section */}
      <div className="mt-8 rounded-xl border border-border-subtle bg-white p-8 shadow-sm">
        <h2 className="font-serif text-2xl font-bold text-ink">
          Required Application Fields Explained
        </h2>
        <p className="mt-1 text-sm text-muted">
          Here is why we request specific details in your application:
        </p>

        <div className="mt-6 grid gap-4">
          {/* Headline */}
          <div className="rounded-lg border border-border-subtle bg-surface/50 p-5">
            <div className="flex items-center justify-between">
              <span className="text-base font-semibold text-ink">
                Professional Headline
              </span>
              <span className="rounded bg-slate-200/60 px-2.5 py-0.5 text-xs font-medium text-slate-700">
                Required
              </span>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              <strong className="font-medium text-ink">Why we need it:</strong>{" "}
              Gives students an immediate summary of your specialty (e.g.,{" "}
              <em>"Senior CS Student & TA for Algorithms"</em>). It acts as your
              primary headline across search results.
            </p>
          </div>

          {/* Academic Background */}
          <div className="rounded-lg border border-border-subtle bg-surface/50 p-5">
            <div className="flex items-center justify-between">
              <span className="text-base font-semibold text-ink">
                Academic Level & Education
              </span>
              <span className="rounded bg-slate-200/60 px-2.5 py-0.5 text-xs font-medium text-slate-700">
                Required
              </span>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              <strong className="font-medium text-ink">Why we need it:</strong>{" "}
              Establishes academic credibility. Students need to know your
              current degree, major, or completed coursework in Computer Science
              to ensure subject mastery.
            </p>
          </div>

          {/* Bio & Teaching Philosophy */}
          <div className="rounded-lg border border-border-subtle bg-surface/50 p-5">
            <div className="flex items-center justify-between">
              <span className="text-base font-semibold text-ink">
                Biography & Teaching Approach
              </span>
              <span className="rounded bg-slate-200/60 px-2.5 py-0.5 text-xs font-medium text-slate-700">
                Required
              </span>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              <strong className="font-medium text-ink">Why we need it:</strong>{" "}
              Explains how you approach problem-solving, code reviews, and exam
              preparation. This helps students find a tutor whose teaching style
              matches their learning pace.
            </p>
          </div>

          {/* Hourly Rate */}
          <div className="rounded-lg border border-border-subtle bg-surface/50 p-5">
            <div className="flex items-center justify-between">
              <span className="text-base font-semibold text-ink">
                Hourly Rate ($ USD)
              </span>
              <span className="rounded bg-slate-200/60 px-2.5 py-0.5 text-xs font-medium text-slate-700">
                Required
              </span>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              <strong className="font-medium text-ink">Why we need it:</strong>{" "}
              Ensures transparent pricing across the directory. You set your own
              compensation based on your experience level and subject
              complexity.
            </p>
          </div>

          {/* Certificates & Experience */}
          <div className="rounded-lg border border-border-subtle bg-surface/50 p-5">
            <div className="flex items-center justify-between">
              <span className="text-base font-semibold text-ink">
                Certificates & Prior Experience
              </span>
              <span className="rounded bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-500">
                Optional
              </span>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              <strong className="font-medium text-ink">Why we need it:</strong>{" "}
              Helps your application stand out to admins and students. Listing
              previous TA experience, honors, or industry certifications speeds
              up approval.
            </p>
          </div>

          {/* Video Intro */}
          <div className="rounded-lg border border-border-subtle bg-surface/50 p-5">
            <div className="flex items-center justify-between">
              <span className="text-base font-semibold text-ink">
                Video Introduction Link
              </span>
              <span className="rounded bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-500">
                Optional
              </span>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              <strong className="font-medium text-ink">Why we need it:</strong>{" "}
              A short 1-minute video introducing yourself builds trust and
              significantly increases booking rates once approved.
            </p>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="mt-8 flex items-center justify-between rounded-lg border border-border-subtle bg-surface p-6 shadow-sm">
        <div>
          <h3 className="font-serif text-lg font-semibold text-ink">
            Ready to begin?
          </h3>
          <p className="mt-1 text-sm text-muted">
            Make sure you have your academic background details ready.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="rounded-md border border-border-subtle px-5 py-2.5 text-sm font-medium text-muted transition-colors hover:bg-white hover:text-ink"
          >
            Back
          </button>
          <Link
            to="/become-a-tutor"
            className="inline-flex items-center justify-center rounded-md bg-brand-primary px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-95"
          >
            Apply as a Tutor &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
