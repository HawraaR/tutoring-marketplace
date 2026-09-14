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
import {CalendarV2}  from "./pages/CalendarV2";
import LandingPage from "./pages/LandingPage2";
import Directory from "./pages/TutorDirectory";
import TutoringReqs from "./pages/TutoringReqs";
import { TutorApplication } from "./pages/TutorApplication";
import { TutorProfileEdit } from "./pages/TutorProfileEdit";
import TutorProfileDetail from "./pages/TutorProfileDetail";
import { StudentProfileEdit } from "./pages/StudentProfileEdit";

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
              <Route path="/calendar" element={<CalendarV2 />} />
              <Route path="/directory" element={<Directory />} />
              <Route path="/tutors/:id" element={<TutorProfileDetail />} />
              <Route path="/become-a-tutor" element={<TutorApplication />} />
              <Route path="/tutor-profile" element={<TutorProfileEdit />} />
              <Route path="/tutoring-requirements" element={<TutoringReqs />} />
              <Route path="/profile" element={<StudentProfileEdit />} />

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
