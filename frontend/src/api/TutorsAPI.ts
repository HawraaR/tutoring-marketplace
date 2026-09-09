// src/lib/api/tutors.ts
'use client';
import type { TutorListItem } from '../types/tutor';
import { api } from './axios';

export const TutorsAPI = {
  async getTutors(): Promise<TutorListItem[]> {
    const res = await api.get("/tutors");
    const payload = res.data;
    // tolerant unwrap: works whether controller sends array, { data }, or { tutors }
    return Array.isArray(payload) ? payload : (payload.data ?? payload.tutors ?? []);
  },
};