import React from "react";
import clsx from "clsx";

type Variant = "primary" | "secondary" | "destructive" | "outline" | "ghost" | "soft";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  leftIcon,
  rightIcon,
  className,
  ...props
}: ButtonProps) {
  const base = "inline-flex items-center justify-center rounded-md font-medium transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-700 disabled:opacity-60 disabled:cursor-not-allowed";

  const sizes: Record<Size, string> = {
    sm: "text-xs px-3 py-1.5",
    md: "text-sm px-4 py-2",
    lg: "text-base px-5 py-2.5",
  };

  const variants: Record<Variant, string> = {
    primary: "bg-primary-700 text-white hover:bg-primary-800",
    secondary: "bg-accent-500 text-white hover:bg-accent-600",
    destructive: "bg-red-600 text-white hover:bg-red-700",
    outline: "border-2 border-primary-700 text-primary-700 hover:bg-primary-700 hover:text-white",
    ghost: "text-primary-700 hover:bg-bg-100",
    soft: "bg-info-300/20 text-primary-700 hover:bg-info-300/30",
  };

  return (
    <button className={clsx(base, sizes[size], variants[variant], className)} disabled={loading || props.disabled} {...props}>
      {leftIcon && <span className={clsx("mr-2", loading && "opacity-0")}>{leftIcon}</span>}
      <span className={clsx(loading && "opacity-0")}>{children}</span>
      {rightIcon && <span className={clsx("ml-2", loading && "opacity-0")}>{rightIcon}</span>}
      {loading && (
        <span className="absolute inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent" aria-hidden />
      )}
    </button>
  );
}
