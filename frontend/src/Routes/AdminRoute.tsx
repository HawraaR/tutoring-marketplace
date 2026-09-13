import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const AdminRoute: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="p-6 text-sm text-muted">Loading authorization...</div>;
  }

  // If user is not logged in or is not an admin, boot them back to dashboard
  if (!user || !user.isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};