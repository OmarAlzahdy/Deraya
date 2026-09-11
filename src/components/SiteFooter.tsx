import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

/** Deliberately thin: the language switch lives in the header, not down here. */
export function SiteFooter() {
  const t = useTranslations();

  return (
    <footer className="page" style={{ paddingBlock: 'var(--space-12)' }}>
      <div className="rule-top stack stack-3">
        <div className="row" style={{ gap: 'var(--space-6)' }}>
          <Link href="/services">{t('nav.build')}</Link>
          <Link href="/system">{t('nav.foundations')}</Link>
        </div>
        <p className="t-fine text-muted measure">{t('brand.positioning')}</p>
      </div>
    </footer>
  );
}
