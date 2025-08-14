import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useUIStore } from '@/stores';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { LanguageSwitcher } from './LanguageSwitcher';
import { Bars3Icon, XMarkIcon, PhoneIcon } from '@heroicons/react/24/outline';
import HeaderSearch from './HeaderSearch';

export const Header: React.FC = () => {
  const router = useRouter();
  const { isMobileMenuOpen, setMobileMenuOpen } = useUIStore();

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'About', href: '/about' },
    { name: 'Services', href: '/services' },
    { name: 'News & Notices', href: '/news' },
    { name: 'Contact', href: '/contact' },
  ];

  return (
    <>
      {/* Top Government Banner */}
      <div className="bg-blue-900 text-white text-xs py-1">
        <Container className="flex justify-between items-center">
          <div className="flex items-center gap-2 md:gap-4">
            <span className="hidden sm:inline">පුරවැසි සේවා</span>
            <span className="hidden sm:inline">|</span>
            <span className="hidden sm:inline">குடிமக்கள் சேவைகள்</span>
            <span className="hidden sm:inline">|</span>
            <span>Citizen Services</span>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <div className="flex items-center gap-1">
              <PhoneIcon className="w-3 h-3" />
              <span>1919</span>
            </div>
            <LanguageSwitcher />
            <Link href="/sitemap" className="hover:underline hidden sm:inline">Site Map</Link>
          </div>
        </Container>
      </div>

      {/* Main Header */}
  <header className="bg-white shadow-sm border-b border-border sticky top-0 z-40">
        <Container>
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo and Title */}
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <img 
                  src="/logo.svg" 
                  alt="Sri Lanka Coat of Arms" 
                  className="h-12 sm:h-16 w-auto"
                />
                <div>
                  <div className="text-primary-900 font-bold text-sm sm:text-lg leading-tight">
                    Government of Sri Lanka
                  </div>
                  <div className="text-primary-700 text-xs sm:text-sm">
                    Citizen Services Portal
                  </div>
                </div>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6">
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
              <div className="w-px h-6 bg-border" aria-hidden />
              <HeaderSearch />
              <Button href="/book" size="md">Book Appointment</Button>
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
                <div className="px-3 py-2">
                  {/* Simple search input for mobile */}
                  <div className="relative">
                    <input
                      type="search"
                      placeholder="Search services..."
                      className="w-full border border-border rounded-md px-3 py-2 text-sm"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          const term = (e.target as HTMLInputElement).value.trim();
                          if (term) {
                            setMobileMenuOpen(false);
                            router.push(`/services?query=${encodeURIComponent(term)}`);
                          }
                        }
                      }}
                    />
                  </div>
                </div>
                <Button href="/book" className="mx-3 my-2 w-[calc(100%-1.5rem)] justify-center" onClick={() => setMobileMenuOpen(false)}>
                  Book Appointment
                </Button>
              </div>
            </div>
          )}
        </Container>

      </header>
    </>
  );
};
