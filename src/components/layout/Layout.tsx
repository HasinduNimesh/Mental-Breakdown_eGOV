import Link from "next/link";
import React from "react";

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
}

export function Layout({ children, title }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white shadow-sm">
        <div className="mx-auto max-w-6xl px-4 py-3 flex justify-between items-center">
          <h1 className="text-lg font-bold">{title || "Admin Dashboard"}</h1>
          <nav className="flex gap-6">
            <Link href="/dashboard" className="hover:underline">
              Super Admin
            </Link>
            <Link href="/health_ministry" className="hover:underline">
              Health Ministry
            </Link>
          </nav>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 mx-auto w-full max-w-6xl px-4 py-6">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t bg-white py-3 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} eGov System
      </footer>
    </div>
  );
}
