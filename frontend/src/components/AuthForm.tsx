import React, { useState } from "react";
import axios from "axios";
import { registerUser, loginUser } from "../services/api/authAPI";
import type { ApiErrorResponse } from "../types";

// Import your custom reusable components
import { Input, Button } from "./ui";

export const AuthForm: React.FC = () => {
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
      const response = isRegister
        ? await registerUser(payload)
        : await loginUser(payload);

      setSuccessMessage(response.message || "Operation successful!");

      // Store JWT token if returned on login
      if (response.token) {
        localStorage.setItem("token", response.token);
      }

      // Reset form fields on success
      setEmail("");
      setPassword("");
    } catch (err: unknown) {
      if (axios.isAxiosError<ApiErrorResponse>(err) && err.response) {
        const errorData = err.response.data;

        if (errorData.details && Array.isArray(errorData.details)) {
          // Zod validation messages array
          setErrorMessages(errorData.details.map((item) => item.message));
        } else if (errorData.error) {
          // Single error message
          setErrorMessages([errorData.error]);
        } else {
          setErrorMessages(["An unexpected server error occurred."]);
        }
      } else {
        setErrorMessages(["Network error. Is your backend running on port 5000?"]);
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
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg">
        
        {/* Navigation Tabs */}
        <div className="mb-6 flex border-b border-gray-200">
          <button
            type="button"
            className={`w-1/2 pb-3 text-center font-semibold transition-colors ${
              !isRegister
                ? "border-b-2 border-indigo-600 text-indigo-600"
                : "text-gray-400 hover:text-gray-600"
            }`}
            onClick={() => handleTabSwitch(false)}
          >
            Login
          </button>
          <button
            type="button"
            className={`w-1/2 pb-3 text-center font-semibold transition-colors ${
              isRegister
                ? "border-b-2 border-indigo-600 text-indigo-600"
                : "text-gray-400 hover:text-gray-600"
            }`}
            onClick={() => handleTabSwitch(true)}
          >
            Register
          </button>
        </div>

        {/* Title */}
        <h2 className="mb-4 text-2xl font-bold text-gray-800">
          {isRegister ? "Create an Account" : "Welcome Back"}
        </h2>

        {/* Success Alert */}
        {successMessage && (
          <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
            {successMessage}
          </div>
        )}

        {/* Error Alert (Handles Zod array errors) */}
        {errorMessages.length > 0 && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            <ul className="list-inside list-disc space-y-1">
              {errorMessages.map((msg, idx) => (
                <li key={idx}>{msg}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Auth Form utilizing Reusable UI Components */}
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />

          <Input
            label="Password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading
              ? "Processing..."
              : isRegister
              ? "Sign Up"
              : "Sign In"}
          </Button>
        </form>
      </div>
    </div>
  );
};