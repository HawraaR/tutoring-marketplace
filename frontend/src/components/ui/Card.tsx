import React from "react";

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-sm border border-border-subtle bg-surface-card p-6 ${className}`}>
      {children}
    </div>
  );
}
