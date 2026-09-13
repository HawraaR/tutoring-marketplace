import { z } from "zod";

// Profile update — every field optional (PATCH: only send what changes).
// No "apply" step exists for students: register() already creates a blank
// StudentProfile row for every user, so this is a plain edit form.
export const studentProfileUpdateSchema = z.object({
  educationLevel: z.string().trim().min(1, "Education level cannot be empty").optional(),
  major: z.string().trim().min(1, "Major cannot be empty").optional(),
  learningGoals: z.string().trim().optional(),
  preferredSubjectIds: z.array(z.string().trim().min(1)).optional(),
  learningStyle: z.string().trim().optional(),
  timezone: z.string().trim().optional(),
  preferredLanguage: z.string().trim().optional(),
  maxHourlyRate: z.coerce.number().min(0, "Max hourly rate must be 0 or more").optional(),
});

export type StudentProfileUpdateInput = z.infer<typeof studentProfileUpdateSchema>;
