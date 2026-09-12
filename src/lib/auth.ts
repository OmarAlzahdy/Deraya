import { redirect } from 'next/navigation';
import type { Route } from 'next';
import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/env';
import type { Tables } from '@/lib/supabase/database.types';
import type { Locale } from '@/i18n/routing';

export type Profile = Tables<'profiles'>;

/**
 * The signed-in member's profile, or null.
 *
 * Identity always comes from `getUser()`, which verifies the token with the
 * auth server — never from `getSession()`, which trusts a cookie the browser
 * could have written.
 */
export async function getProfile(): Promise<Profile | null> {
  if (!isSupabaseConfigured()) return null;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
  return data ?? null;
}

export function isStaff(profile: Profile | null) {
  return profile?.role === 'engineer' || profile?.role === 'instructor' || profile?.role === 'admin';
}

export function isAdmin(profile: Profile | null) {
  return profile?.role === 'admin';
}

/** For pages that require a session. Sends the visitor to sign in, and back. */
export async function requireProfile(locale: Locale, returnTo: string): Promise<Profile> {
  const profile = await getProfile();
  if (!profile) {
    // `redirect` is typed `never`, so the narrowing below holds. The cast is
    // typed-routes not being able to see a path built at runtime.
    redirect(`/${locale}/sign-in?next=${encodeURIComponent(returnTo)}` as Route);
  }
  return profile;
}

/**
 * For the admin area. A member who is not an admin gets a 404 rather than a
 * "forbidden" — the admin routes do not advertise their own existence.
 */
export async function requireAdmin(locale: Locale, returnTo: string): Promise<Profile> {
  const profile = await requireProfile(locale, returnTo);
  if (!isAdmin(profile)) {
    const { notFound } = await import('next/navigation');
    notFound();
  }
  return profile;
}
