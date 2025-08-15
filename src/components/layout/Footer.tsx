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
import { FOOTER_DETAILS, FOOTER_COLUMNS } from '@/lib/footerConfig';
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
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* About column */}
          <div ref={orgCardObs.ref as any} className={`rounded-xl border border-white/20 bg-white/5 backdrop-blur-sm p-6 transition-all duration-700 ease-out ${orgCardObs.inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
            <div className="mb-4">
              <div className="mt-1 text-lg font-extrabold tracking-wide">{FOOTER_DETAILS.orgName}</div>
              <div className="text-sm text-blue-100 leading-snug">{FOOTER_DETAILS.address}</div>
            </div>
            <ul className="space-y-2 text-blue-100 text-sm">
              <li className="flex items-center gap-2"><MapPinIcon className="w-4 h-4" /><span>{FOOTER_DETAILS.address}</span></li>
              <li className="flex items-center gap-2"><PhoneIcon className="w-4 h-4" /><span>{FOOTER_DETAILS.phones[0]}</span></li>
              <li className="flex items-center gap-2"><DevicePhoneMobileIcon className="w-4 h-4" /><span>{FOOTER_DETAILS.phones[1]}</span></li>
              <li className="flex items-center gap-2"><EnvelopeIcon className="w-4 h-4" /><span>{FOOTER_DETAILS.email}</span></li>
            </ul>
          </div>

          {/* Three concise columns */}
          {FOOTER_COLUMNS.map((col, idx) => (
            <div key={col.title} ref={(idx === 0 ? navCardObs.ref : idx === 1 ? mediaCardObs.ref : undefined) as any} className={`rounded-xl border border-white/20 bg-white/5 backdrop-blur-sm p-6 transition-all duration-700 ease-out ${idx === 0 ? 'delay-100' : idx === 1 ? 'delay-200' : 'delay-300'} ${ (idx === 0 ? navCardObs.inView : idx === 1 ? mediaCardObs.inView : true) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
              <h4 className="text-blue-100 font-bold text-lg mb-4">{col.title}</h4>
              <ul className="space-y-2 text-blue-100 text-sm">
                {col.items.map((item: NavigationItem) => (
                  <li key={item.label}>
                    <a href={item.href} className="group flex items-center gap-2 hover:text-white">
                      <ChevronRightIcon className="w-4 h-4 opacity-70 group-hover:opacity-100 transition-transform group-hover:translate-x-0.5" />
                      <span>{item.label}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Emergency / Hotline block */}
        <div className="mt-8 rounded-xl border border-white/20 bg-red-600/20 text-white p-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="font-semibold">Emergency / Hotline</div>
            <div className="text-sm">Hours: 8:00 AM – 8:00 PM (Mon–Fri)</div>
            <div className="text-base font-bold">Short code: 1919</div>
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
