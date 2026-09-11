import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { LanguageSwitch } from './LanguageSwitch';

/**
 * The persistent header. The language switch sits here at every breakpoint.
 *
 * The wordmark is a placeholder lockup — دراية set in IBM Plex Sans Arabic 500
 * beside Deraya in Inter 500. No mark exists yet; one needs to be commissioned
 * (handoff: *Assets*).
 *
 * Logged-out and logged-in navigations differ; this is the logged-out one. The
 * logged-in header is not built — it belongs with the dashboard, which has no
 * approved layout yet.
 */
export function SiteHeader() {
  const t = useTranslations();

  return (
    <header className="nav">
      <Link href="/" className="nav-brand row row-baseline" style={{ gap: 'var(--space-2)' }}>
        <span lang="ar" dir="rtl" className="lang-run" style={{ fontSize: '22px' }}>
          {t('brand.wordmarkAr')}
        </span>
        <span lang="en" dir="ltr" className="lang-run text-muted" style={{ fontSize: '15px' }}>
          {t('brand.wordmarkLatin')}
        </span>
      </Link>

      {/* Logged-out navigation. Only routes that exist are linked — the
          community, assessment and dashboard screens are not built. */}
      <nav aria-label={t('nav.learn')} className="row" style={{ gap: 'var(--space-6)' }}>
        <Link href="/services">{t('nav.build')}</Link>
        <Link href="/system">{t('nav.foundations')}</Link>
      </nav>

      <LanguageSwitch label={t('language.label')} switchTo={t('language.switchTo')} />
    </header>
  );
}
