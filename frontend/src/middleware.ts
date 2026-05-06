import createMiddleware from 'next-intl/middleware';
import { type NextRequest, NextResponse } from 'next/server';
import { locales, defaultLocale } from './i18n';

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always',
});

// Routes qui nécessitent une authentification (peu importe le rôle)
const AUTH_REQUIRED = ['/dashboard', '/reservation'];

export default function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Vérifier si la route nécessite une auth
  const needsAuth = AUTH_REQUIRED.some((prefix) =>
    pathname.includes(prefix),
  );

  if (needsAuth) {
    // Le token est en mémoire côté client → on vérifie le cookie refresh
    const hasRefreshCookie = req.cookies.has('refreshToken');
    if (!hasRefreshCookie) {
      // Extraire la locale depuis le path (ex: /ar/dashboard → ar)
      const localeMatch = pathname.match(/^\/(ar|fr)\//);
      const locale = localeMatch ? localeMatch[1] : defaultLocale;
      const loginUrl = new URL(`/${locale}/auth/login`, req.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return intlMiddleware(req);
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
