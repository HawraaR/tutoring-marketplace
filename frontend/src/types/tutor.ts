// src/lib/types/tutor.ts
// These types mirror the Prisma payload shape so the frontend
// works unchanged once the backend returns real data.

export type TutorStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface Subject {
  id: string;
  name: string;
  category: string | null;
}

export interface TutorSubject {
  tutorId: string;   // User.id
  subjectId: string; // Subject.id
  subject: Subject;
}

export interface AvailabilitySlot {
  id: string;
  tutorId: string;
  startTime: string; // ISO datetime
  endTime: string;   // ISO datetime
  isBooked: boolean;
}

export interface TutorProfile {
  id: string;
  userId: string;
  headline: string | null;
  bio: string | null;
  hourlyRate: number;
  education: string | null;
  languages: string[];
  verificationStatus: TutorStatus;
  rejectionReason: string | null;
  certificates: string[];
  experience: string[];
  averageRating: number;
  reviewCount: number;
  isFeatured: boolean;
}

// Payload sent to POST /tutors/apply and PATCH /tutors/me
export interface TutorApplicationInput {
  headline: string;
  bio: string;
  education: string;
  hourlyRate: number;
  subjectIds: string[];
  languages: string[];
  certificates: string[];
  experience: string[];
}

/**
 * shape of:
 * prisma.user.findmany({
 *   include: {
 *     tutorprofile: true,
 *     tutorsubjects: { include: { subject: true } },
 *     availability: true,
 *   },
 * })
 */
export interface TutorListItem {
  id: string; // User.id
  firstName: string | null;
  lastName: string | null;
  tutorProfile: TutorProfile | null;
  tutorSubjects: TutorSubject[];
  availability: AvailabilitySlot[];
}