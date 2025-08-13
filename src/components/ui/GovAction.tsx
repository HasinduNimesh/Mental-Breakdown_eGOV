import React from 'react';
import Link from 'next/link';
import { ChevronRightIcon } from '@heroicons/react/24/outline';

export interface GovActionProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  label: string;
  icon: React.ElementType;
  colors?: {
    from: string; // tailwind class e.g., 'from-blue-500'
    to: string;   // tailwind class e.g., 'to-blue-600'
    ring?: string; // e.g., 'ring-blue-200'
  };
}

/**
 * A distinctive quick action tile for government services.
 * - Subtle neumorphic container with inner border
 * - Gradient icon capsule with soft glow on hover
 * - Sliding chevron indicator
 */
export const GovAction: React.FC<GovActionProps> = ({ href, label, icon: Icon, colors, className = '', ...rest }) => {
  const from = colors?.from ?? 'from-primary-600';
  const to = colors?.to ?? 'to-primary-700';
  const ring = colors?.ring ?? 'ring-primary-200';

  return (
    <Link
      href={href}
      aria-label={label}
      className={`group relative block rounded-2xl bg-white border border-border shadow-card hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${className}`}
      {...rest}
    >
      {/* Corner accent */}
      <div className="pointer-events-none absolute right-0 top-0 h-14 w-14 rounded-bl-[2rem] bg-gradient-to-br from-black/0 via-black/0 to-black/[0.04]" />

      {/* Inset outline */}
      <div className={`absolute inset-0 rounded-2xl ring-1 ${ring} pointer-events-none`} />

      <div className="flex flex-col items-center px-8 py-7">
        <div
          className={`relative mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br ${from} ${to} text-white shadow-lg transition-transform duration-300 group-hover:scale-110`}
        >
          {/* soft glow */}
          <div className="absolute -inset-1 rounded-full bg-white/10 blur-sm opacity-0 group-hover:opacity-100 transition-opacity" />
          <Icon className="relative z-[1] h-8 w-8" />
        </div>
        <div className="text-center font-medium text-text-700 group-hover:text-primary-700 transition-colors">
          {label}
        </div>
        <div className="mt-3 h-5">
          <span className="inline-flex items-center gap-1 text-sm text-text-500 group-hover:text-primary-700 transition-transform translate-x-0 group-hover:translate-x-1">
            <ChevronRightIcon className="h-4 w-4" />
          </span>
        </div>
      </div>
    </Link>
  );
};

export default GovAction;
