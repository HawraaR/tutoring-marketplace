export interface User {
  id: string;
  email: string;
  createdAt: string;
  updatedAt: string;

  isStudent: boolean;
  isTutor: boolean;
  isAdmin: boolean;
}