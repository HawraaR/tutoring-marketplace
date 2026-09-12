import { api } from "./axios";


export const adminAPI = {
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