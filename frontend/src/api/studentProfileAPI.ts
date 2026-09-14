import { api } from "./axios";
import type { StudentProfile, StudentProfileInput } from "../types";

// GET /students/me — the logged-in user's own student profile
export const getMyStudentProfile = async (): Promise<{ profile: StudentProfile }> => {
  const response = await api.get("/students/me");
  console.log("getMyStudentProfile response:", response.data); // Log the response data
  return response.data;
};

// PATCH /students/me — anyone can edit their own student profile
export const updateMyStudentProfile = async (
  data: StudentProfileInput,
): Promise<{ message: string; profile: StudentProfile }> => {
  const response = await api.patch("/students/me", data);
  return response.data;
};
