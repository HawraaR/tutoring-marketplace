import React, { useState } from "react";
import axios from "axios";
import { registerUser, loginUser } from "../api/authAPI";
import type { ApiErrorResponse } from "../types";

// Import your custom reusable components
import { Input, Button } from "./ui";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export const AuthForm: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  // Toggle between Login (false) and Register (true)
  const [isRegister, setIsRegister] = useState<boolean>(false);

  // Form input state
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  // Feedback states
  const [errorMessages, setErrorMessages] = useState<string[]>([]);
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessages([]);
    setSuccessMessage("");
    setIsLoading(true);

    const payload = { email, password };

    try {
      if (isRegister) {
        // Step 1: Create the account in backend
        await registerUser(payload);

        // Step 2: Auto-login with the exact same credentials!
        const loginResponse = await loginUser(payload);

        if (loginResponse.token && loginResponse.user) {
          login(loginResponse.token, loginResponse.user);
          setEmail("");
          setPassword("");
          navigate("/dashboard");
        } else {
          setErrorMessages([
            "Registered successfully, but auto-login failed. Please sign in.",
          ]);
        }
      } else {
        // Standard Login Flow
        const response = await loginUser(payload);

        if (response.token && response.user) {
          login(response.token, response.user);
          setEmail("");
          setPassword("");
          navigate("/dashboard");
        } else {
          setErrorMessages(["Login failed. No token received."]);
        }
      }
    } catch (err: unknown) {
      if (axios.isAxiosError<ApiErrorResponse>(err) && err.response) {
        const errorData = err.response.data;

        if (errorData.details && Array.isArray(errorData.details)) {
          setErrorMessages(errorData.details.map((item) => item.message));
        } else if (errorData.error) {
          setErrorMessages([errorData.error]);
        } else {
          setErrorMessages(["An unexpected server error occurred."]);
        }
      } else {
        setErrorMessages(["Network error. Is your backend server running?"]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleTabSwitch = (toRegister: boolean) => {
    setIsRegister(toRegister);
    setErrorMessages([]);
    setSuccessMessage("");
  };

  return (
    <div>
      <div className="mb-6 flex gap-6 border-b border-border-subtle">
        <button
          type="button"
          className={`pb-2.5 text-sm font-semibold ${
            !isRegister ? "border-b-2 border-brand-primary text-brand-primary" : "text-muted hover:text-ink"
          }`}
          onClick={() => handleTabSwitch(false)}
        >
          Sign in
        </button>
        <button
          type="button"
          className={`pb-2.5 text-sm font-semibold ${
            isRegister ? "border-b-2 border-brand-primary text-brand-primary" : "text-muted hover:text-ink"
          }`}
          onClick={() => handleTabSwitch(true)}
        >
          Create account
        </button>
      </div>

      <h2 className="font-serif mb-1 text-2xl font-semibold text-ink">
        {isRegister ? "Create an account" : "Sign in"}
      </h2>
      <p className="mb-6 text-sm text-muted">
        {isRegister
          ? "For currently enrolled university students."
          : "Use the email associated with your Tutorium account."}
      </p>

      {successMessage && (
        <p className="mb-4 text-sm text-olive">{successMessage}</p>
      )}

      {errorMessages.length > 0 && (
        <ul className="mb-4 list-inside list-disc space-y-1 text-sm text-error">
          {errorMessages.map((msg, idx) => (
            <li key={idx}>{msg}</li>
          ))}
        </ul>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <Input
          label="Email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@campus.edu"
        />

        <Input
          label="Password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Something you’ll remember"
        />

        <Button type="submit" disabled={isLoading} className="mt-1">
          {isRegister ? "Create account" : "Sign in"}
        </Button>
      </form>
    </div>
  );
};
