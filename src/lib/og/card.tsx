import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { Para } from './bidi';
import { shapeArabic } from './arabic';
import type { Locale } from '@/i18n/routing';

/**
 * The share card — the one screen of Deraya most people will see first.
 *
 * A link pasted into WhatsApp or LinkedIn is rendered by a scraper, not a
 * browser: no CSS file, no web font request, no JavaScript. Everything the
 * card needs has to be inline here, and the type has to come from font bytes
 * this module hands over. So this is the one place in the codebase that
 * repeats token values as literals — the tokens are in `tokens.css`, which a
 * scraper never fetches. The literals below are copied from there and are
 * commented with the token they mirror, so a palette change has one obvious
 * second place to visit.
 *
 * The ground is the dark band (`--color-section`) rather than the site's warm
 * white: a preview sits in a chat thread among other cards, and the saturated
 * teal is the one thing that reads as *us* at thumbnail size.
 */

/** Facebook's stated ideal, and what every other scraper crops from. */
export const OG_SIZE = { width: 1200, height: 630 } as const;
export const OG_CONTENT_TYPE = 'image/png';

const SECTION = '#0d4f43'; // --color-section
const SECTION_DEEP = '#0a3b32'; // one step below it, for the wash
const GLOW = '#12695a'; // --color-section-glow
const INK = '#eaf6f1'; // --color-section-text
const MINT = '#8de3cd'; // --color-accent-300 — the only bright note
const INK_MUTED = 'rgba(234, 246, 241, 0.72)';
const HAIRLINE = 'rgba(234, 246, 241, 0.16)';

const ARABIC = 'Plex Arabic';
const LATIN = 'Inter';

/**
 * Font bytes, read from disk once per lambda rather than per request.
 *
 * The files are subsets — Latin, Arabic, and the punctuation the copy uses —
 * because the whole card has to be built and encoded inside a scraper's
 * patience. `outputFileTracingIncludes` in `next.config.ts` keeps them next to
 * the deployed function; without it the bundler has no reason to ship a `.ttf`
 * nothing imports.
 */
const fontDir = join(process.cwd(), 'src/lib/og/fonts');

let cached: Promise<OgFont[]> | undefined;

type OgFont = {
  name: string;
  data: Buffer;
  weight: 400 | 500;
  style: 'normal';
};

export function ogFonts(): Promise<OgFont[]> {
  cached ??= Promise.all([
    readFile(join(fontDir, 'inter-400.ttf')),
    readFile(join(fontDir, 'inter-500.ttf')),
    readFile(join(fontDir, 'plex-arabic-400.ttf')),
    readFile(join(fontDir, 'plex-arabic-500.ttf')),
  ]).then(([inter400, inter500, plex400, plex500]): OgFont[] => [
    { name: LATIN, data: inter400, weight: 400, style: 'normal' },
    { name: LATIN, data: inter500, weight: 500, style: 'normal' },
    { name: ARABIC, data: plex400, weight: 400, style: 'normal' },
    { name: ARABIC, data: plex500, weight: 500, style: 'normal' },
  ]);

  return cached;
}

export type OgCard = {
  locale: Locale;
  /** The small line above the title: what kind of page this is. */
  kicker?: string;
  title: string;
  /** One sentence under the title. Trimmed if the title runs long. */
  subtitle?: string;
  /** The line along the bottom edge, under a rule. */
  footnote?: string;
  wordmarkAr: string;
  wordmarkLatin: string;
};

/**
 * Type size is chosen from the title's length rather than fixed, because the
 * titles here are user-authored: a course called "Applied AI" and one called
 * "التقييم والمراقبة لأنظمة الاسترجاع في الإنتاج" both have to fill the card
 * without overflowing it. Arabic counts shorter at the same pixel size, so it
 * gets its own steps.
 */
function titleSize(title: string, rtl: boolean) {
  const n = title.length;
  if (rtl) {
    if (n <= 28) return 68;
    if (n <= 48) return 58;
    if (n <= 78) return 48;
    return 40;
  }
  if (n <= 32) return 76;
  if (n <= 56) return 64;
  if (n <= 90) return 52;
  return 44;
}

export function ogCard({
  locale,
  kicker,
  title,
  subtitle,
  footnote,
  wordmarkAr,
  wordmarkLatin,
}: OgCard) {
  const rtl = locale === 'ar';
  const base = rtl ? 'rtl' : 'ltr';
  const size = titleSize(title, rtl);

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '64px 72px',
        color: INK,
        // The font list is ordered by the locale: the first family that has a
        // glyph wins, so Arabic pages resolve Latin digits and product names
        // through Plex's own Latin rather than switching family mid-word.
        fontFamily: rtl ? `"${ARABIC}", "${LATIN}"` : `"${LATIN}", "${ARABIC}"`,
        backgroundColor: SECTION,
        backgroundImage: `linear-gradient(135deg, ${GLOW} 0%, ${SECTION} 46%, ${SECTION_DEEP} 100%)`,
      }}
    >
      {/* ── The lockup, and what kind of page this is ─────────────────── */}
      <div
        style={{
          display: 'flex',
          // `row-reverse` rather than `direction: rtl`: Yoga is the only
          // layout engine here, and this is the part of RTL it does honour.
          flexDirection: rtl ? 'row-reverse' : 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: rtl ? 'row-reverse' : 'row',
            alignItems: 'center',
            gap: 18,
          }}
        >
          <span
            style={{
              fontFamily: `"${ARABIC}"`,
              fontWeight: 500,
              fontSize: 40,
              // The wordmark is Arabic wherever it appears, so it keeps its
              // own direction even on the English card.
              direction: 'rtl',
            }}
          >
            {shapeArabic(wordmarkAr)}
          </span>
          <span style={{ width: 1, height: 30, backgroundColor: HAIRLINE }} />
          <span
            style={{
              fontFamily: `"${LATIN}"`,
              fontWeight: 500,
              fontSize: 23,
              letterSpacing: '0.18em',
              direction: 'ltr',
            }}
          >
            {wordmarkLatin.toUpperCase()}
          </span>
        </div>

        {kicker ? (
          <span
            style={{
              fontSize: 20,
              fontWeight: 500,
              color: MINT,
              padding: '9px 18px',
              borderRadius: 999,
              border: `1px solid ${HAIRLINE}`,
            }}
          >
            {kicker}
          </span>
        ) : null}
      </div>

      {/* ── What the page is ───────────────────────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', maxWidth: 960 }}>
        {/* The one bright mark on the card. It starts where the reading
            starts, so it points into the headline rather than away from it. */}
        <div
          style={{
            display: 'flex',
            flexDirection: rtl ? 'row-reverse' : 'row',
            marginBottom: 32,
          }}
        >
          <span style={{ width: 64, height: 4, backgroundColor: MINT, borderRadius: 2 }} />
        </div>
        <Para
          base={base}
          size={size}
          weight={500}
          lineHeight={rtl ? 1.38 : 1.08}
          letterSpacing={rtl ? undefined : '-0.022em'}
        >
          {title}
        </Para>
        {subtitle ? (
          <Para
            base={base}
            size={28}
            lineHeight={rtl ? 1.62 : 1.45}
            color={INK_MUTED}
            maxWidth={840}
            marginTop={rtl ? 22 : 26}
          >
            {subtitle}
          </Para>
        ) : null}
      </div>

      {/* ── The promise, in one line ───────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          width: '100%',
          paddingTop: 26,
          borderTop: `1px solid ${HAIRLINE}`,
        }}
      >
        {footnote ? (
          <Para base={base} size={22} lineHeight={rtl ? 1.7 : 1.5} color={INK_MUTED}>
            {footnote}
          </Para>
        ) : null}
      </div>
    </div>
  );
}
