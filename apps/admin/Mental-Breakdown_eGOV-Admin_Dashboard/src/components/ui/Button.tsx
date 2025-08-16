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
  const base = "inline-flex items-center justify-center rounded-xl font-medium transition-all focus:outline-none focus:ring-2 focus:ring-sky-400/60 disabled:opacity-60 disabled:cursor-not-allowed";

  const sizes: Record<Size, string> = {
    sm: "text-xs px-3 py-1.5",
    md: "text-sm px-4 py-2",
    lg: "text-base px-5 py-2.5",
  };

  const variants: Record<Variant, string> = {
    primary: "bg-gradient-to-r from-sky-600 to-violet-600 text-white hover:brightness-110 shadow-sm",
    secondary: "bg-slate-200 text-slate-900 hover:bg-slate-300",
    destructive: "bg-red-600 text-white hover:bg-red-700",
    outline: "border border-slate-300 text-slate-700 hover:bg-slate-50",
    ghost: "text-slate-700 hover:bg-slate-100",
    soft: "bg-sky-50 text-sky-700 hover:bg-sky-100",
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
