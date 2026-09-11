'use client';

import { useParams } from 'next/navigation';
import { usePathname, Link } from '@/i18n/navigation';
import { localeNames, otherLocale, type Locale } from '@/i18n/routing';

/**
 * The language switch is a persistent control in the header — never a footer
 * link. It is a real link to the same page in the other language, so it works
 * without JavaScript and can be opened in a new tab; the choice persists in
 * the NEXT_LOCALE cookie set as the request passes through the middleware.
 *
 * The label is always the language's own name in its own script, never a
 * translation of it, and never a flag.
 */
export function LanguageSwitch({ label, switchTo }: { label: string; switchTo: string }) {
  const pathname = usePathname();
  const params = useParams();
  const current = (params.locale as Locale) ?? 'ar';
  const next = otherLocale(current);

  return (
    <Link
      href={pathname}
      locale={next}
      className="btn btn-ghost"
      hrefLang={next}
      aria-label={switchTo}
      title={label}
    >
      <span lang={next} dir={next === 'ar' ? 'rtl' : 'ltr'} className="lang-run">
        {localeNames[next]}
      </span>
    </Link>
  );
}
