import { useState } from "react";
import { Link } from "react-router-dom";
import { TriangleAlert, X } from "lucide-react"; // or your icon library

interface StudentProfile {
  educationLevel?: string;
  preferredSubjects?: string[];
}

interface BannerProps {
  profile: StudentProfile | null;
}

export function CompleteProfileBanner({ profile }: BannerProps) {
  const [dismissed, setDismissed] = useState(false);

  // Check if key fields are missing
  const isProfileIncomplete =
    !profile?.educationLevel || (profile?.preferredSubjects?.length ?? 0) === 0;

  if (!isProfileIncomplete || dismissed) {
    return null;
  }

  return (
    <div className="mb-2 rounded-sm border border-amber-200 bg-amber-50 p-4 text-amber-900 shadow-sm transition">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <TriangleAlert className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600" />
          <div>
            <h4 className="text-sm font-semibold">Complete your Student Profile</h4>
            <p className="mt-1 text-xs text-amber-800">
              Please take a moment to fill out your education details and preferred subjects so we can better match you with tutors.
            </p>
            <Link
              to="/settings"
              className="mt-2 inline-block text-xs font-semibold text-amber-900 underline hover:text-amber-700"
            >
              Go to Profile Settings →
            </Link>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setDismissed(true)}
          aria-label="Dismiss banner"
          className="rounded-sm p-1 text-amber-600 hover:bg-amber-100 hover:text-amber-800"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}