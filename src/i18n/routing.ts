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
