export type BookingStatus = "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";

export interface Booking {
  id: string;
  studentId: string;
  tutorId: string;
  subjectId: string;
  availabilitySlotId?: string | null;
  startTime: string; // ISO DateTime string
  endTime: string;   // ISO DateTime string
  status: BookingStatus;
  totalPrice?: number | null;
  notes?: string | null;
  createdAt?: string;
  updatedAt?: string;
  student?: {
    id: string;
    name: string;
    email: string;
  };
  tutor?: {
    id: string;
    name: string;
    email: string;
  };
  subject?: {
    id: string;
    name: string;
    code?: string;
  };
}

// Payload for creating a new booking (POST /bookings)
export interface CreateBookingPayload {
  subjectId: string;
  startTime: string; // ISO DateTime string
  endTime: string;   // ISO DateTime string
  availabilitySlotId?: string;
  totalPrice?: number;
  notes?: string;
}

// Payload for updating booking status (PATCH /bookings/:bookingId/status)
export interface UpdateBookingStatusPayload {
  status: BookingStatus;
}