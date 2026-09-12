import { setRequestLocale, getTranslations } from 'next-intl/server';
import { SiteHeader } from '@/components/SiteHeader';
import { Kicker } from '@/components/ui/Kicker';
import { TrackForm } from '@/components/admin/TrackForm';
import { Link } from '@/i18n/navigation';
import { requireAdmin } from '@/lib/auth';
import type { Locale } from '@/i18n/routing';
import { saveTrack } from '../../actions';

export default async function NewTrackPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  await requireAdmin(locale as Locale, `/${locale}/admin/tracks/new`);
  const t = await getTranslations({ locale, namespace: 'admin' });

  return (
    <>
      <SiteHeader />
      <main className="page stack stack-8">
        <header className="stack stack-4">
          <Kicker>
            <Link href="/admin/tracks" style={{ border: 0, color: 'inherit' }}>
              {t('courses')}
            </Link>
          </Kicker>
          <h1>{t('newCourse')}</h1>
          <p className="t-small text-secondary measure">{t('newCourseBody')}</p>
        </header>

        <TrackForm action={saveTrack} />
      </main>
    </>
  );
}
