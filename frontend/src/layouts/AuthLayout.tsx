import React from "react";

export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-surface-bg flex flex-col items-center justify-center p-4">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-brand-primary tracking-tight">Tutoring Marketplace</h1>
      </div>
      <div className="w-full max-w-md">
        {children}
      </div>
    </main>
  );
}