import { headers } from 'next/headers';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { SiteHeader } from '@/components/SiteHeader';
import { AuthForm } from '@/components/auth/AuthForm';
import { Kicker } from '@/components/ui/Kicker';
import { Link } from '@/i18n/navigation';
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
  const { next } = await searchParams;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: 'auth' });
  const origin = (await headers()).get('origin') ?? '';

  return (
    <>
      <SiteHeader />
      <main className="page stack stack-8">
        <header className="stack stack-4">
          <Kicker>{t('kicker')}</Kicker>
          <h1>{t('signIn')}</h1>
        </header>

        <AuthForm mode="signIn" action={signIn} locale={locale} next={next} origin={origin} />

        <p className="t-small text-muted">
          {t('noAccount')} <Link href="/sign-up">{t('signUp')}</Link>
        </p>
      </main>
    </>
  );
}
