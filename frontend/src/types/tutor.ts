export type TutorStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface TutorApplicationInput {
  headline: string;
  bio: string;
  hourlyRate: number;
  subjects: string[];
  education: string;
  languages: string[];
  certificates: string[];
  experience: string[];
}

export interface TutorProfile extends TutorApplicationInput {
  id: string;
  userId: string;
  verificationStatus: TutorStatus;
  rejectionReason: string | null;
  createdAt: string;
}
