import React from 'react'
import Link from 'next/link'

export const Layout: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-30 border-b bg-white/80 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-blue-600 text-white grid place-items-center font-bold">GO</div>
            <div className="font-semibold">GovOff — Officer Console</div>
          </div>
          <nav className="text-sm text-gray-600">Secure</nav>
        </div>
      </header>
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6 px-4 py-6">
    <aside className="hidden lg:block">
          <div className="sticky top-[76px] space-y-2">
      <Link href="/dashboard" className="block px-3 py-2 rounded hover:bg-slate-100 text-slate-800">Dashboard</Link>
      <Link href="/search" className="block px-3 py-2 rounded hover:bg-slate-100 text-slate-800">Search</Link>
      <Link href="/reports" className="block px-3 py-2 rounded hover:bg-slate-100 text-slate-800">Reports</Link>
            <div className="mt-4 text-xs text-slate-500">Quick filters</div>
            <div className="text-sm text-slate-700">Today, Upcoming, Completed</div>
          </div>
        </aside>
        <main className="min-w-0">{children}</main>
      </div>
      <footer className="border-t bg-white">
        <div className="max-w-7xl mx-auto px-4 py-3 text-sm text-gray-600">© Government of Sri Lanka</div>
      </footer>
    </div>
  )
}
