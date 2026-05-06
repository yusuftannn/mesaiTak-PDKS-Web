"use client";

import React from "react";
import clsx from "clsx";

type Variant = "primary" | "secondary" | "danger" | "ghost" | "success";
type Size = "sm" | "md" | "lg" | "nav";
type Justify = "center" | "between" | "start";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  justify?: Justify;
}

const variantClasses: Record<Variant, string> = {
  primary: "bg-primary text-white hover:bg-primary-dark",
  secondary: "bg-secondary text-white hover:opacity-90",
  danger: "bg-accent text-white hover:opacity-90",
  ghost: "bg-transparent text-text-primary hover:bg-primary/10",
  success: "bg-primary text-white hover:bg-primary-dark",
};

const sizeClasses: Record<Size, string> = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-base",
  nav: "px-3 py-2 text-md",
};

const justifyClasses: Record<Justify, string> = {
  center: "justify-center",
  between: "justify-between",
  start: "justify-start",
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  fullWidth = false,
  loading = false,
  icon,
  iconPosition = "left",
  justify = "center",
  className,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={clsx(
        "rounded-lg font-medium transition flex items-center gap-2",
        justifyClasses[justify],
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && "w-full",
        "disabled:opacity-60 disabled:cursor-not-allowed",
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
