// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import {
//   AlertCircle,
//   CheckCircle2,
//   FileText,
//   GraduationCap,
//   ShieldCheck,
//   Star,
//   Tag,
//   UploadCloud,
//   User,
// } from "lucide-react";
// import { Card, Input, Button } from "../components/ui";
// import { getMyTutorProfile, updateMyTutorProfile } from "../api/tutorProfileAPI";
// import { getSubjects } from "../api/subjectAPI";
// import type { Subject, TutorProfile } from "../types";

// const toList = (value: string): string[] =>
//   value
//     .split(",")
//     .map((item) => item.trim())
//     .filter(Boolean);

// const statusCopy: Record<string, { title: string; body: string; tone: string }> = {
//   PENDING: {
//     title: "Application under review",
//     body: "Your tutor application is still being reviewed. You'll be able to edit your profile once it's approved.",
//     tone: "text-ink",
//   },
//   REJECTED: {
//     title: "Application not approved",
//     body: "Your application was not approved, so there's no profile to edit.",
//     tone: "text-error",
//   },
// };

// export function TutorProfileEdit() {
//   const navigate = useNavigate();

//   const [profile, setProfile] = useState<TutorProfile | null>(null);
//   const [allSubjects, setAllSubjects] = useState<Subject[]>([]);
//   const [selectedSubjectIds, setSelectedSubjectIds] = useState<string[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [notFound, setNotFound] = useState(false);

//   const [headline, setHeadline] = useState("");
//   const [bio, setBio] = useState("");
//   const [education, setEducation] = useState("");
//   const [hourlyRate, setHourlyRate] = useState("");
//   const [languages, setLanguages] = useState("");

//   // Track existing certificates and new file uploads
//   const [existingCertificates, setExistingCertificates] = useState<string[]>([]);
//   const [certificateFiles, setCertificateFiles] = useState<File[]>([]);

//   const [experience, setExperience] = useState("");

//   const [errorMessages, setErrorMessages] = useState<string[]>([]);
//   const [isSaving, setIsSaving] = useState(false);
//   const [saved, setSaved] = useState(false);

//   useEffect(() => {
//     Promise.all([getMyTutorProfile(), getSubjects().catch(() => [])])
//       .then(([{ profile, subjects }, subjectCatalog]) => {
//         setProfile(profile);
//         setSelectedSubjectIds(subjects.map((s) => s.id));
//         setAllSubjects(subjectCatalog);
//         setHeadline(profile.headline ?? "");
//         setBio(profile.bio ?? "");
//         setEducation(profile.education ?? "");
//         setHourlyRate(String(profile.hourlyRate ?? 0));
//         setLanguages((profile.languages ?? []).join(", "));
//         setExistingCertificates(profile.certificates ?? []);
//         setExperience((profile.experience ?? []).join(", "));
//       })
//       .catch((error) => {
//         if (error?.response?.status === 404) {
//           setNotFound(true);
//         }
//       })
//       .finally(() => setLoading(false));
//   }, []);

//   const toggleSubject = (id: string) => {
//     setSelectedSubjectIds((prev) =>
//       prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
//     );
//   };

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

//   if (loading) {
//     return (
//       <div className="mx-auto max-w-2xl">
//         <Card>
//           <p className="text-sm text-muted">Loading your profile…</p>
//         </Card>
//       </div>
//     );
//   }

//   if (notFound) {
//     return (
//       <div className="mx-auto max-w-2xl">
//         <Card>
//           <h1 className="font-serif text-2xl font-semibold text-ink">Tutor profile</h1>
//           <p className="mt-2 text-sm text-muted">
//             You haven't applied to become a tutor yet.
//           </p>
//           <Button type="button" className="mt-6" onClick={() => navigate("/become-a-tutor")}>
//             Become a tutor
//           </Button>
//         </Card>
//       </div>
//     );
//   }

//   if (profile && profile.verificationStatus !== "APPROVED") {
//     const copy = statusCopy[profile.verificationStatus] ?? statusCopy.PENDING;
//     return (
//       <div className="mx-auto max-w-2xl">
//         <Card>
//           <h1 className="font-serif text-2xl font-semibold text-ink">Tutor profile</h1>
//           <p className={`mt-4 text-sm font-semibold ${copy.tone}`}>{copy.title}</p>
//           <p className="mt-1 text-sm text-muted">{copy.body}</p>
//           {profile.verificationStatus === "REJECTED" && profile.rejectionReason && (
//             <p className="mt-3 text-sm text-muted">
//               <span className="font-medium text-ink">Reason: </span>
//               {profile.rejectionReason}
//             </p>
//           )}
//           <Button type="button" variant="secondary" className="mt-6" onClick={() => navigate("/dashboard")}>
//             Back to dashboard
//           </Button>
//         </Card>
//       </div>
//     );
//   }

//   const handleSubmit = async (event: React.FormEvent) => {
//     event.preventDefault();
//     setErrorMessages([]);
//     setSaved(false);

//     if (selectedSubjectIds.length === 0) {
//       setErrorMessages(["Select at least one subject you can teach."]);
//       return;
//     }

//     setIsSaving(true);
//     try {
//       const data = new FormData();
//       data.append("headline", headline);
//       data.append("bio", bio);
//       data.append("education", education);
//       data.append("hourlyRate", String(Number(hourlyRate) || 0));
//       data.append("subjectIds", JSON.stringify(selectedSubjectIds));
//       data.append("languages", JSON.stringify(toList(languages)));
//       data.append("experience", JSON.stringify(toList(experience)));

//       // Pass existing certificate URLs so the backend knows to keep them
//       existingCertificates.forEach((url) => {
//         data.append("existingCertificates", url);
//       });

//       // Append newly selected files
//       certificateFiles.forEach((file) => {
//         data.append("certificates", file);
//       });

//       const { profile: updated } = await updateMyTutorProfile(data);
//       setProfile(updated);
//       setExistingCertificates(updated.certificates ?? []);
//       setCertificateFiles([]);
//       setSaved(true);
//     } catch (error: any) {
//       const details = error?.response?.data?.details;
//       if (Array.isArray(details)) {
//         setErrorMessages(details.map((d: { message: string }) => d.message));
//       } else {
//         setErrorMessages([error?.response?.data?.error || "Failed to update profile."]);
//       }
//     } finally {
//       setIsSaving(false);
//     }
//   };

//   const selectedSubjectNames = allSubjects
//     .filter((s) => selectedSubjectIds.includes(s.id))
//     .map((s) => s.name);

//   return (
//     <div className="mx-auto max-w-6xl">
//       <div className="mb-6">
//         <h1 className="font-serif text-2xl font-semibold text-ink">Edit tutor profile</h1>
//         <p className="mt-1 text-sm text-muted">
//           This is what students see when they browse tutors.
//         </p>
//       </div>

//       {saved && (
//         <div className="mb-6 flex items-start gap-2 rounded-sm border border-brand-primary/20 bg-brand-primary/5 p-3">
//           <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-primary" />
//           <p className="text-sm font-medium text-ink">Profile updated.</p>
//         </div>
//       )}
//       {errorMessages.length > 0 && (
//         <div className="mb-6 flex items-start gap-2 rounded-sm border border-error/30 bg-error/5 p-3">
//           <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-error" />
//           <div>
//             {errorMessages.map((message) => (
//               <p key={message} className="text-sm text-error">
//                 {message}
//               </p>
//             ))}
//           </div>
//         </div>
//       )}

//       <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 lg:grid-cols-[1.6fr_1fr]">
//         {/* Left: sectioned form */}
//         <div className="flex flex-col gap-6">
//           <Card className="shadow-warm">
//             <div className="mb-4 flex items-center gap-2">
//               <span className="flex h-8 w-8 items-center justify-center rounded-sm bg-brand-primary/10 text-brand-primary">
//                 <User className="h-4 w-4" />
//               </span>
//               <h2 className="font-serif text-lg font-semibold text-ink">Public profile</h2>
//             </div>
//             <div className="flex flex-col gap-4">
//               <Input label="Headline" value={headline} onChange={(e) => setHeadline(e.target.value)} required />
//               <div>
//                 <label className="mb-1 block text-sm font-medium text-ink">Bio</label>
//                 <textarea
//                   className="w-full rounded-sm border border-border-subtle bg-surface-card px-3.5 py-2.5 text-sm text-ink outline-none placeholder:text-muted focus:border-brand-primary"
//                   rows={4}
//                   value={bio}
//                   onChange={(e) => setBio(e.target.value)}
//                   required
//                 />
//               </div>
//               <div>
//                 <label className="mb-1 block text-sm font-medium text-ink">
//                   Subjects you can teach
//                 </label>
//                 <div className="flex flex-wrap gap-2">
//                   {allSubjects.map((subject) => {
//                     const isSelected = selectedSubjectIds.includes(subject.id);
//                     return (
//                       <button
//                         type="button"
//                         key={subject.id}
//                         onClick={() => toggleSubject(subject.id)}
//                         className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
//                           isSelected
//                             ? "border-brand-primary bg-brand-primary/10 text-brand-primary"
//                             : "border-border-subtle bg-surface-bg text-muted hover:text-ink"
//                         }`}
//                       >
//                         {subject.name}
//                       </button>
//                     );
//                   })}
//                 </div>
//               </div>
//             </div>
//           </Card>

//           <Card className="shadow-warm">
//             <div className="mb-4 flex items-center gap-2">
//               <span className="flex h-8 w-8 items-center justify-center rounded-sm bg-brand-primary/10 text-brand-primary">
//                 <GraduationCap className="h-4 w-4" />
//               </span>
//               <h2 className="font-serif text-lg font-semibold text-ink">Credentials</h2>
//             </div>
//             <div className="flex flex-col gap-4">
//               <Input label="Education" value={education} onChange={(e) => setEducation(e.target.value)} required />
//               <Input
//                 label="Languages (comma-separated)"
//                 value={languages}
//                 onChange={(e) => setLanguages(e.target.value)}
//               />
//               <Input
//                 label="Experience (comma-separated)"
//                 value={experience}
//                 onChange={(e) => setExperience(e.target.value)}
//               />

//               <div>
//                 <label className="mb-1 block text-sm font-medium text-ink">
//                   Certificates (PDF or images, max 10MB each)
//                 </label>
//                 {existingCertificates.length > 0 && (
//                   <div className="mb-3 flex flex-wrap gap-2">
//                     {existingCertificates.map((url, idx) => (
//                       <a
//                         key={url}
//                         href={url}
//                         target="_blank"
//                         rel="noreferrer"
//                         className="inline-flex items-center gap-1.5 rounded-sm border border-border-subtle bg-surface-bg px-3 py-1.5 text-xs font-medium text-ink transition hover:bg-brand-primary/10 hover:text-brand-primary"
//                       >
//                         <FileText className="h-3.5 w-3.5" /> Certificate #{idx + 1}
//                       </a>
//                     ))}
//                   </div>
//                 )}
//                 <label className="flex cursor-pointer items-center justify-center gap-2 rounded-sm border border-dashed border-border-subtle bg-surface-bg px-4 py-4 text-xs font-medium text-muted transition hover:border-brand-primary hover:text-brand-primary">
//                   <UploadCloud className="h-4 w-4" />
//                   {certificateFiles.length > 0
//                     ? `${certificateFiles.length} new file(s) selected`
//                     : "Click to upload certificates"}
//                   <input
//                     type="file"
//                     multiple
//                     accept=".pdf,image/png,image/jpeg"
//                     onChange={handleFileChange}
//                     className="hidden"
//                   />
//                 </label>
//               </div>
//             </div>
//           </Card>

//           <Card className="shadow-warm">
//             <div className="mb-4 flex items-center gap-2">
//               <span className="flex h-8 w-8 items-center justify-center rounded-sm bg-brand-primary/10 text-brand-primary">
//                 <Tag className="h-4 w-4" />
//               </span>
//               <h2 className="font-serif text-lg font-semibold text-ink">Pricing</h2>
//             </div>
//             <Input
//               label="Hourly rate (USD)"
//               type="number"
//               min="0"
//               step="0.5"
//               value={hourlyRate}
//               onChange={(e) => setHourlyRate(e.target.value)}
//               required
//             />
//           </Card>

//           <Button type="submit" disabled={isSaving} className="self-end px-6">
//             {isSaving ? "Saving…" : "Save changes"}
//           </Button>
//         </div>

//         {/* Right: live preview, built from existing state only */}
//         <div className="flex flex-col gap-4">
//           <Card className="shadow-warm">
//             <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted">
//               Live preview
//             </p>
//             <div className="flex items-start gap-3">
//               <span className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-sm bg-surface-bg text-sm font-semibold text-ink">
//                 <span className="absolute inset-0 rounded-sm bg-brand-primary opacity-15" />
//                 <ShieldCheck className="relative h-5 w-5 text-brand-primary" />
//               </span>
//               <div className="min-w-0">
//                 <p className="truncate text-sm font-semibold text-ink">
//                   {headline || "Your headline"}
//                 </p>
//                 <p className="truncate text-xs text-muted">{education || "Your education"}</p>
//                 <p className="mt-0.5 flex items-center gap-1 text-xs text-muted">
//                   <Star className="h-3 w-3 fill-current" /> New tutor
//                 </p>
//               </div>
//             </div>

//             {selectedSubjectNames.length > 0 && (
//               <div className="mt-3 flex flex-wrap gap-1.5">
//                 {selectedSubjectNames.slice(0, 4).map((name) => (
//                   <span
//                     key={name}
//                     className="rounded-full bg-brand-primary/10 px-2 py-0.5 text-[10px] font-medium text-brand-primary"
//                   >
//                     {name}
//                   </span>
//                 ))}
//               </div>
//             )}

//             <p className="mt-3 line-clamp-3 text-xs leading-relaxed text-muted">
//               {bio || "Your bio will appear here as you write it."}
//             </p>

//             <div className="mt-4 border-t border-border-subtle pt-3">
//               <p className="text-lg font-semibold text-ink">
//                 ${hourlyRate || "0"}
//                 <span className="text-xs font-normal text-muted"> /hr</span>
//               </p>
//             </div>
//           </Card>

//           <Card className="border-brand-primary/20 bg-brand-primary/5 shadow-none">
//             <p className="text-xs leading-relaxed text-ink">
//               Detailed bios and specific subjects help students find and trust you faster.
//             </p>
//           </Card>
//         </div>
//       </form>
//     </div>
//   );
// }


//----------------------------------------------------




import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Input, Button } from "../components/ui";
import { getMyTutorProfile, updateMyTutorProfile } from "../api/tutorProfileAPI";
import { getSubjects } from "../api/subjectAPI";
import type { Subject, TutorProfile } from "../types";
import { toast } from "react-hot-toast";

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
  
  // Track existing certificates and new file uploads
  const [existingCertificates, setExistingCertificates] = useState<string[]>([]);
  const [certificateFiles, setCertificateFiles] = useState<File[]>([]);
  
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
        setExistingCertificates(profile.certificates ?? []);
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
      const data = new FormData();
      data.append("headline", headline);
      data.append("bio", bio);
      data.append("education", education);
      data.append("hourlyRate", String(Number(hourlyRate) || 0));
      data.append("subjectIds", JSON.stringify(selectedSubjectIds));
      data.append("languages", JSON.stringify(toList(languages)));
      data.append("experience", JSON.stringify(toList(experience)));

      // Pass existing certificate URLs so the backend knows to keep them
      existingCertificates.forEach((url) => {
        data.append("existingCertificates", url);
      });

      // Append newly selected files
      certificateFiles.forEach((file) => {
        data.append("certificates", file);
      });

      const { profile: updated } = await updateMyTutorProfile(data);
      toast.success("Profile updated successfully!");
      setProfile(updated);
      setExistingCertificates(updated.certificates ?? []);
      setCertificateFiles([]);
      setSaved(true);
    } catch (error: any) {
      const details = error?.response?.data?.details;
      if (Array.isArray(details)) {
        setErrorMessages(details.map((d: { message: string }) => d.message));
      } else {
        setErrorMessages([error?.response?.data?.error || "Failed to update profile."]);
      }
      toast.error("Failed to update profile.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      <Card>
        <h1 className="font-serif text-2xl font-semibold text-ink">Tutor Information</h1>
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

          {/* Certificate File Picker & Existing Viewer */}
          <div>
            <label className="mb-1 block text-sm font-medium text-ink">
              Certificates (PDF or Images, Max 10MB each)
            </label>
            {existingCertificates.length > 0 && (
              <div className="mb-2 flex flex-col gap-1 text-xs text-muted">
                <span>Current certificates:</span>
                <ul className="list-disc pl-4">
                  {existingCertificates.map((url, idx) => (
                    <li key={url}>
                      <a href={url} target="_blank" rel="noreferrer" className="text-brand-primary underline">
                        Certificate #{idx + 1}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <input
              type="file"
              multiple
              accept=".pdf,image/png,image/jpeg"
              onChange={handleFileChange}
              className="w-full text-sm text-muted file:mr-4 file:rounded-sm file:border-0 file:bg-brand-primary/10 file:px-4 file:py-2 file:text-xs file:font-semibold file:text-brand-primary hover:file:bg-brand-primary/20"
            />
            {certificateFiles.length > 0 && (
              <p className="mt-1 text-xs text-muted">
                {certificateFiles.length} new file(s) selected for upload
              </p>
            )}
          </div>

          <Input label="Experience (comma-separated)" value={experience} onChange={(e) => setExperience(e.target.value)} />

          <Button type="submit" className="mt-2" disabled={isSaving}>
            {isSaving ? "Saving…" : "Save changes"}
          </Button>
        </form>
      </Card>
    </div>
  );
}