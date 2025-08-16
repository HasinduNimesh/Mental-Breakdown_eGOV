export function formatDate(input: string | number | Date, locale = 'en-GB'): string {
  try {
    const dt = input instanceof Date ? input : new Date(input);
    // Use fixed timezone to avoid SSR/CSR mismatches
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric', month: 'short', day: '2-digit', timeZone: 'UTC',
    }).format(dt);
  } catch {
    try {
      const dt = new Date(input);
      return dt.toISOString().slice(0, 10);
    } catch {
      return String(input);
    }
  }
}
