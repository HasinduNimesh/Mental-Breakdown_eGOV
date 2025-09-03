import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { LanguageSwitcher } from './LanguageSwitcher';
import { Bars3Icon, XMarkIcon, PhoneIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'next-i18next';
import { useAuth } from '@/contexts/AuthContext';

type NavItem = { name: string; href: string; label: string };
const navigation: NavItem[] = [
  { name: 'nav_home', href: '/', label: 'Home' },
  { name: 'nav_about', href: '/about', label: 'About' },
  { name: 'nav_services', href: '/services', label: 'Services' },
  { name: 'nav_news', href: '/news', label: 'News' },
  { name: 'nav_contact', href: '/contact', label: 'Contact' },
  { name: 'nav_help', href: '/help', label: 'Help' },
  { name: 'nav_feedback', href: '/feedback', label: 'Feedback' },
];

export const Header: React.FC = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const { user, loading, signOut } = useAuth();

  const [isMobileMenuOpen, setMobileMenuOpen] = React.useState(false);
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
                <div className="text-[14px] font-semibold text-[#163B8F]">{t('site_gov_name', 'Government of Sri Lanka')}</div>
                <div className="text-[12px] font-medium text-[#4B5563]">{t('site_portal_name', 'Citizen Services Portal')}</div>
              </div>
              <div className="md:hidden text-[14px] font-semibold text-[#163B8F]">{t('site_portal_short', 'Citizen Services')}</div>
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
          {t(item.name, item.label)}
                    {router.pathname === item.href && (
                      <span className="absolute -bottom-0.5 left-0 right-0 h-0.5 bg-[#2D5BFF]" aria-hidden />
                    )}
                  </Link>
                ))}
              </div>

              <div className="flex items-center gap-4 ml-6">
        {user && (
                  <Button href="/services" size="md" className="h-10 px-4 rounded-lg bg-[#2D5BFF] text-white hover:bg-[#224BE6] focus:outline-none focus:ring-2 focus:ring-[#93B4FF]">
          {t('cta_book', 'Book service')}
                  </Button>
                )}
        {user && (
                  <Button href="/appointments" variant="outline" size="md" className="h-10 px-3 rounded-lg border border-[#2D5BFF] text-[#2D5BFF] hover:bg-[#EEF3FF] focus:outline-none focus:ring-2 focus:ring-[#93B4FF]">
          {t('cta_my_appointments', 'My appointments')}
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
                        <Link href="/appointments" className="block px-3 py-2 text-[13px] hover:bg-bg-100" role="menuitem">{t('nav_my_appointments', 'My appointments')}</Link>
                        <Link href="/documents" className="block px-3 py-2 text-[13px] hover:bg-bg-100" role="menuitem">{t('nav_upload_docs', 'Upload documents')}</Link>
                        <Link href="/track" className="block px-3 py-2 text-[13px] hover:bg-bg-100" role="menuitem">{t('nav_track_booking', 'Track booking')}</Link>
                        <Link href="/profile" className="block px-3 py-2 text-[13px] hover:bg-bg-100" role="menuitem">{t('nav_profile', 'Profile')}</Link>
                        <button className="w-full text-left px-3 py-2 text-[13px] hover:bg-bg-100" onClick={() => signOut()} role="menuitem">{t('nav_sign_out', 'Sign out')}</button>
                      </div>
                    )}
                  </div>
                ) : (
                  loading ? (
                    <div className="h-10 w-[172px] rounded-lg bg-bg-100 border border-border animate-pulse" aria-hidden />
                  ) : (
                    <div className="flex items-center gap-2">
                      <Button href="/signin" variant="outline" size="md" className="h-10 px-4 rounded-lg border border-[#1A4DCC] text-[#1A4DCC] bg-white hover:bg-[#F5F8FF] focus:outline-none focus:ring-2 focus:ring-[#93B4FF]">{t('nav_sign_in', 'Sign in')}</Button>
                      <Button href="/signup" size="md" className="h-10 px-4 rounded-lg bg-[#1A4DCC] text-white hover:bg-[#153FA6] focus:outline-none focus:ring-2 focus:ring-[#93B4FF]">{t('nav_sign_up', 'Sign up')}</Button>
                    </div>
                  )
                )}
              </div>
            </nav>

            <div className="md:hidden flex items-center gap-2">
        {user && (
                <Link href="/services" className="inline-flex items-center justify-center h-9 px-3 rounded-lg bg-[#2D5BFF] text-white text-sm font-semibold hover:bg-[#224BE6] focus:outline-none focus:ring-2 focus:ring-[#93B4FF]">
          {t('cta_book_short', 'Book')}
                </Link>
              )}
              {user && (
                <button
                  className="w-7 h-7 rounded-full bg-text-200 text-text-800 text-xs font-semibold flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-[#93B4FF]"
                  title={user.email || 'Account'}
                  onClick={() => setProfileOpen((v) => !v)}
                  aria-haspopup="menu"
                  aria-expanded={profileOpen}
                  aria-controls="profile-menu"
                >
                  {initialsFromEmail(user.email)}
                </button>
              )}
              <button
                type="button"
                className="p-2 rounded-md text-text-700 hover:text-primary-700"
                onClick={() => { setMobileMenuOpen(!isMobileMenuOpen); }}
                aria-label={isMobileMenuOpen ? t('close_menu', 'Close menu') : t('open_menu', 'Open menu')}
              >
                {isMobileMenuOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile inline nav bar (keep items in the nav bar, not in the drawer) */}
          <div className="md:hidden border-t border-border">
            <div className="flex items-center gap-5 px-2 py-2 overflow-x-auto no-scrollbar">
        {navigation.map((item) => (
                <Link
          key={item.name}
                  href={item.href}
                  aria-current={router.pathname === item.href ? 'page' : undefined}
                  className={`whitespace-nowrap px-1 py-1.5 text-[15px] font-medium transition-colors relative ${router.pathname === item.href ? 'text-primary-700' : 'text-text-700 hover:text-primary-700'}`}
                >
          {t(item.name, item.label)}
                  {router.pathname === item.href && (
                    <span className="absolute -bottom-0.5 left-0 right-0 h-0.5 bg-[#2D5BFF]" aria-hidden />
                  )}
                </Link>
              ))}
            </div>
          </div>

          {isMobileMenuOpen && (
            <div className="md:hidden border-t border-border">
              <div className="py-3 space-y-1">
                {/* Mobile requirement: no nav list items in the drawer */}
                <div className="px-3 py-2 flex items-center justify-between">
                  <LanguageSwitcher />
                  <span className="flex items-center gap-1 text-text-600"><PhoneIcon className="w-4 h-4" />1919</span>
                </div>
                <Button
                  href="/services"
                  className="mx-3 my-2 w-[calc(100%-1.5rem)] justify-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t('cta_book', 'Book service')}
                </Button>
                <Button
                  href={user ? "/appointments" : "/signin?next=/appointments"}
                  variant="outline"
                  className="mx-3 mb-2 w-[calc(100%-1.5rem)] justify-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t('cta_my_appointments', 'My appointments')}
                </Button>
                {user && (
                  <button
                    className="mx-3 mb-3 w-[calc(100%-1.5rem)] h-10 rounded-lg border border-border text-[13px] font-medium hover:bg-bg-100"
                    onClick={() => { setMobileMenuOpen(false); signOut(); }}
                  >
                    {t('nav_sign_out', 'Sign out')}
                  </button>
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
