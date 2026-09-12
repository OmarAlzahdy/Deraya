'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import type { Route } from 'next';
import { createClient } from '@/lib/supabase/server';
import { getProfile, isAdmin } from '@/lib/auth';
import { routing, type Locale } from '@/i18n/routing';
import type { Enums } from '@/lib/supabase/database.types';

export type AdminState = { error?: string; saved?: boolean };

const SLUG = /^[a-z0-9][a-z0-9-]{1,60}[a-z0-9]$/;

function readLocale(formData: FormData): Locale {
  const value = String(formData.get('locale') ?? '');
  return routing.locales.includes(value as Locale) ? (value as Locale) : routing.defaultLocale;
}

function text(formData: FormData, name: string) {
  return String(formData.get(name) ?? '').trim();
}

function optionalText(formData: FormData, name: string) {
  return text(formData, name) || null;
}

/** Money is entered in whole currency units and stored in minor units. */
function money(formData: FormData, name: string) {
  const raw = text(formData, name);
  if (!raw) return null;
  const value = Number(raw);
  if (!Number.isFinite(value) || value < 0) return null;
  return Math.round(value * 100);
}

function status(formData: FormData): Enums<'content_status'> {
  const value = text(formData, 'status');
  return value === 'published' || value === 'archived' ? value : 'draft';
}

/**
 * Every action re-checks the role on the server. The admin routes are already
 * guarded and the RLS policies would refuse the write anyway — this is the
 * third of the three, and the cheapest.
 */
async function requireAdminProfile() {
  const profile = await getProfile();
  return isAdmin(profile) ? profile : null;
}

// ── Tracks (courses) ────────────────────────────────────────────────────────

export async function saveTrack(_prev: AdminState, formData: FormData): Promise<AdminState> {
  if (!(await requireAdminProfile())) return { error: 'forbidden' };

  const locale = readLocale(formData);
  const id = text(formData, 'id');
  const slug = text(formData, 'slug').toLowerCase();

  if (!SLUG.test(slug)) return { error: 'slug' };

  // Both languages are required on a published row: Arabic is not a
  // translation layer, so a half-translated track is not publishable.
  const fields = {
    slug,
    title_ar: text(formData, 'titleAr'),
    title_en: text(formData, 'titleEn'),
    summary_ar: text(formData, 'summaryAr'),
    summary_en: text(formData, 'summaryEn'),
    outcome_ar: text(formData, 'outcomeAr'),
    outcome_en: text(formData, 'outcomeEn'),
    prerequisites_ar: optionalText(formData, 'prerequisitesAr'),
    prerequisites_en: optionalText(formData, 'prerequisitesEn'),
    week_count: Number(text(formData, 'weekCount')) || 1,
    price_minor: money(formData, 'price'),
    currency: text(formData, 'currency') || 'SAR',
    status: status(formData),
    position: Number(text(formData, 'position')) || 0,
  };

  if (Object.values(fields).some((value) => value === '')) return { error: 'required' };
  if (fields.week_count < 1 || fields.week_count > 52) return { error: 'weeks' };

  const supabase = await createClient();

  if (id) {
    const { error } = await supabase.from('tracks').update(fields).eq('id', id);
    if (error) return { error: error.code === '23505' ? 'slugTaken' : 'failed' };
    revalidatePath(`/${locale}/admin/tracks`);
    revalidatePath(`/${locale}/tracks/${slug}`);
    return { saved: true };
  }

  const { data, error } = await supabase.from('tracks').insert(fields).select('id').single();
  if (error || !data) return { error: error?.code === '23505' ? 'slugTaken' : 'failed' };

  // A new track starts with its weeks laid out, so the outline is editable
  // immediately rather than after a second, separate step.
  await supabase.from('track_weeks').insert(
    Array.from({ length: fields.week_count }, (_, index) => ({
      track_id: data.id,
      week_number: index + 1,
      title_ar: `الأسبوع ${index + 1}`,
      title_en: `Week ${index + 1}`,
      reviewed: false,
    })),
  );

  revalidatePath(`/${locale}/admin/tracks`);
  redirect(`/${locale}/admin/tracks/${data.id}` as Route);
}

export async function saveWeek(_prev: AdminState, formData: FormData): Promise<AdminState> {
  if (!(await requireAdminProfile())) return { error: 'forbidden' };

  const locale = readLocale(formData);
  const id = text(formData, 'weekId');
  const trackId = text(formData, 'trackId');

  const supabase = await createClient();
  const { error } = await supabase
    .from('track_weeks')
    .update({
      title_ar: text(formData, 'titleAr'),
      title_en: text(formData, 'titleEn'),
      outline_ar: optionalText(formData, 'outlineAr'),
      outline_en: optionalText(formData, 'outlineEn'),
      project_ar: optionalText(formData, 'projectAr'),
      project_en: optionalText(formData, 'projectEn'),
      reviewed: formData.get('reviewed') === 'on',
    })
    .eq('id', id);

  if (error) return { error: 'failed' };

  revalidatePath(`/${locale}/admin/tracks/${trackId}`);
  return { saved: true };
}

export async function deleteTrack(formData: FormData) {
  if (!(await requireAdminProfile())) return;

  const locale = readLocale(formData);
  const supabase = await createClient();
  await supabase.from('tracks').delete().eq('id', text(formData, 'id'));

  revalidatePath(`/${locale}/admin/tracks`);
  redirect(`/${locale}/admin/tracks` as Route);
}

// ── Services ────────────────────────────────────────────────────────────────

export async function saveService(_prev: AdminState, formData: FormData): Promise<AdminState> {
  if (!(await requireAdminProfile())) return { error: 'forbidden' };

  const locale = readLocale(formData);
  const id = text(formData, 'id');
  const slug = text(formData, 'slug').toLowerCase();

  if (!SLUG.test(slug)) return { error: 'slug' };

  const turnaround = text(formData, 'turnaroundDays');
  const min = money(formData, 'priceMin');
  const max = money(formData, 'priceMax');

  if (min !== null && max !== null && max < min) return { error: 'band' };

  const fields = {
    slug,
    title_ar: text(formData, 'titleAr'),
    title_en: text(formData, 'titleEn'),
    scope_ar: text(formData, 'scopeAr'),
    scope_en: text(formData, 'scopeEn'),
    deliverable_ar: text(formData, 'deliverableAr'),
    deliverable_en: text(formData, 'deliverableEn'),
    turnaround_days: turnaround ? Number(turnaround) : null,
    price_band_min_minor: min,
    price_band_max_minor: max,
    currency: text(formData, 'currency') || 'SAR',
    status: status(formData),
    position: Number(text(formData, 'position')) || 0,
  };

  if (Object.values(fields).some((value) => value === '')) return { error: 'required' };

  const supabase = await createClient();

  if (id) {
    const { error } = await supabase.from('services').update(fields).eq('id', id);
    if (error) return { error: error.code === '23505' ? 'slugTaken' : 'failed' };
    revalidatePath(`/${locale}/services`);
    revalidatePath(`/${locale}/admin/services`);
    return { saved: true };
  }

  const { data, error } = await supabase.from('services').insert(fields).select('id').single();
  if (error || !data) return { error: error?.code === '23505' ? 'slugTaken' : 'failed' };

  revalidatePath(`/${locale}/services`);
  redirect(`/${locale}/admin/services/${data.id}` as Route);
}

export async function deleteService(formData: FormData) {
  if (!(await requireAdminProfile())) return;

  const locale = readLocale(formData);
  const supabase = await createClient();
  await supabase.from('services').delete().eq('id', text(formData, 'id'));

  revalidatePath(`/${locale}/services`);
  redirect(`/${locale}/admin/services` as Route);
}
