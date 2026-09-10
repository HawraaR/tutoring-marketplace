import type { TutorApplicationInput, TutorProfile } from "../../types";
import { api } from "./axios";

export const applyAsTutor = async (
  data: TutorApplicationInput
): Promise<{ message: string; user: unknown }> => {
  const response = await api.post("/tutors/apply", data);
  return response.data;
};

// Update the logged-in user's own tutor profile
export const updateTutorProfile = async (
  data: TutorApplicationInput
): Promise<{ message: string; profile: TutorProfile }> => {
  const response = await api.patch("/tutors/me", data);
  return response.data;
};

// admin — used in Part 2
export const getTutorApplications = async (
  status = "PENDING"
): Promise<TutorProfile[]> => {
  const response = await api.get(`/tutors/applications?status=${status}`);
  return response.data.applications;
};

export const reviewTutorApplication = async (
  id: string,
  action: "approve" | "reject",
  rejectionReason?: string
): Promise<{ message: string }> => {
  const response = await api.patch(`/tutors/applications/${id}`, {
    action,
    rejectionReason,
  });
  return response.data;
};
