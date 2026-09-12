import createMiddleware from 'next-intl/middleware';
import type { NextRequest } from 'next/server';
import { routing } from './i18n/routing';
import { refreshSession } from './lib/supabase/session';

const handleLocale = createMiddleware(routing);

/**
 * Two things happen on every request, in this order:
 *
 *   1. Locale is resolved — the persisted NEXT_LOCALE cookie first, then
 *      Accept-Language, then the default — and a request without a locale
 *      prefix is redirected to one, so every URL names its language.
 *   2. The Supabase session is refreshed onto that same response, so a rotated
 *      token reaches the browser. It is a no-op until Supabase is configured.
 *
 * (Next 16's `proxy` convention — the former `middleware` file.)
 */
export default async function proxy(request: NextRequest) {
  const response = handleLocale(request);
  return refreshSession(request, response);
}

export const config = {
  // Everything except Next internals, the auth callback (a machine endpoint,
  // not a page, so it takes no locale prefix) and files with an extension.
  matcher: ['/((?!api|auth|_next|_vercel|.*\\..*).*)'],
};
