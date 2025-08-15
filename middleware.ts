import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

// Redirect first-time visitors (no NEXT_LOCALE cookie) to the language chooser
export function middleware(req: NextRequest) {
  const hasLocale = req.cookies.get('NEXT_LOCALE')?.value;
  const { pathname } = req.nextUrl;
  console.log('[middleware] path=', pathname, 'hasLocale=', Boolean(hasLocale));

  // Send base URL to language chooser only if not chosen yet
  if (pathname === '/') {
    if (!hasLocale) {
      const url = req.nextUrl.clone();
      url.pathname = '/choose-language';
      console.log('[middleware] redirect -> /choose-language (first-time root)');
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // If user hasn't chosen a language yet, send them to the chooser
  if (!hasLocale) {
    const url = req.nextUrl.clone();
    url.pathname = '/choose-language';
  console.log('[middleware] redirect -> /choose-language (first-time visitor)');
  return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// Exclude Next.js internals and the chooser itself from redirection
export const config = {
  matcher: [
  '/',
    // match all paths except _next, static assets, and the choose-language page
    '/((?!_next|api|favicon.ico|robots.txt|sitemap.xml|choose-language|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml|json)).*)',
  ],
};
