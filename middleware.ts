import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

// Redirect first-time visitors (no NEXT_LOCALE cookie) to the language chooser
export function middleware(req: NextRequest) {
  const hasLocale = req.cookies.get('NEXT_LOCALE')?.value;
  const { pathname } = req.nextUrl;

  // Always send base URL to language chooser
  if (pathname === '/' || pathname === '/en' || pathname === '/si' || pathname === '/ta') {
    const url = req.nextUrl.clone();
    url.pathname = '/choose-language';
    return NextResponse.redirect(url);
  }

  // If user hasn't chosen a language yet, send them to the chooser
  if (!hasLocale) {
    const url = req.nextUrl.clone();
    url.pathname = '/choose-language';
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
