// Matches the raw Prisma model returned from Express
export interface AvailabilitySlot {
  id: string;
  tutorId: string;
  startTime: string; // ISO DateTime string
  endTime: string;   // ISO DateTime string
  isBooked: boolean;
  createdAt?: string;
  updatedAt?: string;
  tutor?: {
    id?: string;
    name?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    tutorProfile?: {
      bio:string;
      experience: string;
      averageRating: number;
    }
  };
}

// Payload for creating a new slot (POST /availability)
export interface CreateAvailabilityPayload {
  startTime: string; // ISO DateTime string
  endTime: string;   // ISO DateTime string
}

// Payload for updating an existing slot (PUT /availability/:slotId)
export interface UpdateAvailabilityPayload {
  startTime?: string;
  endTime?: string;
  isBooked?: boolean;
}