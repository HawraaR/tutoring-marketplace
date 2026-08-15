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
  const baseStyles = "w-full py-2.5 px-4 text-sm font-semibold rounded-lg shadow-xs transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center";
  
  const variants = {
    primary: "bg-brand-primary hover:bg-brand-primary-hover text-white",
    secondary: "bg-brand-secondary hover:opacity-90 text-white",
    danger: "bg-error hover:opacity-90 text-white",
  };

  return (
    <button 
      disabled={disabled || isLoading} 
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {isLoading ? "Loading..." : children}
    </button>
  );
}