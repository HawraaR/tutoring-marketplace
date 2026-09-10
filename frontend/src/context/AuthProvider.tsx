import React, { useState, useEffect } from "react";
import type { User } from "../types";
import { api } from "../services/api/axios";
import { AuthContext } from "./AuthContext";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Re-fetch the current user from the backend using the stored token.
  const refreshUser = async () => {
    const storedToken = localStorage.getItem("token");

    if (!storedToken) {
      setUser(null);
      setToken(null);
      return;
    }

    try {
      const response = await api.get("/auth/me");
      setUser(response.data.user);
      setToken(storedToken);
    } catch {
      // Invalid or expired token
      localStorage.removeItem("token");
      setToken(null);
      setUser(null);
    }
  };

  useEffect(() => {
    refreshUser().finally(() => setIsLoading(false));
  }, []);

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};
