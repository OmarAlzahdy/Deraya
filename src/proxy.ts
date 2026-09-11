import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

/**
 * Resolves the locale for every request: the persisted NEXT_LOCALE cookie
 * first, then Accept-Language, then the default. A request without a locale
 * prefix is redirected to one, so every URL in the product names its language.
 *
 * (Next 16's `proxy` convention — the former `middleware` file.)
 */
export default createMiddleware(routing);

export const config = {
  // Everything except Next internals and files with an extension.
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
