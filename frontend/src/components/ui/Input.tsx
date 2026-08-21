import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className = "", ...props }: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="mb-1 block text-sm font-medium text-ink">
          {label}
        </label>
      )}
      <input
        className={`w-full rounded-sm border border-border-subtle bg-surface-card px-3.5 py-2.5 text-sm text-ink outline-none placeholder:text-muted focus:border-brand-primary ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-xs font-medium text-error">{error}</p>}
    </div>
  );
}
