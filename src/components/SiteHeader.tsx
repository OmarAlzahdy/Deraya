import { getTranslations, getLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { LanguageSwitch } from './LanguageSwitch';
import { getProfile, isAdmin } from '@/lib/auth';
import { signOut } from '@/app/[locale]/auth-actions';

/**
 * The persistent header. The language switch sits here at every breakpoint.
 *
 * Logged-out and logged-in navigations differ, as the brief requires: a
 * visitor sees the way in, a member sees their account, and an admin sees the
 * admin area. The wordmark is still a placeholder lockup — دراية in IBM Plex
 * Sans Arabic 500 beside Deraya in Inter 500 — until a real mark exists.
 */
export async function SiteHeader() {
  const t = await getTranslations();
  const locale = await getLocale();
  const profile = await getProfile();

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

      <nav aria-label={t('nav.learn')} className="row" style={{ gap: 'var(--space-6)' }}>
        <Link href="/services">{t('nav.build')}</Link>
        <Link href="/community">{t('nav.community')}</Link>
        {profile ? <Link href="/account">{t('nav.account')}</Link> : null}
        {isAdmin(profile) ? <Link href="/admin">{t('nav.admin')}</Link> : null}
        <Link href="/system">{t('nav.foundations')}</Link>
      </nav>

      {profile ? (
        <form action={signOut}>
          <input type="hidden" name="locale" value={locale} />
          <button type="submit" className="btn btn-ghost">
            {t('nav.signOut')}
          </button>
        </form>
      ) : (
        <Link href="/sign-in" className="btn btn-ghost">
          {t('nav.signIn')}
        </Link>
      )}

      <LanguageSwitch label={t('language.label')} switchTo={t('language.switchTo')} />
    </header>
  );
}
