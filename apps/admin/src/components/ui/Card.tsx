import React from "react";
import clsx from "clsx";

interface CardProps {
  title?: string;
  value?: string | number;
  children?: React.ReactNode;
  className?: string;
  subtle?: boolean; // softer background
}

export function Card({ title, value, children, className, subtle }: CardProps) {
  return (
    <div
      className={clsx(
        "group relative rounded-2xl border border-slate-200/70 dark:border-slate-800/60 bg-white/70 dark:bg-slate-900/40 backdrop-blur shadow-sm hover:shadow-md hover:-translate-y-[1px] transition-all p-5",
        subtle && "bg-slate-50/80 dark:bg-slate-900/30",
        className
      )}
    >
      {title && (
        <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
          {title}
        </div>
      )}
      {value !== undefined && (
        <div className="mt-1 text-3xl font-semibold">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-sky-600 to-violet-600">
            {value}
          </span>
        </div>
      )}
      {children && <div className="mt-4 text-sm text-slate-700 dark:text-slate-300">{children}</div>}
    </div>
  );
}
