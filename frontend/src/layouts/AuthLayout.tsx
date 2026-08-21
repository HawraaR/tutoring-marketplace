import type { ReactNode } from "react";

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-surface-bg px-5 py-12">
      <div className="mb-8">
        <p className="font-serif text-xl font-semibold text-ink">Tutorium</p>
        <p className="text-xs text-muted">University tutoring</p>
      </div>
      <div className="w-full max-w-md rounded-sm border border-border-subtle bg-surface-card p-8">
        {children}
      </div>
    </main>
  );
}
