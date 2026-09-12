import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Input, Button } from "../components/ui";
import { getMyTutorProfile, updateMyTutorProfile } from "../api/tutorProfileAPI";
import { getSubjects } from "../api/subjectAPI";
import type { Subject, TutorProfile } from "../types";

const toList = (value: string): string[] =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const statusCopy: Record<string, { title: string; body: string; tone: string }> = {
  PENDING: {
    title: "Application under review",
    body: "Your tutor application is still being reviewed. You'll be able to edit your profile once it's approved.",
    tone: "text-ink",
  },
  REJECTED: {
    title: "Application not approved",
    body: "Your application was not approved, so there's no profile to edit.",
    tone: "text-error",
  },
};

export function TutorProfileEdit() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState<TutorProfile | null>(null);
  const [allSubjects, setAllSubjects] = useState<Subject[]>([]);
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [headline, setHeadline] = useState("");
  const [bio, setBio] = useState("");
  const [education, setEducation] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");
  const [languages, setLanguages] = useState("");
  const [certificates, setCertificates] = useState("");
  const [experience, setExperience] = useState("");

  const [errorMessages, setErrorMessages] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    Promise.all([getMyTutorProfile(), getSubjects().catch(() => [])])
      .then(([{ profile, subjects }, subjectCatalog]) => {
        setProfile(profile);
        setSelectedSubjectIds(subjects.map((s) => s.id));
        setAllSubjects(subjectCatalog);
        setHeadline(profile.headline ?? "");
        setBio(profile.bio ?? "");
        setEducation(profile.education ?? "");
        setHourlyRate(String(profile.hourlyRate ?? 0));
        setLanguages((profile.languages ?? []).join(", "));
        setCertificates((profile.certificates ?? []).join(", "));
        setExperience((profile.experience ?? []).join(", "));
      })
      .catch((error) => {
        if (error?.response?.status === 404) {
          setNotFound(true);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const toggleSubject = (id: string) => {
    setSelectedSubjectIds((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    );
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl">
        <Card>
          <p className="text-sm text-muted">Loading your profile…</p>
        </Card>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="mx-auto max-w-2xl">
        <Card>
          <h1 className="font-serif text-2xl font-semibold text-ink">Tutor profile</h1>
          <p className="mt-2 text-sm text-muted">
            You haven't applied to become a tutor yet.
          </p>
          <Button type="button" className="mt-6" onClick={() => navigate("/become-a-tutor")}>
            Become a tutor
          </Button>
        </Card>
      </div>
    );
  }

  if (profile && profile.verificationStatus !== "APPROVED") {
    const copy = statusCopy[profile.verificationStatus] ?? statusCopy.PENDING;
    return (
      <div className="mx-auto max-w-2xl">
        <Card>
          <h1 className="font-serif text-2xl font-semibold text-ink">Tutor profile</h1>
          <p className={`mt-4 text-sm font-semibold ${copy.tone}`}>{copy.title}</p>
          <p className="mt-1 text-sm text-muted">{copy.body}</p>
          {profile.verificationStatus === "REJECTED" && profile.rejectionReason && (
            <p className="mt-3 text-sm text-muted">
              <span className="font-medium text-ink">Reason: </span>
              {profile.rejectionReason}
            </p>
          )}
          <Button type="button" variant="secondary" className="mt-6" onClick={() => navigate("/dashboard")}>
            Back to dashboard
          </Button>
        </Card>
      </div>
    );
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrorMessages([]);
    setSaved(false);

    if (selectedSubjectIds.length === 0) {
      setErrorMessages(["Select at least one subject you can teach."]);
      return;
    }

    setIsSaving(true);
    try {
      const { profile: updated } = await updateMyTutorProfile({
        headline,
        bio,
        education,
        hourlyRate: Number(hourlyRate) || 0,
        subjectIds: selectedSubjectIds,
        languages: toList(languages),
        certificates: toList(certificates),
        experience: toList(experience),
      });
      setProfile(updated);
      setSaved(true);
    } catch (error: any) {
      const details = error?.response?.data?.details;
      if (Array.isArray(details)) {
        setErrorMessages(details.map((d: { message: string }) => d.message));
      } else {
        setErrorMessages([error?.response?.data?.error || "Failed to update profile."]);
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <Card>
        <h1 className="font-serif text-2xl font-semibold text-ink">Edit tutor profile</h1>
        <p className="mt-1 text-sm text-muted">
          This is what students see when they browse tutors.
        </p>

        {saved && (
          <p className="mt-4 rounded-sm border border-border-subtle bg-surface-bg p-3 text-sm text-ink">
            Profile updated.
          </p>
        )}
        {errorMessages.length > 0 && (
          <div className="mt-4 rounded-sm border border-error/30 bg-error/5 p-3">
            {errorMessages.map((message) => (
              <p key={message} className="text-sm text-error">
                {message}
              </p>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <Input label="Headline" value={headline} onChange={(e) => setHeadline(e.target.value)} required />
          <div>
            <label className="mb-1 block text-sm font-medium text-ink">Bio</label>
            <textarea
              className="w-full rounded-sm border border-border-subtle bg-surface-card px-3.5 py-2.5 text-sm text-ink outline-none placeholder:text-muted focus:border-brand-primary"
              rows={4}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              required
            />
          </div>
          <Input label="Education" value={education} onChange={(e) => setEducation(e.target.value)} required />
          <Input
            label="Hourly rate (USD)"
            type="number"
            min="0"
            step="0.5"
            value={hourlyRate}
            onChange={(e) => setHourlyRate(e.target.value)}
            required
          />

          <div>
            <label className="mb-1 block text-sm font-medium text-ink">
              Subjects you can teach
            </label>
            <div className="flex flex-wrap gap-2">
              {allSubjects.map((subject) => {
                const isSelected = selectedSubjectIds.includes(subject.id);
                return (
                  <button
                    type="button"
                    key={subject.id}
                    onClick={() => toggleSubject(subject.id)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                      isSelected
                        ? "border-brand-primary bg-brand-primary/10 text-brand-primary"
                        : "border-border-subtle text-muted hover:text-ink"
                    }`}
                  >
                    {subject.name}
                  </button>
                );
              })}
            </div>
          </div>

          <Input label="Languages (comma-separated)" value={languages} onChange={(e) => setLanguages(e.target.value)} />
          <Input
            label="Certificates (comma-separated)"
            value={certificates}
            onChange={(e) => setCertificates(e.target.value)}
          />
          <Input label="Experience (comma-separated)" value={experience} onChange={(e) => setExperience(e.target.value)} />

          <Button type="submit" className="mt-2" disabled={isSaving}>
            {isSaving ? "Saving…" : "Save changes"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
