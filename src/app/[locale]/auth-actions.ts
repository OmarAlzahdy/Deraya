'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import type { Route } from 'next';
import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/env';
import { routing, type Locale } from '@/i18n/routing';

export type AuthState = { error?: string; notice?: string };

function readLocale(formData: FormData): Locale {
  const value = String(formData.get('locale') ?? '');
  return routing.locales.includes(value as Locale) ? (value as Locale) : routing.defaultLocale;
}

/** Keeps a `next` parameter from becoming an open redirect. */
function safeNext(value: FormDataEntryValue | null, locale: Locale) {
  const next = typeof value === 'string' ? value : '';
  return next.startsWith('/') && !next.startsWith('//') ? next : `/${locale}`;
}

export async function signIn(_prev: AuthState, formData: FormData): Promise<AuthState> {
  if (!isSupabaseConfigured()) return { error: 'unconfigured' };

  const locale = readLocale(formData);
  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');

  if (!email || !password) return { error: 'missing' };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: 'credentials' };

  revalidatePath('/', 'layout');
  redirect(safeNext(formData.get('next'), locale) as Route);
}

export async function signUp(_prev: AuthState, formData: FormData): Promise<AuthState> {
  if (!isSupabaseConfigured()) return { error: 'unconfigured' };

  const locale = readLocale(formData);
  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');
  const displayName = String(formData.get('displayName') ?? '').trim();
  const origin = String(formData.get('origin') ?? '');

  if (!email || !password || !displayName) return { error: 'missing' };
  if (password.length < 8) return { error: 'weak' };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // The profile row is created by a database trigger; this is what it
      // reads for the member's name and language.
      data: { display_name: displayName, locale },
      emailRedirectTo: `${origin}/auth/callback?locale=${locale}&next=${encodeURIComponent(`/${locale}/account`)}`,
    },
  });

  if (error) return { error: error.message.includes('already') ? 'taken' : 'failed' };

  // With email confirmation on, there is no session yet — say so rather than
  // bouncing the member to a page that will send them straight back.
  if (!data.session) return { notice: 'confirm' };

  revalidatePath('/', 'layout');
  redirect(`/${locale}/account` as Route);
}

export async function signOut(formData: FormData) {
  const locale = readLocale(formData);
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  revalidatePath('/', 'layout');
  redirect(`/${locale}` as Route);
}
