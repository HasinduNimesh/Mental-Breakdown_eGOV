import React from 'react';
import { useTranslation } from 'next-i18next';
import {
  DocumentTextIcon,
  AcademicCapIcon,
  ComputerDesktopIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  DevicePhoneMobileIcon,
  GlobeAltIcon,
  PlayCircleIcon,
  ChevronRightIcon,
  InformationCircleIcon,
  CalendarDaysIcon,
  SpeakerWaveIcon,
  ClipboardDocumentListIcon,
} from '@heroicons/react/24/outline';
import { FOOTER_DETAILS, FOOTER_NAV_LEFT, FOOTER_NAV_RIGHT } from '@/lib/footerConfig';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { NoticeRail } from '@/components/notice/NoticeRail';
import { GovAction } from '@/components/ui/GovAction';
import { useInView } from '@/lib/hooks/useInView';
import { AccessibilityPanel } from '@/components/ui/AccessibilityPanel';

interface NavigationItem {
  label: string;
  href: string;
}

export const WelcomeDashboard: React.FC = () => {
  const { t } = useTranslation('common');
  // Footer animation observers
  const orgCardObs = useInView();
  const navCardObs = useInView({ threshold: 0.1 });
  const mediaCardObs = useInView({ threshold: 0.1 });

  return (
    <div>
      {/* Skip to content */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-accent-500 text-white px-4 py-2 rounded-md z-50 focus:outline-none focus:ring-2 focus:ring-white"
      >
        Skip to content
      </a>

      {/* Hero Section */}
  <section className="relative overflow-hidden bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-white">
        {/* Background pattern */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-black/10" />
          {/* Government-style pattern */}
          <svg className="absolute right-0 top-0 h-full w-1/2 opacity-10" viewBox="0 0 400 400" aria-hidden="true">
            <defs>
              <pattern id="govt-pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M20 0L30 10L20 20L10 10Z" fill="white" opacity="0.3"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#govt-pattern)" />
          </svg>
        </div>

        {/* Hero Content */}
  <Container className="relative py-16 sm:py-20 lg:py-28">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div>
              <div className="text-blue-200 text-xs sm:text-sm uppercase tracking-wider mb-4 font-semibold">
                OUR MISSION IS <span className="text-orange-400">FOR YOU!</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight mb-6">
                WELCOME TO<br />
                <span className="text-blue-200">GOVERNMENT CITIZEN</span><br />
                SERVICES
              </h1>
              <p className="text-lg sm:text-xl text-blue-100 mb-6 sm:mb-8 max-w-xl">
                "Public service should be the birthright of every citizen"
              </p>
              <p className="text-base sm:text-lg text-blue-200 mb-6 sm:mb-8 max-w-xl">
                Book, manage, and track your public service appointments with ease. 
                Access passport services, driving licenses, registrations, and more.
              </p>
              <div className="flex flex-col sm:flex-row flex-wrap gap-4">
                <Button size="lg" variant="secondary">Explore Services</Button>
                <Button size="lg" variant="outline" className="border-white text-white hover:text-blue-900">Contact Directory</Button>
              </div>
            </div>
            
            {/* Right side with decorative elements */}
            <div className="relative hidden lg:block">
              <div className="absolute top-8 right-8 w-72 h-48 rounded-lg bg-white/10 border border-white/20 backdrop-blur-sm transform rotate-6 shadow-2xl">
                <div className="p-6">
                  <div className="text-white font-semibold mb-2">Digital Services</div>
                  <div className="text-blue-200 text-sm">Quick & Efficient</div>
                </div>
              </div>
              <div className="absolute top-32 right-16 w-64 h-40 rounded-lg bg-white/5 border border-white/20 backdrop-blur-sm transform -rotate-3 shadow-xl">
                <div className="p-6">
                  <div className="text-white font-semibold mb-2">Citizen First</div>
                  <div className="text-blue-200 text-sm">Service Excellence</div>
                </div>
              </div>
            </div>
          </div>
  </Container>
      </section>

      {/* Announcement Rail (unique) */}
      <section className="relative -mt-12 z-10">
        <Container>
          <NoticeRail
            pills={[
              { label: 'Latest', tone: 'warning' },
              { label: 'National Level ICT Championship Competition - 2025', tone: 'info' },
              { label: 'Higher Education Sector', tone: 'success' },
              { label: 'Vocational Education Sector', tone: 'brand' },
            ]}
            items={[
              {
                id: 1,
                title: 'Passport One-Day Service',
                description: 'Extended service slots available this week for urgent passport applications.',
                tone: 'info',
                href: '/news/passport-one-day',
              },
              {
                id: 2,
                title: 'Digital Services Update',
                description: 'New online appointment system now available for all major government services.',
                tone: 'success',
                href: '/notices/maintenance',
              },
            ]}
          />
        </Container>
  </section>

      {/* Government Services Grid */}
      <section className="bg-white py-12 sm:py-16">
  <Container>
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Quick Access Services</h2>
            <p className="text-base sm:text-lg text-gray-600">Access essential government services with just a few clicks</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
            <GovAction
              href="/book"
              label="Book Appointment"
              icon={CalendarDaysIcon}
              colors={{ from: 'from-blue-500', to: 'to-blue-600', ring: 'ring-blue-200' }}
            />
            <GovAction
              href="/appointments"
              label="My Appointments"
              icon={ClipboardDocumentListIcon}
              colors={{ from: 'from-green-500', to: 'to-green-600', ring: 'ring-green-200' }}
            />
            <GovAction
              href="/documents"
              label="Upload Documents"
              icon={DocumentTextIcon}
              colors={{ from: 'from-purple-500', to: 'to-purple-600', ring: 'ring-purple-200' }}
            />
            <GovAction
              href="/citizen"
              label="Find Offices"
              icon={MapPinIcon}
              colors={{ from: 'from-orange-500', to: 'to-orange-600', ring: 'ring-orange-200' }}
            />
            <GovAction
              href="/help"
              label="Help Center"
              icon={InformationCircleIcon}
              colors={{ from: 'from-red-500', to: 'to-red-600', ring: 'ring-red-200' }}
            />
            <GovAction
              href="/citizen"
              label="Citizen Portal"
              icon={AcademicCapIcon}
              colors={{ from: 'from-indigo-500', to: 'to-indigo-600', ring: 'ring-indigo-200' }}
            />
          </div>
  </Container>
      </section>

      {/* Welcome Section */}
      <section id="main-content" className="relative bg-bg-100 py-16 overflow-hidden">
        {/* Decorative arcs background for welcome area */}
        <div
          className="pointer-events-none absolute inset-y-0 right-0 w-[58%] opacity-60"
          style={{
            WebkitMaskImage: 'linear-gradient(to left, rgba(0,0,0,1) 70%, rgba(0,0,0,0) 100%)',
            maskImage: 'linear-gradient(to left, rgba(0,0,0,1) 70%, rgba(0,0,0,0) 100%)',
          }}
        >
          <svg
            className="w-full h-full"
            viewBox="0 0 1600 600"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
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
                <path
                  key={i}
                  d={`M-220 ${y} Q 800 ${ctrl} 1820 ${y + 18}`}
                  fill="none"
                  stroke="url(#welcomeArc)"
                  className="wave-line"
                  strokeWidth="0.8"
                />
              );
            })}
          </svg>
        </div>
  <Container className="relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Welcome Text */}
                <div className="lg:col-span-2">
                  <h2 className="text-h2 font-bold text-text-900 mb-6">
                    Welcome to the Government Services Portal of Sri Lanka
                  </h2>
                  <p className="text-text-600 text-lg leading-relaxed mb-8">
                    Book appointments for key services like passports, driving licences, consular attestation, and civil registrations. Get reminders, check in on-site, and track your token in real time.
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <Button>Overview</Button>
                    <Button variant="outline">Contact Directory</Button>
                  </div>
                </div>

                {/* Feature Card */}
                <div className="relative">
                  <Card className="overflow-hidden">
                    <div className="w-full h-48 bg-gradient-to-br from-blue-100 to-primary-100 flex items-center justify-center">
                      <div className="text-center">
                        <CalendarDaysIcon className="w-16 h-16 text-primary-600 mx-auto mb-2" />
                        <p className="text-text-600 text-sm">Citizen Services</p>
                      </div>
                    </div>
                    <div className="absolute bottom-3 left-3">
                      <span className="bg-primary-700 text-white px-3 py-1 rounded text-sm font-medium">
                        Queue & Check-in
                      </span>
                    </div>
                  </Card>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-4 space-y-4">
              {[
                { icon: CalendarDaysIcon, label: 'Holiday Calendar', href: '/citizen' },
                { icon: InformationCircleIcon, label: 'Right to Information', href: '/rti' },
                { icon: ComputerDesktopIcon, label: 'Service Status', href: '/citizen' },
                { icon: DocumentTextIcon, label: 'Citizenship Charter', href: '/charter' },
              ].map((action, index) => (
                <a
                  key={index}
                  href={action.href}
                  className="flex items-center p-4 bg-white border border-border rounded-md shadow-card hover:shadow-lg hover:bg-bg-100 transition-all duration-200"
                >
                  <action.icon className="w-5 h-5 text-primary-600 mr-3" />
                  <span className="text-text-700 font-medium">{action.label}</span>
                </a>
              ))}
            </div>
          </div>
  </Container>
      </section>

      {/* News and Notices */}
      <section className="bg-white py-16">
  <Container>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Latest News */}
            <div className="bg-white border border-border rounded-lg shadow-card p-6">
              <h3 className="text-h3 font-bold text-text-900 mb-6">Latest News</h3>
              <div className="space-y-4">
                {[
                  { title: 'Passport One-Day service extended in Colombo', date: '2025-07-21', category: 'Immigration', href: '/news/passport-one-day' },
                  { title: 'Driving Licence renewals now by appointment', date: '2025-07-18', category: 'Motor Traffic', href: '/news/licence-renewal' },
                  { title: 'Consular Mobile Service announced for Kandy', date: '2025-07-12', category: 'Foreign Affairs', href: '/news/consular-mobile' },
                ].map((item, index) => (
                  <a key={index} href={item.href} className="block group">
                    <div className="grid grid-cols-1 gap-2">
                      <h4 className="text-text-900 font-medium group-hover:text-primary-700 transition-colors">
                        {item.title}
                      </h4>
                      <div className="flex items-center justify-between text-sm">
                        <time className="text-text-500">{new Date(item.date).toLocaleDateString()}</time>
                        <span className="text-primary-600 text-xs font-medium">{item.category}</span>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            {/* Special Notices */}
            <div className="bg-white border border-border rounded-lg shadow-card p-6">
              <h3 className="text-h3 font-bold text-text-900 mb-6">Special Notices</h3>
              <div className="space-y-4">
                {[
                  { title: 'Registrar General: Online copies for Birth/Marriage available', date: '2025-08-01', category: 'Registrations', href: '/notices/rg-online-copies' },
                  { title: 'e-Services maintenance window on Sunday 1–3 AM', date: '2025-07-25', category: 'System', href: '/notices/maintenance' },
                  { title: 'Public Grievance hotline available 24x7', date: '2025-07-05', category: 'Citizen', href: '/notices/grievance' },
                ].map((item, index) => (
                  <a key={index} href={item.href} className="block group">
                    <div className="grid grid-cols-1 gap-2">
                      <h4 className="text-text-900 font-medium group-hover:text-primary-700 transition-colors">
                        {item.title}
                      </h4>
                      <div className="flex items-center justify-between text-sm">
                        <time className="text-text-500">{new Date(item.date).toLocaleDateString()}</time>
                        <span className="text-primary-600 text-xs font-medium">{item.category}</span>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>
  </Container>
      </section>

      {/* Partners and Quick Links */}
      <section className="relative bg-bg-100 py-16 overflow-hidden">
        {/* Decorative arcs background */}
        <div className="pointer-events-none absolute inset-0 opacity-60">
          <svg className="w-full h-full" viewBox="0 0 1600 600" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" aria-hidden="true">
            <defs>
              <linearGradient id="bgArc" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#DDE6F5" />
                <stop offset="100%" stopColor="#EEF3FB" />
              </linearGradient>
            </defs>
            {Array.from({ length: 22 }).map((_, i) => {
              const y = 80 + i * 22;
              const ctrl = -40 + i * 18 + (i % 4) * 7 - 10;
              return (
                <path
                  key={i}
                  d={`M-200 ${y} Q 800 ${ctrl} 1800 ${y + 20}`}
                  fill="none"
                  stroke="url(#bgArc)"
                  className="wave-line"
                  strokeWidth="0.8"
                />
              );
            })}
          </svg>
        </div>

  <Container className="relative">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Partners (scrollable) */}
            <div className="lg:col-span-2">
              <Card className="p-6">
                <h3 className="text-h3 font-bold text-text-900 mb-6 font-heading">Partner Agencies</h3>
                <div className="relative">
                  <div id="partners-scroll" className="flex gap-4 overflow-x-auto scroll-smooth no-scrollbar pb-2">
                    {[
                      { name: 'Department of Immigration & Emigration' },
                      { name: 'Department of Motor Traffic' },
                      { name: 'Ministry of Foreign Affairs' },
                      { name: 'Registrar General Department' },
                      { name: 'Government Information Center (1919)' },
                      { name: 'Gov.lk' },
                    ].map((partner, index) => (
                      <a key={index} href="#" className="flex-none w-56 flex items-center justify-center p-4 border border-border rounded-md hover:bg-bg-100 transition-colors">
                        <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center text-xs text-center">
                          {partner.name.split(' ').map(word => word[0]).join('')}
                        </div>
                      </a>
                    ))}
                  </div>
                  <div className="mt-3 flex justify-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-primary-600/60" />
                    <span className="w-2 h-2 rounded-full bg-border" />
                    <span className="w-2 h-2 rounded-full bg-border" />
                  </div>
                </div>
              </Card>
            </div>

            {/* Quick Links */}
            <div className="bg-primary-900 text-white rounded-lg shadow-card p-6">
              <h3 className="text-h3 font-bold mb-6 font-heading">Quick Links</h3>
              <div className="space-y-3">
                {[
                  { title: 'Passport – One-Day', href: '/book' },
                  { title: 'Driving Licence – Renewal', href: '/book' },
                  { title: 'Consular Attestation', href: '/book' },
                  { title: 'RG – Birth/Marriage Certificates', href: '/citizen' },
                  { title: 'Public Grievance', href: '/help' },
                  { title: 'Holiday Calendar', href: '/citizen' },
                ].map((link, index) => (
                  <a
                    key={index}
                    href={link.href}
                    className="flex items-center gap-3 px-4 py-3 bg-white/10 border border-white/20 rounded-full text-sm hover:bg-white/20 transition-colors font-body"
                  >
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-white text-primary-900 font-bold">
                      {index + 1}
                    </span>
                    <span className="flex-1">{link.title}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
  </Container>
      </section>

  {/* Floating Accessibility Button (moves up only when BackToTop is visible) */}
  <AccessibilityButton />

  {/* Footer moved to global Layout */}
    </div>
  );
};

// Internal component to keep file cohesive without exporting globally
const AccessibilityButton: React.FC = () => {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 offset-for-btt">
      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls="a11y-panel"
        aria-label="Accessibility options"
        className="inline-flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-3 rounded-full shadow-lg bg-accent-500 text-white hover:bg-accent-600 focus:outline-none focus:ring-2 focus:ring-white"
        onClick={() => setOpen(true)}
      >
        <InformationCircleIcon className="w-5 h-5" />
        <span className="hidden sm:inline">Accessibility</span>
      </button>

      <AccessibilityPanel open={open} onClose={() => setOpen(false)} />
    </div>
  );
};