import Head from 'next/head';

export default function Home() {
  return (
    <main className="bg-bg-100 min-h-screen">
      <div className="relative bg-bg-100 py-16 overflow-hidden">
        <div
          className="pointer-events-none absolute inset-y-0 right-0 w-[58%] opacity-60"
          style={{ WebkitMaskImage: 'linear-gradient(to left, rgba(0,0,0,1) 70%, rgba(0,0,0,0) 100%)', maskImage: 'linear-gradient(to left, rgba(0,0,0,1) 70%, rgba(0,0,0,0) 100%)' }}
        >
          <svg className="w-full h-full" viewBox="0 0 1600 600" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" aria-hidden="true">
            <defs>
              <linearGradient id="welcomeArc" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#DDE6F5" />
                <stop offset="100%" stopColor="#EEF3FB" />
              </linearGradient>
            </defs>
            {Array.from({ length: 20 }).map((_, i) => {
              const y = 90 + i * 22;
              const ctrl = -30 + i * 18 + (i % 5) * 6 - 12;
              return (
                <path key={i} d={`M-220 ${y} Q 800 ${ctrl} 1820 ${y + 18}`} fill="none" stroke="url(#welcomeArc)" className="wave-line" strokeWidth="0.8" />
              );
            })}
          </svg>
        </div>
        <div className="relative z-10 max-w-screen-xl mx-auto px-6">
          <h1 className="text-3xl font-bold mb-4">Welcome to Sri Lanka Government Citizen Services</h1>
          <p className="text-text-600 text-lg leading-relaxed mb-8 max-w-3xl">
            Book, manage, and track your public service appointments in minutes.
          </p>
          <div className="flex gap-4">
            <button className="bg-primary-600 text-white px-6 py-3 rounded-md font-semibold">Overview</button>
            <button className="border-2 border-primary-700 text-primary-700 px-6 py-3 rounded-md font-semibold">Contact Directory</button>
          </div>
        </div>
      </div>
    </main>
  );
}
