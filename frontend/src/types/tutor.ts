// src/lib/types/tutor.ts
// These types mirror the Prisma payload shape so the frontend
// works unchanged once the backend returns real data.

export type TutorStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELED' | 'COMPLETED'
export type SessionType= 'ONLINE' | 'IN_PERSON'
export type ReviewCriterionKey = "knowledge" | "teachingStyle" | "punctuality";
export type CategoryRatings = Record<ReviewCriterionKey, number>;

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
  videoIntroUrl: string | null;
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
/** Phase-2 `Review` model shape (frontend degrades gracefully if absent/empty). */
export interface TutorReview extends BookingReview{
  id: string;
  rating: number; // 1..5, halves allowed
  comment: string;
  createdAt: string;
  sessionDate: string; //booking.startTime(new)
  subject: {id: string; name:string};
  student: { id: string; firstName: string | null; lastName: string | null };
}
/** Contract for GET /api/tutors/:id */
export interface TutorDetailResponse {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  tutorProfile: TutorProfile;
  tutorSubjects: TutorSubject[];
  availability: AvailabilitySlot[]; // future, unbooked slots (asc)
  stats: { completedSessions: number }; // computed from Bookings (COMPLETED)
  reviews: TutorReview[];
}

/** Contract for POST /api/bookings (studentId/status/totalPrice set server-side). */
export interface CreateBookingInput {
  tutorId: string;
  subjectId: string;
  availabilitySlotId: string;
  startTime: string;
  endTime: string;
  sessionType: SessionType; // persist via new Booking.sessionType (phase 2) or fold into notes
  notes?: string;
}
/** Mirrors Prisma `Booking`. */
export interface Booking {
  id: string;
  studentId: string;
  tutorId: string;
  subjectId: string;
  availabilitySlotId: string | null;
  startTime: string;
  endTime: string;
  status: BookingStatus;
  totalPrice: number | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  review?: BookingReview | null;
  student?: { id: string; firstName: string | null; lastName: string | null; email: string };
  tutor?:   { id: string; firstName: string | null; lastName: string | null; email: string };
  subject?: Subject;
}
/** Raw Review row as included on a Booking (`include: { review: true }`) */
export interface BookingReview {
  id: string;
  bookingId: string;
  tutorId: string;
  studentId: string;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReviewInput {
  bookingId: string;
  ratings: CategoryRatings; // 1..5 for each review category
  comment: string;
}

