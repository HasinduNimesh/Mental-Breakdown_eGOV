import React from 'react';
import Link from 'next/link';
import { ChevronRightIcon, HomeIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'next-i18next';

export interface Crumb {
  label: string;
  href?: string;
}

type BreadcrumbsProps = { items: Crumb[]; className?: string; tone?: 'default' | 'light' };

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, className = '', tone = 'default' }) => {
  const { t } = useTranslation();
  if (!items || items.length === 0) return null;
  const first = items[0];
  const rest = items.slice(1);
  const isLight = tone === 'light';
  return (
    <nav className={`text-sm ${isLight ? 'text-blue-100' : 'text-text-600'} ${className}`} aria-label="Breadcrumb">
      <ol className="flex items-center gap-1 flex-wrap">
        <li className="flex items-center gap-1">
          <Link href={first.href || '/'} className={`inline-flex items-center gap-1 ${isLight ? 'text-white hover:text-white' : 'hover:text-primary-700'}`}>
            <HomeIcon className={`w-4 h-4 ${isLight ? 'text-white' : ''}`} />
            <span>{t('nav_home', 'Home')}</span>
          </Link>
        </li>
        {rest.map((it, idx) => (
          <li key={idx} className="flex items-center gap-1">
            <ChevronRightIcon className={`w-4 h-4 ${isLight ? 'text-blue-100' : 'text-text-400'}`} />
            {it.href ? (
              <Link href={it.href} className={`${isLight ? 'text-blue-100 hover:text-white' : 'hover:text-primary-700'}`}>{it.label}</Link>
            ) : (
              <span className={`${isLight ? 'text-white' : 'text-text-800'}`}>{it.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
