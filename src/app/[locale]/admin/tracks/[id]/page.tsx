import { notFound } from 'next/navigation';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { AdminShell } from '@/components/admin/AdminShell';
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
    <AdminShell>
      <header className="section-head">
        <Kicker>
          <Link href="/admin/tracks" style={{ border: 0, color: 'inherit' }}>
            {t('courses')}
          </Link>
        </Kicker>
        <h1>{locale === 'ar' ? row.title_ar : row.title_en}</h1>
      </header>

        <TrackForm track={row} action={saveTrack} />

      <section className="section-tight">
        <div className="section-divider">
          <h2>{t('weeks')}</h2>
        </div>
        <p className="lead" style={{ marginBlockEnd: 'var(--flow-4)' }}>{t('weeksBody')}</p>

        <div className="flow-4">
            {[...weeks]
              .sort((a, b) => a.week_number - b.week_number)
              .map((week) => (
                <WeekEditor key={week.id} week={week} trackId={row.id} action={saveWeek} />
              ))}
        </div>
      </section>

      <section className="section-tight">
        <div className="notice" style={{ borderInlineStartColor: 'var(--color-danger)' }}>
          <div className="flow-3">
            <h2 className="t-title">{t('dangerZone')}</h2>
            <p style={{ margin: 0 }}>{t('deleteCourseBody')}</p>
            <form action={deleteTrack}>
              <input type="hidden" name="id" value={row.id} />
              <input type="hidden" name="locale" value={locale} />
              <Button type="submit" variant="secondary" className="btn-sm">
                {t('deleteCourse')}
              </Button>
            </form>
          </div>
        </div>
      </section>
    </AdminShell>
  );
}
