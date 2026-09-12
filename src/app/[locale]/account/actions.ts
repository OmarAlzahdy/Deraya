'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getProfile } from '@/lib/auth';
import { routing, type Locale } from '@/i18n/routing';

export type AccountState = { error?: string; saved?: boolean };

const HANDLE = /^[a-z0-9][a-z0-9-]{1,38}[a-z0-9]$/;

/**
 * The member edits their own profile. `role` is deliberately not in this form
 * and is refused by a database trigger even if it were posted — promotion is
 * an administrator's action.
 */
export async function updateProfile(_prev: AccountState, formData: FormData): Promise<AccountState> {
  const profile = await getProfile();
  if (!profile) return { error: 'signedOut' };

  const handle = String(formData.get('handle') ?? '').trim().toLowerCase();
  const displayName = String(formData.get('displayName') ?? '').trim();
  const localeValue = String(formData.get('preferredLocale') ?? '');
  const locale: Locale = routing.locales.includes(localeValue as Locale)
    ? (localeValue as Locale)
    : profile.locale;

  if (!HANDLE.test(handle)) return { error: 'handle' };
  if (displayName.length < 2) return { error: 'name' };

  const supabase = await createClient();
  const { error } = await supabase
    .from('profiles')
    .update({
      handle,
      display_name: displayName,
      headline_ar: String(formData.get('headlineAr') ?? '').trim() || null,
      headline_en: String(formData.get('headlineEn') ?? '').trim() || null,
      github_handle: String(formData.get('github') ?? '').trim() || null,
      locale,
    })
    .eq('id', profile.id);

  if (error) {
    return { error: error.code === '23505' ? 'handleTaken' : 'failed' };
  }

  revalidatePath('/', 'layout');
  return { saved: true };
}
