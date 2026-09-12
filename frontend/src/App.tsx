import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthProvider";
import { useAuth } from "./context/AuthContext";
import { ProtectedRoute } from "./Routes/ProtectedRoute";
import { AdminRoute } from "./Routes/AdminRoute";
import { AuthForm } from "./components/AuthForm";
import { Dashboard } from "./pages/Dashboard";
import { TutorD } from "./pages/TutorDashboard";
import AdminD from "./pages/AdminDashboard";
import { UserManagement } from "./pages/UserManagement";
import { TutorApprovals } from "./pages/TutorApprovals";
import { SessionPage } from "./pages/SessionPage";
import { AppLayout, AuthLayout } from "./layouts";
import { Messages } from "./pages/Messages";
import { Calendar } from "./pages/Calendar";
import LandingPage from "./pages/LandingPage2";
import Directory from "./pages/TutorDirectory";

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
          <Route path="/" element={<LandingPage />} />
          <Route
            path="/login"
            element={
              <AuthLayout>
                <AuthForm />
              </AuthLayout>
            }
          />

          {/* Standard Authenticated Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<DashboardRedirect />} />
              <Route path="/sessions" element={<SessionPage />} />
              <Route path="/messages" element={<Messages />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/directory" element={<Directory />} />

              {/* Protected Admin Routes */}
              <Route element={<AdminRoute />}>
                <Route
                  path="/admin/tutor-approvals"
                  element={<TutorApprovals />}
                />
                <Route path="/admin/users" element={<UserManagement />} />
                <Route path="/admin/dashboard" element={<AdminD />} />
              </Route>
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
