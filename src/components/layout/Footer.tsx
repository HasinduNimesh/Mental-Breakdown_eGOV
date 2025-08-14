import React from 'react';
import {
  MapPinIcon,
  PhoneIcon,
  DevicePhoneMobileIcon,
  EnvelopeIcon,
  PlayCircleIcon,
  GlobeAltIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';
import { FOOTER_DETAILS, FOOTER_NAV_LEFT, FOOTER_NAV_RIGHT } from '@/lib/footerConfig';
import { useInView } from '@/lib/hooks/useInView';

interface NavigationItem {
  label: string;
  href: string;
}

export const Footer: React.FC = () => {
  const orgCardObs = useInView();
  const navCardObs = useInView({ threshold: 0.1 });
  const mediaCardObs = useInView({ threshold: 0.1 });

  return (
    <footer className="relative bg-primary-900 text-white">
      {/* Background pattern (denser arcs) */}
      <div className="pointer-events-none absolute inset-0 opacity-40">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" viewBox="0 0 1600 500" aria-hidden="true">
          <defs>
            <linearGradient id="footerArc" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </linearGradient>
          </defs>
          {Array.from({ length: 28 }).map((_, i) => {
            const y = 60 + i * 16;
            const ctrl = -120 + i * 14 + (i % 6) * 9 - 18;
            return (
              <path
                key={i}
                d={`M-300 ${y} Q 700 ${ctrl} 1900 ${y + 18}`}
                fill="none"
                stroke="url(#footerArc)"
                className="wave-line"
                strokeWidth="1"
              />
            );
          })}
        </svg>
      </div>

      <div className="relative max-w-screen-xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Org/Contact Panel */}
          <div
            ref={orgCardObs.ref as any}
            className={`rounded-xl border border-white/20 bg-white/5 backdrop-blur-sm p-6 transition-all duration-700 ease-out ${
              orgCardObs.inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
          >
            <div className="mb-4">
              <div className="text-sm text-blue-100 leading-snug">
                අදාල සංස්ථාව, උසස් අධ්‍යාපන සහ වෘත්තීය අධ්‍යාපන අමාත්‍යාංශය<br />
                கல்வி, உயர் கல்வி மற்றும் தொழில் கல்வி அமைச்சு
              </div>
              <div className="mt-2 text-lg font-extrabold tracking-wide">{FOOTER_DETAILS.orgName}</div>
            </div>

            <ul className="space-y-3 text-blue-100">
              <li className="flex items-start gap-3">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-black/70"><MapPinIcon className="w-4 h-4" /></span>
                <span className="text-sm">{FOOTER_DETAILS.address}</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-black/70"><PhoneIcon className="w-4 h-4" /></span>
                <span className="text-sm">{FOOTER_DETAILS.phones[0]}</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-black/70"><DevicePhoneMobileIcon className="w-4 h-4" /></span>
                <span className="text-sm">{FOOTER_DETAILS.phones[1]}</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-black/70"><EnvelopeIcon className="w-4 h-4" /></span>
                <span className="text-sm">{FOOTER_DETAILS.email}</span>
              </li>
            </ul>

            <div className="mt-4 flex items-center gap-3">
              <a href="#" aria-label="Facebook" className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-white text-primary-900 hover:opacity-90 transition"><span className="font-bold">f</span></a>
              <a href="#" aria-label="YouTube" className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-white text-primary-900 hover:opacity-90 transition"><PlayCircleIcon className="w-6 h-6" /></a>
            </div>
          </div>

          {/* Site Navigations */}
          <div
            ref={navCardObs.ref as any}
            className={`rounded-xl border border-white/20 bg-white/5 backdrop-blur-sm p-6 transition-all duration-700 ease-out delay-100 ${
              navCardObs.inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
          >
            <h4 className="text-blue-100 font-bold text-lg mb-4">Site Navigations</h4>
            <ul className="space-y-2 text-blue-100 text-sm">
              {FOOTER_NAV_LEFT.map((item: NavigationItem) => (
                <li key={item.label}>
                  <a href={item.href} className="group flex items-center gap-2 hover:text-white">
                    <ChevronRightIcon className="w-4 h-4 opacity-70 group-hover:opacity-100 transition-transform group-hover:translate-x-0.5" />
                    <span>{item.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Media Center */}
          <div
            ref={mediaCardObs.ref as any}
            className={`rounded-xl border border-white/20 bg-white/5 backdrop-blur-sm p-6 transition-all duration-700 ease-out delay-200 ${
              mediaCardObs.inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
          >
            <h4 className="text-blue-100 font-bold text-lg mb-4">Media Center</h4>
            <ul className="space-y-2 text-blue-100 text-sm">
              {FOOTER_NAV_RIGHT.map((item: NavigationItem) => (
                <li key={item.label}>
                  <a href={item.href} className="group flex items-center gap-2 hover:text-white">
                    <ChevronRightIcon className="w-4 h-4 opacity-70 group-hover:opacity-100 transition-transform group-hover:translate-x-0.5" />
                    <span>{item.label}</span>
                  </a>
                </li>
              ))}
            </ul>

            <div className="my-4 border-t border-white/20" />
            <div className="flex items-center justify-between text-blue-100 text-xs">
              <div>FOR ALL THE GOVERNMENT CITIZEN SERVICES INFORMATION</div>
              <div className="flex items-center gap-2">
                <GlobeAltIcon className="w-4 h-4" />
                <a className="font-semibold hover:text-white underline-offset-4 hover:underline" href={FOOTER_DETAILS.govLinkHref} target="_blank" rel="noreferrer">
                  {FOOTER_DETAILS.govLinkText}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Legal */}
      <div className="relative border-t border-primary-800">
        <div className="max-w-screen-xl mx-auto px-6 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-blue-200">
            <p>
              Copyright © {FOOTER_DETAILS.copyrightYear} – {FOOTER_DETAILS.copyrightOwner} | All Rights Reserved
            </p>
            <div className="flex space-x-6 mt-2 md:mt-0">
              <a href="/terms" className="hover:text-white transition-colors">Terms and Services</a>
              <a href="/privacy" className="hover:text-white transition-colors">Privacy</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
