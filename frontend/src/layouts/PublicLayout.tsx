import React from "react";

export function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-surface-bg">
      <header className="bg-surface-card border-b border-border-subtle py-4 px-6 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold text-brand-primary tracking-tight">Tutoring Marketplace</h1>
          <nav className="flex items-center space-x-6 text-sm font-medium text-gray-600">
            <a href="/tutors" className="hover:text-brand-primary transition">Find Tutors</a>
            <a href="/login" className="hover:text-brand-primary transition">Log In</a>
            <a 
              href="/register" 
              className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary-hover transition"
            >
              Sign Up
            </a>
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto p-6">
        {children}
      </main>
    </div>
  );
}