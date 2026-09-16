import { headers } from 'next/headers';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { SiteHeader } from '@/components/SiteHeader';
import { AuthForm } from '@/components/auth/AuthForm';
import { Kicker } from '@/components/ui/Kicker';
import { Link } from '@/i18n/navigation';
import { isSupabaseConfigured } from '@/lib/supabase/env';
import { signIn } from '../auth-actions';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'auth' });
  return { title: t('signIn') };
}

export default async function SignInPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { locale } = await params;
  const { next, error } = await searchParams;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: 'auth' });
  const requestHeaders = await headers();
  // `origin` is only sent on cross-origin requests, so a plain navigation to
  // this page has none. The host is what is actually always there.
  const host = requestHeaders.get('host');
  const origin = requestHeaders.get('origin') ?? (host ? `https://${host}` : '');

  /**
   * A deployment with no database still serves this page, and until now it
   * served a form that looked ready and failed on submit. Say it before the
   * password is typed, not after.
   */
  const ready = isSupabaseConfigured();

  return (
    <>
      <SiteHeader />
      <main id="main" className="auth-layout">
        <div className="auth-card">
          <header className="auth-head">
            <Kicker>{t('kicker')}</Kicker>
            <h1 className="t-page">{t('signIn')}</h1>
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

          {error === 'link' ? (
            <p className="field-message field-message-error" role="alert">
              {t('error.link')}
            </p>
          ) : null}

          <AuthForm
            mode="signIn"
            action={signIn}
            locale={locale}
            next={next}
            origin={origin}
            unavailable={!ready}
          />

          <p className="auth-foot">
            {t('noAccount')} <Link href="/sign-up">{t('signUp')}</Link>
          </p>
        </div>
      </main>
    </>
  );
}
