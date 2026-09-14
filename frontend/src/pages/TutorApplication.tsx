import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  FileText,
  GraduationCap,
  Sparkles,
  Tag,
  UploadCloud,
  User,
  X,
  XCircle,
} from "lucide-react";
import { Card, Input, Button } from "../components/ui";
import { useAuth } from "../context/AuthContext";
import { applyAsTutor } from "../api/tutorProfileAPI";
import { getSubjects } from "../api/subjectAPI";
import type { Subject } from "../types";

const toList = (value: string): string[] =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const statusCopy: Record<
  string,
  {
    title: string;
    body: string;
    tone: string;
    icon: React.ElementType;
    iconBg: string;
  }
> = {
  PENDING: {
    title: "Application under review",
    body: "Your tutor application has been submitted. An admin will review it shortly.",
    tone: "text-ink",
    icon: Clock3,
    iconBg: "bg-olive/10 text-olive",
  },
  APPROVED: {
    title: "You're an approved tutor",
    body: "Your application was approved. You can now offer sessions.",
    tone: "text-ink",
    icon: CheckCircle2,
    iconBg: "bg-brand-primary/10 text-brand-primary",
  },
  REJECTED: {
    title: "Application not approved",
    body: "Your application was not approved this time.",
    tone: "text-error",
    icon: XCircle,
    iconBg: "bg-error/10 text-error",
  },
};

export function TutorApplication() {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<string[]>([]);
  const [headline, setHeadline] = useState("");
  const [bio, setBio] = useState("");
  const [education, setEducation] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");
  const [languages, setLanguages] = useState("English");
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB limit

    const invalidFile = files.find((file) => file.size > MAX_SIZE_BYTES);
    if (invalidFile) {
      setErrorMessages([`File "${invalidFile.name}" exceeds the 10MB limit.`]);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setErrorMessages([]);
    setCertificateFiles(files);
  };

  const removeFile = (indexToRemove: number) => {
    setCertificateFiles((prev) =>
      prev.filter((_, idx) => idx !== indexToRemove),
    );
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  if (existing) {
    const copy = statusCopy[existing.verificationStatus] ?? statusCopy.PENDING;
    const StatusIcon = copy.icon;
    return (
      <div className="mx-auto max-w-2xl">
        <Card className="shadow-warm">
          <h1 className="font-serif text-2xl font-semibold text-ink">
            Become a tutor
          </h1>
          <div className="mt-4 flex items-start gap-3">
            <span
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-sm ${copy.iconBg}`}
            >
              <StatusIcon className="h-4.5 w-4.5" />
            </span>
            <div>
              <p className={`text-sm font-semibold ${copy.tone}`}>
                {copy.title}
              </p>
              <p className="mt-1 text-sm text-muted">{copy.body}</p>
              {existing.verificationStatus === "REJECTED" &&
                existing.rejectionReason && (
                  <p className="mt-3 rounded-sm border border-error/20 bg-error/5 p-3 text-sm text-muted">
                    <span className="font-medium text-ink">Reason: </span>
                    {existing.rejectionReason}
                  </p>
                )}
            </div>
          </div>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            {existing.verificationStatus === "APPROVED" && (
              <Button type="button" onClick={() => navigate("/tutor-profile")}>
                Edit profile
              </Button>
            )}
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate("/dashboard")}
            >
              Back to dashboard
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="mx-auto max-w-2xl">
        <Card className="shadow-warm">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm bg-brand-primary/10 text-brand-primary">
              <CheckCircle2 className="h-5 w-5" />
            </span>
            <div>
              <h1 className="font-serif text-2xl font-semibold text-ink">
                Application submitted
              </h1>
              <p className="mt-2 text-sm text-muted">
                Thanks. An admin will review your application.
              </p>
            </div>
          </div>
          <Button
            type="button"
            className="mt-6"
            onClick={() => navigate("/dashboard")}
          >
            Back to dashboard
          </Button>
        </Card>
      </div>
    );
  }

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

      data.append("subjectIds", JSON.stringify(selectedSubjectIds));
      data.append("languages", JSON.stringify(toList(languages)));
      data.append("experience", JSON.stringify(toList(experience)));

      certificateFiles.forEach((file) => {
        data.append("certificates", file);
      });

      await applyAsTutor(data);
      await refreshUser();
      setSubmitted(true);
    } catch (error: any) {
      const details = error?.response?.data?.details;
      if (Array.isArray(details)) {
        setErrorMessages(details.map((d: { message: string }) => d.message));
      } else {
        setErrorMessages([
          error?.response?.data?.error || "Failed to submit application.",
        ]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const selectedSubjectNames = subjects
    .filter((s) => selectedSubjectIds.includes(s.id))
    .map((s) => s.name);

  return (
    <div className="mx-auto max-w-7xl px-4">
      <div className="mb-6">
        <h1 className="font-serif text-2xl font-semibold text-ink">
          Become a tutor
        </h1>
        <p className="mt-1 text-sm text-muted">
          Tell us about what you can teach. Your application will be reviewed by
          an admin.
        </p>
      </div>

      {errorMessages.length > 0 && (
        <div className="mb-6 flex items-start gap-2 rounded-sm border border-error/30 bg-error/5 p-3">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-error" />
          <div>
            {errorMessages.map((message) => (
              <p key={message} className="text-sm text-error">
                {message}
              </p>
            ))}
          </div>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 gap-6 lg:grid-cols-[1.7fr_1fr]"
      >
        {/* Left: sectioned form, each section its own accent color */}
        <div className="flex flex-col gap-6">
          <Card className="shadow-warm">
            <div className="mb-4 flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-sm bg-brand-primary/10 text-brand-primary">
                <User className="h-4 w-4" />
              </span>
              <h2 className="font-serif text-lg font-semibold text-ink">
                About you
              </h2>
            </div>
            <div className="flex flex-col gap-4">
              <Input
                label="Headline"
                placeholder="e.g. CS Student & React Tutor"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                required
              />
              <div>
                <label className="mb-1 block text-sm font-medium text-ink">
                  Bio
                </label>
                <textarea
                  placeholder="Tell us more about yourself... "
                  className="w-full rounded-sm border border-border-subtle bg-surface-card px-3.5 py-2.5 text-sm text-ink outline-none placeholder:text-muted focus:border-brand-primary"
                  rows={4}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-ink">
                  Subjects you can teach
                </label>
                {subjects.length === 0 ? (
                  <p className="text-sm text-muted">Loading subjects…</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {subjects.map((subject) => {
                      const isSelected = selectedSubjectIds.includes(
                        subject.id,
                      );
                      return (
                        <button
                          type="button"
                          key={subject.id}
                          onClick={() => toggleSubject(subject.id)}
                          className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                            isSelected
                              ? "border-brand-primary bg-brand-primary/10 text-brand-primary"
                              : "border-border-subtle bg-surface-bg text-muted hover:text-ink"
                          }`}
                        >
                          {subject.name}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </Card>

          <Card className="shadow-warm">
            <div className="mb-4 flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-sm bg-olive/10 text-olive">
                <GraduationCap className="h-4 w-4" />
              </span>
              <h2 className="font-serif text-lg font-semibold text-ink">
                Credentials
              </h2>
            </div>
            <div className="flex flex-col gap-4">
              <Input
                label="Education"
                placeholder="e.g. 2nd Year CS Student at LU"
                value={education}
                onChange={(e) => setEducation(e.target.value)}
                required
              />
              <Input
                label="Languages (comma-separated)"
                placeholder="e.g. English, Arabic"
                value={languages}
                onChange={(e) => setLanguages(e.target.value)}
              />
              <Input
                label="Experience (comma-separated, optional)"
                placeholder="e.g. 2 Years C++ Lab Assisatnt"
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
              />
            </div>
          </Card>

          <Card className="shadow-warm">
            <div className="mb-4 flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-sm bg-slate-blue/10 text-slate-blue">
                  <FileText className="h-4 w-4" />
                </span>
                <h2 className="font-serif text-lg font-semibold text-ink">
                  Certificates / Projects
                </h2>
              </div>
              <p className="text-xs text-muted">
                Showcase your work and credentials to build trust with your peers.
              </p>
            </div>
            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-sm border border-dashed border-border-subtle bg-surface-bg px-4 py-4 text-xs font-medium text-muted transition hover:border-slate-blue hover:text-slate-blue">
              <UploadCloud className="h-4 w-4" />
              {certificateFiles.length > 0
                ? `${certificateFiles.length} file(s) selected`
                : "Click to upload certificates (PDF or images, max 10MB each)"}
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,image/png,image/jpeg"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>

            {certificateFiles.length > 0 && (
              <div className="mt-3 flex flex-col gap-2">
                {certificateFiles.map((file, idx) => (
                  <div
                    key={`${file.name}-${idx}`}
                    className="flex w-full items-center justify-between rounded-sm border border-border-subtle bg-surface-bg p-2.5 text-sm text-ink transition hover:border-slate-blue/40"
                  >
                    <div className="flex min-w-0 items-center gap-2 pr-2">
                      <FileText className="h-4 w-4 shrink-0 text-slate-blue" />
                      <span className="truncate text-xs font-medium sm:text-sm">
                        {file.name}
                      </span>
                      <span className="shrink-0 text-xs text-muted">
                        ({(file.size / (1024 * 1024)).toFixed(2)} MB)
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeFile(idx)}
                      title="Remove file"
                      className="shrink-0 rounded-sm p-1 text-muted transition hover:bg-error/10 hover:text-error"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card className="shadow-warm">
            <div className="mb-4 flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-sm bg-burgundy/10 text-burgundy">
                <Tag className="h-4 w-4" />
              </span>
              <h2 className="font-serif text-lg font-semibold text-ink">
                Pricing
              </h2>
            </div>
            <Input
              label="Hourly rate (USD)"
              placeholder="15"
              type="number"
              min="0"
              step="0.5"
              value={hourlyRate}
              onChange={(e) => setHourlyRate(e.target.value)}
              required
            />
          </Card>

          <Button type="submit" disabled={isLoading} className="self-end px-6">
            {isLoading ? "Submitting…" : "Submit application"}
          </Button>
        </div>

        {/* Right: live preview, built from existing state only */}
        <div className="flex flex-col gap-4">
          <Card className="shadow-warm">
            <p className="mb-3 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted">
              <Sparkles className="h-3.5 w-3.5 text-brand-primary" /> Preview
            </p>
            <div className="flex items-start gap-3">
              <span className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-sm bg-surface-bg">
                <span className="absolute inset-0 rounded-sm bg-brand-primary opacity-15" />
                <User className="relative h-5 w-5 text-brand-primary" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-ink">
                  {headline || "Your headline"}
                </p>
                <p className="truncate text-xs text-muted">
                  {education || "Your education"}
                </p>
              </div>
            </div>

            {selectedSubjectNames.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {selectedSubjectNames.slice(0, 4).map((name, i) => {
                  const palettes = [
                    "bg-brand-primary/10 text-brand-primary",
                    "bg-olive/10 text-olive",
                    "bg-slate-blue/10 text-slate-blue",
                    "bg-burgundy/10 text-burgundy",
                  ];
                  return (
                    <span
                      key={name}
                      className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${palettes[i % palettes.length]}`}
                    >
                      {name}
                    </span>
                  );
                })}
              </div>
            )}

            <p className="mt-3 line-clamp-3 text-xs leading-relaxed text-muted">
              {bio || "Your bio will appear here as you write it."}
            </p>

            <div className="mt-4 border-t border-border-subtle pt-3">
              <p className="text-lg font-semibold text-ink">
                ${hourlyRate || "0"}
                <span className="text-xs font-normal text-muted"> /hr</span>
              </p>
            </div>
          </Card>

          <Card className="border-olive/20 bg-olive/5 shadow-none">
            <p className="flex items-start gap-2 text-xs leading-relaxed text-ink">
              <Clock3 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-olive" />
              Applications are typically reviewed within a few days. You'll be
              notified once an admin makes a decision.
            </p>
          </Card>

          <Card className="border-slate-blue/20 bg-slate-blue/5 shadow-none">
            <p className="flex items-start gap-2 text-xs leading-relaxed text-ink">
              <GraduationCap className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-blue" />
              A clear headline and uploaded certificates make it easier for an
              admin to verify your application quickly.
            </p>
          </Card>
        </div>
      </form>
    </div>
  );
}

// import React, { useEffect, useState, useRef } from "react";
// import { useNavigate } from "react-router-dom";
// import { Card, Input, Button } from "../components/ui";
// import { useAuth } from "../context/AuthContext";
// import { applyAsTutor } from "../api/tutorProfileAPI";
// import { getSubjects } from "../api/subjectAPI";
// import type { Subject } from "../types";

// const toList = (value: string): string[] =>
//   value
//     .split(",")
//     .map((item) => item.trim())
//     .filter(Boolean);

// const statusCopy: Record<
//   string,
//   { title: string; body: string; tone: string }
// > = {
//   PENDING: {
//     title: "Application under review",
//     body: "Your tutor application has been submitted. An admin will review it shortly.",
//     tone: "text-ink",
//   },
//   APPROVED: {
//     title: "You're an approved tutor",
//     body: "Your application was approved. You can now offer sessions.",
//     tone: "text-ink",
//   },
//   REJECTED: {
//     title: "Application not approved",
//     body: "Your application was not approved this time.",
//     tone: "text-error",
//   },
// };

// export function TutorApplication() {
//   const navigate = useNavigate();
//   const { user, refreshUser } = useAuth();
//   const fileInputRef = useRef<HTMLInputElement>(null);

//   const [subjects, setSubjects] = useState<Subject[]>([]);
//   const [selectedSubjectIds, setSelectedSubjectIds] = useState<string[]>([]);
//   const [headline, setHeadline] = useState("");
//   const [bio, setBio] = useState("");
//   const [education, setEducation] = useState("");
//   const [hourlyRate, setHourlyRate] = useState("");
//   const [languages, setLanguages] = useState("English");
//   const [certificateFiles, setCertificateFiles] = useState<File[]>([]);
//   const [experience, setExperience] = useState("");

//   const [errorMessages, setErrorMessages] = useState<string[]>([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const [submitted, setSubmitted] = useState(false);

//   const existing = user?.tutorProfile;

//   useEffect(() => {
//     if (existing) return;
//     getSubjects()
//       .then(setSubjects)
//       .catch(() => setSubjects([]));
//   }, [existing]);

//   const toggleSubject = (id: string) => {
//     setSelectedSubjectIds((prev) =>
//       prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
//     );
//   };

//   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (!e.target.files) return;
//     const files = Array.from(e.target.files);
//     const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB limit

//     const invalidFile = files.find((file) => file.size > MAX_SIZE_BYTES);
//     if (invalidFile) {
//       setErrorMessages([`File "${invalidFile.name}" exceeds the 10MB limit.`]);
//       if (fileInputRef.current) fileInputRef.current.value = "";
//       return;
//     }

//     setErrorMessages([]);
//     setCertificateFiles(files);
//   };

//   const removeFile = (indexToRemove: number) => {
//     setCertificateFiles((prev) =>
//       prev.filter((_, idx) => idx !== indexToRemove),
//     );
//     if (fileInputRef.current) fileInputRef.current.value = "";
//   };

//   if (existing) {
//     const copy = statusCopy[existing.verificationStatus] ?? statusCopy.PENDING;
//     return (
//       <div>
//         <Card>
//           <h1 className="font-serif text-2xl font-semibold text-ink">
//             Become a tutor
//           </h1>
//           <p className={`mt-4 text-sm font-semibold ${copy.tone}`}>
//             {copy.title}
//           </p>
//           <p className="mt-1 text-sm text-muted">{copy.body}</p>
//           {existing.verificationStatus === "REJECTED" &&
//             existing.rejectionReason && (
//               <p className="mt-3 text-sm text-muted">
//                 <span className="font-medium text-ink">Reason: </span>
//                 {existing.rejectionReason}
//               </p>
//             )}
//           <div className="mt-6 flex flex-col gap-3 sm:flex-row">
//             {existing.verificationStatus === "APPROVED" && (
//               <Button type="button" onClick={() => navigate("/tutor-profile")}>
//                 Edit profile
//               </Button>
//             )}
//             <Button
//               type="button"
//               variant="secondary"
//               onClick={() => navigate("/dashboard")}
//             >
//               Back to dashboard
//             </Button>
//           </div>
//         </Card>
//       </div>
//     );
//   }

//   if (submitted) {
//     return (
//       <div>
//         <Card>
//           <h1 className="font-serif text-2xl font-semibold text-ink">
//             Application submitted
//           </h1>
//           <p className="mt-2 text-sm text-muted">
//             Thanks. An admin will review your application.
//           </p>
//           <Button
//             type="button"
//             className="mt-6"
//             onClick={() => navigate("/dashboard")}
//           >
//             Back to dashboard
//           </Button>
//         </Card>
//       </div>
//     );
//   }

//   const handleSubmit = async (event: React.FormEvent) => {
//     event.preventDefault();
//     setErrorMessages([]);

//     if (selectedSubjectIds.length === 0) {
//       setErrorMessages(["Select at least one subject you can teach."]);
//       return;
//     }

//     setIsLoading(true);
//     try {
//       const data = new FormData();
//       data.append("headline", headline);
//       data.append("bio", bio);
//       data.append("education", education);
//       data.append("hourlyRate", String(Number(hourlyRate) || 0));

//       data.append("subjectIds", JSON.stringify(selectedSubjectIds));
//       data.append("languages", JSON.stringify(toList(languages)));
//       data.append("experience", JSON.stringify(toList(experience)));

//       certificateFiles.forEach((file) => {
//         data.append("certificates", file);
//       });

//       await applyAsTutor(data);
//       await refreshUser();
//       setSubmitted(true);
//     } catch (error: any) {
//       const details = error?.response?.data?.details;
//       if (Array.isArray(details)) {
//         setErrorMessages(details.map((d: { message: string }) => d.message));
//       } else {
//         setErrorMessages([
//           error?.response?.data?.error || "Failed to submit application.",
//         ]);
//       }
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div>
//       <Card>
//         <h1 className="font-serif text-2xl font-semibold text-ink">
//           Become a tutor
//         </h1>
//         <p className="mt-1 text-sm text-muted">
//           Tell us about what you can teach. Your application will be reviewed by
//           an admin.
//         </p>

//         {errorMessages.length > 0 && (
//           <div className="mt-4 rounded-sm border border-error/30 bg-error/5 p-3">
//             {errorMessages.map((message) => (
//               <p key={message} className="text-sm text-error">
//                 {message}
//               </p>
//             ))}
//           </div>
//         )}

//         <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
//           <Input
//             label="Headline"
//             placeholder="e.g. MSc CS Student & MERN Tutor"
//             value={headline}
//             onChange={(e) => setHeadline(e.target.value)}
//             required
//           />
//           <div>
//             <label className="mb-1 block text-sm font-medium text-ink">
//               Bio
//             </label>
//             <textarea
//               className="w-full rounded-sm border border-border-subtle bg-surface-card px-3.5 py-2.5 text-sm text-ink outline-none placeholder:text-muted focus:border-brand-primary"
//               rows={4}
//               value={bio}
//               onChange={(e) => setBio(e.target.value)}
//               required
//             />
//           </div>
//           <Input
//             label="Education"
//             placeholder="e.g. BSc Computer Science"
//             value={education}
//             onChange={(e) => setEducation(e.target.value)}
//             required
//           />
//           <Input
//             label="Hourly rate (USD)"
//             type="number"
//             min="0"
//             step="0.5"
//             value={hourlyRate}
//             onChange={(e) => setHourlyRate(e.target.value)}
//             required
//           />

//           <div>
//             <label className="mb-1 block text-sm font-medium text-ink">
//               Subjects you can teach
//             </label>
//             {subjects.length === 0 ? (
//               <p className="text-sm text-muted">Loading subjects…</p>
//             ) : (
//               <div className="flex flex-wrap gap-2">
//                 {subjects.map((subject) => {
//                   const isSelected = selectedSubjectIds.includes(subject.id);
//                   return (
//                     <button
//                       type="button"
//                       key={subject.id}
//                       onClick={() => toggleSubject(subject.id)}
//                       className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
//                         isSelected
//                           ? "border-brand-primary bg-brand-primary/10 text-brand-primary"
//                           : "border-border-subtle text-muted hover:text-ink"
//                       }`}
//                     >
//                       {subject.name}
//                     </button>
//                   );
//                 })}
//               </div>
//             )}
//           </div>

//           <Input
//             label="Languages (comma-separated)"
//             value={languages}
//             onChange={(e) => setLanguages(e.target.value)}
//           />

//           <Input
//             label="Experience (comma-separated, optional)"
//             placeholder="e.g. 3 Years University TA"
//             value={experience}
//             onChange={(e) => setExperience(e.target.value)}
//           />

//           <div>
//             <label className="mb-1 block text-sm font-medium text-ink">
//               Certificates (PDF or Images, Max 10MB each)
//             </label>
//             <input
//               ref={fileInputRef}
//               type="file"
//               multiple
//               accept=".pdf,image/png,image/jpeg"
//               onChange={handleFileChange}
//               className="w-full text-sm text-muted file:mr-4 file:rounded-sm file:border-0 file:bg-brand-primary/10 file:px-4 file:py-2 file:text-xs file:font-semibold file:text-brand-primary hover:file:bg-brand-primary/20"
//             />

//             {certificateFiles.length > 0 && (
//               <div className="mt-3 flex flex-col gap-2">
//                 {certificateFiles.map((file, idx) => (
//                   <div
//                     key={`${file.name}-${idx}`}
//                     className="flex w-full items-center justify-between rounded-md border border-brand-primary/30 bg-brand-primary/5 p-3 text-sm text-ink transition hover:border-brand-primary/60"
//                   >
//                     <div className="flex items-center gap-2 min-w-0 pr-2">
//                       <span className="truncate font-medium text-xs sm:text-sm">
//                         {file.name}
//                       </span>
//                       <span className="shrink-0 text-xs text-muted">
//                         ({(file.size / (1024 * 1024)).toFixed(2)} MB)
//                       </span>
//                     </div>

//                     <button
//                       type="button"
//                       onClick={() => removeFile(idx)}
//                       title="Remove file"
//                       className="rounded p-1 text-red-600"
//                     >
//                       <svg
//                         xmlns="http://www.w3.org/2000/svg"
//                         fill="none"
//                         viewBox="0 0 24 24"
//                         strokeWidth={1.5}
//                         stroke="currentColor"
//                         className="h-5 w-5"
//                       >
//                         <path
//                           strokeLinecap="round"
//                           strokeLinejoin="round"
//                           d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
//                         />
//                       </svg>
//                     </button>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>

//           <Button type="submit" className="mt-2" disabled={isLoading}>
//             {isLoading ? "Submitting…" : "Submit application"}
//           </Button>
//         </form>
//       </Card>
//     </div>
//   );
// }

// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { Card, Input, Button } from "../components/ui";
// import { useAuth } from "../context/AuthContext";
// import { applyAsTutor } from "../api/tutorProfileAPI";
// import { getSubjects } from "../api/subjectAPI";
// import type { Subject } from "../types";

// // "React, TypeScript, PostgreSQL" -> ["React", "TypeScript", "PostgreSQL"]
// const toList = (value: string): string[] =>
//   value
//     .split(",")
//     .map((item) => item.trim())
//     .filter(Boolean);

// const statusCopy: Record<string, { title: string; body: string; tone: string }> = {
//   PENDING: {
//     title: "Application under review",
//     body: "Your tutor application has been submitted. An admin will review it shortly.",
//     tone: "text-ink",
//   },
//   APPROVED: {
//     title: "You're an approved tutor",
//     body: "Your application was approved. You can now offer sessions.",
//     tone: "text-ink",
//   },
//   REJECTED: {
//     title: "Application not approved",
//     body: "Your application was not approved this time.",
//     tone: "text-error",
//   },
// };

// export function TutorApplication() {
//   const navigate = useNavigate();
//   const { user, refreshUser } = useAuth();

//   const [subjects, setSubjects] = useState<Subject[]>([]);
//   const [selectedSubjectIds, setSelectedSubjectIds] = useState<string[]>([]);
//   const [headline, setHeadline] = useState("");
//   const [bio, setBio] = useState("");
//   const [education, setEducation] = useState("");
//   const [hourlyRate, setHourlyRate] = useState("");
//   const [languages, setLanguages] = useState("English");

//   // Changed certificates from string to File array for file selection
//   const [certificateFiles, setCertificateFiles] = useState<File[]>([]);

//   const [experience, setExperience] = useState("");

//   const [errorMessages, setErrorMessages] = useState<string[]>([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const [submitted, setSubmitted] = useState(false);

//   const existing = user?.tutorProfile;

//   useEffect(() => {
//     if (existing) return;
//     getSubjects()
//       .then(setSubjects)
//       .catch(() => setSubjects([]));
//   }, [existing]);

//   const toggleSubject = (id: string) => {
//     setSelectedSubjectIds((prev) =>
//       prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
//     );
//   };

//   // Handle file selection with a 10MB individual limit check
//   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (!e.target.files) return;
//     const files = Array.from(e.target.files);
//     const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB limit

//     for (const file of files) {
//       if (file.size > MAX_SIZE_BYTES) {
//         setErrorMessages([`File "${file.name}" exceeds the 10MB limit.`]);
//         return;
//       }
//     }

//     setErrorMessages([]);
//     setCertificateFiles(files);
//   };

//   // 1. Already applied -> show status instead of the form
//   if (existing) {
//     const copy = statusCopy[existing.verificationStatus] ?? statusCopy.PENDING;
//     return (
//       <div >
//         <Card>
//           <h1 className="font-serif text-2xl font-semibold text-ink">Become a tutor</h1>
//           <p className={`mt-4 text-sm font-semibold ${copy.tone}`}>{copy.title}</p>
//           <p className="mt-1 text-sm text-muted">{copy.body}</p>
//           {existing.verificationStatus === "REJECTED" && existing.rejectionReason && (
//             <p className="mt-3 text-sm text-muted">
//               <span className="font-medium text-ink">Reason: </span>
//               {existing.rejectionReason}
//             </p>
//           )}
//           <div className="mt-6 flex flex-col gap-3 sm:flex-row">
//             {existing.verificationStatus === "APPROVED" && (
//               <Button type="button" onClick={() => navigate("/tutor-profile")}>
//                 Edit profile
//               </Button>
//             )}
//             <Button type="button" variant="secondary" onClick={() => navigate("/dashboard")}>
//               Back to dashboard
//             </Button>
//           </div>
//         </Card>
//       </div>
//     );
//   }

//   // 2. Just submitted in this session
//   if (submitted) {
//     return (
//       <div >
//         <Card>
//           <h1 className="font-serif text-2xl font-semibold text-ink">Application submitted</h1>
//           <p className="mt-2 text-sm text-muted">
//             Thanks. An admin will review your application.
//           </p>
//           <Button type="button" className="mt-6" onClick={() => navigate("/dashboard")}>
//             Back to dashboard
//           </Button>
//         </Card>
//       </div>
//     );
//   }

//   // 3. The application form using FormData
//   const handleSubmit = async (event: React.FormEvent) => {
//     event.preventDefault();
//     setErrorMessages([]);

//     if (selectedSubjectIds.length === 0) {
//       setErrorMessages(["Select at least one subject you can teach."]);
//       return;
//     }

//     setIsLoading(true);
//     try {
//       const data = new FormData();
//       data.append("headline", headline);
//       data.append("bio", bio);
//       data.append("education", education);
//       data.append("hourlyRate", String(Number(hourlyRate) || 0));

//       // Append array fields as JSON strings so backend can parse them easily
//       data.append("subjectIds", JSON.stringify(selectedSubjectIds));
//       data.append("languages", JSON.stringify(toList(languages)));
//       data.append("experience", JSON.stringify(toList(experience)));

//       // Append each certificate file under the 'certificates' field name
//       certificateFiles.forEach((file) => {
//         data.append("certificates", file);
//       });

//       // Pass the FormData object to your API client function
//       await applyAsTutor(data);

//       await refreshUser();
//       setSubmitted(true);
//     } catch (error: any) {
//       const details = error?.response?.data?.details;
//       if (Array.isArray(details)) {
//         setErrorMessages(details.map((d: { message: string }) => d.message));
//       } else {
//         setErrorMessages([error?.response?.data?.error || "Failed to submit application."]);
//       }
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div>
//       <Card>
//         <h1 className="font-serif text-2xl font-semibold text-ink">Become a tutor</h1>
//         <p className="mt-1 text-sm text-muted">
//           Tell us about what you can teach. Your application will be reviewed by an admin.
//         </p>

//         {errorMessages.length > 0 && (
//           <div className="mt-4 rounded-sm border border-error/30 bg-error/5 p-3">
//             {errorMessages.map((message) => (
//               <p key={message} className="text-sm text-error">
//                 {message}
//               </p>
//             ))}
//           </div>
//         )}

//         <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
//           <Input
//             label="Headline"
//             placeholder="e.g. MSc CS Student & MERN Tutor"
//             value={headline}
//             onChange={(e) => setHeadline(e.target.value)}
//             required
//           />
//           <div>
//             <label className="mb-1 block text-sm font-medium text-ink">Bio</label>
//             <textarea
//               className="w-full rounded-sm border border-border-subtle bg-surface-card px-3.5 py-2.5 text-sm text-ink outline-none placeholder:text-muted focus:border-brand-primary"
//               rows={4}
//               value={bio}
//               onChange={(e) => setBio(e.target.value)}
//               required
//             />
//           </div>
//           <Input
//             label="Education"
//             placeholder="e.g. BSc Computer Science, AUB"
//             value={education}
//             onChange={(e) => setEducation(e.target.value)}
//             required
//           />
//           <Input
//             label="Hourly rate (USD)"
//             type="number"
//             min="0"
//             step="0.5"
//             value={hourlyRate}
//             onChange={(e) => setHourlyRate(e.target.value)}
//             required
//           />

//           <div>
//             <label className="mb-1 block text-sm font-medium text-ink">
//               Subjects you can teach
//             </label>
//             {subjects.length === 0 ? (
//               <p className="text-sm text-muted">Loading subjects…</p>
//             ) : (
//               <div className="flex flex-wrap gap-2">
//                 {subjects.map((subject) => {
//                   const isSelected = selectedSubjectIds.includes(subject.id);
//                   return (
//                     <button
//                       type="button"
//                       key={subject.id}
//                       onClick={() => toggleSubject(subject.id)}
//                       className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
//                         isSelected
//                           ? "border-brand-primary bg-brand-primary/10 text-brand-primary"
//                           : "border-border-subtle text-muted hover:text-ink"
//                       }`}
//                     >
//                       {subject.name}
//                     </button>
//                   );
//                 })}
//               </div>
//             )}
//           </div>

//           <Input
//             label="Languages (comma-separated)"
//             value={languages}
//             onChange={(e) => setLanguages(e.target.value)}
//           />

//           {/* Certificate File Picker Input */}
//           <div>
//             <label className="mb-1 block text-sm font-medium text-ink">
//               Certificates (PDF or Images, Max 10MB each)
//             </label>
//             <input
//               type="file"
//               multiple
//               accept=".pdf,image/png,image/jpeg"
//               onChange={handleFileChange}
//               className="w-full text-sm text-muted file:mr-4 file:rounded-sm file:border-0 file:bg-brand-primary/10 file:px-4 file:py-2 file:text-xs file:font-semibold file:text-brand-primary hover:file:bg-brand-primary/20"
//             />
//             {certificateFiles.length > 0 && (
//               <p className="mt-1 text-xs text-muted">
//                 {certificateFiles.length} file(s) selected
//               </p>
//             )}
//           </div>

//           <Input
//             label="Experience (comma-separated, optional)"
//             placeholder="e.g. 3 Years University TA"
//             value={experience}
//             onChange={(e) => setExperience(e.target.value)}
//           />

//           <Button type="submit" className="mt-2" disabled={isLoading}>
//             {isLoading ? "Submitting…" : "Submit application"}
//           </Button>
//         </form>
//       </Card>
//     </div>
//   );
// }
