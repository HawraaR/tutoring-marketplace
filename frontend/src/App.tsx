import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthProvider";
import { ProtectedRoute } from "./ProtectedRoute";
import { AuthForm } from "./components/AuthForm";
import { Dashboard } from "./pages/Dashboard";

export const App: React.FC = () => {
  return (
    <BrowserRouter>
  <AuthProvider>
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<AuthForm />} />

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
      </Route>

      {/* Default Catch-All */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  </AuthProvider>
</BrowserRouter>
  );
};

export default App;