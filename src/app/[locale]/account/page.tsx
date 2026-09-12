import { setRequestLocale, getTranslations } from 'next-intl/server';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import { AccountForm } from '@/components/account/AccountForm';
import { Kicker } from '@/components/ui/Kicker';
import { Tag } from '@/components/ui/Tag';
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
      <SiteHeader />
      <main className="page stack stack-8">
        <header className="stack stack-4">
          <Kicker>{t('kicker')}</Kicker>
          <h1>{t('title')}</h1>
          <div className="row">
            <Tag tone={profile.role === 'member' ? 'neutral' : 'accent'}>
              <Ltr>{profile.role}</Ltr>
            </Tag>
            <span className="t-fine text-muted">
              <Ltr>@{profile.handle}</Ltr>
            </span>
          </div>
        </header>

        <AccountForm profile={profile} action={updateProfile} />
      </main>
      <SiteFooter />
    </>
  );
}
