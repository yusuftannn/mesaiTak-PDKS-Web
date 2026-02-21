"use client";

import React from "react";
import clsx from "clsx";

type Variant = "primary" | "secondary" | "danger" | "ghost" | "success";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
}

const variantClasses: Record<Variant, string> = {
  primary: "bg-black text-white hover:opacity-90",
  secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300",
  danger: "bg-red-600 text-white hover:bg-red-700",
  ghost: "bg-transparent text-gray-700 hover:bg-gray-100",
  success: "bg-green-600 text-white hover:bg-green-700",
};

const sizeClasses: Record<Size, string> = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-base",
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  fullWidth = false,
  loading = false,
  icon,
  iconPosition = "left",
  className,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={clsx(
        "rounded-lg font-medium transition flex items-center justify-center gap-2",
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && "w-full",
        (disabled || loading) && "opacity-60 cursor-not-allowed",
        className,
      )}
      {...props}
    >
      {loading ? (
        <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
      ) : (
        <>
          {icon && iconPosition === "left" && icon}
          {children}
          {icon && iconPosition === "right" && icon}
        </>
      )}
    </button>
  );
}
