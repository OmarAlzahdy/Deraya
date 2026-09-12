import { headers } from 'next/headers';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { SiteHeader } from '@/components/SiteHeader';
import { AuthForm } from '@/components/auth/AuthForm';
import { Kicker } from '@/components/ui/Kicker';
import { Link } from '@/i18n/navigation';
import { signUp } from '../auth-actions';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'auth' });
  return { title: t('signUp') };
}

export default async function SignUpPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: 'auth' });
  const requestHeaders = await headers();
  const origin =
    requestHeaders.get('origin') ??
    (requestHeaders.get('host') ? `https://${requestHeaders.get('host')}` : '');

  return (
    <>
      <SiteHeader />
      <main id="main" className="auth-layout">
        <div className="auth-card">
          <header className="auth-head">
            <Kicker>{t('kicker')}</Kicker>
            <h1 className="t-page">{t('signUp')}</h1>
            <p className="t-small text-secondary">{t('signUpBody')}</p>
          </header>

          <AuthForm mode="signUp" action={signUp} locale={locale} origin={origin} />

          <p className="auth-foot">
            {t('haveAccount')} <Link href="/sign-in">{t('signIn')}</Link>
          </p>
        </div>
      </main>
    </>
  );
}
