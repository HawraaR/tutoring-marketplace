// Matches the raw Prisma StudentProfile model returned from Express
export interface StudentProfile {
  id: string;
  userId: string;
  educationLevel: string | null;
  major: string | null;
  learningGoals: string | null;
  preferredSubjects: string[]; // Subject IDs
  learningStyle: string | null;
  timezone: string | null;
  preferredLanguage: string | null;
  maxHourlyRate: number | null;
}

// Payload sent to PATCH /students/me
export interface StudentProfileInput {
  educationLevel?: string;
  major?: string;
  learningGoals?: string;
  preferredSubjectIds?: string[];
  learningStyle?: string;
  timezone?: string;
  preferredLanguage?: string;
  maxHourlyRate?: number;
}
