import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/env';
import { services as placeholderServices, type Service } from '@/content/services';
import type { Tables } from '@/lib/supabase/database.types';

/** Services, from the database, with the same pre-connection fallback as tracks. */
function toService(row: Tables<'services'>): Service {
  return {
    slug: row.slug,
    title: { ar: row.title_ar, en: row.title_en },
    scope: { ar: row.scope_ar, en: row.scope_en },
    deliverable: { ar: row.deliverable_ar, en: row.deliverable_en },
    turnaroundDays: row.turnaround_days ?? undefined,
    turnaround: row.turnaround_days
      ? { ar: `${row.turnaround_days} يومًا`, en: `${row.turnaround_days} days` }
      : { ar: 'حسب النطاق', en: 'Scoped per engagement' },
    priceBand:
      row.price_band_min_minor !== null && row.price_band_max_minor !== null
        ? {
            minMinor: row.price_band_min_minor,
            maxMinor: row.price_band_max_minor,
            currency: row.currency,
          }
        : undefined,
    placeholder: row.price_band_min_minor === null ? true : undefined,
    blockedBy: row.price_band_min_minor === null ? 'open decision 4 — price bands' : undefined,
  };
}

export async function getPublishedServices(): Promise<Service[]> {
  if (!isSupabaseConfigured()) return placeholderServices;

  const supabase = await createClient();
  const { data } = await supabase
    .from('services')
    .select('*')
    .eq('status', 'published')
    .order('position');

  return (data ?? []).map(toService);
}

/** Admin listing: drafts included. */
export async function getAllServices(): Promise<Tables<'services'>[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createClient();
  const { data } = await supabase.from('services').select('*').order('position');
  return data ?? [];
}

export async function getServiceById(id: string) {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createClient();
  const { data } = await supabase.from('services').select('*').eq('id', id).maybeSingle();
  return data;
}
