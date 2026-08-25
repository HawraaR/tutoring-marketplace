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