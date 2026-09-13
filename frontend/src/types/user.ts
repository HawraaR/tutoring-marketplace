import type { TutorProfile } from "./tutor";
import type { StudentProfile } from "./student";

export interface User {
  id: string;
  email: string;
  createdAt: string;
  updatedAt: string;

  isStudent: boolean;
  isTutor: boolean;
  isAdmin: boolean;

  // Present once the user has applied to become a tutor (any verification status).
  tutorProfile?: TutorProfile | null;
  // Every user gets one on registration.
  studentProfile?: StudentProfile | null;
}