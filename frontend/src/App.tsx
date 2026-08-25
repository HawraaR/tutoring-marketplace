import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthProvider";
import { useAuth } from "./context/AuthContext";
import { ProtectedRoute } from "./ProtectedRoute";
import { AuthForm } from "./components/AuthForm";
import { Dashboard } from "./pages/Dashboard";
import { TutorD } from "./pages/TutorDashboard";
import { AdminD } from "./pages/AdminDashboard";
import { Sessions } from "./pages/Sessions";
import { AppLayout, AuthLayout } from "./layouts";
import { Messages } from "./pages/Messages";
import { Calendar } from "./pages/Calendar";
import LandingPage from "./pages/LandingPage2";

const DashboardRedirect: React.FC = () => {
  const { user, activeRole } = useAuth();

  if (user?.isAdmin) {
    return <AdminD />;
  }
  if (activeRole === "tutor" && user?.isTutor) {
    return <TutorD />;
  }
  return <Dashboard />;
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route
            path="/"
            element={<LandingPage />} />
          <Route
            path="/login"
            element={
              <AuthLayout>
                <AuthForm />
              </AuthLayout>
            }
          />
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<DashboardRedirect />} />
              <Route path="/sessions" element={<Sessions />} />
              <Route path="/messages" element={<Messages />} />
              <Route path="/calendar" element={<Calendar/>}/>
            </Route>
          </Route>
          <Route
            path="*"
            element={<Navigate to="/login" replace />}
          />

        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;