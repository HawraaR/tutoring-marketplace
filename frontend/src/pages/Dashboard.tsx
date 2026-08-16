import React from "react";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/ui/Button";

export const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-md text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Welcome Back!</h1>
        <p className="text-gray-600 mb-6">{user?.email}</p>

        <Button onClick={logout} className="w-full">
          Logout
        </Button>
      </div>
    </div>
  );
};