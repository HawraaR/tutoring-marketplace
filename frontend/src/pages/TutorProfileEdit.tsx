import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Input, Button } from "../components/ui";
import { useAuth } from "../context/AuthContext";
import { updateTutorProfile } from "../services/api/tutorAPI";
import type { ApiErrorResponse, TutorApplicationInput } from "../types";

// "React, TypeScript , PostgreSQL" -> ["React", "TypeScript", "PostgreSQL"]
const toList = (value: string): string[] =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const statusLabel: Record<string, string> = {
  PENDING: "Pending review",
  APPROVED: "Approved",
  REJECTED: "Not approved",
};

export function TutorProfileEdit() {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
//   const profile = user?.tutorProfile ?? null;
  // TEMP preview — revert to:  const profile = user?.tutorProfile ?? null;
  const profile = {
    headline: "MSc CS student & React tutor",
    bio: "I hold a CS degree and specialise in React, Node.js, and PostgreSQL. I tutor with hands-on exercises and past exam papers.",
    education: "BSc Computer Science, University of X",
    hourlyRate: 30,
    subjects: ["React", "TypeScript", "PostgreSQL"],
    languages: ["English", "Arabic"],
    certificates: ["AWS Certified Developer"],
    experience: ["2 years university teaching assistant"],
    verificationStatus: "APPROVED" as const,
    rejectionReason: null,
  };


  // Pre-fill each field from the current profile (arrays -> comma-separated text)
  const [headline, setHeadline] = useState(profile?.headline ?? "");
  const [bio, setBio] = useState(profile?.bio ?? "");
  const [education, setEducation] = useState(profile?.education ?? "");
  const [hourlyRate, setHourlyRate] = useState(profile ? String(profile.hourlyRate) : "");
  const [subjects, setSubjects] = useState((profile?.subjects ?? []).join(", "));
  const [languages, setLanguages] = useState((profile?.languages ?? []).join(", "));
  const [certificates, setCertificates] = useState((profile?.certificates ?? []).join(", "));
  const [experience, setExperience] = useState((profile?.experience ?? []).join(", "));

  const [errorMessages, setErrorMessages] = useState<string[]>([]);
  const [successMessage, setSuccessMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  // No tutor profile yet -> nothing to edit
  if (!profile) {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="rounded-sm border border-border-subtle bg-surface-card p-6">
          <h1 className="font-serif text-2xl font-semibold text-ink">Tutor profile</h1>
          <p className="mt-2 text-sm text-muted">
            You don't have a tutor profile yet. Apply first, then you can edit it here.
          </p>
          <Button type="button" className="mt-6" onClick={() => navigate("/become-a-tutor")}>
            Apply to become a tutor
          </Button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessages([]);
    setSuccessMessage("");

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

    setIsSaving(true);
    try {
      await updateTutorProfile(payload);
      await refreshUser(); // pull the saved values back into context
      setSuccessMessage("Profile saved.");
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
      setIsSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <div className="rounded-sm border border-border-subtle bg-surface-card p-6">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="font-serif text-2xl font-semibold text-ink">Edit tutor profile</h1>
            <p className="mt-1 text-sm text-muted">
              Status: {statusLabel[profile.verificationStatus] ?? profile.verificationStatus}
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="text-sm text-muted hover:text-ink hover:underline"
          >
            Cancel
          </button>
        </div>

        {successMessage && <p className="mb-4 text-sm text-olive">{successMessage}</p>}

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
          />

          <div className="w-full">
            <label className="mb-1 block text-sm font-medium text-ink">Bio</label>
            <textarea
              required
              rows={4}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full rounded-sm border border-border-subtle bg-surface-card px-3.5 py-2.5 text-sm text-ink outline-none placeholder:text-muted focus:border-brand-primary"
            />
          </div>

          <Input
            label="Education"
            required
            value={education}
            onChange={(e) => setEducation(e.target.value)}
          />

          <Input
            label="Hourly rate (USD)"
            type="number"
            min={0}
            step="0.5"
            required
            value={hourlyRate}
            onChange={(e) => setHourlyRate(e.target.value)}
          />

          <div>
            <Input
              label="Subjects"
              required
              value={subjects}
              onChange={(e) => setSubjects(e.target.value)}
            />
            <p className="mt-1 text-xs text-muted">Separate multiple entries with commas.</p>
          </div>

          <div>
            <Input
              label="Languages"
              value={languages}
              onChange={(e) => setLanguages(e.target.value)}
            />
            <p className="mt-1 text-xs text-muted">Separate with commas.</p>
          </div>

          <Input
            label="Certificates"
            value={certificates}
            onChange={(e) => setCertificates(e.target.value)}
          />

          <Input
            label="Experience"
            value={experience}
            onChange={(e) => setExperience(e.target.value)}
          />

          <Button type="submit" disabled={isSaving} className="mt-2">
            {isSaving ? "Saving…" : "Save changes"}
          </Button>
        </form>
      </div>
    </div>
  );
}
