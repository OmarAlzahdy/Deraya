import type { Locale } from './routing';

/**
 * Numbers.
 *
 * Two separate questions that get confused with each other:
 *
 *   1. Ordering — a number never mirrors. Inside an Arabic paragraph a number,
 *      a repo path or a version string stays in its own LTR run. That is the
 *      `.num` / `.ltr` class in rtl.css, and it is not optional.
 *
 *   2. Digit shape — Western (1234, `latn`) or Eastern Arabic (١٢٣٤, `arab`).
 *      This codebase uses Western digits in both locales: the register is
 *      technical, the surrounding material is code, prices, week counts and
 *      version numbers, and Gulf technical writing generally sets them
 *      Western. Flagged in the handoff notes as an assumption worth
 *      confirming — it is one constant to change here if it is wrong.
 */
const NUMBERING_SYSTEM = 'latn';

export function formatNumber(
  value: number,
  locale: Locale,
  options: Intl.NumberFormatOptions = {},
) {
  return new Intl.NumberFormat(locale, {
    numberingSystem: NUMBERING_SYSTEM,
    ...options,
  }).format(value);
}

export function formatDate(
  value: Date | number,
  locale: Locale,
  options: Intl.DateTimeFormatOptions = { dateStyle: 'medium' },
) {
  // `ar` alone would bring the Islamic calendar on some platforms; the product
  // runs on the Gregorian calendar with Western digits in both languages.
  const tag = locale === 'ar' ? 'ar-SA-u-ca-gregory' : 'en-GB';
  return new Intl.DateTimeFormat(tag, {
    numberingSystem: NUMBERING_SYSTEM,
    ...options,
  }).format(value);
}
