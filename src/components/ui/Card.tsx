import React from "react";
import clsx from "clsx";

interface CardProps {
  title?: string;
  value?: string | number;
  children?: React.ReactNode;
  className?: string;
}

export function Card({ title, value, children, className }: CardProps) {
  return (
    <div className={clsx("rounded-2xl border bg-white shadow-sm p-5", className)}>
      {title && (
        <div className="text-sm text-gray-500">
          {title}
        </div>
      )}
      {value && (
        <div className="mt-2 text-3xl font-semibold">
          {value}
        </div>
      )}
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
}
