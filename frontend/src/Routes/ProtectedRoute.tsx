import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const ProtectedRoute: React.FC = () => {
  const { token, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-gray-600 font-medium">Loading session...</p>
      </div>
    );
  }

  // If no token exists, redirect to /login immediately
  return token ? <Outlet /> : <Navigate to="/login" replace />;
};