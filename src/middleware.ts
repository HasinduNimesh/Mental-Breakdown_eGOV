import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const hasLocale = req.cookies.get('NEXT_LOCALE')?.value;
  const { pathname } = req.nextUrl;
  console.log('[middleware:src] path=', pathname, 'hasLocale=', Boolean(hasLocale));

  if (pathname === '/') {
    if (!hasLocale) {
      const url = req.nextUrl.clone();
      url.pathname = '/choose-language';
      console.log('[middleware:src] redirect -> /choose-language (first-time root)');
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  if (!hasLocale) {
    const url = req.nextUrl.clone();
    url.pathname = '/choose-language';
    console.log('[middleware:src] redirect -> /choose-language (first-time visitor)');
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/((?!_next|api|favicon.ico|robots.txt|sitemap.xml|choose-language|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml|json)).*)',
  ],
};
