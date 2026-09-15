import React, { useState } from "react";
import axios from "axios";
import { registerUser, loginUser } from "../api/authAPI";
import type { ApiErrorResponse } from "../types";

import { Input, Button } from "./ui";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

export const AuthForm: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [isRegister, setIsRegister] = useState<boolean>(false);

  // Form input states
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [isTutor, setIsTutor] = useState<boolean>(false);

  // Feedback states
  const [errorMessages, setErrorMessages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessages([]);
    setIsLoading(true);

    try {
      if (isRegister) {
        const registerPayload = {
          email,
          password,
          firstName,
          lastName,
          isStudent: true,
          isTutor,
        };

        await registerUser(registerPayload);
        const loginResponse = await loginUser({ email, password });

        if (loginResponse.token && loginResponse.user) {
          login(loginResponse.token, loginResponse.user);
          resetForm();
          navigate("/dashboard");
        } else {
          setErrorMessages([
            "Registered successfully, but auto-login failed. Please sign in.",
          ]);
        }
      } else {
        const response = await loginUser({ email, password });

        if (response.token && response.user) {
          login(response.token, response.user);
          resetForm();
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

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setFirstName("");
    setLastName("");
    setIsTutor(false);
  };

  return (
    <div className="min-h-screen w-full bg-surface-card flex flex-col lg:grid lg:grid-cols-2 overflow-x-hidden">
      
      {/* LEFT COLUMN: Hero / Branding */}
      <div className="relative hidden lg:flex flex-col justify-between p-12 bg-slate-900 text-white overflow-hidden">
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center opacity-30" 
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80')` }} 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-transparent z-0" />

        <div className="relative z-10 flex items-center gap-2">
          <span className="text-2xl">✦</span>
          <span className="font-serif text-2xl font-bold tracking-tight">Tutorium</span>
        </div>

        <div className="relative z-10 my-auto w-full max-w-md rounded-2xl border border-white/10 bg-white/10 p-8 backdrop-blur-md shadow-2xl">
          <div className="mb-4 flex items-center gap-2">
            <div className="flex -space-x-2">
              <span className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-slate-400" />
              <span className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-slate-500" />
              <span className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-slate-600" />
            </div>
            <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-semibold text-primary border border-brand-primary/30">
              Verified Tutors
            </span>
          </div>

          <h1 className="font-serif text-3xl font-bold leading-tight text-white">
            Connect with top peer tutors across your campus.
          </h1>

          <p className="mt-4 text-sm text-slate-300 italic">
            "Education is the key to unlocking your potential. Connect, learn, and excel together."
          </p>
          <span className="mt-2 block text-xs font-semibold tracking-wider text-slate-400 uppercase">
            — Peer Learning Network
          </span>
        </div>

        <div className="relative z-10 text-xs text-slate-400">
          © {new Date().getFullYear()} Tutorium. Empowering Higher Education.
        </div>
      </div>

      {/* RIGHT COLUMN: Form Area */}
      <div className="flex min-h-screen flex-col justify-between p-6 sm:p-12 lg:p-16 w-full">
        {/* Spacer for top alignment */}
        <div />

        {/* Form Container */}
        <div className="mx-auto my-auto w-full max-w-md">
          <div className="mb-6">
            <h2 className="font-serif text-3xl font-bold text-ink">
              {isRegister ? "Create your account" : "Welcome Back"}
            </h2>
            <p className="mt-1 text-sm text-muted">
              {isRegister
                ? "Join as a student or tutor to access your portal."
                : "Enter your credentials to access your peer-to-peer portal."}
            </p>
          </div>

          {/* Error List */}
          {errorMessages.length > 0 && (
            <div className="mb-4 rounded-lg bg-error/10 p-3 text-xs text-error">
              <ul className="list-inside list-disc space-y-0.5">
                {errorMessages.map((msg, idx) => (
                  <li key={idx}>{msg}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {isRegister && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="First Name"
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Jane"
                  />
                  <Input
                    label="Last Name"
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Doe"
                  />
                </div>

                <div className="flex items-center gap-2 py-1">
                  <input
                    id="isTutor"
                    type="checkbox"
                    checked={isTutor}
                    onChange={(e) => setIsTutor(e.target.checked)}
                    className="h-4 w-4 rounded border-border-subtle text-brand-primary focus:ring-brand-primary"
                  />
                  <label htmlFor="isTutor" className="text-sm font-medium text-ink">
                    I want to register as a Tutor
                  </label>
                </div>
              </>
            )}

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
              placeholder="••••••••"
            />

            <Button
              type="submit"
              disabled={isLoading}
              className="mt-2 w-full py-2.5 text-sm font-semibold"
            >
              {isRegister ? "Create Account →" : "Sign In to Portal →"}
            </Button>

            {/* TOGGLE PROMPT BELOW BUTTON */}
            <p className="pt-2 text-center text-sm text-muted">
              {isRegister ? "Already have an account?" : "New user?"}{" "}
              <button
                type="button"
                onClick={() => {
                  setIsRegister(!isRegister);
                  setErrorMessages([]);
                }}
                className="font-semibold text-brand-primary hover:underline"
              >
                {isRegister ? "Sign In" : "Create Account"}
              </button>
            </p>
          </form>
        </div>

        {/* Footer Links */}
        <div className="flex items-center justify-between text-xs text-muted pt-6">
          <div className="flex gap-4">
            <Link to="/privacy" className="hover:text-ink">Privacy Policy</Link>
            <a href="#terms" className="hover:text-ink">Terms of Service</a>
            <a href="#help" className="hover:text-ink">Help Center</a>
          </div>
          <span>EN</span>
        </div>
      </div>

    </div>
  );
};