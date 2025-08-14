import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { MagnifyingGlassIcon, ClockIcon } from '@heroicons/react/24/outline';
import { SEARCH_ITEMS, expandQuery } from '@/lib/searchIndex';

export const HeaderSearch: React.FC = () => {
  const router = useRouter();
  const [q, setQ] = React.useState('');
  const [open, setOpen] = React.useState(false);
  const [activeIdx, setActiveIdx] = React.useState(0);
  const [recent, setRecent] = React.useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem('recent-searches');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const results = React.useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return [];
    const terms = expandQuery(query);
    return SEARCH_ITEMS.filter((it) => {
      const hay = (it.label + ' ' + (it.tags?.join(' ') ?? '')).toLowerCase();
      return terms.every((t) => hay.includes(t));
    }).slice(0, 8);
  }, [q]);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('recent-searches', JSON.stringify(recent.slice(0, 6)));
  }, [recent]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const term = q.trim();
    if (!term) return;
    setRecent((r) => [term, ...r.filter((x) => x !== term)].slice(0, 6));
    router.push(`/services?query=${encodeURIComponent(term)}`);
    setOpen(false);
  };

  const onKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (!open) return;
    const listLen = (q ? results.length : recent.length);
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, Math.max(0, listLen - 1)));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      if (q && results.length > 0) {
        router.push(results[activeIdx]?.href ?? results[0].href);
        setOpen(false);
      } else if (!q && recent.length > 0) {
        const term = recent[activeIdx] ?? recent[0];
        setQ(term);
        router.push(`/services?query=${encodeURIComponent(term)}`);
        setOpen(false);
      }
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  return (
    <div className="relative w-full max-w-sm" onBlur={() => setTimeout(() => setOpen(false), 120)}>
      <form onSubmit={onSubmit} className="relative">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-500" />
        <input
          aria-label="Search services and departments"
          placeholder="Search services and departments..."
          className="w-full pl-10 pr-3 py-2 rounded-md border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary-700"
          value={q}
          onChange={(e) => { setQ(e.target.value); setOpen(true); setActiveIdx(0); }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
        />
      </form>

      {open && (q ? results.length > 0 : recent.length > 0) && (
        <div className="absolute mt-1 w-full bg-white border border-border rounded-md shadow-lg z-30">
          {q ? (
            <ul role="listbox" aria-label="Search results" className="max-h-80 overflow-auto">
              {results.map((r, i) => (
                <li key={r.id} role="option" aria-selected={i === activeIdx}>
                  <Link
                    href={r.href}
                    className={`flex items-center gap-2 px-3 py-2 text-sm hover:bg-bg-100 ${i === activeIdx ? 'bg-bg-100' : ''}`}
                    onMouseEnter={() => setActiveIdx(i)}
                    onClick={() => setOpen(false)}
                  >
                    <MagnifyingGlassIcon className="w-4 h-4 text-text-500" />
                    <span className="truncate">{r.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div>
              <div className="px-3 py-2 text-xs text-text-500">Recent searches</div>
              <ul className="max-h-60 overflow-auto">
                {recent.map((term, i) => (
                  <li key={term}>
                    <button
                      className={`w-full text-left flex items-center gap-2 px-3 py-2 text-sm hover:bg-bg-100 ${i === activeIdx ? 'bg-bg-100' : ''}`}
                      onMouseEnter={() => setActiveIdx(i)}
                      onClick={() => {
                        setQ(term);
                        router.push(`/services?query=${encodeURIComponent(term)}`);
                        setOpen(false);
                      }}
                    >
                      <ClockIcon className="w-4 h-4 text-text-500" />
                      <span className="truncate">{term}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default HeaderSearch;
