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
  // Derive a tone class from the gradient 'from-*' for icon/text tinting
  const tone = from.replace('from-', 'text-');

  return (
    <Link
      href={href}
      aria-label={label}
      className={`group relative block overflow-hidden rounded-2xl bg-white border border-border shadow-[0_0_15px_rgba(0,0,0,0.09)] hover:shadow-[0_10px_25px_rgba(0,0,0,0.10)] transition-all duration-300 hover:-translate-y-1 ${className}`}
      {...rest}
    >
      {/* Decorative corner bubble with glass effect */}
      <div className={`pointer-events-none absolute -right-5 -top-7 h-24 w-24 rounded-full bg-gradient-to-br ${from} ${to} dec-bubble z-0`}>
        <div className="absolute inset-0 rounded-full bg-white/20 backdrop-blur-[1px] border border-white/30"></div>
      </div>      {/* Inset outline */}
      <div className={`absolute inset-0 rounded-2xl ring-1 ${ring} pointer-events-none`} />

      <div className="px-6 sm:px-9 py-6 sm:py-9 space-y-3">
        {/* Icon aligned to top-left like the reference design */}
        <div className={`${tone} w-10 h-10 sm:w-12 sm:h-12`}> 
          <Icon className="w-10 h-10 sm:w-12 sm:h-12" />
        </div>
        <div className="font-bold text-base sm:text-lg text-text-700 group-hover:text-primary-700 transition-colors">
          {label}
        </div>
        <div className="pt-2">
          <span className="inline-flex items-center gap-1 text-sm text-text-500 group-hover:text-primary-700 transition-transform translate-x-0 group-hover:translate-x-1">
            <ChevronRightIcon className="h-4 w-4" />
          </span>
        </div>
      </div>
    </Link>
  );
};

export default GovAction;
