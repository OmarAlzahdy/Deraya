import { notFound } from 'next/navigation';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { SiteHeader } from '@/components/SiteHeader';
import { Kicker } from '@/components/ui/Kicker';
import { Button } from '@/components/ui/Button';
import { TrackForm } from '@/components/admin/TrackForm';
import { WeekEditor } from '@/components/admin/WeekEditor';
import { Link } from '@/i18n/navigation';
import { requireAdmin } from '@/lib/auth';
import { getTrackById } from '@/lib/data/tracks';
import type { Locale } from '@/i18n/routing';
import { saveTrack, saveWeek, deleteTrack } from '../../actions';

export default async function EditTrackPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  await requireAdmin(locale as Locale, `/${locale}/admin/tracks/${id}`);
  const track = await getTrackById(id);
  if (!track) notFound();

  const t = await getTranslations({ locale, namespace: 'admin' });
  const { track_weeks: weeks, ...row } = track;

  return (
    <>
      <SiteHeader />
      <main className="page stack stack-12">
        <header className="stack stack-4">
          <Kicker>
            <Link href="/admin/tracks" style={{ border: 0, color: 'inherit' }}>
              {t('courses')}
            </Link>
          </Kicker>
          <h1>{locale === 'ar' ? row.title_ar : row.title_en}</h1>
        </header>

        <TrackForm track={row} action={saveTrack} />

        <section className="stack stack-6 rule-top" style={{ paddingBlockStart: 'var(--space-12)' }}>
          <h2>{t('weeks')}</h2>
          <p className="t-small text-secondary measure">{t('weeksBody')}</p>

          <div className="stack stack-6">
            {[...weeks]
              .sort((a, b) => a.week_number - b.week_number)
              .map((week) => (
                <WeekEditor key={week.id} week={week} trackId={row.id} action={saveWeek} />
              ))}
          </div>
        </section>

        <section className="stack stack-4 rule-top" style={{ paddingBlockStart: 'var(--space-12)' }}>
          <h2 className="t-title">{t('dangerZone')}</h2>
          <p className="t-small text-muted measure">{t('deleteCourseBody')}</p>
          <form action={deleteTrack}>
            <input type="hidden" name="id" value={row.id} />
            <input type="hidden" name="locale" value={locale} />
            <Button type="submit" variant="secondary">
              {t('deleteCourse')}
            </Button>
          </form>
        </section>
      </main>
    </>
  );
}
