import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthProvider";
import { ProtectedRoute } from "./ProtectedRoute";
import { AuthForm } from "./components/AuthForm";
import { Dashboard } from "./pages/Dashboard";
import { Sessions } from "./pages/Sessions";
import { AppLayout, AuthLayout } from "./layouts";
import { Messages } from "./pages/Messages";
import { TutorApplication } from "./pages/TutorApplication";
import { TutorProfileEdit } from "./pages/TutorProfileEdit";

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route
            path="/login"
            element={
              <AuthLayout>
                <AuthForm />
              </AuthLayout>
            }
          />
              <Route path="/become-a-tutor" element={<TutorApplication />} />
 <Route path="/tutor-profile" element={<TutorProfileEdit />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/sessions" element={<Sessions />} />
              <Route path="/messages" element={<Messages />} />
              {/* <Route path="/become-a-tutor" element={<TutorApplication />} /> */}
             {/* <Route path="/tutor-profile" element={<TutorProfileEdit />} /> */}
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
