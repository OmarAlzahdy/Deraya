import type { Localized, MaybePlaceholder } from './types';

/**
 * Tracks.
 *
 * Open decision 3 — which three tracks launch, how long each runs and what
 * each ends with — is not answered, so these carry the *structure* of a track
 * with the specifics marked pending. Prices (open decision 4) are absent for
 * the same reason: a made-up number on a page a buyer reads is worse than a
 * visible gap.
 *
 * The shape mirrors `public.tracks` / `public.track_weeks` in
 * supabase/migrations, so replacing this module with a query is mechanical.
 */
export type TrackWeek = MaybePlaceholder<{
  weekNumber: number;
  title: Localized;
  outline?: Localized;
  project?: Localized;
  reviewed: boolean;
}>;

export type Track = MaybePlaceholder<{
  slug: string;
  title: Localized;
  summary: Localized;
  outcome: Localized;
  prerequisites?: Localized;
  weekCount: number;
  priceMinor?: number;
  currency: string;
  instructorIds: string[];
  weeks: TrackWeek[];
}>;

const PENDING_TRACK = 'open decision 3 — the launch track list';
const PENDING_PRICE = 'open decision 4 — prices';

/** A week whose subject is not decided, but whose shape is. */
function pendingWeek(weekNumber: number, reviewed: boolean): TrackWeek {
  return {
    weekNumber,
    title: { ar: 'موضوع الأسبوع قيد التحديد', en: 'Week subject pending' },
    // No outline until the subject is decided: twelve rows of the same
    // sentence is noise, and the empty column shows the shape honestly.
    reviewed,
    placeholder: true,
    blockedBy: PENDING_TRACK,
  };
}

export const tracks: Track[] = [
  {
    slug: 'track-one',
    title: { ar: 'المسار الأول', en: 'Track one' },
    summary: {
      ar: 'مسار كامل من الصفر إلى مشروع يعمل، مع مراجعة على مستوى السطر في كل تسليم.',
      en: 'A full track from zero to a working project, with line-level review on every submission.',
    },
    outcome: {
      ar: 'مستودع واحد مُراجَع يستطيع مسؤول التوظيف قراءته.',
      en: 'One reviewed repository a hiring manager can read.',
    },
    weekCount: 12,
    currency: 'SAR',
    instructorIds: ['instructor-1'],
    weeks: Array.from({ length: 12 }, (_, index) => pendingWeek(index + 1, (index + 1) % 3 === 0)),
    placeholder: true,
    blockedBy: PENDING_TRACK,
  },
  {
    slug: 'track-two',
    title: { ar: 'المسار الثاني', en: 'Track two' },
    summary: {
      ar: 'مسار كامل من الصفر إلى مشروع يعمل، مع مراجعة على مستوى السطر في كل تسليم.',
      en: 'A full track from zero to a working project, with line-level review on every submission.',
    },
    outcome: {
      ar: 'مشروع يعمل في الإنتاج ومستودع مُراجَع.',
      en: 'A project running in production and a reviewed repository.',
    },
    weekCount: 12,
    currency: 'SAR',
    instructorIds: ['instructor-2'],
    weeks: Array.from({ length: 12 }, (_, index) => pendingWeek(index + 1, (index + 1) % 3 === 0)),
    placeholder: true,
    blockedBy: PENDING_TRACK,
  },
  {
    slug: 'track-three',
    title: { ar: 'المسار الثالث', en: 'Track three' },
    summary: {
      ar: 'مسار كامل من الصفر إلى مشروع يعمل، مع مراجعة على مستوى السطر في كل تسليم.',
      en: 'A full track from zero to a working project, with line-level review on every submission.',
    },
    outcome: {
      ar: 'مستودع مُراجَع ومشروع واحد مكتمل.',
      en: 'A reviewed repository and one finished project.',
    },
    weekCount: 12,
    currency: 'SAR',
    instructorIds: ['instructor-3'],
    weeks: Array.from({ length: 12 }, (_, index) => pendingWeek(index + 1, (index + 1) % 3 === 0)),
    placeholder: true,
    blockedBy: PENDING_TRACK,
  },
];

export const PRICE_PENDING = PENDING_PRICE;

export function getTrack(slug: string) {
  return tracks.find((track) => track.slug === slug);
}
