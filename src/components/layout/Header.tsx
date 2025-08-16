import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { LanguageSwitcher } from './LanguageSwitcher';
import { Bars3Icon, XMarkIcon, PhoneIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'next-i18next';
import { useAuth } from '@/contexts/AuthContext';

const navigation = [
  { name: 'Services', href: '/services' },
  { name: 'Documents', href: '/documents' },
  { name: 'Help', href: '/help' },
];

export const Header: React.FC = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const { user, loading, signOut } = useAuth();

  const [isMobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [showSearch, setShowSearch] = React.useState(false);
  const searchRef = React.useRef<HTMLInputElement>(null);
  React.useEffect(() => { if (showSearch) searchRef.current?.focus(); }, [showSearch]);

  const [scrolled, setScrolled] = React.useState(false);
  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const [profileOpen, setProfileOpen] = React.useState(false);
  const profileRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    if (!profileOpen) return;
    const onDocClick = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setProfileOpen(false); };
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDocClick); document.removeEventListener('keydown', onKey); };
  }, [profileOpen]);

  React.useEffect(() => {
    const close = () => setProfileOpen(false);
    router.events.on('routeChangeStart', close);
    return () => router.events.off('routeChangeStart', close);
  }, [router.events]);

  function initialsFromEmail(email?: string | null) {
    if (!email) return 'U';
    const name = email.split('@')[0] || 'U';
    const parts = name.replace(/[^a-zA-Z]/g, ' ').trim().split(/\s+/);
    const first = parts[0]?.[0] || 'U';
    const second = parts[1]?.[0] || '';
    return (first + second).toUpperCase();
  }

  return (
    <>
      <div className="bg-blue-900 text-blue-100/90 text-[12.5px] h-8 hidden md:flex items-center border-b border-[#2C4A9A]">
        <Container className="max-w-[1200px] px-6 flex justify-end items-center">
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <span className="hidden sm:flex items-center gap-1"><PhoneIcon className="w-3 h-3" /><span>1919</span></span>
            <Link href="/sitemap" className="hover:underline hidden sm:inline">Site Map</Link>
          </div>
        </Container>
      </div>

      <header className="bg-white border-b border-border sticky top-0 z-40">
        <Container className="relative max-w-[1200px] px-6">
          <div className={`flex items-center justify-between ${scrolled ? 'h-14' : 'h-16'} transition-[height] duration-200`}>
            <Link href="/" aria-label="Home" className="flex items-center gap-3">
              <img src="/logo.svg" alt={t('logo_alt', 'Sri Lanka Coat of Arms')} className="h-9 w-auto" />
              <div className="leading-tight hidden md:block">
                <div className="text-[14px] font-semibold text-[#163B8F]">Government of Sri Lanka</div>
                <div className="text-[12px] font-medium text-[#4B5563]">Citizen Services Portal</div>
              </div>
              <div className="md:hidden text-[14px] font-semibold text-[#163B8F]">Citizen Services</div>
            </Link>

            <nav className="hidden md:flex items-center gap-6">
              <div className="flex items-center gap-6 ml-8">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    aria-current={router.pathname === item.href ? 'page' : undefined}
                    className={`px-1 py-2 text-[16px] font-medium transition-colors relative ${router.pathname === item.href ? 'text-primary-700' : 'text-text-700 hover:text-primary-700'}`}
                  >
                    {item.name}
                    {router.pathname === item.href && (
                      <span className="absolute -bottom-0.5 left-0 right-0 h-0.5 bg-[#2D5BFF]" aria-hidden />
                    )}
                  </Link>
                ))}
              </div>

              <div className="flex items-center gap-4 ml-6">
                <div className="relative">
                  <button className="p-2 rounded-md hover:bg-bg-100 focus:outline-none focus:ring-2 focus:ring-[#93B4FF]" aria-label="Open search" aria-expanded={showSearch} onClick={() => setShowSearch((v) => !v)}>
                    <MagnifyingGlassIcon className="w-5 h-5" />
                  </button>
                  {showSearch && (
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[280px] bg-white border border-border rounded-md shadow-lg p-2 z-50">
                      <div className="flex items-center gap-2">
                        <MagnifyingGlassIcon className="w-5 h-5 text-text-500" />
                        <input
                          ref={searchRef}
                          type="search"
                          placeholder="Search services, departments…"
                          className="flex-1 outline-none text-sm"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              const term = (e.target as HTMLInputElement).value.trim();
                              if (term) router.push(`/services?query=${encodeURIComponent(term)}`);
                              setShowSearch(false);
                            } else if (e.key === 'Escape') {
                              setShowSearch(false);
                            }
                          }}
                          onBlur={() => setShowSearch(false)}
                        />
                      </div>
                    </div>
                  )}
                </div>
                {user && (
                  <Button href="/services" size="md" className="h-10 px-4 rounded-lg bg-[#2D5BFF] text-white hover:bg-[#224BE6] focus:outline-none focus:ring-2 focus:ring-[#93B4FF]">
                    Book appointment
                  </Button>
                )}
                {user && (
                  <Button href="/appointments" variant="outline" size="md" className="h-10 px-3 rounded-lg border border-[#2D5BFF] text-[#2D5BFF] hover:bg-[#EEF3FF] focus:outline-none focus:ring-2 focus:ring-[#93B4FF]">
                    My appointments
                  </Button>
                )}
                {user ? (
                  <div className="relative" ref={profileRef}>
                    <button
                      className="ml-1 w-7 h-7 rounded-full bg-text-200 text-text-800 text-xs font-semibold flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-[#93B4FF]"
                      aria-haspopup="menu"
                      aria-expanded={profileOpen}
                      aria-controls="profile-menu"
                      title={user.email || 'Account'}
                      onClick={() => setProfileOpen((v) => !v)}
                    >
                      {initialsFromEmail(user.email)}
                    </button>
                    {profileOpen && (
                      <div id="profile-menu" role="menu" className="absolute right-0 mt-2 w-56 bg-white text-text-900 border border-border rounded-[10px] shadow-2xl">
                        <Link href="/appointments" className="block px-3 py-2 text-[13px] hover:bg-bg-100" role="menuitem">My appointments</Link>
                        <Link href="/documents" className="block px-3 py-2 text-[13px] hover:bg-bg-100" role="menuitem">Upload documents</Link>
                        <Link href="/track" className="block px-3 py-2 text-[13px] hover:bg-bg-100" role="menuitem">Track booking</Link>
                        <Link href="/profile" className="block px-3 py-2 text-[13px] hover:bg-bg-100" role="menuitem">Profile</Link>
                        <button className="w-full text-left px-3 py-2 text-[13px] hover:bg-bg-100" onClick={() => signOut()} role="menuitem">Sign out</button>
                      </div>
                    )}
                  </div>
                ) : (
                  loading ? (
                    <div className="h-10 w-[172px] rounded-lg bg-bg-100 border border-border animate-pulse" aria-hidden />
                  ) : (
                    <div className="flex items-center gap-2">
                      <Button href="/signin" variant="outline" size="md" className="h-10 px-4 rounded-lg border border-[#1A4DCC] text-[#1A4DCC] bg-white hover:bg-[#F5F8FF] focus:outline-none focus:ring-2 focus:ring-[#93B4FF]">Sign in</Button>
                      <Button href="/signup" size="md" className="h-10 px-4 rounded-lg bg-[#1A4DCC] text-white hover:bg-[#153FA6] focus:outline-none focus:ring-2 focus:ring-[#93B4FF]">Sign up</Button>
                    </div>
                  )
                )}
              </div>
            </nav>

            <div className="md:hidden flex items-center gap-2">
              {user && (
                <Link href="/services" className="inline-flex items-center justify-center h-9 px-3 rounded-lg bg-[#2D5BFF] text-white text-sm font-semibold hover:bg-[#224BE6] focus:outline-none focus:ring-2 focus:ring-[#93B4FF]">
                  Book
                </Link>
              )}
              <button
                type="button"
                className="p-2 rounded-md text-text-700 hover:bg-bg-100 focus:outline-none focus:ring-2 focus:ring-[#93B4FF]"
                aria-label="Open search"
                aria-expanded={showSearch}
                onClick={() => { setShowSearch((v) => !v); if (isMobileMenuOpen) setMobileMenuOpen(false); }}
              >
                <MagnifyingGlassIcon className="w-6 h-6" />
              </button>
              <button
                type="button"
                className="p-2 rounded-md text-text-700 hover:text-primary-700"
                onClick={() => { setMobileMenuOpen(!isMobileMenuOpen); if (showSearch) setShowSearch(false); }}
                aria-label={isMobileMenuOpen ? t('close_menu', 'Close menu') : t('open_menu', 'Open menu')}
              >
                {isMobileMenuOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {showSearch && (
            <div className="md:hidden absolute right-4 top-full mt-2 w-[min(90vw,320px)] bg-white border border-border rounded-md shadow-lg p-2 z-50">
              <div className="flex items-center gap-2">
                <MagnifyingGlassIcon className="w-5 h-5 text-text-500" />
                <input
                  ref={searchRef}
                  type="search"
                  placeholder="Search services, departments…"
                  className="flex-1 outline-none text-sm"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const term = (e.target as HTMLInputElement).value.trim();
                      if (term) router.push(`/services?query=${encodeURIComponent(term)}`);
                      setShowSearch(false);
                    } else if (e.key === 'Escape') {
                      setShowSearch(false);
                    }
                  }}
                  onBlur={() => setShowSearch(false)}
                />
              </div>
            </div>
          )}

          {isMobileMenuOpen && (
            <div className="md:hidden border-t border-border">
              <div className="py-3 space-y-1">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`block px-3 py-2 text-base font-medium transition-colors ${router.pathname === item.href ? 'text-primary-700 bg-primary-50' : 'text-text-700 hover:text-primary-700 hover:bg-bg-100'}`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
                <div className="px-3 py-2 flex items-center justify-between">
                  <LanguageSwitcher />
                  <span className="flex items-center gap-1 text-text-600"><PhoneIcon className="w-4 h-4" />1919</span>
                </div>
                {user && (
                  <Button href="/services" className="mx-3 my-2 w-[calc(100%-1.5rem)] justify-center" onClick={() => setMobileMenuOpen(false)}>
                    Book appointment
                  </Button>
                )}
                {user && (
                  <Button href="/appointments" variant="outline" className="mx-3 mb-2 w-[calc(100%-1.5rem)] justify-center" onClick={() => setMobileMenuOpen(false)}>
                    My appointments
                  </Button>
                )}
                {!user && (
                  loading ? (
                    <div className="mx-3 mb-3 w-[calc(100%-1.5rem)] h-10 rounded-lg bg-bg-100 border border-border animate-pulse" aria-hidden />
                  ) : (
                    <div className="mx-3 mb-3 flex gap-2">
                      <Link href="/signin" className="flex-1 inline-flex items-center justify-center h-10 px-3 rounded-lg bg-white border border-[#1A4DCC] text-[#1A4DCC] text-sm font-semibold hover:bg-[#F5F8FF] focus:outline-none focus:ring-2 focus:ring-[#93B4FF]">Sign in</Link>
                      <Link href="/signup" className="inline-flex items-center justify-center h-10 px-3 rounded-lg bg-[#1A4DCC] text-white text-sm font-semibold hover:bg-[#153FA6] focus:outline-none focus:ring-2 focus:ring-[#93B4FF]">Sign up</Link>
                    </div>
                  )
                )}
              </div>
            </div>
          )}
        </Container>
      </header>
    </>
  );
};

export default Header;
