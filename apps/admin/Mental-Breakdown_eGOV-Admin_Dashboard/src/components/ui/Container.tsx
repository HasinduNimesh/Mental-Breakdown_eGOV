import React from "react";
import clsx from "clsx";

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function Container({ children, className }: ContainerProps) {
  return (
    <div className={clsx("mx-auto w-full max-w-7xl px-4", className)}>
      {children}
    </div>
  );
}
