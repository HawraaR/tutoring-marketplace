// Matches the raw Prisma model returned from Express
export interface Subject {
  id: string;
  name: string;
  category?: string | null;
  description?: string | null;
  createdAt?: string; // Transmitted as ISO string over HTTP
}

// Payload for creating a new subject (POST /subjects)
export interface CreateSubjectPayload {
  name: string;
  category?: string;
  description?: string;
}
