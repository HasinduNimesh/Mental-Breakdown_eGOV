import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Supported locales must match next-i18next.config.js
const locales = ['en', 'si', 'ta'];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Always allow internal/asset routes and the chooser
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/choose-language') ||
    /\.[a-zA-Z0-9]+$/.test(pathname)
  ) {
    return NextResponse.next();
  }

  // If path already has a supported locale prefix, continue
  const hasLocalePrefix = locales.some((l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`));
  if (hasLocalePrefix) {
    return NextResponse.next();
  }

  const cookieLocale = req.cookies.get('NEXT_LOCALE')?.value;

  // If no saved locale, send user to the chooser
  if (!cookieLocale) {
    const url = req.nextUrl.clone();
    url.pathname = '/choose-language';
    return NextResponse.redirect(url);
  }

  // Otherwise, redirect to the saved locale prefix
  const targetLocale = locales.includes(cookieLocale) ? cookieLocale : 'en';
  const url = req.nextUrl.clone();
  url.pathname = `/${targetLocale}${pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    '/',
    '/((?!_next|api|favicon.ico|robots.txt|sitemap.xml|choose-language|.*\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml|json)).*)',
  ],
};
