import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  variant?: "primary" | "secondary" | "danger";
}

export function Button({
  children,
  isLoading,
  variant = "primary",
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  const variants = {
    primary: "bg-brand-primary hover:bg-brand-primary-hover text-white",
    secondary: "bg-slate-blue hover:opacity-90 text-white",
    danger: "bg-error hover:opacity-90 text-white",
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={`inline-flex w-full cursor-pointer items-center justify-center rounded-sm px-4 py-2.5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
      {...props}
    >
      {isLoading ? "Signing in…" : children}
    </button>
  );
}
