import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Inter, IBM_Plex_Sans_Arabic, IBM_Plex_Mono } from 'next/font/google';
import { routing, getDirection, otherLocale, type Locale } from '@/i18n/routing';
import { siteUrl } from '@/lib/site';
import '@/styles/globals.css';

/**
 * Fonts are downloaded at build time and served from this origin — self-hosted
 * for production, as the handoff requires. Weights are limited to the ones the
 * system actually uses: 500 for headings, 400 for body, 400 for mono.
 */
const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-inter',
  display: 'swap',
});

const plexArabic = IBM_Plex_Sans_Arabic({
  subsets: ['arabic', 'latin'],
  weight: ['400', '500'],
  variable: '--font-plex-arabic',
  display: 'swap',
});

const plexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-plex-mono',
  display: 'swap',
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'brand' });

  return {
    /**
     * Without this every URL below stays relative, and a scraper — which has
     * no page to resolve them against — drops them. It is the difference
     * between a link that previews and a bare blue URL in a chat.
     */
    metadataBase: siteUrl(),
    title: {
      default: `${t('wordmarkAr')} · ${t('wordmarkLatin')}`,
      template: `%s · ${t('wordmarkLatin')}`,
    },
    description: t('positioning'),
    alternates: {
      // Resolved against `metadataBase`, so these go out absolute. Arabic is
      // the x-default: it is the language the audience reads.
      languages: { ar: '/ar', en: '/en', 'x-default': '/ar' },
    },
    /**
     * Deliberately no `title`, `description` or `url` here. Open Graph fields
     * are replaced wholesale by a child segment, never merged, so anything
     * named here would freeze at the site default on every inner page. Left
     * out, Next fills `og:title` and `og:description` from whatever title and
     * description the page itself resolved to, and a scraper reading a track
     * or a thread gets that page's own words.
     */
    openGraph: {
      type: 'website',
      siteName: `${t('wordmarkAr')} · ${t('wordmarkLatin')}`,
      locale: ogLocale[locale as Locale],
      alternateLocale: ogLocale[otherLocale(locale as Locale)],
    },
    twitter: {
      // The wide card. The narrow one crops a 1200×630 image to a square and
      // loses the wordmark.
      card: 'summary_large_image',
    },
  };
}

/** What Open Graph calls our two languages. Not a locale we route on. */
const ogLocale: Record<Locale, string> = { ar: 'ar_SA', en: 'en_US' };

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  // Enables static rendering for this locale.
  setRequestLocale(locale);

  /**
   * Direction lives here and nowhere else. Every layout rule in the codebase
   * is written in logical properties, so this one attribute is the whole
   * of RTL — there is no mirrored stylesheet to keep in step.
   */
  return (
    <html
      lang={locale}
      dir={getDirection(locale as Locale)}
      className={`${inter.variable} ${plexArabic.variable} ${plexMono.variable}`}
    >
      <body>
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
