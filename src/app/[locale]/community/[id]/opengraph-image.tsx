import { ImageResponse } from 'next/og';
import { getTranslations } from 'next-intl/server';
import { ogCard, ogFonts, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og/card';
import { getQuestion } from '@/lib/data/community';
import { resolveLocale } from '@/i18n/routing';

/**
 * The card for one thread.
 *
 * A question gets shared to be answered, so the card leads with the question
 * and shows the opening of it underneath — enough to tell whether you can
 * help, before you have opened anything.
 */
/**
 * Rendered per request. The card's content comes from the database through
 * the session-aware client, and `generateImageMetadata` below would otherwise
 * have Next treat this route as static and refuse the read.
 */
export const dynamic = 'force-dynamic';

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

type Params = { params: Promise<{ locale: string; id: string }> };

/** The first sentences of a body, without the code fences or the markdown. */
function opening(body: string, limit: number) {
  const prose = body
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/[`*_>#]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (prose.length <= limit) return prose;
  return `${prose.slice(0, prose.lastIndexOf(' ', limit))}…`;
}

/**
 * Named after the kind of page rather than the thread on it, for the reason
 * given in the track card: this runs at build time, where there is no request
 * and so no session to read the thread with.
 */
export async function generateImageMetadata({ params }: Params) {
  const locale = resolveLocale((await params).locale);
  const t = await getTranslations({ locale });

  return [
    {
      id: 'card',
      size,
      contentType,
      alt: `${t('community.kicker')} — ${t('brand.wordmarkAr')} · ${t('brand.wordmarkLatin')}`,
    },
  ];
}

export default async function ThreadOpenGraphImage({ params }: Params) {
  const { locale: raw, id } = await params;
  const locale = resolveLocale(raw);
  const [question, t] = await Promise.all([getQuestion(id), getTranslations({ locale })]);

  return new ImageResponse(
    ogCard({
      // A thread is written in one language and read in both. The card
      // follows the thread, not the URL, so an Arabic question shared from an
      // English page still previews as Arabic.
      locale: question ? resolveLocale(question.locale) : locale,
      kicker: t('community.kicker'),
      title: question ? question.title : t('community.title'),
      subtitle: question ? opening(question.body, 150) : t('community.intro'),
      // The plural form, not a count and a label: Arabic has six of them and
      // the messages already carry all six.
      footnote: question ? t('community.answers', { count: question.answers.length }) : undefined,
      wordmarkAr: t('brand.wordmarkAr'),
      wordmarkLatin: t('brand.wordmarkLatin'),
    }),
    { ...size, fonts: await ogFonts() },
  );
}
