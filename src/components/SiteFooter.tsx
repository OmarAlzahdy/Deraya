import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';

/**
 * The footer carries the map of the site, not the language switch — that is a
 * persistent header control, as the brief requires, and putting a second one
 * here would make the header's look optional.
 */
export async function SiteFooter() {
  const t = await getTranslations();

  return (
    <footer className="site-footer">
      <div className="shell">
        <div className="footer-grid">
          <div>
            <div className="brand" style={{ marginBlockEnd: 'var(--space-4)' }}>
              <span lang="ar" dir="rtl" className="brand-ar">
                {t('brand.wordmarkAr')}
              </span>
              <span lang="en" dir="ltr" className="brand-latin">
                {t('brand.wordmarkLatin')}
              </span>
            </div>
            <p className="t-fine text-muted" style={{ maxInlineSize: '32ch' }}>
              {t('brand.positioning')}
            </p>
          </div>

          <div>
            <h2 className="footer-heading">{t('nav.learn')}</h2>
            <ul className="footer-list">
              <li>
                <Link href="/tracks">{t('nav.tracks')}</Link>
              </li>
              <li>
                <Link href="/community">{t('nav.community')}</Link>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="footer-heading">{t('nav.build')}</h2>
            <ul className="footer-list">
              <li>
                <Link href="/services">{t('services.title')}</Link>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="footer-heading">{t('footer.more')}</h2>
            <ul className="footer-list">
              <li>
                <Link href="/system">{t('nav.foundations')}</Link>
              </li>
              <li>
                <Link href="/sign-in">{t('nav.signIn')}</Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
