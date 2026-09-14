import React, { useEffect, useState } from "react";
import { Card, Input, Button } from "../components/ui";
import {
  getMyStudentProfile,
  updateMyStudentProfile,
} from "../api/studentProfileAPI";
import { getSubjects } from "../api/subjectAPI";
import type { Subject } from "../types";
import toast from "react-hot-toast";


export function StudentProfileEdit() {
  const [allSubjects, setAllSubjects] = useState<Subject[]>([]);
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const [educationLevel, setEducationLevel] = useState("");
  const [major, setMajor] = useState("");
  const [learningGoals, setLearningGoals] = useState("");
  // const [learningStyle, setLearningStyle] = useState("");
  // const [timezone, setTimezone] = useState("");
  const [preferredLanguage, setPreferredLanguage] = useState("");
  const [maxHourlyRate, setMaxHourlyRate] = useState("");

  const [errorMessages, setErrorMessages] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [ ,setSaved] = useState(false);

  useEffect(() => {
    Promise.all([getMyStudentProfile(), getSubjects().catch(() => [])])
      .then(([{ profile }, subjectCatalog]) => {
        setSelectedSubjectIds(profile.preferredSubjects ?? []);
        setAllSubjects(subjectCatalog);
        setEducationLevel(profile.educationLevel ?? "");
        setMajor(profile.major ?? "");
        setLearningGoals(profile.learningGoals ?? "");
        // setLearningStyle(profile.learningStyle ?? "");
        // setTimezone(profile.timezone ?? "");
        setPreferredLanguage(profile.preferredLanguage ?? "");
        setMaxHourlyRate(
          profile.maxHourlyRate != null ? String(profile.maxHourlyRate) : "",
        );
      })
      .catch(() => setErrorMessages(["Failed to load your profile."]))
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

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrorMessages([]);
    setSaved(false);
    setIsSaving(true);

    try {
      await updateMyStudentProfile({
        educationLevel: educationLevel || undefined,
        major: major || undefined,
        learningGoals: learningGoals || undefined,
        preferredSubjectIds: selectedSubjectIds,
        // learningStyle: learningStyle || undefined,
        // timezone: timezone || undefined,
        preferredLanguage: preferredLanguage || undefined,
        maxHourlyRate: maxHourlyRate ? Number(maxHourlyRate) : undefined,
      });
      setSaved(true);
      toast.success(`Student Profile updated successfully.`);
    } catch (error: any) {
      const details = error?.response?.data?.details;
      if (Array.isArray(details)) {
        setErrorMessages(details.map((d: { message: string }) => d.message));
      } else {
        setErrorMessages([
          error?.response?.data?.error || "Failed to update profile.",
        ]);
        toast.error("Something went wrong. Please try again.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      <Card>
        <h1 className="font-serif text-2xl font-semibold text-ink">
          Student Information
        </h1>
        <p className="mt-1 text-sm text-muted">
          Tell us about yourself so we can match you with the right tutors.
        </p>

        {/* {saved && (
          <p className="mt-4 rounded-sm border border-emerald-200 bg-emerald-50 p-3 text-sm font-medium text-emerald-800">
            {" "}
            Profile updated.
          </p>
        )} */}
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
            label="Education level"
            placeholder="e.g. Undergraduate, High School"
            value={educationLevel}
            onChange={(e) => setEducationLevel(e.target.value)}
          />
          <Input
            label="Major"
            placeholder="e.g. Computer Science"
            value={major}
            onChange={(e) => setMajor(e.target.value)}
          />
          <div>
            <label className="mb-1 block text-sm font-medium text-ink">
              Learning goals
            </label>
            <textarea
              className="w-full rounded-sm border border-border-subtle bg-surface-card px-3.5 py-2.5 text-sm text-ink outline-none placeholder:text-muted focus:border-brand-primary"
              rows={4}
              placeholder="What are you hoping to achieve?"
              value={learningGoals}
              onChange={(e) => setLearningGoals(e.target.value)}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-ink">
              Preferred subjects
            </label>
            {allSubjects.length === 0 ? (
              <p className="text-sm text-muted">Loading subjects…</p>
            ) : (
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
            )}
          </div>

          {/* <Input
            label="Learning style"
            placeholder="e.g. Visual, Exam Prep, Project-Based"
            value={learningStyle}
            onChange={(e) => setLearningStyle(e.target.value)}
          /> */}
          {/* <Input
            label="Timezone"
            placeholder="e.g. Asia/Beirut"
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
          /> */}
          <Input
            label="Preferred language"
            placeholder="e.g. English, Arabic"
            value={preferredLanguage}
            onChange={(e) => setPreferredLanguage(e.target.value)}
          />
          <Input
            label="Max hourly rate (USD, optional budget)"
            type="number"
            min="0"
            step="0.5"
            value={maxHourlyRate}
            onChange={(e) => setMaxHourlyRate(e.target.value)}
          />

          <Button type="submit" className="mt-2" disabled={isSaving}>
            {isSaving ? "Saving…" : "Save changes"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
