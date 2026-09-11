import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Inter, IBM_Plex_Sans_Arabic, IBM_Plex_Mono } from 'next/font/google';
import { routing, getDirection, type Locale } from '@/i18n/routing';
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
    title: {
      default: `${t('wordmarkAr')} · ${t('wordmarkLatin')}`,
      template: `%s · ${t('wordmarkLatin')}`,
    },
    description: t('positioning'),
    alternates: {
      languages: { ar: '/ar', en: '/en' },
    },
  };
}

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
