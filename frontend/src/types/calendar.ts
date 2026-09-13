// src/types/calendar.ts

// Component Modes & UI Styling Types
export type CalendarMode = "student" | "tutor" | "admin";
export type EventTone = "burgundy" | "olive" | "slate";
export type EventStatus = "available" | "booked";

// Frontend Display Model (Parsed from backend availability/bookings for grid render)
export interface CalendarEvent {
  id: string;
  tutorId?: string;
  startTime?: string;
  endTime?: string;
  date: string;
  start: string;
  end: string;
  title: string;
  tutor: string;
  course: string;
  mode: string;
  note: string;
  tone: EventTone;
  status: EventStatus;
}

// Local Form State (Used within calendar creation forms)
export interface AvailabilityForm {
  title: string;
  course: string;
  date: string;
  start: string;
  end: string;
  mode: string;
  note: string;
}

export interface CalendarProps {
  initialDate?: Date | string;
  className?: string;
}