import { getTranslations, getLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { LanguageSwitch } from './LanguageSwitch';
import { NavLink } from './NavLink';
import { Avatar } from './ui/Avatar';
import { getProfile, isAdmin } from '@/lib/auth';
import { signOut } from '@/app/[locale]/auth-actions';

/**
 * The persistent header, in three zones: the brand, the navigation, and the
 * account. The earlier version pushed everything into one row against the
 * trailing edge, which read as a list of links rather than as a header.
 *
 * It sticks, because on a platform the way back is part of the furniture, and
 * its bottom edge is a rule that fades at both ends rather than a hard border.
 *
 * Logged-out and logged-in navigations differ, as the brief requires. The
 * wordmark is a placeholder lockup — دراية in IBM Plex Sans Arabic 500 beside
 * Deraya in Inter 500 — until a real mark is commissioned.
 */
export async function SiteHeader() {
  const t = await getTranslations();
  const locale = await getLocale();
  const profile = await getProfile();

  return (
    <header className="site-header">
      <div className="shell site-header-inner">
        <Link href="/" className="brand" aria-label={`${t('brand.wordmarkLatin')} — ${t('nav.home')}`}>
          <span lang="ar" dir="rtl" className="brand-ar">
            {t('brand.wordmarkAr')}
          </span>
          <span lang="en" dir="ltr" className="brand-latin">
            {t('brand.wordmarkLatin')}
          </span>
        </Link>

        <nav className="site-nav" aria-label={t('nav.primary')}>
          <NavLink href="/tracks">{t('nav.learn')}</NavLink>
          <NavLink href="/services">{t('nav.build')}</NavLink>
          <NavLink href="/community">{t('nav.community')}</NavLink>
          {isAdmin(profile) ? <NavLink href="/admin">{t('nav.admin')}</NavLink> : null}
        </nav>

        <div className="site-header-actions">
          {profile ? (
            <>
              <Link
                href="/account"
                className="btn btn-quiet"
                aria-label={`${t('nav.account')} — ${profile.display_name}`}
              >
                <Avatar name={profile.display_name} staff={profile.role !== 'member'} />
              </Link>
              <form action={signOut}>
                <input type="hidden" name="locale" value={locale} />
                <button type="submit" className="btn btn-quiet btn-sm">
                  {t('nav.signOut')}
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/sign-in" className="btn btn-quiet btn-sm">
                {t('nav.signIn')}
              </Link>
              <Link href="/sign-up" className="btn btn-primary btn-sm">
                {t('nav.signUp')}
              </Link>
            </>
          )}

          <span className="header-divider" aria-hidden="true" />
          <LanguageSwitch label={t('language.label')} switchTo={t('language.switchTo')} />
        </div>
      </div>
    </header>
  );
}
