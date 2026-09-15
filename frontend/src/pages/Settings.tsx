import  { useState } from "react";
import { useAuth } from "../context/AuthContext";
// Import your pre-existing profile edit components/pages
import { StudentProfileEdit } from "./StudentProfileEdit";
import { TutorProfileEdit } from "./TutorProfileEdit";
import { UserProfileEdit } from "./UserProfileEdit";

interface TabOption {
  id: "user" | "student" | "tutor";
  label: string;
}

export function Settings() {
  const { user } = useAuth();

  // Check if user is a verified tutor to conditionally display the tab
  const isVerifiedTutor = user?.tutorProfile?.verificationStatus === "APPROVED";
  const isStudent = user?.isStudent;

  const tabs: TabOption[] = [
    { id: "user", label: "User Account" },
    // { id: "student", label: "Student Profile" },
    ...(isStudent
      ? [{ id: "student" as const, label: "Student Profile" }]
      : []),
    ...(isVerifiedTutor
      ? [{ id: "tutor" as const, label: "Tutor Profile" }]
      : []),
  ];

  const [activeTab, setActiveTab] = useState<"user" | "student" | "tutor">(
    "user",
  );

  return (
    <div>
      <h1 className="font-serif text-3xl font-bold text-ink">
        Account Settings
      </h1>
      <p className="mt-1 text-sm text-muted">
        Manage your user credentials, student profile, and tutor preferences in
        one place.
      </p>

      {/* Settings Tab Header */}
      <div className="mt-6 border-b border-border-subtle">
        <nav className="-mb-px flex gap-6" aria-label="Settings Tabs">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`border-b-2 py-3 px-1 text-sm font-medium transition-colors ${
                  isActive
                    ? "border-brand-primary font-semibold text-brand-primary"
                    : "border-transparent text-muted hover:border-border-subtle hover:text-ink"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Contents */}
      <div className="mt-6">
        {/* Tab 1: Base User Account Form */}
        {activeTab === "user" && <UserProfileEdit />}

        {/* Tab 2: Existing Student Profile Page Form & Logic */}
        {activeTab === "student" && <StudentProfileEdit />}

        {/* Tab 3: Existing Tutor Profile Page Form & Logic */}
        {activeTab === "tutor" && isVerifiedTutor && <TutorProfileEdit />}
      </div>
    </div>
  );
}
