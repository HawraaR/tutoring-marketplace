import { useState } from "react";
import { Card, Input, Button } from "./ui";

export default function RegisterForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setStatus(null);
    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create account.");
      }

      setStatus({ type: "success", text: `Account created successfully for ${data.user.email}!` });
      setEmail("");
      setPassword("");
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred.";
      setStatus({ type: "error", text: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Create an Account</h2>
        <p className="text-sm text-gray-500 mt-1">Sign up to get started as a tutor or student</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email Address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="you@example.com"
        />

        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          placeholder="••••••••"
        />

        <Button type="submit" isLoading={loading}>
          Sign Up
        </Button>
      </form>

      {status && (
        <div
          className={`mt-4 p-3 rounded-lg text-sm font-medium border ${
            status.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-red-50 text-red-800 border-red-200"
          }`}
        >
          {status.text}
        </div>
      )}
    </Card>
  );
}