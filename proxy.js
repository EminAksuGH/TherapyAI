import { NextResponse } from 'next/server';

const PUBLIC_FILE = /\.(.*)$/;
const SUPPORTED_LOCALES = ['tr', 'en'];

const getLocaleFromPath = (pathname) => {
  const firstSegment = pathname.split('/')[1];
  if (SUPPORTED_LOCALES.includes(firstSegment)) {
    return firstSegment;
  }
  return null;
};

const detectLocale = (acceptLanguage) => {
  if (!acceptLanguage) return 'en';
  const firstLang = acceptLanguage.split(',')[0]?.trim().toLowerCase();
  if (firstLang?.startsWith('tr')) return 'tr';
  return 'en';
};

export function proxy(request) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/icon') ||
    PUBLIC_FILE.test(pathname)
  ) {
    return NextResponse.next();
  }

  const localeFromPath = getLocaleFromPath(pathname);
  const cookieLocale = request.cookies.get('locale')?.value;
  const preferredLocale = SUPPORTED_LOCALES.includes(cookieLocale) ? cookieLocale : null;
  const locale = preferredLocale ?? localeFromPath ?? detectLocale(request.headers.get('accept-language'));

  // If no locale in path, redirect to add it
  if (!localeFromPath) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = `/${locale}${pathname}`;
    const response = NextResponse.redirect(redirectUrl);
    response.cookies.set('locale', locale, { path: '/', maxAge: 60 * 60 * 24 * 365 });
    return response;
  }

  // If locale in path doesn't match preferred locale from cookie, redirect to correct locale
  if (preferredLocale && localeFromPath !== preferredLocale) {
    // Remove the current locale prefix
    let pathWithoutLocale = pathname.replace(/^\/(tr|en)/, '') || '/';
    // Ensure we have a valid path
    if (!pathWithoutLocale || pathWithoutLocale === '') {
      pathWithoutLocale = '/';
    }
    // Remove any additional locale prefixes that might exist (safety check)
    pathWithoutLocale = pathWithoutLocale.replace(/^\/(tr|en)/, '') || '/';
    if (!pathWithoutLocale || pathWithoutLocale === '') {
      pathWithoutLocale = '/';
    }
    
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = `/${preferredLocale}${pathWithoutLocale === '/' ? '' : pathWithoutLocale}`;
    const response = NextResponse.redirect(redirectUrl);
    response.cookies.set('locale', preferredLocale, { path: '/', maxAge: 60 * 60 * 24 * 365 });
    return response;
  }
  
  // Safety check: if path has double locale prefixes (e.g., /en/tr or /tr/en), clean it up
  const doubleLocaleMatch = pathname.match(/^\/(tr|en)\/(tr|en)(\/.*|$)/);
  if (doubleLocaleMatch) {
    const preferredLocaleForCleanup = preferredLocale || 'en';
    // Extract everything after the second locale
    const pathAfterDoubleLocale = pathname.replace(/^\/(tr|en)\/(tr|en)/, '') || '/';
    const cleanPath = pathAfterDoubleLocale === '' ? '/' : pathAfterDoubleLocale;
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = `/${preferredLocaleForCleanup}${cleanPath === '/' ? '' : cleanPath}`;
    const response = NextResponse.redirect(redirectUrl);
    response.cookies.set('locale', preferredLocaleForCleanup, { path: '/', maxAge: 60 * 60 * 24 * 365 });
    return response;
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-locale', locale);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
  response.cookies.set('locale', locale, { path: '/', maxAge: 60 * 60 * 24 * 365 });
  return response;
}

export const config = {
  matcher: ['/((?!_next|api|.*\\..*).*)'],
};
