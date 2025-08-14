import React from 'react';
import Link from 'next/link';
import { ChevronRightIcon, HomeIcon } from '@heroicons/react/24/outline';

export interface Crumb {
  label: string;
  href?: string;
}

export const Breadcrumbs: React.FC<{ items: Crumb[]; className?: string }> = ({ items, className = '' }) => {
  if (!items || items.length === 0) return null;
  const first = items[0];
  const rest = items.slice(1);
  return (
    <nav className={`text-sm text-text-600 ${className}`} aria-label="Breadcrumb">
      <ol className="flex items-center gap-1 flex-wrap">
        <li className="flex items-center gap-1">
          <Link href={first.href || '/'} className="inline-flex items-center gap-1 hover:text-primary-700">
            <HomeIcon className="w-4 h-4" />
            <span>Home</span>
          </Link>
        </li>
        {rest.map((it, idx) => (
          <li key={idx} className="flex items-center gap-1">
            <ChevronRightIcon className="w-4 h-4 text-text-400" />
            {it.href ? (
              <Link href={it.href} className="hover:text-primary-700">{it.label}</Link>
            ) : (
              <span className="text-text-800">{it.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
