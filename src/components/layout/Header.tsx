import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useUIStore } from '@/stores';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

export const Header: React.FC = () => {
  const router = useRouter();
  const { isMobileMenuOpen, setMobileMenuOpen } = useUIStore();

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Book Appointment', href: '/book' },
    { name: 'My Appointments', href: '/appointments' },
    { name: 'Citizen Portal', href: '/citizen' },
    { name: 'Help', href: '/help' },
  ];

  return (
    <header className="bg-white shadow-sm border-b border-border">
      <div className="max-w-screen-xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">SL</span>
              </div>
              <div className="text-text-900 font-bold text-lg">
                Sri Lanka Gov Services
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`px-3 py-2 text-sm font-medium transition-colors ${
                  router.pathname === item.href
                    ? 'text-primary-700 border-b-2 border-primary-700'
                    : 'text-text-700 hover:text-primary-700'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              type="button"
              className="p-2 rounded-md text-text-700 hover:text-primary-700"
              onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <XMarkIcon className="w-6 h-6" />
              ) : (
                <Bars3Icon className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-border">
            <div className="py-3 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`block px-3 py-2 text-base font-medium transition-colors ${
                    router.pathname === item.href
                      ? 'text-primary-700 bg-primary-50'
                      : 'text-text-700 hover:text-primary-700 hover:bg-bg-100'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
