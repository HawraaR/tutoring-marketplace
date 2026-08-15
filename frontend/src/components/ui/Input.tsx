import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className = "", ...props }: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <input
        className={`w-full px-3.5 py-2 text-sm text-gray-900 bg-gray-50 border border-border-subtle rounded-lg outline-none focus:bg-white focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-error font-medium">{error}</p>}
    </div>
  );
}