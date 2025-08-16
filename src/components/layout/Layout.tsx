import Link from "next/link";
import React from "react";

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
}

export function Layout({ children, title }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 text-slate-900 dark:text-slate-100">
      {/* Decorative background grid */}
      <div className="pointer-events-none fixed inset-0 -z-10 bg-grid-slate-100/60 dark:bg-grid-slate-800/30 [mask-image:radial-gradient(ellipse_at_center,black,transparent_65%)]" />

      {/* Sidebar (desktop) */}
      <aside className="hidden md:flex fixed inset-y-0 left-0 w-72 border-r border-slate-200/60 dark:border-slate-800/60 bg-white/70 dark:bg-slate-900/40 backdrop-blur supports-[backdrop-filter]:backdrop-blur-md">
        <div className="flex h-full flex-col p-4">
          <div className="px-2 py-3">
            <Link href="/dashboard" className="flex items-center gap-2">
              <span className="inline-block h-3 w-3 rounded-full bg-gradient-to-tr from-sky-500 to-violet-500" />
              <span className="text-sm font-semibold tracking-wide">
                eGov Admin
              </span>
            </Link>
          </div>

          <nav className="mt-6 space-y-1">
            <SidebarLink href="/dashboard" label="Super Admin" />
            <SidebarLink href="/health_ministry" label="Health Ministry" />
          </nav>

          <div className="mt-auto pt-4 text-xs text-slate-500/80">
            © {new Date().getFullYear()} eGov System
          </div>
        </div>
      </aside>

      {/* Top bar (mobile + desktop) */}
      <header className="sticky top-0 z-20 border-b border-slate-200/60 dark:border-slate-800/60 bg-white/70 dark:bg-slate-900/40 backdrop-blur supports-[backdrop-filter]:backdrop-blur-md">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between md:pl-[calc(1rem+18rem)]">
          <h1 className="text-base font-semibold bg-clip-text text-transparent bg-gradient-to-r from-sky-500 to-violet-500">
            {title || "Admin Dashboard"}
          </h1>

          {/* Simple inline nav for mobile */}
          <nav className="flex gap-4 md:hidden text-sm">
            <Link href="/dashboard" className="hover:opacity-80">Super Admin</Link>
            <Link href="/health_ministry" className="hover:opacity-80">Health Ministry</Link>
          </nav>
        </div>
      </header>

      {/* Main content (push for sidebar on md+) */}
      <main className="mx-auto w-full max-w-6xl px-4 py-6 md:pl-[18rem]">
        {children}
      </main>
    </div>
  );
}

function SidebarLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="group block rounded-xl px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100/70 dark:hover:bg-slate-800/40 hover:shadow-sm transition-colors"
    >
      <div className="flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-slate-300 group-hover:bg-gradient-to-tr group-hover:from-sky-500 group-hover:to-violet-500 transition-all" />
        <span>{label}</span>
      </div>
    </Link>
  );
}
