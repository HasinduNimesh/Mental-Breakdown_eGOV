// Lightweight analytics & experiments helper
// Sends events to window.dataLayer (if present) and console in dev.

export type AnalyticsEvent =
  | 'search_submit'
  | 'search_suggestion_click'
  | 'search_recent_click'
  | 'filter_change'
  | 'sort_change'
  | 'service_book_click'
  | 'service_view_details'
  | 'booking_started'
  | 'booking_completed'
  | 'upload_error'
  | 'cancel_reason'
  | 'reschedule_reason';

export function getAnonId(): string {
  if (typeof window === 'undefined') return 'server';
  const key = 'anon-id';
  let id = localStorage.getItem(key);
  if (!id) {
    id = Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem(key, id);
  }
  return id;
}

export function track(event: AnalyticsEvent, payload: Record<string, any> = {}) {
  try {
    const data = { event, anonId: getAnonId(), ts: Date.now(), ...payload };
    // Push to GTM-style dataLayer if available
    (window as any).dataLayer = (window as any).dataLayer || [];
    (window as any).dataLayer.push(data);
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.debug('[analytics]', data);
    }
  } catch {
    // no-op
  }
}

// Simple deterministic assignment using anonId hash
export function getExperimentVariant<T extends string>(expName: string, variants: T[]): T {
  const id = getAnonId();
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  const idx = hash % variants.length;
  const variant = variants[idx];
  // Fire an impression only once per session
  try {
    const k = `exp:${expName}:v`;
    const prev = sessionStorage.getItem(k);
    if (prev !== variant) {
      sessionStorage.setItem(k, variant);
      track('filter_change', { // reuse channel for impressions without adding new event type
        kind: 'experiment_impression', exp: expName, variant,
      });
    }
  } catch {}
  return variant;
}
