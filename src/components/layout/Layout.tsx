import Link from "next/link";
import React from "react";
import dynamic from "next/dynamic";
import { ThemeToggle } from "../ThemeToggle";
const Clock = dynamic(() => import("../clock"), { ssr: false });

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
}

export function Layout({ children, title }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 text-slate-900 dark:text-slate-100">
      {/* Sticky header only (no sidebar) */}
      <header className="sticky top-0 z-20 border-b border-slate-200/60 dark:border-slate-800/60 bg-white/70 dark:bg-slate-900/40 backdrop-blur supports-[backdrop-filter]:backdrop-blur-md">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
          <h1 className="text-base font-semibold bg-clip-text text-transparent bg-gradient-to-r from-sky-500 to-violet-500">
            {title || "Admin Dashboard"}
          </h1>
          <div className="flex items-center gap-3">
            <ThemeToggle />
          <Clock />
        </div>
      </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-6">
        {children}
      </main>
    </div>
  );
}

