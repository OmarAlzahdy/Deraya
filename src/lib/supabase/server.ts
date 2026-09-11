import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import type { Database } from './database.types';
import { requireSupabaseEnv } from './env';

/**
 * The server client, for Server Components, Route Handlers and Server Actions.
 *
 * Cookies are read through Next's store so the session follows the request. In
 * a Server Component the store is read-only and `setAll` throws — that is
 * expected and swallowed here, because the session is refreshed in the proxy
 * (src/proxy.ts) where cookies can still be written.
 */
export async function createClient() {
  const { url, key } = requireSupabaseEnv();
  const cookieStore = await cookies();

  return createServerClient<Database>(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Called from a Server Component — the proxy refreshes the session.
        }
      },
    },
  });
}

/**
 * The signed-in member's profile, or null. Never trust a cookie for identity:
 * `getUser()` verifies the token with the auth server, unlike `getSession()`.
 */
export async function getCurrentProfile() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
  return data;
}
