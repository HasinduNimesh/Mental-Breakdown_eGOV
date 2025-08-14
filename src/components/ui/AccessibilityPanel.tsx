import React from 'react';
import { useUIStore } from '@/stores';

interface AccessibilityPanelProps {
  open: boolean;
  onClose: () => void;
  panelId?: string;
}

export const AccessibilityPanel: React.FC<AccessibilityPanelProps> = ({ open, onClose, panelId = 'a11y-panel' }) => {
  const { accessibility, setAccessibility } = useUIStore();
  const panelRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);

    // Focus the first focusable element inside the panel
    const firstFocusable = panelRef.current?.querySelector<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    firstFocusable?.focus();

    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const toggle = (key: 'highContrast' | 'largeText') => (e: React.ChangeEvent<HTMLInputElement>) => {
    setAccessibility({ [key]: e.target.checked });
  };

  const reset = () => setAccessibility({ highContrast: false, largeText: false });

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/30 z-40"
        aria-hidden="true"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        id={panelId}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${panelId}-title`}
        className="fixed bottom-24 right-6 z-50 w-[22rem] max-w-[90vw] rounded-lg bg-white border border-border shadow-card focus:outline-none"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
          <h2 id={`${panelId}-title`} className="text-sm font-semibold text-text-700">Accessibility options</h2>
          <button
            type="button"
            className="text-sm text-text-500 hover:text-text-700 focus:outline-none focus:ring-2 focus:ring-primary-700 rounded"
            onClick={onClose}
            aria-label="Close accessibility options"
          >
            ✕
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-sm font-medium text-text-700">High contrast</div>
              <p className="text-xs text-text-500">Increase contrast for improved readability.</p>
            </div>
            <label className="inline-flex items-center cursor-pointer select-none">
              <input
                type="checkbox"
                className="sr-only"
                checked={accessibility.highContrast}
                onChange={toggle('highContrast')}
                aria-label="Toggle high contrast mode"
              />
              <span
                aria-hidden="true"
                className={`relative inline-block h-6 w-11 rounded-full transition-colors ${
                  accessibility.highContrast ? 'bg-primary-700' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                    accessibility.highContrast ? 'translate-x-5' : ''
                  }`}
                />
              </span>
            </label>
          </div>

          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-sm font-medium text-text-700">Large text</div>
              <p className="text-xs text-text-500">Slightly enlarge text across the site.</p>
            </div>
            <label className="inline-flex items-center cursor-pointer select-none">
              <input
                type="checkbox"
                className="sr-only"
                checked={accessibility.largeText}
                onChange={toggle('largeText')}
                aria-label="Toggle large text"
              />
              <span
                aria-hidden="true"
                className={`relative inline-block h-6 w-11 rounded-full transition-colors ${
                  accessibility.largeText ? 'bg-primary-700' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                    accessibility.largeText ? 'translate-x-5' : ''
                  }`}
                />
              </span>
            </label>
          </div>

          <div className="pt-2 flex items-center justify-between">
            <button
              type="button"
              onClick={reset}
              className="text-sm text-text-600 hover:text-text-900 underline underline-offset-4 focus:outline-none focus:ring-2 focus:ring-primary-700 rounded"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={onClose}
              className="text-sm bg-primary-700 text-white px-3 py-1.5 rounded-md hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-white"
            >
              Done
            </button>
          </div>
        </div>

        <div className="sr-only" role="status" aria-live="polite">
          High contrast {accessibility.highContrast ? 'on' : 'off'}. Large text {accessibility.largeText ? 'on' : 'off'}.
        </div>
      </div>
    </>
  );
};
