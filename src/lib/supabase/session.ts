import { createServerClient } from '@supabase/ssr';
import type { NextRequest, NextResponse } from 'next/server';
import type { Database } from './database.types';
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL, isSupabaseConfigured } from './env';

/**
 * Refreshes the auth session on the way through the proxy and copies the
 * rotated cookies onto the response the locale middleware already produced.
 *
 * This has to happen here rather than in a Server Component: a refreshed token
 * must be written back to the browser, and only middleware can still set
 * cookies at that point.
 */
export async function refreshSession(request: NextRequest, response: NextResponse) {
  if (!isSupabaseConfigured()) return response;

  const supabase = createServerClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  // Verifies the token with the auth server and rotates it if needed.
  await supabase.auth.getUser();

  return response;
}
