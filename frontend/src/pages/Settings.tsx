import React, { useState } from "react";
import { Card, Input, Button } from "../components/ui";
import { useAuth } from "../context/AuthContext";
// Import your pre-existing profile edit components/pages
import {StudentProfileEdit} from "./StudentProfileEdit"; 
import {TutorProfileEdit} from "./TutorProfileEdit";

interface TabOption {
  id: "user" | "student" | "tutor";
  label: string;
}

export function Settings() {
  const { user } = useAuth();
  
  // Check if user is a verified tutor to conditionally display the tab
  const isVerifiedTutor = user?.tutorProfile?.verificationStatus === "APPROVED";

  const tabs: TabOption[] = [
    { id: "user", label: "User Account" },
    { id: "student", label: "Student Profile" },
    ...(isVerifiedTutor ? [{ id: "tutor" as const, label: "Tutor Profile" }] : []),
  ];

  const [activeTab, setActiveTab] = useState<"user" | "student" | "tutor">("user");

  // Basic User Account local state
  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`User credentials updated: ${firstName} ${lastName}`);
  };

  return (
    <div >
      <h1 className="font-serif text-3xl font-bold text-ink">Account Settings</h1>
      <p className="mt-1 text-sm text-muted">
        Manage your user credentials, student profile, and tutor preferences in one place.
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
        {activeTab === "user" && (
          <Card>
            <h2 className="font-serif text-xl font-semibold text-ink">User Credentials</h2>
            <p className="mt-1 text-xs text-muted">Update your standard account identity.</p>

            <form className="mt-6 flex flex-col gap-4" onSubmit={handleSaveUser}>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input
                  label="First Name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
                <Input
                  label="Last Name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
              <Input
                label="Email Address"
                type="email"
                value={user?.email || ""}
                disabled
              />
              <Button type="submit" className="mt-2 w-fit">
                Save Account Changes
              </Button>
            </form>
          </Card>
        )}

        {/* Tab 2: Existing Student Profile Page Form & Logic */}
        {activeTab === "student" && <StudentProfileEdit />}

        {/* Tab 3: Existing Tutor Profile Page Form & Logic */}
        {activeTab === "tutor" && isVerifiedTutor && <TutorProfileEdit />}
      </div>
    </div>
  );
}