import { setRequestLocale, getTranslations } from 'next-intl/server';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import { AccountForm } from '@/components/account/AccountForm';
import { Kicker } from '@/components/ui/Kicker';
import { Tag } from '@/components/ui/Tag';
import { Avatar } from '@/components/ui/Avatar';
import { Ltr } from '@/components/ui/Bidi';
import { requireProfile } from '@/lib/auth';
import type { Locale } from '@/i18n/routing';
import { updateProfile } from './actions';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'account' });
  return { title: t('title') };
}

export default async function AccountPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const profile = await requireProfile(locale as Locale, `/${locale}/account`);
  const t = await getTranslations({ locale, namespace: 'account' });

  return (
    <>
      <a href="#main" className="sr-only skip-link">
        {t('skipToContent')}
      </a>
      <SiteHeader />

      <main id="main" className="page">
        <div className="grid-editorial">
          <div className="col-content flow-6">
            <header className="section-head" style={{ marginBlockEnd: 0 }}>
              <Kicker>{t('kicker')}</Kicker>
              <h1>{t('title')}</h1>
              <p className="lead">{t('intro')}</p>
            </header>

            <AccountForm profile={profile} action={updateProfile} />
          </div>

          {/* What the rest of the platform sees. */}
          <aside className="col-rail col-rail-sticky flow-3">
            <span className="footer-heading" style={{ marginBlockEnd: 0 }}>
              {t('preview')}
            </span>
            <div className="card" style={{ gap: 'var(--space-4)' }}>
              <div className="row row-4" style={{ flexWrap: 'nowrap' }}>
                <Avatar name={profile.display_name} size="lg" staff={profile.role !== 'member'} />
                <div className="flow-1">
                  <span className="t-title">{profile.display_name}</span>
                  <span className="t-fine text-muted">
                    <Ltr>@{profile.handle}</Ltr>
                  </span>
                </div>
              </div>
              <div className="row">
                <Tag tone={profile.role === 'member' ? 'neutral' : 'accent'}>
                  <Ltr>{profile.role}</Ltr>
                </Tag>
              </div>
            </div>
          </aside>
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
