import { defineRouting } from 'next-intl/routing';

/**
 * Arabic and English are equal: both carry a URL prefix (`/ar/...`, `/en/...`),
 * so neither language is the unprefixed "real" site with the other bolted on.
 *
 * `defaultLocale` is only the fallback when negotiation is inconclusive — no
 * cookie, no usable Accept-Language. Arabic wins that tie: the audience is
 * Arabic-speaking engineers in Saudi Arabia and the Gulf.
 *
 * Locale choice persists across sessions in the NEXT_LOCALE cookie, written
 * when the header's language switch is used and read on every later visit.
 */
export const routing = defineRouting({
  locales: ['ar', 'en'],
  defaultLocale: 'ar',
  localePrefix: 'always',
  localeDetection: true,
  localeCookie: {
    name: 'NEXT_LOCALE',
    maxAge: 60 * 60 * 24 * 365, // a year
    sameSite: 'lax',
  },
});

export type Locale = (typeof routing.locales)[number];

/**
 * Narrow an unknown segment value to a locale.
 *
 * Pages get their locale from a matched `[locale]` segment and can trust it.
 * The Open Graph image routes cannot: Next resolves their metadata once per
 * locale *and* once with no params bound at all, so `locale` arrives as
 * `undefined` there. Falling back is the whole point — an image route must
 * still produce an image.
 */
export function resolveLocale(value: string | undefined): Locale {
  const known: readonly string[] = routing.locales;
  return value !== undefined && known.includes(value) ? (value as Locale) : routing.defaultLocale;
}

/** Direction is a property of the locale, and the only thing that flips layout. */
export const direction = { ar: 'rtl', en: 'ltr' } as const;

export function getDirection(locale: Locale) {
  return direction[locale];
}

/** The other language, for the header switch. Two locales, so this is total. */
export function otherLocale(locale: Locale): Locale {
  return locale === 'ar' ? 'en' : 'ar';
}

/** What each language calls itself. Never translated. */
export const localeNames: Record<Locale, string> = {
  ar: 'العربية',
  en: 'English',
};
