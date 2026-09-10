import type { TutorProfile } from "./tutor";

export interface User {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  isStudent: boolean;
  isTutor: boolean;
  isAdmin: boolean;
  createdAt: string;
  updatedAt?: string;
  tutorProfile?: TutorProfile | null;
}
