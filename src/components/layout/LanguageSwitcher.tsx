import React from 'react';
import { useRouter } from 'next/router';

const langs = [
  { code: 'si', label: 'සි' },
  { code: 'ta', label: 'தமிழ்' },
  { code: 'en', label: 'EN' },
] as const;

export const LanguageSwitcher: React.FC = () => {
  const router = useRouter();
  const active = router.locale ?? 'en';

  const switchTo = (locale: string) => {
    try {
      // Persist preference for 1 year
      const oneYear = 365 * 24 * 60 * 60;
      document.cookie = `NEXT_LOCALE=${locale}; Max-Age=${oneYear}; Path=/`;
    } catch {}
  // Let Next.js compute the correct localized URL; do not override `as` with the old path
  router.replace(router.asPath, undefined, { locale });
  };

  return (
    <div className="inline-flex items-center gap-1" role="group" aria-label="Language selector">
      {langs.map((l) => (
        <button
          key={l.code}
          type="button"
          onClick={() => switchTo(l.code)}
          aria-current={active === l.code ? 'true' : undefined}
          className={`px-2.5 py-1 rounded-md text-[11px] leading-none font-semibold transition-colors border ${
            active === l.code
              ? 'bg-white text-primary-900 border-white'
              : 'bg-primary-800/40 text-white/90 border-white/20 hover:bg-primary-700'
          }`}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
};

export default LanguageSwitcher;
