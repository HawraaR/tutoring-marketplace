import React from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-surface-bg">
      {/* Global Header */}
      <header className="bg-surface-card border-b border-border-subtle py-4 px-6 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold text-brand-primary tracking-tight">Tutoring Marketplace</h1>
          <nav className="space-x-4 text-sm font-medium text-gray-600">
            <a href="#" className="hover:text-brand-primary transition">Find Tutors</a>
            <a href="#" className="hover:text-brand-primary transition">Become a Tutor</a>
          </nav>
        </div>
      </header>

      {/* Main Page Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-6">
        {children}
      </main>
    </div>
  );
}