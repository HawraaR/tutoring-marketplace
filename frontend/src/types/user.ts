import type { TutorProfile } from "./tutor";

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
}