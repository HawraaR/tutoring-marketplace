import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Input, Button } from "../components/ui";
import { useAuth } from "../context/AuthContext";
import { applyAsTutor } from "../services/api/tutorAPI";
import type { ApiErrorResponse, TutorApplicationInput } from "../types";

// "React, TypeScript , PostgreSQL" -> ["React", "TypeScript", "PostgreSQL"]
const toList = (value: string): string[] =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const statusCopy: Record<string, { title: string; body: string; tone: string }> = {
  PENDING: {
    title: "Application under review",
    body: "Your tutor application has been submitted. An admin will review it shortly.",
    tone: "text-olive",
  },
  APPROVED: {
    title: "You're an approved tutor",
    body: "Your application was approved. You can now offer sessions.",
    tone: "text-olive",
  },
  REJECTED: {
    title: "Application not approved",
    body: "Your application was not approved this time.",
    tone: "text-error",
  },
};

export function TutorApplication() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Form fields
  const [headline, setHeadline] = useState("");
  const [bio, setBio] = useState("");
  const [education, setEducation] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");
  const [subjects, setSubjects] = useState("");
  const [languages, setLanguages] = useState("");
  const [certificates, setCertificates] = useState("");
  const [experience, setExperience] = useState("");

  // Feedback
  const [errorMessages, setErrorMessages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const existing = user?.tutorProfile;

  // 1. Already applied -> show status instead of the form
  if (existing) { 
    const copy = statusCopy[existing.verificationStatus] ?? statusCopy.PENDING;
    return (
      <div className="mx-auto max-w-2xl">
        <div className="rounded-sm border border-border-subtle bg-surface-card p-6">
          <h1 className="font-serif text-2xl font-semibold text-ink">Become a tutor</h1>
          <p className={`mt-4 text-sm font-semibold ${copy.tone}`}>{copy.title}</p>
          <p className="mt-1 text-sm text-muted">{copy.body}</p>
          {existing.verificationStatus === "REJECTED" && existing.rejectionReason && (
            <p className="mt-3 text-sm text-muted">
              <span className="font-medium text-ink">Reason: </span>
              {existing.rejectionReason}
            </p>
          )}
          {/* <Button type="button" className="mt-6" onClick={() => navigate("/dashboard")}>
            Back to dashboard
          </Button> */}
                    <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button type="button" onClick={() => navigate("/tutor-profile")}>
              Edit profile
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate("/dashboard")}
            >
              Back to dashboard
            </Button>
          </div>

        </div>
      </div>
    );
  }

  // 2. Just submitted in this session
  if (submitted) {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="rounded-sm border border-border-subtle bg-surface-card p-6">
          <h1 className="font-serif text-2xl font-semibold text-ink">Application submitted</h1>
          <p className="mt-2 text-sm text-muted">
            Thanks. An admin will review your application. Reload the page to see the latest status.
          </p>
          <Button type="button" className="mt-6" onClick={() => navigate("/dashboard")}>
            Back to dashboard
          </Button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessages([]);

    const rate = Number(hourlyRate);
    if (Number.isNaN(rate) || rate < 0) {
      setErrorMessages(["Hourly rate must be a number of 0 or more."]);
      return;
    }

    const payload: TutorApplicationInput = {
      headline: headline.trim(),
      bio: bio.trim(),
      education: education.trim(),
      hourlyRate: rate,
      subjects: toList(subjects),
      languages: toList(languages),
      certificates: toList(certificates),
      experience: toList(experience),
    };

    setIsLoading(true);
    try {
      await applyAsTutor(payload);
      setSubmitted(true);
    } catch (err: unknown) {
      if (axios.isAxiosError<ApiErrorResponse>(err) && err.response) {
        const errorData = err.response.data;

        if (errorData.details && Array.isArray(errorData.details)) {
          setErrorMessages(errorData.details.map((item) => item.message));
        } else if (errorData.error) {
          setErrorMessages([errorData.error]);
        } else {
          setErrorMessages(["An unexpected server error occurred."]);
        }
      } else {
        setErrorMessages(["Network error. Is your backend server running?"]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <div className="rounded-sm border border-border-subtle bg-surface-card p-6">
        <h1 className="font-serif text-2xl font-semibold text-ink">Become a tutor</h1>
        <p className="mt-1 mb-6 text-sm text-muted">
          Tell us what you can teach. An admin reviews every application before you go live.
        </p>

        {errorMessages.length > 0 && (
          <ul className="mb-4 list-inside list-disc space-y-1 text-sm text-error">
            {errorMessages.map((msg, idx) => (
              <li key={idx}>{msg}</li>
            ))}
          </ul>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <Input
            label="Headline"
            required
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            placeholder="MSc CS student & React tutor"
          />

          <div className="w-full">
            <label className="mb-1 block text-sm font-medium text-ink">Bio</label>
            <textarea
              required
              rows={4}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="A few sentences about your background and how you teach."
              className="w-full rounded-sm border border-border-subtle bg-surface-card px-3.5 py-2.5 text-sm text-ink outline-none placeholder:text-muted focus:border-brand-primary"
            />
          </div>

          <Input
            label="Education"
            required
            value={education}
            onChange={(e) => setEducation(e.target.value)}
            placeholder="BSc Computer Science, University of X"
          />

          <Input
            label="Hourly rate (USD)"
            type="number"
            min={0}
            step="0.5"
            required
            value={hourlyRate}
            onChange={(e) => setHourlyRate(e.target.value)}
            placeholder="30"
          />

          <div>
            <Input
              label="Subjects"
              required
              value={subjects}
              onChange={(e) => setSubjects(e.target.value)}
              placeholder="React, TypeScript, PostgreSQL"
            />
            <p className="mt-1 text-xs text-muted">Separate multiple entries with commas.</p>
          </div>

          <div>
            <Input
              label="Languages"
              value={languages}
              onChange={(e) => setLanguages(e.target.value)}
              placeholder="English, Arabic"
            />
            <p className="mt-1 text-xs text-muted">
              Separate with commas. Leave blank to default to English.
            </p>
          </div>

          <Input
            label="Certificates (optional)"
            value={certificates}
            onChange={(e) => setCertificates(e.target.value)}
            placeholder="AWS Certified Developer"
          />

          <Input
            label="Experience (optional)"
            value={experience}
            onChange={(e) => setExperience(e.target.value)}
            placeholder="2 years university teaching assistant"
          />

          <Button type="submit" disabled={isLoading} className="mt-2">
            {isLoading ? "Submitting…" : "Submit application"}
          </Button>
        </form>
      </div>
    </div>
  );
}
