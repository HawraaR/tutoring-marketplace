import React, { useState, useEffect } from "react";
import type { User } from "../types";
import { api } from "../api/axios";
import { AuthContext } from "./AuthContext";

const activeRoleKey = (userId: string) => `tutorium-active-role:${userId}`;

function roleForUser(user: User): "student" | "tutor" {
  const storedRole = localStorage.getItem(activeRoleKey(user.id));

  if (storedRole === "tutor" && user.isTutor) return "tutor";
  if (storedRole === "student" && user.isStudent) return "student";
  if (user.isTutor && !user.isStudent) return "tutor";
  return "student";
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token"),
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeRole, setActiveRoleState] = useState<"student" | "tutor">(
    localStorage.getItem("tutorium-active-role") === "tutor" ? "tutor" : "student",
  );

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem("token");

      if (storedToken) {
        try {
          // Express backend route to verify token
          const response = await api.get("/auth/me");
          setUser(response.data.user);
          setToken(storedToken);
          setActiveRoleState(roleForUser(response.data.user));
        } catch {
          // Invalid or expired token
          localStorage.removeItem("token");
          setToken(null);
          setUser(null);
        }
      }

      // Always stop loading, whether token was found/valid or not!
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  // Re-fetch the current user (e.g. right after submitting a tutor
  // application) so nav/role checks that depend on user.tutorProfile update
  // without requiring a full page reload.
  const refreshUser = async () => {
    try {
      const response = await api.get("/auth/me");
      setUser(response.data.user);
    } catch {
      // Keep the existing user state if the refresh fails; the next
      // protected request will surface any real auth problem.
    }
  };

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
    setUser(newUser);
    setActiveRoleState(roleForUser(newUser));
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    setActiveRoleState("student");
  };

  const setActiveRole = (role: "student" | "tutor") => {
    setActiveRoleState(role);
    if (user) {
      localStorage.setItem(activeRoleKey(user.id), role);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout, activeRole, setActiveRole, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};
