import { ImageResponse } from 'next/og';
import { getTranslations } from 'next-intl/server';
import { ogCard, ogFonts, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og/card';
import { resolveLocale } from '@/i18n/routing';

/**
 * The card for the site itself: home, and every page that does not name its
 * own. Next reads the exports below and writes the `og:image` and
 * `twitter:image` tags for the whole `[locale]` subtree, so a link to any page
 * without a more specific card still previews as Deraya rather than as a bare
 * URL.
 */
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export async function generateImageMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const locale = resolveLocale((await params).locale);
  const t = await getTranslations({ locale, namespace: 'brand' });

  return [
    {
      id: 'card',
      size,
      contentType,
      // Read aloud by the scrapers that expose it, so it says what the card
      // says rather than describing the artwork.
      alt: `${t('wordmarkAr')} · ${t('wordmarkLatin')} — ${t('positioning')}`,
    },
  ];
}

export default async function OpenGraphImage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const locale = resolveLocale((await params).locale);
  const t = await getTranslations({ locale });

  return new ImageResponse(
    ogCard({
      locale,
      title: t('hero.headline'),
      subtitle: t('hero.subhead'),
      // Two of the three supporting lines, not all three: the third wraps the
      // footer onto a second line, and a second line under a rule reads as
      // spill rather than as a caption.
      footnote: [t('hero.supporting.one'), t('hero.supporting.three')].join('   ·   '),
      wordmarkAr: t('brand.wordmarkAr'),
      wordmarkLatin: t('brand.wordmarkLatin'),
    }),
    { ...size, fonts: await ogFonts() },
  );
}
