import Link from "next/link";
import React from "react";
import dynamic from "next/dynamic";
import { ThemeToggle } from "../ThemeToggle";
const Clock = dynamic(() => import("../Clock"), { ssr: false });

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
}

export function Layout({ children, title }: LayoutProps) {
  return (
    <div className="min-h-screen bg-bg-50 text-text-900">
      {/* Sticky header only (no sidebar) */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-border">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary-600 to-accent-600" />
            <span className="font-semibold">Officer Dashboard</span>
          </div>
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
