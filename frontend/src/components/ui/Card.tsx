import React from "react";

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`p-6 bg-surface-card border border-border-subtle rounded-xl shadow-xs ${className}`}>
      {children}
    </div>
  );
}