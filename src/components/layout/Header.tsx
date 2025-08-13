import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useUIStore } from '@/stores';
import { Bars3Icon, XMarkIcon, PhoneIcon } from '@heroicons/react/24/outline';

export const Header: React.FC = () => {
  const router = useRouter();
  const { isMobileMenuOpen, setMobileMenuOpen } = useUIStore();

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'About Us', href: '/about' },
    { name: 'Services', href: '/citizen' },
    { name: 'News', href: '/news' },
    { name: 'Contact', href: '/contact' },
  ];

  return (
    <>
      {/* Top Government Banner */}
      <div className="bg-blue-900 text-white text-xs py-1">
        <div className="max-w-screen-xl mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <span>ගෝව් 91 / වන / 92 / වන / 93 / වන</span>
            <span>|</span>
            <span>அரசாங்க சேவைகள்</span>
            <span>|</span>
            <span>Government Services</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <PhoneIcon className="w-3 h-3" />
              <span>1919</span>
            </div>
            <Link href="/sitemap" className="hover:underline">Site Map</Link>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="bg-white shadow-sm border-b border-border">
        <div className="max-w-screen-xl mx-auto px-6">
          <div className="flex items-center justify-between h-20">
            {/* Logo and Title */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <img 
                  src="/logo.svg" 
                  alt="Sri Lanka Coat of Arms" 
                  className="w-12 h-12"
                />
                <div>
                  <div className="text-primary-900 font-bold text-lg leading-tight">
                    Government of Sri Lanka
                  </div>
                  <div className="text-primary-700 text-sm">
                    Citizen Services Portal
                  </div>
                </div>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`px-3 py-2 text-sm font-medium transition-colors relative ${
                    router.pathname === item.href
                      ? 'text-primary-700'
                      : 'text-text-700 hover:text-primary-700'
                  }`}
                >
                  {item.name}
                  {router.pathname === item.href && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-700" />
                  )}
                </Link>
              ))}
              <Link
                href="/book"
                className="bg-primary-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-700 transition-colors"
              >
                Book Service
              </Link>
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
                <Link
                  href="/book"
                  className="block mx-3 my-2 bg-primary-600 text-white px-4 py-2 rounded-md text-sm font-medium text-center hover:bg-primary-700 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Book Service
                </Link>
              </div>
            </div>
          )}
        </div>
      </header>
    </>
  );
};
