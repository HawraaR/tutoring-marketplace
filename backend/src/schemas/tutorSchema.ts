import { z } from "zod";

// Full application — every field required (arrays may be omitted where a default exists)
// export const tutorApplicationSchema = z.object({
//   headline: z.string().trim().min(1, "Headline is required"),
//   bio: z.string().trim().min(1, "Bio is required"),
//   education: z.string().trim().min(1, "Education is required"),
//   hourlyRate: z.coerce.number().min(0, "Hourly rate must be 0 or more"),
//   subjectIds: z.array(z.string().trim().min(1)).min(1, "Select at least one subject"),
//   languages: z.array(z.string().trim().min(1)).default(["English"]),
//    certificates: z.array(z.string().trim().min(1)).default([]),
//   experience: z.array(z.string().trim().min(1)).default([]),
// });

export const tutorApplicationSchema = z.object({
  headline: z.string().trim().min(1, "Headline is required"),
  bio: z.string().trim().min(1, "Bio is required"),
  education: z.string().trim().min(1, "Education is required"),
  hourlyRate: z.coerce.number().min(0, "Hourly rate must be 0 or more"),
  meetingUrl: z.string().optional().nullable(),   // 👈 ADD THIS FIELD!
  // Accept either an array or a JSON string / comma-separated string
  subjectIds: z.preprocess((val) => {
    if (typeof val === "string") {
      try { return JSON.parse(val); } catch { return val.split(",").map(s => s.trim()); }
    }
    return val;
  }, z.array(z.string().trim().min(1)).min(1, "Select at least one subject")),

  languages: z.preprocess((val) => {
    if (typeof val === "string") {
      try { return JSON.parse(val); } catch { return val.split(",").map(s => s.trim()); }
    }
    return val;
  }, z.array(z.string().trim().min(1)).default(["English"])),

  // certificates: z.array(z.string()).default([]), // Populated by backend storage, not frontend form text

  experience: z.preprocess((val) => {
    if (typeof val === "string") {
      try { return JSON.parse(val); } catch { return val.split(",").map(s => s.trim()); }
    }
    return val;
  }, z.array(z.string().trim().min(1)).default([])),
});

// Profile update — same fields, all optional (PATCH: only send what changes)

export const tutorProfileUpdateSchema = z.object({
  headline: z.string().trim().min(1, "Headline is required"),
  bio: z.string().trim().min(1, "Bio is required"),
  education: z.string().trim().min(1, "Education is required"),
  hourlyRate: z.coerce.number().min(0, "Hourly rate must be 0 or more"),
    meetingUrl: z.string().optional().nullable(),   // 👈 ADD THIS FIELD!

  subjectIds: z.preprocess((val) => {
    if (typeof val === "string") {
      try { return JSON.parse(val); } catch { return val.split(",").map(s => s.trim()); }
    }
    return val;
  }, z.array(z.string().trim().min(1)).min(1, "Select at least one subject")),

  languages: z.preprocess((val) => {
    if (typeof val === "string") {
      try { return JSON.parse(val); } catch { return val.split(",").map(s => s.trim()); }
    }
    return val;
  }, z.array(z.string().trim().min(1)).default(["English"])),

  experience: z.preprocess((val) => {
    if (typeof val === "string") {
      try { return JSON.parse(val); } catch { return val.split(",").map(s => s.trim()); }
    }
    return val;
  }, z.array(z.string().trim().min(1)).default([])),

  // ✅ Add this line to accept the existing certificate URLs sent from the frontend edit form
  existingCertificates: z.preprocess((val) => {
    if (!val) return [];
    if (typeof val === "string") return [val];
    return val;
  }, z.array(z.string()).default([])),
});

// export const tutorProfileUpdateSchema = z.object({
//   headline: z.string().trim().min(1, "Headline cannot be empty").optional(),
//   bio: z.string().trim().min(1, "Bio cannot be empty").optional(),
//   education: z.string().trim().min(1, "Education cannot be empty").optional(),
//   hourlyRate: z.coerce.number().min(0, "Hourly rate must be 0 or more").optional(),
//   subjectIds: z.array(z.string().trim().min(1)).min(1, "Select at least one subject").optional(),
//   languages: z.array(z.string().trim().min(1)).optional(),
//   // certificates: z.array(z.string().trim().min(1)).optional(),
//   experience: z.array(z.string().trim().min(1)).optional(),
// });

// Admin approve/reject step
export const reviewApplicationSchema = z
  .object({
    action: z.enum(["approve", "reject"]),
    rejectionReason: z.string().trim().optional(),
  })
  .refine(
    (data) => data.action !== "reject" || Boolean(data.rejectionReason),
    { message: "rejectionReason is required when rejecting", path: ["rejectionReason"] },
  );

export type TutorApplicationInput = z.infer<typeof tutorApplicationSchema>;
export type TutorProfileUpdateInput = z.infer<typeof tutorProfileUpdateSchema>;
export type ReviewApplicationInput = z.infer<typeof reviewApplicationSchema>;
