import React from 'react';

export const BackToTop: React.FC = () => {
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY || document.documentElement.scrollTop;
      setVisible(y > 300);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Toggle a body class so other floating buttons can avoid overlap
  React.useEffect(() => {
    const cls = 'btt-visible';
    if (visible) {
      document.body.classList.add(cls);
    } else {
      document.body.classList.remove(cls);
    }
    return () => document.body.classList.remove(cls);
  }, [visible]);

  const scrollToTop = () => {
    const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const behavior: ScrollBehavior | undefined = prefersReducedMotion ? 'auto' : 'smooth';
    try {
      window.scrollTo({ top: 0, behavior });
    } catch {
      window.scrollTo(0, 0);
    }
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 text-primary-700">
      <button
        type="button"
        aria-label="Back to top"
        className="back-to-top"
        onClick={scrollToTop}
      >
        <div className="text" aria-hidden>
          <span>Back</span>
          <span>to</span>
          <span>top</span>
        </div>
        <div className="clone" aria-hidden>
          <span>Back</span>
          <span>to</span>
          <span>top</span>
        </div>
        <svg strokeWidth={2} stroke="currentColor" viewBox="0 0 24 24" fill="none" className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" width="20">
          <path d="M14 5l7 7m0 0l-7 7m7-7H3" strokeLinejoin="round" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
};

export default BackToTop;
