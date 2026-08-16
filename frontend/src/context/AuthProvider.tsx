import React, { useState, useEffect } from "react";
import type { User } from "../types";
import { api } from "../services/api/axios";
import { AuthContext } from "./AuthContext";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
  const initializeAuth = async () => {
    const storedToken = localStorage.getItem("token");
    
    if (storedToken) {
      try {
        // Express backend route to verify token
        const response = await api.get("/auth/me");
        setUser(response.data.user);
        setToken(storedToken);
      } catch{
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
    <AuthContext.Provider value={{ user, token, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};