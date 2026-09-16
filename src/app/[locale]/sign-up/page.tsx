import { headers } from 'next/headers';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { SiteHeader } from '@/components/SiteHeader';
import { AuthForm } from '@/components/auth/AuthForm';
import { Kicker } from '@/components/ui/Kicker';
import { Link } from '@/i18n/navigation';
import { isSupabaseConfigured } from '@/lib/supabase/env';
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

  /** Same as sign-in: an inert form is better than one that fails on submit. */
  const ready = isSupabaseConfigured();

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

          {ready ? null : (
            <div className="notice notice-accent" role="status">
              <div className="flow-1">
                <strong className="t-small" style={{ color: 'var(--color-text)' }}>
                  {t('unavailable.title')}
                </strong>
                <p>{t('unavailable.body')}</p>
              </div>
            </div>
          )}

          <AuthForm
            mode="signUp"
            action={signUp}
            locale={locale}
            origin={origin}
            unavailable={!ready}
          />

          <p className="auth-foot">
            {t('haveAccount')} <Link href="/sign-in">{t('signIn')}</Link>
          </p>
        </div>
      </main>
    </>
  );
}
