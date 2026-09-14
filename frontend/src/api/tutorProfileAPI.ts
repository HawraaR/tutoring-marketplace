import { api } from "./axios";
import type { Subject, TutorApplicationInput, TutorProfile } from "../types";

// POST /tutors/apply — submit a new tutor application (once per user)
export const applyAsTutor = async (
  data: FormData | TutorApplicationInput,
): Promise<{ message: string; user: unknown }> => {
  const response = await api.post("/tutors/apply", data);
  return response.data;
};

// GET /tutors/me — the logged-in user's own tutor profile + selected subjects
export const getMyTutorProfile = async (): Promise<{
  profile: TutorProfile;
  subjects: Subject[];
}> => {
  const response = await api.get("/tutors/me");
  return response.data;
};

// PATCH /tutors/me — edit an already-approved tutor profile
export const updateMyTutorProfile = async (
  data: FormData | Partial<TutorApplicationInput>,
): Promise<{ message: string; profile: TutorProfile }> => {
  const response = await api.patch("/tutors/me", data);
  return response.data;
};

// GET /tutors/applications?status=... — admin only
export interface TutorApplication extends TutorProfile {
  user: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
  };
}

export const getTutorApplications = async (
  status: "PENDING" | "APPROVED" | "REJECTED" = "PENDING",
): Promise<TutorApplication[]> => {
  const response = await api.get(`/tutors/applications?status=${status}`);
  return response.data.applications;
};

// PATCH /tutors/applications/:id — admin only
export const reviewTutorApplication = async (
  id: string,
  status: "APPROVED" | "REJECTED",
  rejectionReason?: string,
): Promise<{ message: string }> => {
  const response = await api.patch(`/tutors/applications/${id}`, {
    status,
    rejectionReason,
  });
  return response.data;
};

// import { api } from "./axios";
// import type { Subject, TutorApplicationInput, TutorProfile } from "../types";

// // POST /tutors/apply — submit a new tutor application (once per user)
// export const applyAsTutor = async (
//   data: TutorApplicationInput,
// ): Promise<{ message: string; user: unknown }> => {
//   const response = await api.post("/tutors/apply", data);
//   return response.data;
// };

// // GET /tutors/me — the logged-in user's own tutor profile + selected subjects
// export const getMyTutorProfile = async (): Promise<{
//   profile: TutorProfile;
//   subjects: Subject[];
// }> => {
//   const response = await api.get("/tutors/me");
//   return response.data;
// };

// // PATCH /tutors/me — edit an already-approved tutor profile
// export const updateMyTutorProfile = async (
//   data: Partial<TutorApplicationInput>,
// ): Promise<{ message: string; profile: TutorProfile }> => {
//   const response = await api.patch("/tutors/me", data);
//   return response.data;
// };

// // GET /tutors/applications?status=... — admin only
// export interface TutorApplication extends TutorProfile {
//   user: { id: string; email: string; firstName: string | null; lastName: string | null };
// }

// export const getTutorApplications = async (
//   status: "PENDING" | "APPROVED" | "REJECTED" = "PENDING",
// ): Promise<TutorApplication[]> => {
//   const response = await api.get(`/tutors/applications?status=${status}`);
//   return response.data.applications;
// };

// // PATCH /tutors/applications/:id — admin only
// export const reviewTutorApplication = async (
//   id: string,
//   action: "approve" | "reject",
//   rejectionReason?: string,
// ): Promise<{ message: string }> => {
//   const response = await api.patch(`/tutors/applications/${id}`, {
//     action,
//     rejectionReason,
//   });
//   return response.data;
// };
