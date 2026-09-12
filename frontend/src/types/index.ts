export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export * from "./auth";
export * from "./user";
export * from "./calendar";
export * from "./subject";
export * from "./availabilitySlot";
export * from "./booking";
export * from "./messages";
// Named (not wildcard) re-export: tutor.ts also declares its own local
// Subject/AvailabilitySlot shapes for the directory's TutorListItem payload,
// which would otherwise collide with the canonical ones from ./subject and
// ./availabilitySlot above.
export type {
  TutorProfile,
  TutorStatus,
  TutorSubject,
  TutorListItem,
  TutorApplicationInput,
} from "./tutor";