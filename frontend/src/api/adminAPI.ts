import { api } from "./axios";


export const adminAPI = {
  getDashboard: async () => {
    const response = await api.get("/admin/dashboard");
    return response.data;
  },
  exportReport: async (type: string) => {
    const response = await api.get("/admin/reports/export", {
      params: { type },
      responseType: "text",
    });
    return response.data as string;
  },
  getPendingTutors: async () => {
    const response = await api.get("/admin/tutors/pending");
    return response.data;
  },
  reviewTutor: async (
    profileId: string,
    payload: { verificationStatus: "APPROVED" | "REJECTED"; rejectionReason?: string }
  ) => {
    const response = await api.patch(`/admin/tutors/${profileId}/verify`, payload);
    return response.data;
  },
};