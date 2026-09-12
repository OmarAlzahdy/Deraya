import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/env';
import { tracks as placeholderTracks, type Track, type TrackWeek } from '@/content/tracks';
import type { Tables } from '@/lib/supabase/database.types';

/**
 * Tracks, from the database.
 *
 * Until a Supabase project is connected, these fall back to the placeholder
 * module so the marketing pages still render — with their "pending" markers
 * intact, saying exactly what they are. Once the environment is set, the same
 * pages read real rows with no other change.
 */

function toTrack(row: Tables<'tracks'>, weeks: Tables<'track_weeks'>[]): Track {
  return {
    slug: row.slug,
    title: { ar: row.title_ar, en: row.title_en },
    summary: { ar: row.summary_ar, en: row.summary_en },
    outcome: { ar: row.outcome_ar, en: row.outcome_en },
    prerequisites:
      row.prerequisites_ar || row.prerequisites_en
        ? { ar: row.prerequisites_ar ?? '', en: row.prerequisites_en ?? '' }
        : undefined,
    weekCount: row.week_count,
    priceMinor: row.price_minor ?? undefined,
    currency: row.currency,
    instructorIds: [],
    weeks: weeks
      .sort((a, b) => a.week_number - b.week_number)
      .map(
        (week): TrackWeek => ({
          weekNumber: week.week_number,
          title: { ar: week.title_ar, en: week.title_en },
          outline:
            week.outline_ar || week.outline_en
              ? { ar: week.outline_ar ?? '', en: week.outline_en ?? '' }
              : undefined,
          project:
            week.project_ar || week.project_en
              ? { ar: week.project_ar ?? '', en: week.project_en ?? '' }
              : undefined,
          reviewed: week.reviewed,
        }),
      ),
  };
}

export async function getPublishedTracks(): Promise<Track[]> {
  if (!isSupabaseConfigured()) return placeholderTracks;

  const supabase = await createClient();
  const { data } = await supabase
    .from('tracks')
    .select('*, track_weeks(*)')
    .eq('status', 'published')
    .order('position');

  if (!data || data.length === 0) return [];

  return data.map((row) => {
    const { track_weeks: weeks, ...track } = row as Tables<'tracks'> & {
      track_weeks: Tables<'track_weeks'>[];
    };
    return toTrack(track, weeks ?? []);
  });
}

export async function getTrackBySlug(slug: string): Promise<Track | undefined> {
  if (!isSupabaseConfigured()) return placeholderTracks.find((track) => track.slug === slug);

  const supabase = await createClient();
  const { data } = await supabase
    .from('tracks')
    .select('*, track_weeks(*)')
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle();

  if (!data) return undefined;

  const { track_weeks: weeks, ...track } = data as Tables<'tracks'> & {
    track_weeks: Tables<'track_weeks'>[];
  };
  return toTrack(track, weeks ?? []);
}

/** Admin listing: drafts and archived rows included. */
export async function getAllTracks(): Promise<Tables<'tracks'>[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createClient();
  const { data } = await supabase.from('tracks').select('*').order('position');
  return data ?? [];
}

export async function getTrackById(id: string) {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createClient();
  const { data } = await supabase
    .from('tracks')
    .select('*, track_weeks(*)')
    .eq('id', id)
    .maybeSingle();
  return data as (Tables<'tracks'> & { track_weeks: Tables<'track_weeks'>[] }) | null;
}
