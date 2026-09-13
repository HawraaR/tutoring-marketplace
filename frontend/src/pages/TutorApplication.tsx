import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Input, Button } from "../components/ui";
import { useAuth } from "../context/AuthContext";
import { applyAsTutor } from "../api/tutorProfileAPI";
import { getSubjects } from "../api/subjectAPI";
import type { Subject } from "../types";

// "React, TypeScript, PostgreSQL" -> ["React", "TypeScript", "PostgreSQL"]
const toList = (value: string): string[] =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const statusCopy: Record<string, { title: string; body: string; tone: string }> = {
  PENDING: {
    title: "Application under review",
    body: "Your tutor application has been submitted. An admin will review it shortly.",
    tone: "text-ink",
  },
  APPROVED: {
    title: "You're an approved tutor",
    body: "Your application was approved. You can now offer sessions.",
    tone: "text-ink",
  },
  REJECTED: {
    title: "Application not approved",
    body: "Your application was not approved this time.",
    tone: "text-error",
  },
};

export function TutorApplication() {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<string[]>([]);
  const [headline, setHeadline] = useState("");
  const [bio, setBio] = useState("");
  const [education, setEducation] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");
  const [languages, setLanguages] = useState("English");
  
  // Changed certificates from string to File array for file selection
  const [certificateFiles, setCertificateFiles] = useState<File[]>([]);
  
  const [experience, setExperience] = useState("");

  const [errorMessages, setErrorMessages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const existing = user?.tutorProfile;

  useEffect(() => {
    if (existing) return;
    getSubjects()
      .then(setSubjects)
      .catch(() => setSubjects([]));
  }, [existing]);

  const toggleSubject = (id: string) => {
    setSelectedSubjectIds((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    );
  };

  // Handle file selection with a 10MB individual limit check
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB limit

    for (const file of files) {
      if (file.size > MAX_SIZE_BYTES) {
        setErrorMessages([`File "${file.name}" exceeds the 10MB limit.`]);
        return;
      }
    }

    setErrorMessages([]);
    setCertificateFiles(files);
  };

  // 1. Already applied -> show status instead of the form
  if (existing) {
    const copy = statusCopy[existing.verificationStatus] ?? statusCopy.PENDING;
    return (
      <div className="mx-auto max-w-2xl">
        <Card>
          <h1 className="font-serif text-2xl font-semibold text-ink">Become a tutor</h1>
          <p className={`mt-4 text-sm font-semibold ${copy.tone}`}>{copy.title}</p>
          <p className="mt-1 text-sm text-muted">{copy.body}</p>
          {existing.verificationStatus === "REJECTED" && existing.rejectionReason && (
            <p className="mt-3 text-sm text-muted">
              <span className="font-medium text-ink">Reason: </span>
              {existing.rejectionReason}
            </p>
          )}
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            {existing.verificationStatus === "APPROVED" && (
              <Button type="button" onClick={() => navigate("/tutor-profile")}>
                Edit profile
              </Button>
            )}
            <Button type="button" variant="secondary" onClick={() => navigate("/dashboard")}>
              Back to dashboard
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // 2. Just submitted in this session
  if (submitted) {
    return (
      <div className="mx-auto max-w-2xl">
        <Card>
          <h1 className="font-serif text-2xl font-semibold text-ink">Application submitted</h1>
          <p className="mt-2 text-sm text-muted">
            Thanks. An admin will review your application.
          </p>
          <Button type="button" className="mt-6" onClick={() => navigate("/dashboard")}>
            Back to dashboard
          </Button>
        </Card>
      </div>
    );
  }

  // 3. The application form using FormData
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrorMessages([]);

    if (selectedSubjectIds.length === 0) {
      setErrorMessages(["Select at least one subject you can teach."]);
      return;
    }

    setIsLoading(true);
    try {
      const data = new FormData();
      data.append("headline", headline);
      data.append("bio", bio);
      data.append("education", education);
      data.append("hourlyRate", String(Number(hourlyRate) || 0));
      
      // Append array fields as JSON strings so backend can parse them easily
      data.append("subjectIds", JSON.stringify(selectedSubjectIds));
      data.append("languages", JSON.stringify(toList(languages)));
      data.append("experience", JSON.stringify(toList(experience)));

      // Append each certificate file under the 'certificates' field name
      certificateFiles.forEach((file) => {
        data.append("certificates", file);
      });

      // Pass the FormData object to your API client function
      await applyAsTutor(data);
      
      await refreshUser();
      setSubmitted(true);
    } catch (error: any) {
      const details = error?.response?.data?.details;
      if (Array.isArray(details)) {
        setErrorMessages(details.map((d: { message: string }) => d.message));
      } else {
        setErrorMessages([error?.response?.data?.error || "Failed to submit application."]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <Card>
        <h1 className="font-serif text-2xl font-semibold text-ink">Become a tutor</h1>
        <p className="mt-1 text-sm text-muted">
          Tell us about what you can teach. Your application will be reviewed by an admin.
        </p>

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
          <Input
            label="Headline"
            placeholder="e.g. MSc CS Student & MERN Tutor"
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            required
          />
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
          <Input
            label="Education"
            placeholder="e.g. BSc Computer Science, AUB"
            value={education}
            onChange={(e) => setEducation(e.target.value)}
            required
          />
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
            {subjects.length === 0 ? (
              <p className="text-sm text-muted">Loading subjects…</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {subjects.map((subject) => {
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
            )}
          </div>

          <Input
            label="Languages (comma-separated)"
            value={languages}
            onChange={(e) => setLanguages(e.target.value)}
          />

          {/* Certificate File Picker Input */}
          <div>
            <label className="mb-1 block text-sm font-medium text-ink">
              Certificates (PDF or Images, Max 10MB each)
            </label>
            <input
              type="file"
              multiple
              accept=".pdf,image/png,image/jpeg"
              onChange={handleFileChange}
              className="w-full text-sm text-muted file:mr-4 file:rounded-sm file:border-0 file:bg-brand-primary/10 file:px-4 file:py-2 file:text-xs file:font-semibold file:text-brand-primary hover:file:bg-brand-primary/20"
            />
            {certificateFiles.length > 0 && (
              <p className="mt-1 text-xs text-muted">
                {certificateFiles.length} file(s) selected
              </p>
            )}
          </div>

          <Input
            label="Experience (comma-separated, optional)"
            placeholder="e.g. 3 Years University TA"
            value={experience}
            onChange={(e) => setExperience(e.target.value)}
          />

          <Button type="submit" className="mt-2" disabled={isLoading}>
            {isLoading ? "Submitting…" : "Submit application"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
