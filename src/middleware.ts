import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const hasLocale = req.cookies.get('NEXT_LOCALE')?.value;
  const { pathname } = req.nextUrl;

  if (pathname === '/') {
    if (!hasLocale) {
      const url = req.nextUrl.clone();
      url.pathname = '/choose-language';
  // redirect first-time visitors to language chooser
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  if (!hasLocale) {
    const url = req.nextUrl.clone();
    url.pathname = '/choose-language';
  // ensure language selection
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
  // Exclude Next internals, APIs, static assets, and i18n JSON data files
  '/((?!_next|api|favicon.ico|robots.txt|sitemap.xml|choose-language|locales|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml|json)).*)',
  ],
};
