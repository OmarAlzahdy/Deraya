import { setRequestLocale, getTranslations } from 'next-intl/server';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import { Kicker } from '@/components/ui/Kicker';
import { AskForm } from '@/components/community/AskForm';
import { Link } from '@/i18n/navigation';
import { listTags } from '@/lib/data/community';
import { requireProfile } from '@/lib/auth';
import type { Locale } from '@/i18n/routing';
import { askQuestion } from '../actions';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'community' });
  return { title: t('ask') };
}

export default async function AskPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  await requireProfile(locale as Locale, `/${locale}/community/ask`);
  const t = await getTranslations({ locale, namespace: 'community' });
  const tags = await listTags();

  return (
    <>
      <SiteHeader />
      <main id="main" className="page">
        <div className="grid-editorial">
          <div className="col-content-wide flow-6">
            <header className="section-head" style={{ marginBlockEnd: 0 }}>
              <Kicker>
                <Link href="/community" style={{ border: 0, color: 'inherit' }}>
                  {t('kicker')}
                </Link>
              </Kicker>
              <h1>{t('ask')}</h1>
              <p className="lead">{t('askBody')}</p>
            </header>

            <AskForm action={askQuestion} tags={tags} />
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
