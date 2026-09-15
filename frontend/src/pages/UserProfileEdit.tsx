import React, { useEffect, useState } from "react";
import { Input, Button, Card } from "../components/ui";
import toast from "react-hot-toast";
import { usersAPI } from "../api/usersAPI";

export function UserProfileEdit() {
  // Account state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSavingAccount, setIsSavingAccount] = useState(false);

  // Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Fetch current user details on mount
  useEffect(() => {
    usersAPI
      .getMe()
      .then((data) => {
        // Adjust property access based on your API response shape (e.g., data.user or data)
        const user = data.user || data;
        setFirstName(user.firstName ?? "");
        setLastName(user.lastName ?? "");
        setEmail(user.email ?? "");
      })
      .catch((error) => {
        toast.error("Failed to load account information.");
        console.error("Error fetching user profile:", error);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingAccount(true);

    try {
      await usersAPI.updateMe({ firstName, lastName, email });
      toast.success("Account changes saved successfully!");
    } catch (error: any) {
      toast.error(error?.response?.data?.error || "Failed to save account changes.");
    } finally {
      setIsSavingAccount(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }

    setIsChangingPassword(true);
    try {
      await usersAPI.changePassword({ currentPassword, newPassword });
      toast.success("Password changed successfully!");

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      toast.error(error?.response?.data?.error || "Failed to change password.");
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <p className="text-sm text-muted">Loading account settings…</p>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* User Credentials Card */}
      <Card>
        <h1 className="font-serif text-xl font-semibold text-ink">User Credentials</h1>
        <p className="mt-1 text-sm text-muted">Update your standard account identity.</p>

        <form onSubmit={handleAccountSubmit} className="mt-6 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
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
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Button type="submit" disabled={isSavingAccount} className="mt-2 w-fit">
            {isSavingAccount ? "Saving…" : "Save Account Changes"}
          </Button>
        </form>
      </Card>

      {/* Change Password Card */}
      <Card>
        <h2 className="font-serif text-xl font-semibold text-ink">Security & Password</h2>
        <p className="mt-1 text-sm text-muted">Change your account password below.</p>

        <form onSubmit={handlePasswordSubmit} className="mt-6 flex flex-col gap-4">
          <Input
            label="Current Password"
            type="password"
            placeholder="••••••••"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="New Password"
              type="password"
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <Input
              label="Confirm New Password"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <Button type="submit" disabled={isChangingPassword} className="mt-2 w-fit">
            {isChangingPassword ? "Updating…" : "Update Password"}
          </Button>
        </form>
      </Card>
    </div>
  );
}