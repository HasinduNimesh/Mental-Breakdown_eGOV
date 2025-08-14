export type SearchItem = {
  id: string;
  label: string;
  href: string;
  tags?: string[];
};

// Minimal built-in dataset used for header typeahead and synonyms
export const SEARCH_ITEMS: SearchItem[] = [
  { id: 'svc-passport', label: 'Passport Application', href: '/book?service=passport', tags: ['passport', 'travel', 'immigration'] },
  { id: 'svc-driving', label: 'Driving License Services', href: '/book?service=license', tags: ['driving license', 'license', 'dl'] },
  { id: 'svc-birth-cert', label: 'Birth Certificate', href: '/book?service=birth-cert', tags: ['certificate', 'birth'] },
  { id: 'svc-marriage-cert', label: 'Marriage Certificate', href: '/book?service=marriage-cert', tags: ['certificate', 'marriage'] },
  { id: 'svc-police-clearance', label: 'Police Clearance Certificate', href: '/book?service=police-clearance', tags: ['police', 'clearance', 'pcc'] },
  { id: 'dept-immigration', label: 'Department of Immigration & Emigration', href: '/services?dept=immigration', tags: ['immigration', 'passport'] },
  { id: 'dept-dmt', label: 'Department of Motor Traffic', href: '/services?dept=transport', tags: ['motor traffic', 'dmt', 'license'] },
  { id: 'dept-registrar', label: 'Registrar General Department', href: '/services?dept=registrar', tags: ['registrar', 'certificates'] },
];

// Simple synonym mapping
export const SYNONYMS: Record<string, string[]> = {
  passport: ['passport', 'travel document', 'immigration'],
  license: ['license', 'licence', 'driving', 'driver license'],
  id: ['nic', 'national id', 'identity'],
  police: ['police', 'pcc', 'clearance'],
  certificate: ['certificate', 'cert'],
};

export function expandQuery(q: string): string[] {
  const parts = q
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);
  const expanded: string[] = [];
  for (const p of parts) {
    expanded.push(p);
    if (SYNONYMS[p]) expanded.push(...SYNONYMS[p]);
  }
  return Array.from(new Set(expanded));
}
