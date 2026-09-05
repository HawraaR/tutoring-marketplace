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
  meetingUrl?: string;
  createdAt?: string;
  updatedAt?: string;
  student?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  tutor?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    title?: string;
  };
  subject?: {
    id: string;
    name: string;
    code?: string;
  };
}

// UI ViewModel for the Sessions page
export type SessionStatus = "upcoming" | "past" | "cancelled";

export interface Session {
  id: string;
  title: string;
  tutor: string;
  credentials?: string;
  date: string;
  day: string;
  time: string;
  duration: string;
  mode: string;
  note?: string;
  status: SessionStatus;
  sortDate: string;
  tone?: "slate" | "olive" | "amber";
  meetingUrl?: string;
}

export interface UnifiedSession {
  id: string;
  counterpartId: string;
  title: string;
  counterpartName: string;
  counterpartRole: "Tutor" | "Student";
  credentials?: string;
  date: string;
  day: string;
  time: string;
  duration: string;
  mode: string;
  note?: string;
  status: SessionStatus;
  sortDate: string;
  tone?: "slate" | "olive" | "amber";
  meetingUrl?: string;
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