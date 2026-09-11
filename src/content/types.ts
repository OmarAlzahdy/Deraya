import type { Locale } from '@/i18n/routing';

/**
 * A string that exists in both languages. Not a translation pair — either side
 * may be written first, and neither is the source of the other.
 */
export type Localized = { ar: string; en: string };

export function pick(value: Localized, locale: Locale): string {
  return value[locale];
}

/**
 * Content the brief has not decided yet carries this. Anything marked
 * `placeholder` renders with a visible marker in the interface: the product
 * says what is missing rather than shipping invented specifics as if they were
 * real. See the open decisions in README.md.
 */
export type Placeholder = {
  placeholder: true;
  /** Which open decision fills this in. */
  blockedBy: string;
};

export type MaybePlaceholder<T> = T & Partial<Placeholder>;
