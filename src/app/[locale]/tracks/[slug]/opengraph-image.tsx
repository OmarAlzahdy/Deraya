import { ImageResponse } from 'next/og';
import { getTranslations } from 'next-intl/server';
import { ogCard, ogFonts, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og/card';
import { getTrackBySlug } from '@/lib/data/tracks';
import { pick } from '@/content/types';
import { resolveLocale } from '@/i18n/routing';

/**
 * The card for one track.
 *
 * A track page is the link that actually gets sent — to a friend, into a
 * group, to someone deciding whether to enrol — so the preview carries what
 * that person is deciding on: the name, what it ends with, how long it runs
 * and what it costs. The site card would have shown them the slogan.
 */
/**
 * Rendered per request. The card's content comes from the database through
 * the session-aware client, and `generateImageMetadata` below would otherwise
 * have Next treat this route as static and refuse the read.
 */
export const dynamic = 'force-dynamic';

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

type Params = { params: Promise<{ locale: string; slug: string }> };

/**
 * The alt text names the kind of page, not the track on it. This runs where
 * `generateStaticParams` runs — at build time, with no request — so it cannot
 * read cookies, and reading the track means reading the session's cookies to
 * reach the database. The image itself runs per request and does name it.
 */
export async function generateImageMetadata({ params }: Params) {
  const locale = resolveLocale((await params).locale);
  const t = await getTranslations({ locale });

  return [
    {
      id: 'card',
      size,
      contentType,
      alt: `${t('track.kicker')} — ${t('brand.wordmarkAr')} · ${t('brand.wordmarkLatin')}`,
    },
  ];
}

export default async function TrackOpenGraphImage({ params }: Params) {
  const { locale: raw, slug } = await params;
  const locale = resolveLocale(raw);
  const [track, t] = await Promise.all([getTrackBySlug(slug), getTranslations({ locale })]);

  // Counted phrases, not a number beside a column heading: "8 weeks" reads
  // as a fact, "8 Weeks" reads as a table cell that lost its table. Arabic
  // needs the plural forms anyway, and the messages carry all six.
  const facts = track
    ? [
        t('home.weeks', { count: track.weekCount }),
        t('home.reviewedWeeks', { count: track.weeks.filter((week) => week.reviewed).length }),
        track.priceMinor === undefined
          ? t('track.priceOnRequest')
          : `${(track.priceMinor / 100).toLocaleString('en-US')} ${track.currency}`,
      ]
    : [];

  return new ImageResponse(
    ogCard({
      locale,
      kicker: t('track.kicker'),
      // A slug that resolves to nothing still has to render something: the
      // scraper does not follow the 404 the page itself returns.
      title: track ? pick(track.title, locale) : t('tracks.title'),
      subtitle: track ? pick(track.outcome, locale) : t('tracks.intro'),
      footnote: facts.join('   ·   '),
      wordmarkAr: t('brand.wordmarkAr'),
      wordmarkLatin: t('brand.wordmarkLatin'),
    }),
    { ...size, fonts: await ogFonts() },
  );
}
