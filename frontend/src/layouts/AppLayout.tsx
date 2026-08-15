import React from "react";

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-surface-bg">
      <header className="bg-surface-card border-b border-border-subtle py-3 px-6 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-8">
            <h1 className="text-xl font-bold text-brand-primary">Tutoring Marketplace</h1>
            <nav className="hidden md:flex space-x-4 text-sm font-medium text-gray-600">
              <a href="/dashboard" className="text-brand-primary font-semibold">Dashboard</a>
              <a href="/my-sessions" className="hover:text-brand-primary transition">My Sessions</a>
              <a href="/messages" className="hover:text-brand-primary transition">Messages</a>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-700">Account</span>
            <button className="text-sm font-medium text-red-600 hover:text-red-700 cursor-pointer">
              Log Out
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-6">
        {children}
      </main>
    </div>
  );
}